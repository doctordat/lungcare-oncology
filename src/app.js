import { loadState, saveState, resetState, addEvent } from './store.js';
import { transition } from './workflow.js';
import { getDoctorBlockers } from './clinical.js';
import { activeCase, projectCase, updateActiveCase } from './cases.js';
import { rolePickerView, loginView } from './views/login.js';
import { nurseView } from './views/nurse.js';
import { doctorView } from './views/doctor.js';
import { patientView } from './views/patient.js';

const root = document.getElementById('app');
const loaded = loadState();
let state = loaded.state;
let recoveryMessage = loaded.error;

function persist() {
  state = saveState(state);
  const el = document.getElementById('saveStatus');
  if (el) el.textContent = 'Đã lưu cục bộ';
}
function routeParts() { return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean); }
function currentRole() { const [page, role] = routeParts(); return page === 'workspace' ? role : state.activeRole; }
function value(id, fallback) { const el = document.getElementById(id); return el ? el.value : fallback; }
function checked(id, fallback) { const el = document.getElementById(id); return el ? el.checked : fallback; }
function replaceActiveCase(nextCase) { state = updateActiveCase(state, () => nextCase); }

function nurseUrgent(i) {
  return Number(i.spo2) < 90 || String(i.dyspnea).toLowerCase().includes('nặng') || Object.values(i.redFlags || {}).some(Boolean);
}
function getNurseBlockers(i) {
  const blockers = [];
  if (!i.spo2 || !i.heartRate || !i.dyspnea) blockers.push('Thiếu sinh hiệu hoặc mức khó thở.');
  if (nurseUrgent(i) && !i.escalationAcknowledged) blockers.push('Có red flag/cảnh báo khẩn nhưng chưa xác nhận đã escalated cho bác sĩ.');
  if (!i.medicationSafety.allergiesReviewed) blockers.push('Chưa rà soát dị ứng thuốc.');
  if (!i.medicationSafety.medicationsReviewed) blockers.push('Chưa medication reconciliation.');
  if (!i.education.identityConfirmed) blockers.push('Chưa xác nhận danh tính trước giáo dục/bàn giao.');
  if (!i.education.teachBackCompleted) blockers.push('Chưa hoàn tất teach-back.');
  if (!i.handoff.situation?.trim() || !i.handoff.assessment?.trim() || !i.handoff.recommendation?.trim()) blockers.push('SBAR chưa đủ Situation / Assessment / Recommendation.');
  return blockers;
}

function captureCurrentForm() {
  const role = currentRole();
  let current = activeCase(state);
  if (!current) return;

  if (role === 'nurse') {
    const i = current.intake;
    current = { ...current, intake: { ...i,
      spo2: Number(value('spo2', i.spo2) || 0), heartRate: Number(value('heartRate', i.heartRate) || 0), temperature: Number(value('temperature', i.temperature) || 0), systolicBP: Number(value('systolicBP', i.systolicBP) || 0), diastolicBP: Number(value('diastolicBP', i.diastolicBP) || 0), dyspnea: value('dyspnea', i.dyspnea), pain: Number(value('pain', i.pain) || 0), note: value('intakeNote', i.note).trim(),
      redFlags: { ...i.redFlags, severeDyspnea: checked('rfSevereDyspnea', i.redFlags.severeDyspnea), majorHemoptysis: checked('rfHemoptysis', i.redFlags.majorHemoptysis), alteredMentalStatus: checked('rfMental', i.redFlags.alteredMentalStatus), chestPainAcute: checked('rfChestPain', i.redFlags.chestPainAcute) },
      escalationAcknowledged: checked('escalationAcknowledged', i.escalationAcknowledged),
      medicationSafety: { ...i.medicationSafety, allergiesReviewed: checked('allergiesReviewed', i.medicationSafety.allergiesReviewed), allergies: value('allergies', i.medicationSafety.allergies).trim(), medicationsReviewed: checked('medicationsReviewed', i.medicationSafety.medicationsReviewed), currentMedications: value('currentMedications', i.medicationSafety.currentMedications).trim(), interactionConcern: value('interactionConcern', i.medicationSafety.interactionConcern).trim() },
      education: { ...i.education, identityConfirmed: checked('identityConfirmed', i.education.identityConfirmed), teachBackCompleted: checked('teachBackCompleted', i.education.teachBackCompleted), supportPerson: value('supportPerson', i.education.supportPerson).trim(), educationNote: value('educationNote', i.education.educationNote).trim() },
      handoff: { ...i.handoff, situation: value('handoffSituation', i.handoff.situation).trim(), background: value('handoffBackground', i.handoff.background).trim(), assessment: value('handoffAssessment', i.handoff.assessment).trim(), recommendation: value('handoffRecommendation', i.handoff.recommendation).trim() },
    }};
  }

  if (role === 'doctor') {
    const d = current.doctorReview;
    const nextBiomarkers = { ...d.biomarkers };
    document.querySelectorAll('[data-biomarker]').forEach(el => { nextBiomarkers[el.dataset.biomarker] = el.checked; });
    current = { ...current, doctorReview: { ...d,
      diagnosisConfirmed: checked('diagnosisConfirmed', d.diagnosisConfirmed), pathologyReviewed: checked('pathologyReviewed', d.pathologyReviewed), pathologyType: value('pathologyType', d.pathologyType), pathologyNote: value('pathologyNote', d.pathologyNote).trim(), stagingReviewed: checked('stagingReviewed', d.stagingReviewed), diseaseExtent: value('diseaseExtent', d.diseaseExtent), n2Status: value('n2Status', d.n2Status), nodalConfirmationPlan: value('nodalConfirmationPlan', d.nodalConfirmationPlan).trim(), biomarkerStatus: value('biomarkerStatus', d.biomarkerStatus), biomarkers: nextBiomarkers, mdtDecision: value('mdtDecision', d.mdtDecision).trim(), plan: value('doctorPlan', d.plan).trim(),
    }};
  }

  if (role === 'patient') {
    const p = current.patientEducation;
    const r = p.symptomReport;
    current = { ...current, patientEducation: { ...p,
      medicationAcknowledged: checked('medicationAcknowledged', p.medicationAcknowledged),
      teamMessage: value('patientTeamMessage', p.teamMessage).trim(),
      symptomReport: { ...r, dyspnea: value('patientDyspnea', r.dyspnea), pain: Number(value('patientPain', r.pain) || 0), fever: checked('patientFever', r.fever), hemoptysis: checked('patientHemoptysis', r.hemoptysis), confusion: checked('patientConfusion', r.confusion), chestPain: checked('patientChestPain', r.chestPain), note: value('patientSymptomNote', r.note).trim() },
    }};
  }

  replaceActiveCase(current);
  persist();
}

