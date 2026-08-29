import { escapeHtml, taskList, timeline, workspaceShell } from './common.js';

function patientUrgent(report) {
  return Boolean(report.hemoptysis || report.confusion || report.chestPain || report.dyspnea === 'Tăng nhiều');
}

function nav(state) {
  const current = state.ui.patientStep || 'today';
  const items = [
    ['today', 'Hôm nay'],
    ['medications', 'Hướng dẫn & thuốc'],
    ['symptoms', 'Theo dõi triệu chứng'],
    ['contact', 'Xác nhận & nhắn team'],
  ];
  return `<aside class="patient-nav">${items.map(([id, label]) => `<button data-action="patient-step" data-step="${id}" class="patient-nav-btn ${current === id ? 'active' : ''}">${label}</button>`).join('')}</aside>`;
}

function todayPanel(state) {
  const ready = ['PLAN_READY', 'PATIENT_ACKNOWLEDGED'].includes(state.workflow.state);
  return `<section class="panel patient-plan">
    <div class="eyebrow">Kế hoạch hôm nay</div>
    <h2>${ready ? 'Hướng dẫn đã được bác sĩ phát hành' : 'Chưa có kế hoạch để xem'}</h2>
    ${ready
      ? `<div class="plan-copy">${escapeHtml(state.doctorReview.plan)}</div>
         ${state.doctorReview.mdtDecision ? `<div class="patient-summary-card"><strong>Tóm tắt quyết định MDT</strong><p>${escapeHtml(state.doctorReview.mdtDecision)}</p></div>` : ''}
         <div class="info-callout">Không tự thay đổi thuốc hoặc trì hoãn đánh giá y tế chỉ dựa trên nội dung trong demo này.</div>`
      : '<div class="empty-state">Khi bác sĩ hoàn tất và phát hành kế hoạch, nội dung sẽ xuất hiện tại đây.</div>'}
  </section>`;
}

function medicationsPanel(state) {
  const p = state.patientEducation;
  const ready = ['PLAN_READY', 'PATIENT_ACKNOWLEDGED'].includes(state.workflow.state);
  return `<section class="panel">
    <div class="panel-head"><div><div class="eyebrow">Hướng dẫn & thuốc</div><h2>Thông tin cần nhớ</h2></div><span class="required">Không tự chỉnh thuốc</span></div>
    ${ready ? `<div class="patient-summary-card"><strong>Thuốc hiện đang được ghi nhận</strong><p>${escapeHtml(state.intake.medicationSafety.currentMedications || 'Chưa có dữ liệu thuốc.')}</p></div>
    <div class="patient-summary-card"><strong>Dị ứng đã ghi nhận</strong><p>${escapeHtml(state.intake.medicationSafety.allergies || 'Chưa có dữ liệu dị ứng.')}</p></div>
    <label class="check-card"><input id="medicationAcknowledged" type="checkbox" ${p.medicationAcknowledged ? 'checked' : ''}><span><strong>Tôi đã đọc phần thuốc và hiểu rằng không tự ý thay đổi thuốc</strong><small>Nếu có thắc mắc về thuốc, gửi tin nhắn cho team điều trị hoặc liên hệ cơ sở y tế.</small></span></label>` : '<div class="empty-state">Phần này sẽ mở sau khi kế hoạch được bác sĩ phát hành.</div>'}
  </section>`;
}

