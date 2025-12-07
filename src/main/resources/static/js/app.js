// App initialization and utilities

// Load status pills
async function loadStatus() {
    try {
        const statusEl = document.getElementById('statusPills');
        if (!statusEl) return;
        
        const tables = await api.getTables();
        
        // Đếm các trạng thái bàn (hỗ trợ cả tiếng Việt và tiếng Anh)
        const emptyTables = tables.filter(t => {
            const status = (t.status || '').trim();
            return status === 'Trống' || status === 'empty' || status === 'available' || !status;
        }).length;
        
        const reservedTables = tables.filter(t => {
            const status = (t.status || '').trim();
            return status === 'Đặt trước' || status === 'reserved';
        }).length;
        
        const servingTables = tables.filter(t => {
            const status = (t.status || '').trim();
            return status === 'Đang sử dụng' || status === 'occupied';
        }).length;
        
        statusEl.innerHTML = `
            <div class="pill">Bàn trống: <strong style="margin-left:6px">${emptyTables}</strong></div>
            <div class="pill">Bàn đặt trước: <strong style="margin-left:6px">${reservedTables}</strong></div>
            <div class="pill">Đang phục vụ: <strong style="margin-left:6px">${servingTables}</strong></div>
        `;
    } catch (error) {
        console.error('Error loading status:', error);
        const statusEl = document.getElementById('statusPills');
        if (statusEl) {
            statusEl.innerHTML = '<div class="pill">Lỗi khi tải trạng thái</div>';
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStatus();
    setInterval(loadStatus, 30000); // Refresh every 30 seconds
});

