import { decisionFingerprint } from './treatment.js';

export function currentDecision(state){ return state.doctorReview?.treatmentContext?.decision || {}; }
export function releaseReadiness(state){
  const d=currentDecision(state), tc=state.doctorReview?.treatmentContext||{};
  const blockers=[];
  if(!d.id || !d.selectedOptionId) blockers.push('Chưa có clinician decision đã lưu.');
  if(!tc.decisionReviewed) blockers.push('Clinician decision chưa được review/sign-off.');
  if(d.contextFingerprint && d.contextFingerprint!==decisionFingerprint(state)) blockers.push('Clinical context đã thay đổi; decision hiện tại bị stale.');
  if(!state.doctorReview?.mdtDecision?.trim()) blockers.push('Chưa ghi kết luận MDT.');
  if(!state.doctorReview?.plan?.trim()) blockers.push('Chưa có patient-facing plan.');
  return {ready:blockers.length===0,blockers};
}
export function makePlanRelease(state){
  const r=releaseReadiness(state); if(!r.ready) return {ok:false,blockers:r.blockers};
  const d=currentDecision(state), now=new Date().toISOString();
  return {ok:true,release:{id:crypto.randomUUID(),version:(state.planReleases?.length||0)+1,decisionId:d.id,decisionOptionTitle:d.optionTitle||'',decisionFingerprint:d.contextFingerprint||decisionFingerprint(state),guidelineLabel:d.sourceLabel||'',guidelineUpdated:d.sourceUpdated||'',mdtDecision:state.doctorReview.mdtDecision.trim(),patientPlan:state.doctorReview.plan.trim(),releasedAt:now,status:'released'}};
}
export function activePlanRelease(state){ return [...(state.planReleases||[])].reverse().find(x=>x.status==='released')||null; }
export function releaseIsCurrent(state,release=activePlanRelease(state)){
  if(!release) return false; const d=currentDecision(state); return Boolean(d.id && release.decisionId===d.id && release.decisionFingerprint===decisionFingerprint(state));
}
