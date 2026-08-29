import { escapeHtml, taskList, timeline, workspaceShell } from './common.js';

function hasUrgentFlag(i) {
  return Number(i.spo2) < 90 || String(i.dyspnea).toLowerCase().includes('nặng') || Object.values(i.redFlags || {}).some(Boolean);
}

function nurseBlockers(i) {
  const blockers = [];
  if (!i.spo2 || !i.heartRate || !i.dyspnea) blockers.push('Thiếu sinh hiệu hoặc mức khó thở.');
  if (hasUrgentFlag(i) && !i.escalationAcknowledged) blockers.push('Có red flag/cảnh báo khẩn nhưng chưa xác nhận đã escalated cho bác sĩ.');
  if (!i.medicationSafety.allergiesReviewed) blockers.push('Chưa rà soát dị ứng thuốc.');
  if (!i.medicationSafety.medicationsReviewed) blockers.push('Chưa medication reconciliation.');
  if (!i.education.identityConfirmed) blockers.push('Chưa xác nhận danh tính trước giáo dục/bàn giao.');
  if (!i.education.teachBackCompleted) blockers.push('Chưa hoàn tất teach-back.');
  if (!i.handoff.situation?.trim() || !i.handoff.assessment?.trim() || !i.handoff.recommendation?.trim()) blockers.push('SBAR chưa đủ Situation / Assessment / Recommendation.');
  return blockers;
}

function nav(state) {
  const active = state.ui?.nurseStep || 'overview';
  const items = [
    ['overview', '01', 'Tổng quan'],
    ['vitals', '02', 'Sinh hiệu & red flags'],
    ['meds', '03', 'Thuốc & dị ứng'],
    ['education', '04', 'Teach-back'],
    ['handoff', '05', 'Bàn giao SBAR'],
  ];
  return `<nav class="nurse-nav">${items.map(([step, no, label]) => `<button class="nurse-nav-item ${active === step ? 'active' : ''}" data-action="nurse-step" data-step="${step}"><span>${no}</span><strong>${label}</strong></button>`).join('')}</nav>`;
}

function overview(state) {
  const i = state.intake;
  const blockers = nurseBlockers(i);
  return `
    <section class="panel">
      <div class="panel-head"><div><div class="eyebrow">Nurse workspace</div><h2>Tiếp nhận ca bệnh</h2></div><span class="state-chip">${blockers.length ? `${blockers.length} blocker` : 'Sẵn sàng bàn giao'}</span></div>
      ${blockers.length ? `<div class="blocker-list">${blockers.map(x => `<div>• ${escapeHtml(x)}</div>`).join('')}</div>` : '<div class="success-callout">Dữ liệu bắt buộc đã đủ để bàn giao bác sĩ.</div>'}
      <div class="nurse-summary-grid">
        <div><span>SpO₂</span><strong>${escapeHtml(i.spo2)}%</strong></div>
        <div><span>Mạch</span><strong>${escapeHtml(i.heartRate)}/phút</strong></div>
        <div><span>Khó thở</span><strong>${escapeHtml(i.dyspnea)}</strong></div>
        <div><span>Medication safety</span><strong>${i.medicationSafety.allergiesReviewed && i.medicationSafety.medicationsReviewed ? 'Đã rà soát' : 'Chưa đủ'}</strong></div>
      </div>
    </section>
    ${taskList(state, 'nurse')}`;
}

