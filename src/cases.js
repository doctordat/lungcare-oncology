export function activeCase(state) {
  return state.cases.find(item => item.id === state.activeCaseId) || state.cases[0];
}

export function projectCase(state) {
  const current = activeCase(state);
  return { ...state, ...current };
}

export function updateActiveCase(state, updater) {
  const id = state.activeCaseId;
  return {
    ...state,
    cases: state.cases.map(item => item.id === id ? updater(item) : item),
  };
}

export function casePriority(caseItem) {
  const report = caseItem.patientEducation?.symptomReport || {};
  const patientUrgent = Boolean(report.submittedAt) && (report.hemoptysis || report.confusion || report.chestPain || report.dyspnea === 'Tăng nhiều');
  const intake = caseItem.intake || {};
  const nurseUrgent = Number(intake.spo2) < 90 || String(intake.dyspnea || '').toLowerCase().includes('nặng') || Object.values(intake.redFlags || {}).some(Boolean);
  if (patientUrgent || nurseUrgent) return 'urgent';
  if (['READY_FOR_DOCTOR', 'DOCTOR_REVIEW'].includes(caseItem.workflow?.state)) return 'attention';
  return 'routine';
}

export function waitingFor(caseItem) {
  const workflow = caseItem.workflow?.state;
  if (workflow === 'NURSE_INTAKE') return 'Điều dưỡng';
  if (workflow === 'READY_FOR_DOCTOR' || workflow === 'DOCTOR_REVIEW') return 'Bác sĩ';
  if (workflow === 'PLAN_READY') return 'Bệnh nhân';
  if (workflow === 'PATIENT_ACKNOWLEDGED') return 'Theo dõi';
  return 'Team';
}

export function queueCounts(state) {
  return state.cases.reduce((acc, item) => {
    const priority = casePriority(item);
    acc.total += 1;
    if (priority === 'urgent') acc.urgent += 1;
    if (waitingFor(item) === 'Bác sĩ') acc.doctor += 1;
    if (waitingFor(item) === 'Điều dưỡng') acc.nurse += 1;
    return acc;
  }, { total: 0, urgent: 0, doctor: 0, nurse: 0 });
}