function recoveryBanner() {
  if (!recoveryMessage) return '';
  return `<div class="recovery-banner"><strong>Đã phục hồi dữ liệu demo</strong><span>${recoveryMessage}</span><button data-action="dismiss-recovery">Đóng</button></div>`;
}

function render() {
  try {
    const [page, role] = routeParts();
    const view = projectCase(state);
    let html;
    if (!page) html = rolePickerView();
    else if (page === 'login') html = loginView(role);
    else if (page === 'workspace' && role === 'nurse') html = nurseView(view);
    else if (page === 'workspace' && role === 'doctor') html = doctorView(view);
    else if (page === 'workspace' && role === 'patient') html = patientView(view);
    else html = rolePickerView();
    root.innerHTML = recoveryBanner() + html;
  } catch (error) {
    console.error(error);
    root.innerHTML = `<div class="error-shell"><div class="error-card"><div class="eyebrow">Error state</div><h1>Không thể hiển thị workspace</h1><p>${String(error.message || error)}</p><div class="action-row"><button class="secondary-btn" data-action="go-home">Về chọn vai trò</button><button class="danger-btn" data-action="reset-demo">Khôi phục dữ liệu demo</button></div></div></div>`;
  }
}

function saveNurseDraft() {
  captureCurrentForm();
  replaceActiveCase(addEvent(activeCase(state), { type: 'NURSE_DRAFT_SAVED', role: 'nurse', text: 'Điều dưỡng đã lưu nháp tiếp nhận.' }));
  persist(); render();
}
function completeNurseIntake() {
  captureCurrentForm();
  let current = activeCase(state);
  if (current.workflow.state !== 'NURSE_INTAKE') return;
  const blockers = getNurseBlockers(current.intake);
  if (blockers.length) { alert(`Chưa thể bàn giao:\n- ${blockers.join('\n- ')}`); render(); return; }
  current = { ...current, intake: { ...current.intake, completed: true } };
  current = transition(current, 'READY_FOR_DOCTOR', { role: 'nurse', text: 'Điều dưỡng hoàn tất tiếp nhận an toàn và bàn giao SBAR cho bác sĩ.' });
  replaceActiveCase(current); persist(); render();
}
function startDoctorReview() {
  const current = activeCase(state);
  if (current.workflow.state !== 'READY_FOR_DOCTOR') return;
  replaceActiveCase(transition(current, 'DOCTOR_REVIEW', { role: 'doctor', text: 'Bác sĩ bắt đầu đánh giá ca bệnh.' }));
  persist(); render();
}
function saveDoctorReview() {
  captureCurrentForm();
  replaceActiveCase(addEvent(activeCase(state), { type: 'DOCTOR_REVIEW_SAVED', role: 'doctor', text: 'Bác sĩ đã lưu đánh giá.' }));
  persist(); render();
}
function completeDoctorReview() {
  captureCurrentForm();
  let current = activeCase(state);
  if (current.workflow.state !== 'DOCTOR_REVIEW') return;
  const blockers = getDoctorBlockers(projectCase(state));
  if (blockers.length) { alert(`Chưa thể phát hành kế hoạch:\n- ${blockers.join('\n- ')}`); render(); return; }
  current = { ...current, doctorReview: { ...current.doctorReview, completed: true } };
  current = transition(current, 'PLAN_READY', { role: 'doctor', text: 'Bác sĩ hoàn tất kế hoạch và gửi hướng dẫn sang workspace bệnh nhân.' });
  replaceActiveCase(current); persist(); render();
}
function acknowledgePlan() {
  captureCurrentForm();
  let current = activeCase(state);
  if (current.workflow.state !== 'PLAN_READY') return;
  if (!current.patientEducation.medicationAcknowledged) { alert('Cần đọc và xác nhận phần hướng dẫn thuốc trước khi hoàn tất.'); state = { ...state, ui: { ...state.ui, patientStep: 'medications' } }; persist(); render(); return; }
  current = { ...current, patientEducation: { ...current.patientEducation, acknowledged: true } };
  current = transition(current, 'PATIENT_ACKNOWLEDGED', { role: 'patient', text: 'Bệnh nhân xác nhận đã đọc và hiểu kế hoạch/hướng dẫn.' });
  replaceActiveCase(current); persist(); render();
}
function submitSymptoms() {
  captureCurrentForm();
  let current = activeCase(state);
  const r = current.patientEducation.symptomReport;
  const urgent = r.hemoptysis || r.confusion || r.chestPain || r.dyspnea === 'Tăng nhiều';
  current = { ...current, patientEducation: { ...current.patientEducation, symptomReport: { ...r, submittedAt: new Date().toISOString() } } };
  current = addEvent(current, { type: urgent ? 'PATIENT_URGENT_SYMPTOM' : 'PATIENT_SYMPTOM_UPDATE', role: 'patient', text: urgent ? 'Bệnh nhân gửi cập nhật có triệu chứng cảnh báo; cần team ưu tiên xem và bệnh nhân được nhắc không chờ app nếu cần cấp cứu.' : 'Bệnh nhân đã gửi cập nhật triệu chứng.' });
  replaceActiveCase(current); persist(); render();
}
function sendPatientMessage() {
  captureCurrentForm();
  let current = activeCase(state);
  if (!current.patientEducation.teamMessage.trim()) { alert('Nhập nội dung cần gửi cho team.'); return; }
  current = { ...current, patientEducation: { ...current.patientEducation, messageSentAt: new Date().toISOString() } };
  current = addEvent(current, { type: 'PATIENT_MESSAGE', role: 'patient', text: `Bệnh nhân gửi tin nhắn cho team: ${current.patientEducation.teamMessage}` });
  replaceActiveCase(current); persist(); render();
}

