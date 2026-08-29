export function hasValue(value){return value!==''&&value!==null&&value!==undefined}
export function patientSymptomUrgent(report={}){return Boolean(report.submittedAt)&&(Boolean(report.hemoptysis)||Boolean(report.confusion)||Boolean(report.chestPain)||report.dyspnea==='Tăng nhiều')}
export function pendingPatientSymptomUrgent(report={}){return Boolean(report.hemoptysis)||Boolean(report.confusion)||Boolean(report.chestPain)||report.dyspnea==='Tăng nhiều'}
export function nurseUrgent(intake={}){const hasSpo2=hasValue(intake.spo2);return (hasSpo2&&Number(intake.spo2)<90)||String(intake.dyspnea||'').toLowerCase().includes('nặng')||Object.values(intake.redFlags||{}).some(Boolean)}
export function caseUrgent(caseItem={}){return nurseUrgent(caseItem.intake||{})||patientSymptomUrgent(caseItem.patientEducation?.symptomReport||{})}
