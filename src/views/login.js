import { ROLE_META } from './common.js';

export function rolePickerView() {
  return `
    <div class="auth-shell">
      <div class="auth-wrap">
        <div class="brand large">LungCare <span>Oncology</span></div>
        <p class="lead">Chọn workspace để vào đúng luồng công việc. Dữ liệu demo dùng chung giữa ba vai trò.</p>
        <div class="role-grid">
          ${Object.entries(ROLE_META).map(([role, meta]) => `
            <a class="role-card" href="#/login/${role}">
              <div class="eyebrow">${meta.eyebrow}</div>
              <h2>${meta.label}</h2>
              <p>${role === 'doctor' ? 'Đánh giá staging, kế hoạch xử trí và bàn giao.' : role === 'nurse' ? 'Tiếp nhận, sinh hiệu, triệu chứng và bàn giao bác sĩ.' : 'Xem kế hoạch và xác nhận đã hiểu hướng dẫn.'}</p>
              <span>Đăng nhập →</span>
            </a>
          `).join('')}
        </div>
        <div class="demo-notice">Prototype dùng dữ liệu tổng hợp. Chưa có xác thực người dùng thật hoặc kết nối HIS/EMR.</div>
      </div>
    </div>`;
}

export function loginView(role) {
  const meta = ROLE_META[role];
  if (!meta) return rolePickerView();
  return `
    <div class="auth-shell">
      <div class="login-card">
        <a href="#/" class="back-link">← Chọn vai trò khác</a>
        <div class="eyebrow">${meta.eyebrow}</div>
        <h1>Đăng nhập ${meta.label}</h1>
        <p>Đây là đăng nhập demo để kiểm tra luồng nghiệp vụ, chưa phải hệ thống xác thực thật.</p>
        <label>Tên hiển thị</label>
        <input id="displayName" value="${meta.label} Demo" autocomplete="off" />
        <label>Mã truy cập demo</label>
        <input id="demoCode" value="DEMO2026" autocomplete="off" />
        <button class="primary-btn full" data-action="login" data-role="${role}">Vào workspace</button>
        <div class="security-note">Không nhập dữ liệu bệnh nhân thật vào bản demo công khai này.</div>
      </div>
    </div>`;
}
