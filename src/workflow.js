import { addEvent } from './store.js';

export const WORKFLOW_LABELS = {
  NURSE_INTAKE: 'Điều dưỡng tiếp nhận',
  READY_FOR_DOCTOR: 'Chờ bác sĩ đánh giá',
  DOCTOR_REVIEW: 'Bác sĩ đang đánh giá',
  PLAN_READY: 'Kế hoạch đã sẵn sàng',
  PATIENT_ACKNOWLEDGED: 'Bệnh nhân đã xác nhận',
};

const transitions = {
  NURSE_INTAKE: ['READY_FOR_DOCTOR'],
  READY_FOR_DOCTOR: ['DOCTOR_REVIEW'],
  DOCTOR_REVIEW: ['PLAN_READY'],
  PLAN_READY: ['PATIENT_ACKNOWLEDGED'],
  PATIENT_ACKNOWLEDGED: [],
};

export function canTransition(state, next) {
  return transitions[state.workflow.state]?.includes(next) ?? false;
}

export function transition(state, next, meta) {
  if (!canTransition(state, next)) throw new Error(`Không thể chuyển ${state.workflow.state} → ${next}`);
  let updated = { ...state, workflow: { state: next, updatedAt: new Date().toISOString() } };
  updated = addEvent(updated, { type: 'WORKFLOW_TRANSITION', role: meta.role, text: meta.text });
  return updated;
}

export function getRoleTasks(state, role) {
  const workflow = state.workflow.state;
  const i = state.intake;
  const p = state.patientEducation;
  const planReady = ['PLAN_READY', 'PATIENT_ACKNOWLEDGED'].includes(workflow);
  const medicationReady = i.medicationSafety.allergiesReviewed && i.medicationSafety.medicationsReviewed;
  const educationReady = i.education.identityConfirmed && i.education.teachBackCompleted;
  const handoffReady = Boolean(i.handoff.situation?.trim() && i.handoff.assessment?.trim() && i.handoff.recommendation?.trim());
  const tasks = {
    nurse: [
      { id: 'nurse-vitals', title: 'Sinh hiệu & red flags', detail: 'Ghi nhận sinh hiệu, triệu chứng và escalated nếu có cảnh báo khẩn.', status: i.spo2 && i.heartRate && i.dyspnea ? 'done' : workflow === 'NURSE_INTAKE' ? 'active' : 'locked' },
      { id: 'nurse-medication', title: 'Thuốc & dị ứng', detail: 'Medication reconciliation và ghi nhận vấn đề cần bác sĩ kiểm tra.', status: medicationReady ? 'done' : workflow === 'NURSE_INTAKE' ? 'active' : 'locked' },
      { id: 'nurse-education', title: 'Teach-back', detail: 'Xác nhận danh tính và khả năng nhắc lại hướng dẫn chính.', status: educationReady ? 'done' : workflow === 'NURSE_INTAKE' ? 'active' : 'locked' },
      { id: 'nurse-handoff', title: 'Bàn giao SBAR', detail: 'Một nguồn bàn giao duy nhất sang workspace bác sĩ.', status: i.completed ? 'done' : handoffReady && workflow === 'NURSE_INTAKE' ? 'active' : workflow === 'NURSE_INTAKE' ? 'active' : 'locked' },
    ],
    doctor: [
      { id: 'doctor-staging', title: 'Xác nhận staging demo', detail: 'Đối chiếu dữ liệu đầu vào trước khi dùng cho quyết định tiếp theo.', status: state.doctorReview.stagingReviewed ? 'done' : ['READY_FOR_DOCTOR', 'DOCTOR_REVIEW'].includes(workflow) ? 'active' : 'locked' },
      { id: 'doctor-plan', title: 'Hoàn tất kế hoạch xử trí', detail: 'Ghi kế hoạch và bàn giao cho bệnh nhân sau khi đánh giá.', status: state.doctorReview.completed ? 'done' : workflow === 'DOCTOR_REVIEW' ? 'active' : 'locked' },
    ],
    patient: [
      { id: 'patient-plan', title: 'Xem kế hoạch hôm nay', detail: 'Kế hoạch chỉ xuất hiện sau khi bác sĩ phát hành.', status: planReady ? 'done' : 'locked' },
      { id: 'patient-medications', title: 'Đọc hướng dẫn thuốc', detail: 'Xác nhận hiểu rằng không tự ý thay đổi thuốc.', status: p.medicationAcknowledged ? 'done' : planReady ? 'active' : 'locked' },
      { id: 'patient-symptoms', title: 'Cập nhật triệu chứng', detail: 'Báo triệu chứng mới hoặc nặng lên cho team.', status: p.symptomReport.submittedAt ? 'done' : planReady ? 'active' : 'locked' },
      { id: 'patient-ack', title: 'Xác nhận hướng dẫn', detail: 'Xác nhận sau khi đã đọc kế hoạch và hướng dẫn.', status: p.acknowledged ? 'done' : workflow === 'PLAN_READY' ? 'active' : 'locked' },
    ],
  };
  return tasks[role] || [];
}
