import { loadState, saveState, resetState, addEvent } from './store.js';
import { transition } from './workflow.js';
import { getDoctorBlockers } from './clinical.js';
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

function setState(next) {
  state = next;
  persist();
  render();
}

function routeParts() {
  return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
}

function currentRole() {
  const [page, role] = routeParts();
  if (page === 'workspace') return role;
  return state.activeRole;
}

function value(id, fallback) {
  const el = document.getElementById(id);
  return el ? el.value : fallback;
}

function checked(id, fallback) {
  const el = document.getElementById(id);
  return el ? el.checked : fallback;
}

function captureCurrentForm() {
  const role = currentRole();
  if (role === 'nurse' && document.getElementById('spo2')) {
    state = {
      ...state,
      intake: {
        ...state.intake,
        spo2: Number(document.getElementById('spo2').value || 0),
        heartRate: Number(document.getElementById('heartRate').value || 0),
        dyspnea: document.getElementById('dyspnea').value,
        pain: Number(document.getElementById('pain').value || 0),
        note: document.getElementById('intakeNote').value.trim(),
      },
    };
  }

  if (role === 'doctor') {
    const d = state.doctorReview;
    const nextBiomarkers = { ...d.biomarkers };
    document.querySelectorAll('[data-biomarker]').forEach((el) => {
      nextBiomarkers[el.dataset.biomarker] = el.checked;
    });
    state = {
      ...state,
      doctorReview: {
        ...d,
        diagnosisConfirmed: checked('diagnosisConfirmed', d.diagnosisConfirmed),
        pathologyReviewed: checked('pathologyReviewed', d.pathologyReviewed),
        pathologyType: value('pathologyType', d.pathologyType),
        pathologyNote: value('pathologyNote', d.pathologyNote).trim(),
        stagingReviewed: checked('stagingReviewed', d.stagingReviewed),
        diseaseExtent: value('diseaseExtent', d.diseaseExtent),
        n2Status: value('n2Status', d.n2Status),
        nodalConfirmationPlan: value('nodalConfirmationPlan', d.nodalConfirmationPlan).trim(),
        biomarkerStatus: value('biomarkerStatus', d.biomarkerStatus),
        biomarkers: nextBiomarkers,
        mdtDecision: value('mdtDecision', d.mdtDecision).trim(),
        plan: value('doctorPlan', d.plan).trim(),
      },
    };
  }
  persist();
}

function recoveryBanner() {
  if (!recoveryMessage) return '';
  return `<div class="recovery-banner"><strong>Đã phục hồi dữ liệu demo</strong><span>${recoveryMessage}</span><button data-action="dismiss-recovery">Đóng</button></div>`;
}

function render() {
  try {
    const [page, role] = routeParts();
    let html;
    if (!page) html = rolePickerView();
    else if (page === 'login') html = loginView(role);
    else if (page === 'workspace' && role === 'nurse') html = nurseView(state);
    else if (page === 'workspace' && role === 'doctor') html = doctorView(state);
    else if (page === 'workspace' && role === 'patient') html = patientView(state);
    else html = rolePickerView();
    root.innerHTML = recoveryBanner() + html;
  } catch (error) {
    console.error(error);
    root.innerHTML = `<div class="error-shell"><div class="error-card"><div class="eyebrow">Error state</div><h1>Không thể hiển thị workspace</h1><p>${String(error.message || error)}</p><div class="action-row"><button class="secondary-btn" data-action="go-home">Về chọn vai trò</button><button class="danger-btn" data-action="reset-demo">Khôi phục dữ liệu demo</button></div></div></div>`;
  }
}

function saveNurseDraft() {
  captureCurrentForm();
  state = addEvent(state, { type: 'NURSE_DRAFT_SAVED', role: 'nurse', text: 'Điều dưỡng đã lưu nháp tiếp nhận.' });
  persist();
  render();
}

function completeNurseIntake() {
  captureCurrentForm();
  if (state.workflow.state !== 'NURSE_INTAKE') return;
  if (!state.intake.spo2 || !state.intake.heartRate || !state.intake.dyspnea) {
    alert('Cần nhập đủ SpO₂, mạch và mức khó thở trước khi bàn giao.');
    return;
  }
  state = { ...state, intake: { ...state.intake, completed: true } };
  state = transition(state, 'READY_FOR_DOCTOR', { role: 'nurse', text: 'Điều dưỡng hoàn tất tiếp nhận và bàn giao ca cho bác sĩ.' });
  persist();
  render();
}

function startDoctorReview() {
  if (state.workflow.state !== 'READY_FOR_DOCTOR') return;
  setState(transition(state, 'DOCTOR_REVIEW', { role: 'doctor', text: 'Bác sĩ bắt đầu đánh giá ca bệnh.' }));
}

function saveDoctorReview() {
  captureCurrentForm();
  state = addEvent(state, { type: 'DOCTOR_REVIEW_SAVED', role: 'doctor', text: 'Bác sĩ đã lưu đánh giá.' });
  persist();
  render();
}

function completeDoctorReview() {
  captureCurrentForm();
  if (state.workflow.state !== 'DOCTOR_REVIEW') return;
  const blockers = getDoctorBlockers(state);
  if (blockers.length) {
    alert(`Chưa thể phát hành kế hoạch:\n- ${blockers.join('\n- ')}`);
    render();
    return;
  }
  state = { ...state, doctorReview: { ...state.doctorReview, completed: true } };
  state = transition(state, 'PLAN_READY', { role: 'doctor', text: 'Bác sĩ hoàn tất kế hoạch và gửi hướng dẫn sang workspace bệnh nhân.' });
  persist();
  render();
}

function acknowledgePlan() {
  if (state.workflow.state !== 'PLAN_READY') return;
  state = { ...state, patientEducation: { ...state.patientEducation, acknowledged: true } };
  state = transition(state, 'PATIENT_ACKNOWLEDGED', { role: 'patient', text: 'Bệnh nhân xác nhận đã đọc và hiểu hướng dẫn.' });
  persist();
  render();
}

root.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;

  if (action === 'login') {
    const role = button.dataset.role;
    const code = document.getElementById('demoCode')?.value.trim();
    if (code !== 'DEMO2026') {
      alert('Mã demo chưa đúng.');
      return;
    }
    state = addEvent({ ...state, activeRole: role }, { type: 'ROLE_LOGIN', role, text: `${role} đã vào workspace demo.` });
    persist();
    location.hash = `#/workspace/${role}`;
    return;
  }

  if (action === 'switch-role') {
    captureCurrentForm();
    state = { ...state, activeRole: null };
    persist();
    location.hash = '#/';
    return;
  }

  if (action === 'doctor-step') {
    captureCurrentForm();
    state = { ...state, ui: { ...state.ui, doctorStep: button.dataset.step } };
    persist();
    render();
    return;
  }

  if (action === 'save-intake') saveNurseDraft();
  if (action === 'complete-intake') completeNurseIntake();
  if (action === 'start-doctor-review') startDoctorReview();
  if (action === 'save-doctor-review') saveDoctorReview();
  if (action === 'complete-doctor-review') completeDoctorReview();
  if (action === 'acknowledge-plan') acknowledgePlan();
  if (action === 'dismiss-recovery') { recoveryMessage = null; render(); }
  if (action === 'go-home') { location.hash = '#/'; }
  if (action === 'reset-demo') {
    state = resetState();
    recoveryMessage = null;
    location.hash = '#/';
    render();
  }
});

window.addEventListener('hashchange', render);
window.addEventListener('beforeunload', captureCurrentForm);
render();