root.addEventListener('click', event => {
  const button = event.target.closest('[data-action]'); if (!button) return;
  const action = button.dataset.action;
  if (action === 'login') {
    const role = button.dataset.role; const code = document.getElementById('demoCode')?.value.trim();
    if (code !== 'DEMO2026') { alert('Mã demo chưa đúng.'); return; }
    state = { ...state, activeRole: role };
    replaceActiveCase(addEvent(activeCase(state), { type: 'ROLE_LOGIN', role, text: `${role} đã vào workspace demo.` }));
    persist(); location.hash = `#/workspace/${role}`; return;
  }
  if (action === 'switch-role') { captureCurrentForm(); state = { ...state, activeRole: null }; persist(); location.hash = '#/'; return; }
  if (action === 'select-case') {
    captureCurrentForm();
    const id = button.dataset.caseId;
    if (state.cases.some(item => item.id === id)) { state = { ...state, activeCaseId: id }; persist(); render(); }
    return;
  }
  if (action === 'queue-filter') { state = { ...state, ui: { ...state.ui, queueFilter: button.dataset.filter || 'all' } }; persist(); render(); return; }
  if (action === 'doctor-step') { captureCurrentForm(); state = { ...state, ui: { ...state.ui, doctorStep: button.dataset.step } }; persist(); render(); return; }
  if (action === 'nurse-step') { captureCurrentForm(); state = { ...state, ui: { ...state.ui, nurseStep: button.dataset.step } }; persist(); render(); return; }
  if (action === 'patient-step') { captureCurrentForm(); state = { ...state, ui: { ...state.ui, patientStep: button.dataset.step } }; persist(); render(); return; }
  if (action === 'save-intake') saveNurseDraft();
  if (action === 'complete-intake') completeNurseIntake();
  if (action === 'start-doctor-review') startDoctorReview();
  if (action === 'save-doctor-review') saveDoctorReview();
  if (action === 'complete-doctor-review') completeDoctorReview();
  if (action === 'acknowledge-plan') acknowledgePlan();
  if (action === 'submit-symptoms') submitSymptoms();
  if (action === 'send-patient-message') sendPatientMessage();
  if (action === 'dismiss-recovery') { recoveryMessage = null; render(); }
  if (action === 'go-home') location.hash = '#/';
  if (action === 'reset-demo') { state = resetState(); recoveryMessage = null; location.hash = '#/'; render(); }
});

window.addEventListener('hashchange', render);
window.addEventListener('beforeunload', captureCurrentForm);
render();
