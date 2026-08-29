import { escapeHtml, timeline, workspaceShell } from './common.js';
import { BIOMARKERS, EVIDENCE_NOTES, clinicalPrompts, getDataCompleteness, getDoctorBlockers } from '../clinical.js';

const STEPS = [
  ['overview', 'Tổng quan'],
  ['pathology', 'Mô bệnh học'],
  ['staging', 'Staging'],
  ['biomarkers', 'Biomarker'],
  ['mdt', 'MDT & kế hoạch'],
];

function stepStatus(state, step) {
  const d = state.doctorReview;
  if (step === 'overview') return 'done';
  if (step === 'pathology') return d.diagnosisConfirmed && d.pathologyReviewed ? 'done' : 'todo';
  if (step === 'staging') return d.stagingReviewed && (d.n2Status !== 'suspected' || d.nodalConfirmationPlan.trim()) ? 'done' : 'todo';
  if (step === 'biomarkers') return d.diseaseExtent !== 'advanced' || d.biomarkerStatus === 'complete' ? 'done' : 'todo';
  if (step === 'mdt') return d.mdtDecision.trim() && d.plan.trim() ? 'done' : 'todo';
  return 'todo';
}

function nav(state) {
  const active = state.ui.doctorStep || 'overview';
  return `<aside class="doctor-nav panel compact">
    <div class="eyebrow">Case queue</div>
    <div class="case-row active"><div><strong>${escapeHtml(state.patient.name)}</strong><span>${escapeHtml(state.patient.id)} · DEMO</span></div><span class="case-dot"></span></div>
    <div class="divider"></div>
    <div class="eyebrow">Clinical workflow</div>
    <div class="doctor-step-list">${STEPS.map(([id,label],i)=>`<button class="doctor-step ${active===id?'active':''}" data-action="doctor-step" data-step="${id}"><span>${i+1}</span><b>${label}</b><i class="${stepStatus(state,id)}"></i></button>`).join('')}</div>
    <button class="secondary-btn fullish" disabled>Thêm ca — Chưa triển khai</button>
  </aside>`;
}

function overview(state) {
  const pct = getDataCompleteness(state);
  const prompts = clinicalPrompts(state);
  return `<section class="panel doctor-section">
    <div class="panel-head"><div><div class="eyebrow">Overview</div><h2>Tóm tắt ca & dữ liệu bàn giao</h2></div><div class="completeness"><strong>${pct}%</strong><span>đủ dữ liệu</span></div></div>
    ${state.workflow.state === 'READY_FOR_DOCTOR' ? '<div class="info-callout">Điều dưỡng đã bàn giao. Bấm “Bắt đầu đánh giá” để chuyển ca sang trạng thái bác sĩ đang review.</div>' : ''}
    <div class="metric-grid">
      <div><span>SpO₂</span><strong>${escapeHtml(state.intake.spo2)}%</strong></div>
      <div><span>Mạch</span><strong>${escapeHtml(state.intake.heartRate)}/phút</strong></div>
      <div><span>Khó thở</span><strong>${escapeHtml(state.intake.dyspnea)}</strong></div>
      <div><span>Đau</span><strong>${escapeHtml(state.intake.pain)}/10</strong></div>
    </div>
    <p class="note-box">${escapeHtml(state.intake.note)}</p>
    <div class="prompt-list">${prompts.map(p=>`<div class="clinical-prompt ${p.level}"><strong>${escapeHtml(p.title)}</strong><span>${escapeHtml(p.text)}</span></div>`).join('')}</div>
    ${state.workflow.state === 'READY_FOR_DOCTOR' ? '<div class="action-row"><button class="primary-btn" data-action="start-doctor-review">Bắt đầu đánh giá</button></div>' : ''}
  </section>`;
}

function pathology(state) {
  const d = state.doctorReview;
  return `<section class="panel doctor-section"><div class="eyebrow">Step 2</div><h2>Mô bệnh học & chẩn đoán</h2>
    <div class="check-grid">
      <label class="check-card"><input id="diagnosisConfirmed" type="checkbox" ${d.diagnosisConfirmed?'checked':''}><span><strong>Đã xác nhận chẩn đoán mô học</strong><small>Không tick nếu mới chỉ nghi ngờ trên hình ảnh.</small></span></label>
      <label class="check-card"><input id="pathologyReviewed" type="checkbox" ${d.pathologyReviewed?'checked':''}><span><strong>Đã review mẫu / IHC / độ đầy đủ</strong><small>Ghi nhận rõ dữ liệu còn thiếu.</small></span></label>
    </div>
    <div class="form-grid"><label>Phân loại mô học<select id="pathologyType"><option ${d.pathologyType==='NSCLC — chưa định subtype'?'selected':''}>NSCLC — chưa định subtype</option><option ${d.pathologyType==='Adenocarcinoma'?'selected':''}>Adenocarcinoma</option><option ${d.pathologyType==='Squamous cell carcinoma'?'selected':''}>Squamous cell carcinoma</option><option ${d.pathologyType==='SCLC'?'selected':''}>SCLC</option><option ${d.pathologyType==='Khác / chưa xác định'?'selected':''}>Khác / chưa xác định</option></select></label>
    <label class="full">Ghi chú pathology<textarea id="pathologyNote">${escapeHtml(d.pathologyNote)}</textarea></label></div>
  </section>`;
}