function vitals(state) {
  const i = state.intake;
  const urgent = hasUrgentFlag(i);
  return `
    ${urgent ? '<div class="critical-alert"><strong>CẢNH BÁO KHẨN</strong><span>Có dữ liệu gợi ý cần đánh giá ngay. Điều dưỡng phải escalated cho bác sĩ; app không tự đưa y lệnh.</span></div>' : ''}
    <section class="panel">
      <div class="panel-head"><div><div class="eyebrow">Safety intake</div><h2>Sinh hiệu & red flags</h2></div><span class="required">Bắt buộc</span></div>
      <div class="form-grid">
        <label>SpO₂ (%)<input id="spo2" type="number" min="50" max="100" value="${escapeHtml(i.spo2)}"></label>
        <label>Mạch (lần/phút)<input id="heartRate" type="number" min="20" max="220" value="${escapeHtml(i.heartRate)}"></label>
        <label>HA tâm thu<input id="systolicBP" type="number" value="${escapeHtml(i.systolicBP)}"></label>
        <label>HA tâm trương<input id="diastolicBP" type="number" value="${escapeHtml(i.diastolicBP)}"></label>
        <label>Nhiệt độ (°C)<input id="temperature" type="number" step="0.1" value="${escapeHtml(i.temperature)}"></label>
        <label>Đau (0–10)<input id="pain" type="number" min="0" max="10" value="${escapeHtml(i.pain)}"></label>
        <label class="full">Mức khó thở<select id="dyspnea"><option ${i.dyspnea === 'Không' ? 'selected' : ''}>Không</option><option ${i.dyspnea === 'Nhẹ khi gắng sức' ? 'selected' : ''}>Nhẹ khi gắng sức</option><option ${i.dyspnea === 'Khó thở vừa' ? 'selected' : ''}>Khó thở vừa</option><option ${i.dyspnea === 'Khó thở nặng' ? 'selected' : ''}>Khó thở nặng</option></select></label>
      </div>
      <div class="redflag-grid">
        <label class="check-card"><input id="rfSevereDyspnea" type="checkbox" ${i.redFlags.severeDyspnea ? 'checked' : ''}><span><strong>Khó thở nặng/tiến triển nhanh</strong><small>Đánh dấu khi điều dưỡng nhận diện red flag.</small></span></label>
        <label class="check-card"><input id="rfHemoptysis" type="checkbox" ${i.redFlags.majorHemoptysis ? 'checked' : ''}><span><strong>Ho ra máu đáng kể</strong><small>Cần escalated ngay theo quy trình cơ sở.</small></span></label>
        <label class="check-card"><input id="rfMental" type="checkbox" ${i.redFlags.alteredMentalStatus ? 'checked' : ''}><span><strong>Rối loạn tri giác mới</strong><small>Không chờ hoàn tất checklist thường quy.</small></span></label>
        <label class="check-card"><input id="rfChestPain" type="checkbox" ${i.redFlags.chestPainAcute ? 'checked' : ''}><span><strong>Đau ngực cấp</strong><small>Cần đánh giá khẩn theo bối cảnh.</small></span></label>
      </div>
      ${urgent ? `<label class="escalation-box"><input id="escalationAcknowledged" type="checkbox" ${i.escalationAcknowledged ? 'checked' : ''}><span><strong>Tôi đã escalated cảnh báo này cho bác sĩ/đội cấp cứu phù hợp</strong><small>Đây là xác nhận quy trình, không phải y lệnh.</small></span></label>` : ''}
      <label>Ghi chú tiếp nhận<textarea id="intakeNote">${escapeHtml(i.note)}</textarea></label>
    </section>`;
}

function meds(state) {
  const m = state.intake.medicationSafety;
  return `<section class="panel">
    <div class="panel-head"><div><div class="eyebrow">Medication safety</div><h2>Thuốc & dị ứng</h2></div><span class="required">Bắt buộc</span></div>
    <div class="check-grid">
      <label class="check-card"><input id="allergiesReviewed" type="checkbox" ${m.allergiesReviewed ? 'checked' : ''}><span><strong>Đã rà soát dị ứng</strong><small>Không để trống hoặc mặc định “không dị ứng” nếu chưa hỏi.</small></span></label>
      <label class="check-card"><input id="medicationsReviewed" type="checkbox" ${m.medicationsReviewed ? 'checked' : ''}><span><strong>Đã medication reconciliation</strong><small>Đối chiếu thuốc đang dùng và thuốc tự mua.</small></span></label>
    </div>
    <label>Dị ứng / phản ứng có hại đã biết<textarea id="allergies">${escapeHtml(m.allergies)}</textarea></label>
    <label>Thuốc đang dùng<textarea id="currentMedications">${escapeHtml(m.currentMedications)}</textarea></label>
    <label>Vấn đề cần bác sĩ kiểm tra<textarea id="interactionConcern" placeholder="Ví dụ: thuốc mới, trùng hoạt chất, nguy cơ tương tác...">${escapeHtml(m.interactionConcern)}</textarea></label>
    <div class="clinical-note">Điều dưỡng ghi nhận và escalated vấn đề an toàn thuốc; app không tự ngưng, đổi hoặc kê thuốc.</div>
  </section>`;
}

