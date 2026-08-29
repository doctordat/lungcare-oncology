import { escapeHtml, taskList, timeline, workspaceShell } from './common.js';

export function doctorView(state) {
  const d = state.doctorReview;
  const canStart = state.workflow.state === 'READY_FOR_DOCTOR';
  const canComplete = state.workflow.state === 'DOCTOR_REVIEW' && d.stagingReviewed && d.pathologyReviewed && d.plan.trim().length > 0;
  const body = `
    <div class="workspace-grid">
      <div class="stack">
        ${taskList(state, 'doctor')}
        <section class="panel">
          <div class="panel-head"><div><div class="eyebrow">Clinical review</div><h2>Đánh giá của bác sĩ</h2></div><span class="required">MDT required</span></div>
          ${state.workflow.state === 'READY_FOR_DOCTOR' ? '<div class="info-callout">Điều dưỡng đã hoàn tất tiếp nhận. Bắt đầu đánh giá để khóa dữ liệu đầu vào hiện tại và lập kế hoạch.</div>' : ''}
          <div class="check-grid">
            <label class="check-card"><input id="stagingReviewed" type="checkbox" ${d.stagingReviewed ? 'checked' : ''}><span><strong>Đã xem staging demo</strong><small>${escapeHtml(state.patient.tnm)} · ${escapeHtml(state.patient.stage)}</small></span></label>
            <label class="check-card"><input id="pathologyReviewed" type="checkbox" ${d.pathologyReviewed ? 'checked' : ''}><span><strong>Đã xem mô bệnh học / dữ liệu còn thiếu</strong><small>Không tự suy diễn khi dữ liệu chưa đủ.</small></span></label>
          </div>
          <label>Kế hoạch xử trí<textarea id="doctorPlan">${escapeHtml(d.plan)}</textarea></label>
          <div class="clinical-note">Khuyến nghị trong prototype chỉ là hỗ trợ quyết định. Không thay thế hội chẩn, guideline hiện hành hoặc y lệnh do bác sĩ ký.</div>
          <div class="action-row">
            ${canStart ? '<button class="primary-btn" data-action="start-doctor-review">Bắt đầu đánh giá</button>' : ''}
            <button class="secondary-btn" data-action="save-doctor-review" ${!['DOCTOR_REVIEW','PLAN_READY'].includes(state.workflow.state) ? 'disabled' : ''}>Lưu đánh giá</button>
            <button class="primary-btn" data-action="complete-doctor-review" ${canComplete ? '' : 'disabled'}>Hoàn tất & gửi bệnh nhân</button>
          </div>
        </section>
      </div>
      <div class="stack">
        <section class="panel compact">
          <div class="eyebrow">Nurse handoff</div>
          <h2>Dữ liệu bàn giao</h2>
          <div class="metric-row"><span>SpO₂</span><strong>${escapeHtml(state.intake.spo2)}%</strong></div>
          <div class="metric-row"><span>Mạch</span><strong>${escapeHtml(state.intake.heartRate)}/phút</strong></div>
          <div class="metric-row"><span>Khó thở</span><strong>${escapeHtml(state.intake.dyspnea)}</strong></div>
          <div class="metric-row"><span>Đau</span><strong>${escapeHtml(state.intake.pain)}/10</strong></div>
          <p class="note-box">${escapeHtml(state.intake.note)}</p>
        </section>
        ${timeline(state)}
      </div>
    </div>`;
  return workspaceShell(state, 'doctor', body);
}