function staging(state) {
  const d = state.doctorReview;
  return `<section class="panel doctor-section"><div class="panel-head"><div><div class="eyebrow">Step 3</div><h2>Clinical staging</h2></div><span class="evidence-chip">IASLC TNM 9</span></div>
    <div class="stage-hero"><span>Staging đang lưu trong demo</span><strong>${escapeHtml(state.patient.tnm)}</strong><small>${escapeHtml(state.patient.stage)}</small></div>
    <label class="check-card single"><input id="stagingReviewed" type="checkbox" ${d.stagingReviewed?'checked':''}><span><strong>Đã đối chiếu staging với dữ liệu hiện có</strong><small>Không xem staging demo là kết luận chính thức.</small></span></label>
    <div class="form-grid">
      <label>Phạm vi bệnh<select id="diseaseExtent"><option value="locoregional" ${d.diseaseExtent==='locoregional'?'selected':''}>Khu trú / tại vùng</option><option value="advanced" ${d.diseaseExtent==='advanced'?'selected':''}>Tiến xa / di căn</option><option value="uncertain" ${d.diseaseExtent==='uncertain'?'selected':''}>Chưa xác định</option></select></label>
      <label>Tình trạng N2<select id="n2Status"><option value="suspected" ${d.n2Status==='suspected'?'selected':''}>Nghi ngờ — chưa xác nhận</option><option value="confirmed" ${d.n2Status==='confirmed'?'selected':''}>Đã xác nhận</option><option value="not_applicable" ${d.n2Status==='not_applicable'?'selected':''}>Không áp dụng</option></select></label>
      <label class="full">Kế hoạch xác nhận hạch / staging bổ sung<textarea id="nodalConfirmationPlan" placeholder="Ví dụ: lấy mẫu hạch trung thất khi kết quả có thể thay đổi chiến lược điều trị.">${escapeHtml(d.nodalConfirmationPlan)}</textarea></label>
    </div>
  </section>`;
}

function biomarkers(state) {
  const d = state.doctorReview;
  return `<section class="panel doctor-section"><div class="eyebrow">Step 4</div><h2>Biomarker / molecular</h2>
    <div class="clinical-note">Đây là checklist độ đầy đủ dữ liệu. Không phải engine chọn thuốc. Nếu đánh dấu bệnh tiến xa, trạng thái “hoàn tất” mới cho phép đóng blocker biomarker.</div>
    <label>Trạng thái xét nghiệm<select id="biomarkerStatus"><option value="pending" ${d.biomarkerStatus==='pending'?'selected':''}>Đang chờ / chưa đủ</option><option value="complete" ${d.biomarkerStatus==='complete'?'selected':''}>Đã có đủ dữ liệu cần thiết</option><option value="not_required_yet" ${d.biomarkerStatus==='not_required_yet'?'selected':''}>Chưa yêu cầu ở bước hiện tại</option></select></label>
    <div class="biomarker-grid">${BIOMARKERS.map(name=>`<label class="biomarker-item"><input type="checkbox" data-biomarker="${escapeHtml(name)}" ${d.biomarkers[name]?'checked':''}><span>${escapeHtml(name)}</span></label>`).join('')}</div>
  </section>`;
}

function mdt(state) {
  const d = state.doctorReview;
  const blockers = getDoctorBlockers(state);
  const canComplete = state.workflow.state === 'DOCTOR_REVIEW' && blockers.length === 0;
  return `<section class="panel doctor-section"><div class="panel-head"><div><div class="eyebrow">Step 5</div><h2>MDT & kế hoạch bàn giao</h2></div><span class="required">Clinician sign-off</span></div>
    ${blockers.length ? `<div class="blocker-box"><strong>Chưa thể phát hành kế hoạch</strong>${blockers.map(x=>`<div>• ${escapeHtml(x)}</div>`).join('')}</div>` : '<div class="success-box"><strong>Dữ liệu bắt buộc đã đủ cho demo workflow.</strong><span>Vẫn cần bác sĩ/MDT chịu trách nhiệm quyết định thực tế.</span></div>'}
    <label>Kết luận MDT<textarea id="mdtDecision" placeholder="Tóm tắt kết luận đa chuyên khoa, lý do và dữ liệu đầu vào.">${escapeHtml(d.mdtDecision)}</textarea></label>
    <label>Hướng dẫn / kế hoạch gửi bệnh nhân<textarea id="doctorPlan">${escapeHtml(d.plan)}</textarea></label>
    <div class="action-row"><button class="secondary-btn" data-action="save-doctor-review" ${state.workflow.state!=='DOCTOR_REVIEW'?'disabled':''}>Lưu đánh giá</button><button class="primary-btn" data-action="complete-doctor-review" ${canComplete?'':'disabled'}>Phát hành sang bệnh nhân</button></div>
  </section>`;
}

function content(state) {
  const step = state.ui.doctorStep || 'overview';
  if (step === 'pathology') return pathology(state);
  if (step === 'staging') return staging(state);
  if (step === 'biomarkers') return biomarkers(state);
  if (step === 'mdt') return mdt(state);
  return overview(state);
}

function evidence() {
  return `<section class="panel compact"><div class="eyebrow">Evidence & provenance</div><h2>Nguồn logic</h2>${EVIDENCE_NOTES.map(x=>`<div class="evidence-row"><span>${x.label}</span><p>${x.text}</p></div>`).join('')}</section>`;
}

export function doctorView(state) {
  const body = `<div class="doctor-layout">${nav(state)}<div class="stack">${content(state)}</div><div class="stack">${evidence()}${timeline(state)}</div></div>`;
  return workspaceShell(state, 'doctor', body);
}