function education(state) {
  const e = state.intake.education;
  return `<section class="panel">
    <div class="panel-head"><div><div class="eyebrow">Patient communication</div><h2>Teach-back</h2></div><span class="required">Bắt buộc</span></div>
    <div class="check-grid">
      <label class="check-card"><input id="identityConfirmed" type="checkbox" ${e.identityConfirmed ? 'checked' : ''}><span><strong>Đã xác nhận đúng người bệnh</strong><small>Dùng quy trình định danh của cơ sở.</small></span></label>
      <label class="check-card"><input id="teachBackCompleted" type="checkbox" ${e.teachBackCompleted ? 'checked' : ''}><span><strong>Đã hoàn tất teach-back</strong><small>Người bệnh/người chăm sóc nhắc lại được ý chính.</small></span></label>
    </div>
    <label>Người hỗ trợ/người chăm sóc<input id="supportPerson" value="${escapeHtml(e.supportPerson)}" placeholder="Nếu có"></label>
    <label>Ghi chú giáo dục<textarea id="educationNote" placeholder="Điểm người bệnh hiểu/chưa hiểu, nội dung cần nhắc lại...">${escapeHtml(e.educationNote)}</textarea></label>
  </section>`;
}

function handoff(state) {
  const h = state.intake.handoff;
  const blockers = nurseBlockers(state.intake);
  return `<section class="panel">
    <div class="panel-head"><div><div class="eyebrow">Structured handoff</div><h2>SBAR → Bác sĩ</h2></div><span class="required">Nguồn bàn giao duy nhất</span></div>
    <label>Situation<textarea id="handoffSituation">${escapeHtml(h.situation)}</textarea></label>
    <label>Background<textarea id="handoffBackground">${escapeHtml(h.background)}</textarea></label>
    <label>Assessment<textarea id="handoffAssessment" placeholder="Tóm tắt đánh giá điều dưỡng, red flags, vấn đề an toàn...">${escapeHtml(h.assessment)}</textarea></label>
    <label>Recommendation<textarea id="handoffRecommendation">${escapeHtml(h.recommendation)}</textarea></label>
    ${blockers.length ? `<div class="blocker-list"><strong>Chưa thể bàn giao</strong>${blockers.map(x => `<div>• ${escapeHtml(x)}</div>`).join('')}</div>` : '<div class="success-callout">Không còn blocker bắt buộc.</div>'}
    <div class="action-row"><button class="secondary-btn" data-action="save-intake">Lưu nháp</button><button class="primary-btn" data-action="complete-intake" ${state.workflow.state !== 'NURSE_INTAKE' || blockers.length ? 'disabled' : ''}>Hoàn tất & bàn giao bác sĩ</button></div>
  </section>`;
}

export function nurseView(state) {
  const step = state.ui?.nurseStep || 'overview';
  const content = step === 'vitals' ? vitals(state) : step === 'meds' ? meds(state) : step === 'education' ? education(state) : step === 'handoff' ? handoff(state) : overview(state);
  const body = `<div class="nurse-layout"><div class="stack">${nav(state)}${content}</div><div class="stack"><section class="panel compact"><div class="eyebrow">Ca hiện tại</div><h2>${escapeHtml(state.patient.name)}</h2><div class="metric-row"><span>Trạng thái</span><strong>${escapeHtml(state.workflow.state)}</strong></div><div class="metric-row"><span>Chẩn đoán demo</span><strong>${escapeHtml(state.patient.diagnosis)}</strong></div><div class="metric-row"><span>ECOG</span><strong>${escapeHtml(state.patient.ecog)}</strong></div></section>${timeline(state)}</div></div>`;
  return workspaceShell(state, 'nurse', body);
}
