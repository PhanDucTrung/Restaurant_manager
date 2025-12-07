// Sidebar component
function renderSidebar(activePage) {
    const pages = {
        'tables': '🪑 Trạng thái bàn',
        'menu': '📋 Dịch vụ',
        'orders': '🧾 Hóa đơn',
        'customers': '👥 Khách hàng',
        'dashboard': '📊 Thống kê',
        'employees': '👨‍🍳 Nhân viên'
    };
    
    return `
    <aside class="sidebar">
      <div class="brand">
        <div class="logo">RM</div>
        <div>
          <div style="font-weight:700">Quản Lý Nhà Hàng</div>
          <div class="small">v1.0 • Spring Boot + MongoDB</div>
        </div>
      </div>
      <nav class="nav">
        ${Object.entries(pages).map(([key, label]) => 
            `<a href="/${key === 'dashboard' ? 'dashboard' : key}.html" ${key === activePage ? 'class="active"' : ''}>${label}</a>`
        ).join('')}
      </nav>
      <div style="margin-top:20px" class="small">Trạng thái</div>
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap" id="statusPills">
        <div class="pill">Đang tải...</div>
      </div>
    </aside>
    `;
}

function renderHeader(pageTitle, subtitle) {
    return `
    <header>
      <div style="display:flex;gap:12px;align-items:center">
        <h2 id="pageTitle">${pageTitle}</h2>
        <div class="small">${subtitle}</div>
      </div>
      <div class="actions">
        <div class="search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <input placeholder="Tìm kiếm..." id="globalSearch" />
        </div>
        <button class="btn" onclick="window.location.reload()">⟳ Làm mới</button>
      </div>
    </header>
    `;
}