function symptomsPanel(state) {
  const r = state.patientEducation.symptomReport;
  const urgent = patientUrgent(r);
  return `<section class="panel">
    <div class="panel-head"><div><div class="eyebrow">Theo dõi tại nhà</div><h2>Triệu chứng hiện tại</h2></div><span class="required">Tự báo cáo</span></div>
    ${urgent ? '<div class="critical-alert"><strong>CẦN ĐÁNH GIÁ KHẨN</strong><span>Có triệu chứng cảnh báo. Không chờ phản hồi trong app; liên hệ cơ sở y tế/cấp cứu phù hợp ngay.</span></div>' : ''}
    <div class="form-grid">
      <label>Khó thở<select id="patientDyspnea"><option ${r.dyspnea === 'Không tăng' ? 'selected' : ''}>Không tăng</option><option ${r.dyspnea === 'Tăng nhẹ' ? 'selected' : ''}>Tăng nhẹ</option><option ${r.dyspnea === 'Tăng nhiều' ? 'selected' : ''}>Tăng nhiều</option></select></label>
      <label>Đau (0–10)<input id="patientPain" type="number" min="0" max="10" value="${escapeHtml(r.pain)}"></label>
    </div>
    <div class="patient-flag-grid">
      <label class="check-card"><input id="patientFever" type="checkbox" ${r.fever ? 'checked' : ''}><span><strong>Sốt</strong><small>Ghi nhận để team theo dõi.</small></span></label>
      <label class="check-card"><input id="patientHemoptysis" type="checkbox" ${r.hemoptysis ? 'checked' : ''}><span><strong>Ho ra máu</strong><small>Có thể cần đánh giá khẩn tùy mức độ.</small></span></label>
      <label class="check-card"><input id="patientConfusion" type="checkbox" ${r.confusion ? 'checked' : ''}><span><strong>Lơ mơ / thay đổi tri giác</strong><small>Dấu hiệu cảnh báo khẩn.</small></span></label>
      <label class="check-card"><input id="patientChestPain" type="checkbox" ${r.chestPain ? 'checked' : ''}><span><strong>Đau ngực cấp</strong><small>Dấu hiệu cảnh báo khẩn.</small></span></label>
    </div>
    <label>Ghi chú thêm<textarea id="patientSymptomNote">${escapeHtml(r.note)}</textarea></label>
    <div class="action-row"><button class="primary-btn" data-action="submit-symptoms">Gửi cập nhật triệu chứng</button></div>
    ${r.submittedAt ? `<div class="clinical-note">Lần gửi gần nhất: ${new Date(r.submittedAt).toLocaleString('vi-VN')}</div>` : ''}
  </section>`;
}

function contactPanel(state) {
  const p = state.patientEducation;
  const ready = ['PLAN_READY', 'PATIENT_ACKNOWLEDGED'].includes(state.workflow.state);
  return `<section class="panel">
    <div class="eyebrow">Xác nhận & liên hệ</div>
    <h2>Hoàn tất hướng dẫn</h2>
    ${ready ? `<label>Nhắn team điều trị<textarea id="patientTeamMessage" placeholder="Ví dụ: Tôi chưa rõ lịch tái khám...">${escapeHtml(p.teamMessage)}</textarea></label>
      <div class="action-row"><button class="secondary-btn" data-action="send-patient-message">Gửi tin nhắn</button><button class="primary-btn" data-action="acknowledge-plan" ${state.workflow.state === 'PLAN_READY' ? '' : 'disabled'}>${p.acknowledged ? 'Đã xác nhận' : 'Tôi đã đọc và hiểu hướng dẫn'}</button></div>
      ${p.messageSentAt ? `<div class="clinical-note">Tin nhắn demo đã được ghi vào timeline lúc ${new Date(p.messageSentAt).toLocaleString('vi-VN')}.</div>` : ''}` : '<div class="empty-state">Chỉ xác nhận sau khi bác sĩ đã phát hành kế hoạch.</div>'}
  </section>`;
}

export function patientView(state) {
  const current = state.ui.patientStep || 'today';
  const panel = current === 'medications' ? medicationsPanel(state) : current === 'symptoms' ? symptomsPanel(state) : current === 'contact' ? contactPanel(state) : todayPanel(state);
  const body = `<div class="patient-layout">${nav(state)}<main class="stack">${taskList(state, 'patient')}${panel}</main><aside class="stack">${timeline(state)}</aside></div>`;
  return workspaceShell(state, 'patient', body);
}
