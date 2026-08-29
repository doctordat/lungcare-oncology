import { WORKFLOW_LABELS, getRoleTasks } from '../workflow.js';

export const ROLE_META = {
  doctor: { label: 'Bác sĩ', eyebrow: 'Doctor workspace' },
  nurse: { label: 'Điều dưỡng', eyebrow: 'Nurse workspace' },
  patient: { label: 'Bệnh nhân', eyebrow: 'Patient workspace' },
};

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function taskList(state, role) {
  const items = getRoleTasks(state, role);
  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <div class="eyebrow">Nhiệm vụ</div>
          <h2>Việc cần làm</h2>
        </div>
        <span class="state-chip">${escapeHtml(WORKFLOW_LABELS[state.workflow.state] || state.workflow.state)}</span>
      </div>
      <div class="task-list">
        ${items.map(task => `
          <div class="task ${task.status}">
            <div class="task-mark">${task.status === 'done' ? '✓' : task.status === 'active' ? '•' : '–'}</div>
            <div>
              <strong>${escapeHtml(task.title)}</strong>
              <p>${escapeHtml(task.detail)}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>`;
}

export function patientHeader(state) {
  const p = state.patient;
  return `
    <section class="patient-strip">
      <div>
        <div class="eyebrow">Ca bệnh hiện tại</div>
        <h2>${escapeHtml(p.name)} <span class="demo-tag">DEMO</span></h2>
        <p>${escapeHtml(p.id)} · ${p.age} tuổi · ECOG ${p.ecog} · ${escapeHtml(p.diagnosis)}</p>
      </div>
      <div class="tnm-box">
        <span>TNM demo</span>
        <strong>${escapeHtml(p.tnm)}</strong>
        <small>${escapeHtml(p.stage)}</small>
      </div>
    </section>`;
}

export function timeline(state) {
  const events = [...state.events].reverse().slice(0, 6);
  return `
    <section class="panel">
      <div class="eyebrow">Activity</div>
      <h2>Dòng sự kiện</h2>
      <div class="timeline">
        ${events.map(event => `
          <div class="timeline-item">
            <span></span>
            <div>
              <strong>${escapeHtml(event.text)}</strong>
              <small>${new Date(event.at).toLocaleString('vi-VN')}</small>
            </div>
          </div>
        `).join('')}
      </div>
    </section>`;
}

export function workspaceShell(state, role, body) {
  const meta = ROLE_META[role];
  return `
    <div class="workspace-shell">
      <header class="appbar">
        <a class="brand" href="#/">LungCare <span>Oncology</span></a>
        <div class="appbar-actions">
          <span class="role-badge">${meta.label}</span>
          <button class="ghost-btn" data-action="switch-role">Đổi vai trò</button>
        </div>
      </header>
      <main class="workspace">
        <div class="workspace-title">
          <div>
            <div class="eyebrow">${meta.eyebrow}</div>
            <h1>${meta.label}</h1>
          </div>
          <div class="save-status" id="saveStatus">Đã lưu cục bộ</div>
        </div>
        ${patientHeader(state)}
        ${body}
      </main>
    </div>`;
}
