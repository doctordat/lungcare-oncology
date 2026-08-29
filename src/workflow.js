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
  if (!canTransition(state, next)) {
    throw new Error(`Không thể chuyển ${state.workflow.state} → ${next}`);
  }

  let updated = {
    ...state,
    workflow: {
      state: next,
      updatedAt: new Date().toISOString(),
    },
  };

  updated = addEvent(updated, {
    type: 'WORKFLOW_TRANSITION',
    role: meta.role,
    text: meta.text,
  });

  return updated;
}

export function getRoleTasks(state, role) {
  const workflow = state.workflow.state;
  const tasks = {
    nurse: [
      {
        id: 'nurse-intake',
        title: 'Hoàn tất tiếp nhận ban đầu',
        detail: 'Sinh hiệu, khó thở, đau và ghi chú bàn giao.',
        status: state.intake.completed ? 'done' : workflow === 'NURSE_INTAKE' ? 'active' : 'locked',
      },
    ],
    doctor: [
      {
        id: 'doctor-staging',
        title: 'Xác nhận staging demo',
        detail: 'Đối chiếu dữ liệu đầu vào trước khi dùng cho quyết định tiếp theo.',
        status: state.doctorReview.stagingReviewed ? 'done' : ['READY_FOR_DOCTOR', 'DOCTOR_REVIEW'].includes(workflow) ? 'active' : 'locked',
      },
      {
        id: 'doctor-plan',
        title: 'Hoàn tất kế hoạch xử trí',
        detail: 'Ghi kế hoạch và bàn giao cho bệnh nhân sau khi đánh giá.',
        status: state.doctorReview.completed ? 'done' : workflow === 'DOCTOR_REVIEW' ? 'active' : 'locked',
      },
    ],
    patient: [
      {
        id: 'patient-ack',
        title: 'Xem và xác nhận hướng dẫn',
        detail: 'Chỉ mở khi bác sĩ đã hoàn tất kế hoạch.',
        status: state.patientEducation.acknowledged ? 'done' : workflow === 'PLAN_READY' ? 'active' : 'locked',
      },
    ],
  };
  return tasks[role] || [];
}
