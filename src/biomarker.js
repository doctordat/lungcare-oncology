export const BIOMARKER_EVIDENCE={label:'CAP / IASLC / AMP molecular testing guideline',note:'Older molecular-testing standard used only for test-structure concepts; not presented as a 2026 guideline.'};
export const STRUCTURED_DRIVER_GENES=['EGFR','ALK','ROS1','BRAF V600E','KRAS G12C','MET exon 14','RET','NTRK','HER2 / ERBB2'];
export function nsclcPathology(pathologyType=''){return pathologyType==='Adenocarcinoma'||pathologyType==='Squamous cell carcinoma'||pathologyType.startsWith('NSCLC')}
export function legacyBiomarkerSnapshot(state){const d=state.doctorReview||{};return {status:d.biomarkerStatus||'pending',tests:Object.fromEntries(Object.entries(d.biomarkers||{}).filter(([name])=>name!=='__structuredFingerprint').map(([name,done])=>[name,{status:done?'resulted_unknown':'pending',result:null}])),pdl1:{status:d.biomarkers?.['PD-L1']?'resulted_unknown':'pending',tps:null},migrationNote:'Legacy boolean true means checklist/test previously marked complete; it is never interpreted as positive or negative.'}}
export function structuredBiomarkerContext(state){
 const d=state.doctorReview||{},stored=d.biomarkerResults;
 if(!stored?.tests)return {mode:'legacy',structured:false,complete:false,driverStatus:d.treatmentContext?.driverStatus||'pending',positiveDrivers:[],driverNames:[],pdl1:{status:'unknown',tps:null,bucket:'unknown'},snapshot:legacyBiomarkerSnapshot(state)};
 const tests=Object.fromEntries(STRUCTURED_DRIVER_GENES.map(g=>{const x=stored.tests?.[g]||{};return[g,{status:x.status||'pending',alteration:String(x.alteration||'').trim()}]}));
 const positiveDrivers=STRUCTURED_DRIVER_GENES.filter(g=>tests[g].status==='positive');
 const molecularFinal=STRUCTURED_DRIVER_GENES.every(g=>['positive','negative'].includes(tests[g].status));
 const pStatus=stored.pdl1?.status||'pending',rawTps=stored.pdl1?.tps,tps=rawTps===''||rawTps==null?null:Number(rawTps),pdl1Valid=pStatus==='resulted'&&Number.isFinite(tps)&&tps>=0&&tps<=100;
 const complete=molecularFinal&&pdl1Valid;
 const driverStatus=positiveDrivers.length?'present':(complete?'none':'pending');
 const driverNames=positiveDrivers.map(g=>tests[g].alteration?`${g}: ${tests[g].alteration}`:g);
 const bucket=!pdl1Valid?'unknown':tps>=50?'high':tps>=1?'intermediate':'negative';
 return {mode:'structured',structured:true,complete,driverStatus,positiveDrivers,driverNames,pdl1:{status:pStatus,tps:pdl1Valid?tps:null,bucket},snapshot:{tests,pdl1:{status:pStatus,tps:pdl1Valid?tps:null},updatedAt:stored.updatedAt||null}};
}
export function biomarkerConsistency(state){
 const d=state.doctorReview||{},c=d.treatmentContext||{},stage=d.stagingInput?.calculatedStage||'',issues=[],ctx=structuredBiomarkerContext(state);
 if(d.diagnosisConfirmed&&d.pathologyReviewed&&!nsclcPathology(d.pathologyType||''))issues.push('Treatment routing hiện chỉ hỗ trợ NSCLC; pathology hiện tại nằm ngoài scope.');
 if(/^IV/.test(stage)&&d.diseaseExtent!=='advanced')issues.push('TNM stage IV nhưng phạm vi bệnh chưa được ghi là tiến xa / di căn.');
 if(/^(I|II|III)/.test(stage)&&d.diseaseExtent==='advanced')issues.push('TNM stage I–III nhưng phạm vi bệnh đang được ghi là tiến xa / di căn; cần review consistency.');
 if(ctx.structured){
  for(const gene of ctx.positiveDrivers){if(!ctx.snapshot.tests[gene].alteration)issues.push(`${gene} positive nhưng chưa có alteration/variant/fusion cụ thể.`)}
  if(d.biomarkerStatus==='complete'&&!ctx.complete)issues.push('Biomarker status = complete nhưng structured molecular/PD-L1 results chưa hoàn tất hợp lệ.');
  if(c.driverStatus&&c.driverStatus!==ctx.driverStatus)issues.push(`Legacy driverStatus (${c.driverStatus}) không khớp structured results (${ctx.driverStatus}); engine sẽ ưu tiên structured results.`);
 }else{
  const checklist=d.biomarkers||{},names=Object.keys(checklist).filter(name=>!name.startsWith('__'));
  if(d.biomarkerStatus==='complete'){const missing=names.filter(name=>!checklist[name]);if(missing.length)issues.push(`Biomarker status = complete nhưng checklist còn thiếu: ${missing.join(', ')}.`)}
  if(c.driverStatus==='present'&&!String(c.driverName||'').trim())issues.push('Driver status = present nhưng chưa ghi alteration đã xác nhận.');
  if(c.driverStatus==='none'&&d.biomarkerStatus!=='complete')issues.push('Không thể khóa driver status = none khi biomarker workup chưa complete.');
 }
 return issues;
}
