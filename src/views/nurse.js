import { escapeHtml, taskList, timeline, workspaceShell } from './common.js';

export function nurseView(state) {
  const i = state.intake;
  const urgent = Number(i.spo2) < 90 || String(i.dyspnea).toLowerCase().includes('nặng');
  const body = `
    ${urgent ? '<div class="critical-alert"><strong>CẢNH BÁO KHẨN</strong><span>SpO₂ thấp hoặc khó thở nặng. Cần đánh giá ngay và bàn giao bác sĩ.</span></div>' : ''}
    <div class="workspace-grid">
      <div class="stack">
        ${taskList(state, 'nurse')}
        <section class="panel">
          <div class="panel-head"><div><div class="eyebrow">Tiếp nhận</div><h2>Sinh hiệu & triệu chứng</h2></div><span class="required">Bắt buộc</span></div>
          <div class="form-grid">
            <label>SpO₂ (%)<input id="spo2" type="number" min="50" max="100" value="${escapeHtml(i.spo2)}"></label>
            <label>Mạch (lần/phút)<input id="heartRate" type="number" min="20" max="220" value="${escapeHtml(i.heartRate)}"></label>
            <label>Mức khó thở<select id="dyspnea"><option ${i.dyspnea === 'Không' ? 'selected' : ''}>Không</option><option ${i.dyspnea === 'Nhẹ khi gắng sức' ? 'selected' : ''}>Nhẹ khi gắng sức</option><option ${i.dyspnea === 'Khó thở vừa' ? 'selected' : ''}>Khó thở vừa</option><option ${i.dyspnea === 'Khó thở nặng' ? 'selected' : ''}>Khó thở nặng</option></select></label>
            <label>Đau (0–10)<input id="pain" type="number" min="0" max="10" value="${escapeHtml(i.pain)}"></label>
            <label class="full">Ghi chú bàn giao<textarea id="intakeNote">${escapeHtml(i.note)}</textarea></label>
          </div>
          <div class="action-row">
            <button class="secondary-btn" data-action="save-intake">Lưu nháp</button>
            <button class="primary-btn" data-action="complete-intake" ${state.workflow.state !== 'NURSE_INTAKE' ? 'disabled' : ''}>Hoàn tất & bàn giao bác sĩ</button>
          </div>
        </section>
      </div>
      <div class="stack">${timeline(state)}</div>
    </div>`;
  return workspaceShell(state, 'nurse', body);
}
