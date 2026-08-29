import { escapeHtml, taskList, timeline, workspaceShell } from './common.js';

export function patientView(state) {
  const ready = state.workflow.state === 'PLAN_READY';
  const done = state.patientEducation.acknowledged;
  const body = `
    <div class="workspace-grid">
      <div class="stack">
        ${taskList(state, 'patient')}
        <section class="panel patient-plan">
          <div class="eyebrow">Kế hoạch của bác sĩ</div>
          <h2>${ready || done ? 'Hướng dẫn hiện tại' : 'Chưa có kế hoạch để xem'}</h2>
          ${ready || done
            ? `<div class="plan-copy">${escapeHtml(state.doctorReview.plan)}</div>
               <div class="info-callout">Nếu khó thở tăng nhanh, ho ra máu nhiều, lơ mơ hoặc có triệu chứng cấp tính khác, liên hệ cơ sở y tế ngay. Prototype này không thay thế tư vấn cấp cứu.</div>`
            : '<div class="empty-state">Bác sĩ chưa hoàn tất kế hoạch. Khi có kế hoạch mới, nội dung sẽ xuất hiện tại đây.</div>'}
          <button class="primary-btn" data-action="acknowledge-plan" ${ready ? '' : 'disabled'}>${done ? 'Đã xác nhận' : 'Tôi đã đọc và hiểu hướng dẫn'}</button>
        </section>
      </div>
      <div class="stack">${timeline(state)}</div>
    </div>`;
  return workspaceShell(state, 'patient', body);
}
