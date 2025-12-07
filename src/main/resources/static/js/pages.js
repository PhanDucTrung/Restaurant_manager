// Page navigation and content management
const pageConfig = {
  dashboard: { title: 'Thống kê', subtitle: '/ Tổng quan hệ thống', loadFn: loadDashboard },
  tables: { title: 'Trạng thái bàn', subtitle: '/ Quản lý bàn', loadFn: loadTables },
  menu: { title: 'Dịch vụ', subtitle: '/ Quản lý menu', loadFn: loadMenu },
  orders: { title: 'Hóa đơn', subtitle: '/ Quản lý đơn hàng', loadFn: loadOrders },
  customers: { title: 'Khách hàng', subtitle: '/ Quản lý khách hàng', loadFn: loadCustomers },
  inventory: { title: 'Kho hàng', subtitle: '/ Quản lý kho', loadFn: loadInventory },
  employees: { title: 'Nhân viên', subtitle: '/ Quản lý nhân viên', loadFn: loadEmployees },
  payments: { title: 'Thanh toán', subtitle: '/ Quản lý thanh toán', loadFn: loadPayments },
  settings: { title: 'Cài đặt', subtitle: '/ Cài đặt', loadFn: loadSettings }
};
let currentPage = 'tables';

function showPage(pageName) {
  // Kiểm tra quyền truy cập
  const employeeRole = sessionStorage.getItem('employeeRole');
  
  // ADMIN và Quản_lý: có quyền truy cập tất cả
  const hasFullAccess = employeeRole === 'ADMIN' || employeeRole === 'Quản_lý' || employeeRole === 'manager';
  
  // Các role khác: chỉ được truy cập trang tables
  if (!hasFullAccess && pageName !== 'tables') {
    alert('Bạn không có quyền truy cập trang này');
    pageName = 'tables'; // Force về trang tables
  }
  
  // Hide all views
  document.querySelectorAll('.view').forEach(view => {
    view.style.display = 'none';
  });

  // Show selected view
  const view = document.getElementById(pageName);
  if (view) {
    view.style.display = '';
  }

  // Update active nav
  document.querySelectorAll('.nav a').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('data-page') === pageName) {
      a.classList.add('active');
    }
  });

  // Update header (nếu có)
  const config = pageConfig[pageName];
  if (config) {
    const pageTitleEl = document.getElementById('pageTitle');
    const pageSubtitleEl = document.getElementById('pageSubtitle');
    if (pageTitleEl) pageTitleEl.textContent = config.title;
    if (pageSubtitleEl) pageSubtitleEl.textContent = config.subtitle;
  }

  // Load page data
  if (config && config.loadFn) {
    config.loadFn();
  }

  currentPage = pageName;
}

// Hàm làm mới trang hiện tại với loading indicator
async function refreshCurrentPage() {
  const config = pageConfig[currentPage];
  if (!config || !config.loadFn) {
    console.warn('No load function found for page:', currentPage);
    return;
  }
  
  // Lấy nút refresh để hiển thị loading
  const refreshBtn = document.querySelector('button[onclick="refreshCurrentPage()"]');
  const originalText = refreshBtn ? refreshBtn.textContent : '';
  
  // Hiển thị loading indicator
  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.textContent = '⟳ Đang tải...';
    refreshBtn.style.opacity = '0.7';
  }
  
  try {
    // Gọi hàm load
    await config.loadFn();
    
    // Hiển thị thông báo thành công (tùy chọn)
    if (refreshBtn) {
      refreshBtn.textContent = '✓ Đã làm mới';
      setTimeout(() => {
        refreshBtn.textContent = originalText;
        refreshBtn.disabled = false;
        refreshBtn.style.opacity = '1';
      }, 1000);
    }
  } catch (error) {
    console.error('Error refreshing page:', error);
    alert('Lỗi khi làm mới dữ liệu: ' + error.message);
    
    // Khôi phục nút
    if (refreshBtn) {
      refreshBtn.textContent = originalText;
      refreshBtn.disabled = false;
      refreshBtn.style.opacity = '1';
    }
  }
}

// Hàm refresh cho từng section cụ thể
window.refreshSection = async function(sectionId) {
  const sectionConfig = {
    'tables': loadTables,
    'menu': loadMenu,
    'orders': loadOrders,  // loadOrders sẽ gọi loadOrdersData bên trong
    'customers': loadCustomers,
    'inventory': loadInventory,
    'employees': loadEmployees,
    'payments': loadPayments,
    'dashboard': loadDashboard,
    'categories': loadCategoriesTable
  };
  
  const loadFn = sectionConfig[sectionId];
  if (!loadFn) {
    console.warn('No load function found for section:', sectionId);
    return;
  }
  
  // Tìm nút refresh của section
  const refreshBtn = document.querySelector(`button[onclick="refreshSection('${sectionId}')"]`);
  const originalText = refreshBtn ? refreshBtn.textContent : '';
  
  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.textContent = '⟳ Đang tải...';
    refreshBtn.style.opacity = '0.7';
  }
  
  try {
    await loadFn();
    
    if (refreshBtn) {
      refreshBtn.textContent = '✓ Đã làm mới';
      setTimeout(() => {
        refreshBtn.textContent = originalText;
        refreshBtn.disabled = false;
        refreshBtn.style.opacity = '1';
      }, 1000);
    }
  } catch (error) {
    console.error('Error refreshing section:', error);
    alert('Lỗi khi làm mới dữ liệu: ' + error.message);
    
    if (refreshBtn) {
      refreshBtn.textContent = originalText;
      refreshBtn.disabled = false;
      refreshBtn.style.opacity = '1';
    }
  }
}

// Dashboard
async function loadDashboard() {
  try {
    const [tables, orders, payments] = await Promise.all([
      api.getTables(),
      api.getOrders(),
      api.getPayments()
    ]);

    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(today));
    const todayPayments = payments.filter(p => p.createdAt && p.createdAt.startsWith(today));
    const todayRevenue = todayPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    
    document.getElementById('todayRevenue').textContent = `₫ ${todayRevenue.toLocaleString('vi-VN')}`;
    document.getElementById('todayOrders').textContent = todayOrders.length;
    document.getElementById('occupiedTables').textContent = `${occupiedTables} / ${tables.length}`;

    const tablesList = document.getElementById('tablesList');
    if (tables.length === 0) {
      tablesList.innerHTML = '<tr><td colspan="5" class="empty-state">Chưa có bàn nào</td></tr>';
    } else {
      tablesList.innerHTML = tables.slice(0, 10).map((t, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${t.name || '-'}</td>
          <td>${t.area || '-'}</td>
          <td><span class="status-${t.status}">${t.status || '-'}</span></td>
          <td><button class="pill" style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; border-color: rgba(6, 182, 212, 0.4);" onclick="showPage('tables')">Xem</button></td>
        </tr>
      `).join('');
    }

    const ordersList = document.getElementById('ordersList');
    if (orders.length === 0) {
      ordersList.innerHTML = '<tr><td colspan="5" class="empty-state">Chưa có đơn hàng nào</td></tr>';
    } else {
      ordersList.innerHTML = orders.slice(0, 10).map(o => `
        <tr>
          <td>${o.id || '-'}</td>
          <td>${o.customer?.name || '-'}</td>
          <td>${o.orderType || '-'}</td>
          <td>₫ ${(parseFloat(o.totalAmount) || 0).toLocaleString('vi-VN')}</td>
          <td><span class="status-${o.status}">${o.status || '-'}</span></td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// Tables
let editingTableId = null;

function getStatusLabel(status) {
  if (!status) return 'Trống';
  return status;
}

function getStatusColor(status) {
  const statusStr = String(status || 'Trống').toLowerCase().trim();
  const colors = {
    'trống': '#10b981',
    'đặt trước': '#fbbf24',
    'đang sử dụng': '#fb923c',
    'sửa chữa': '#ef4444'
  };
  return colors[statusStr] || '#10b981';
}

async function updateTableStatusDirect(tableId, newStatus) {
  try {
    const table = await api.getTableById(tableId);
    if (table) {
      table.status = newStatus;
      await api.updateTable(tableId, table);
      loadTables();
      loadStatus();
    }
  } catch (error) {
    alert('Lỗi khi cập nhật trạng thái: ' + error.message);
  }
}

window.useTable = async function(tableId) {
  try {
    // Tạo hóa đơn mới với trạng thái pending
    const table = await api.getTableById(tableId);
    if (!table) {
      alert('Không tìm thấy bàn');
      return;
    }

    // Tạo hóa đơn mới
    const newOrder = {
      tableName: table.name || '', // Lưu tên bàn dạng text
      status: 'pending',
      orderType: 'dine_in',
      orderItems: [],
      totalAmount: 0
    };

    const createdOrder = await api.createOrder(newOrder);
    
    // Thêm order vào danh sách orders của table
    if (!table.orders) {
      table.orders = [];
    }
    table.orders.push({ id: createdOrder.id });
    
    // Cập nhật table với order mới và trạng thái "Đang sử dụng"
    table.status = 'Đang sử dụng';
    await api.updateTable(tableId, table);
    
    loadTables();
    loadStatus();
  } catch (error) {
    alert('Lỗi khi tạo hóa đơn: ' + error.message);
  }
}

window.reserveTable = async function(tableId) {
  await updateTableStatusDirect(tableId, 'Đặt trước');
}

window.payTable = async function(tableId) {
  await updateTableStatusDirect(tableId, 'Trống');
}

// Hiển thị chi tiết hóa đơn (theo hình)
window.showOrderDetails = async function(tableId) {
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  
  if (!backdrop || !content) {
    console.error('Modal elements not found');
    return;
  }
  
  try {
    // Lấy thông tin bàn
    const table = await api.getTableById(tableId);
    if (!table) {
      alert('Không tìm thấy bàn');
      return;
    }
    
    // Lấy order của bàn
    let activeOrder = null;
    
    if (table.orders && table.orders.length > 0) {
      const orderIds = table.orders.map(o => {
        if (typeof o === 'string') return o;
        return o.id || o.$id || (o._id || '');
      }).filter(id => id);
      
      if (orderIds.length > 0) {
        const lastOrderId = orderIds[orderIds.length - 1];
        activeOrder = await api.getOrderById(lastOrderId);
        
        if (activeOrder && activeOrder.status !== 'pending' && activeOrder.status !== 'serving') {
          for (let i = orderIds.length - 1; i >= 0; i--) {
            const order = await api.getOrderById(orderIds[i]);
            if (order && (order.status === 'pending' || order.status === 'serving')) {
              activeOrder = order;
              break;
            }
          }
        }
      }
    }
    
    if (!activeOrder && table.name) {
      const orders = await api.getOrdersByTableName(table.name);
      activeOrder = orders.find(o => o.status === 'pending' || o.status === 'serving') || orders[0];
    }
    
    if (!activeOrder) {
      alert('Không tìm thấy hóa đơn cho bàn này');
      return;
    }
    
    // Lấy OrderItems từ collection order_items với id của order
    const orderItems = await api.getOrderItemsByOrderId(activeOrder.id);
    
    // Lấy danh sách menu items cho cột bên phải
    const menuItems = await api.getActiveMenuItems();
    
    // Lấy danh sách categories cho bộ lọc
    const categories = await api.getCategories();
    
    // Hiển thị giao diện chi tiết với OrderItems từ collection order_items
    await displayOrderDetailsModal(content, activeOrder, table, menuItems, tableId, orderItems, categories);
    
    backdrop.style.display = 'flex';
  } catch (error) {
    console.error('Error showing order details:', error);
    alert('Lỗi khi hiển thị chi tiết hóa đơn: ' + error.message);
  }
}

// Hiển thị modal chi tiết hóa đơn
async function displayOrderDetailsModal(content, order, table, menuItems, tableId, orderItemsFromDB = null, categories = []) {
  // Lưu menuItems gốc để filter
  window.allMenuItems = menuItems;
  window.allCategories = categories;
  // Nếu không có orderItemsFromDB, lấy từ order.orderItems (fallback)
  // Nhưng ưu tiên lấy từ collection order_items (orderItemsFromDB)
  const orderItems = orderItemsFromDB || order.orderItems || [];
  
  // Tính lại tổng tiền từ orderItems (đảm bảo luôn đúng)
  let totalAmount = 0;
  if (orderItems.length > 0) {
    totalAmount = orderItems.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      const price = parseFloat(item.price || 0);
      return sum + (price * quantity);
    }, 0);
  } else {
    // Nếu không có orderItems, lấy từ order.totalAmount
    totalAmount = parseFloat(order.totalAmount) || 0;
  }
  // Format thời gian vào
  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
  const timeString = createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const dateString = createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  // Render bảng dịch vụ đã chọn (có thêm cột thùng rác)
  let orderItemsTableHTML = '';
  if (orderItems.length === 0) {
    orderItemsTableHTML = '';
  } else {
    orderItemsTableHTML = orderItems.map(item => {
      // Lấy dữ liệu từ OrderItem (order_items)
      const quantity = item.quantity || 1;
      const price = parseFloat(item.price || 0); // Đơn giá từ order_items
      const amount = price * quantity;
      
      // Tên dịch vụ từ MenuItem (đã được populate)
      const menuItemName = item.menuItem?.name || 'N/A';
      const menuItemId = item.menuItem?.id || item.menuItem?.$id || '';
      
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; border: 1px solid #e5e7eb;">${menuItemName}</td>
          <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${quantity}</td>
          <td style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">${price.toLocaleString('vi-VN')}₫</td>
          <td style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">${amount.toLocaleString('vi-VN')}₫</td>
          <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">
            <button onclick="removeOrderItemFromDetails('${order.id}', '${menuItemId}', '${tableId}')" 
                    style="background: none; border: none; cursor: pointer; padding: 0; color: #ef4444; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;"
                    title="Xóa">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
  
  // Render danh sách dịch vụ bên phải thành bảng
  let menuItemsTableHTML = '';
  if (menuItems.length === 0) {
    menuItemsTableHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #9ca3af;">Chưa có dịch vụ nào</td></tr>';
  } else {
    menuItemsTableHTML = menuItems.map(item => {
      const price = parseFloat(item.price || 0);
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${price.toLocaleString('vi-VN')}₫</td>
          <td style="padding: 10px; text-align: center; border: 1px solid #e5e7eb;">
            <button onclick="addMenuItemToOrderFromDetails('${order.id}', '${item.id}', '${item.name}', ${price}, '${tableId}')" 
                    style="background: #10b981; border: none; cursor: pointer; width: 25px; height: 25px; border-radius: 4px; color: white; font-size: 24px; font-weight: bold; display: flex; align-items: center; justify-content: center;"
                    title="Thêm">
              +
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
  
  // Lấy thông tin khách hàng từ order
  const customerName = order.customer?.name || '';
  const customerPhone = order.customer?.phone || '';
  
  content.innerHTML = `
    <div style="width: 1000px; max-height: 90vh; overflow-y: auto; background: white; color: #1f2937; border-radius: 8px; padding: 24px; position: relative;">
      <!-- Nút đóng X ở góc trên bên phải -->
      <button onclick="closeModal()" 
              style="position: absolute; top: 16px; right: 16px; background: none; border: none; cursor: pointer; width: 50px; height: 50px; color: #6b7280; font-size: 32px; line-height: 1; z-index: 10; display: flex; align-items: center; justify-content: center;"
              onmouseover="this.style.color='#374151'" 
              onmouseout="this.style.color='#6b7280'"
              title="Đóng">
        ×
      </button>
      <div style="display: grid; grid-template-columns: 65% 35%; gap: 24px;">
        
        <!-- Left Column: Thông tin hóa đơn -->
        <div>
          <h3 style="margin-bottom: 20px; color: #1f2937; font-size: 20px; font-weight: 600;">Thông tin hóa đơn</h3>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
            <div>
              <strong style="font-size: 16px;">Bàn: ${table.name || 'N/A'}</strong>
            </div>
            <div style="color: #6b7280; font-size: 14px;">
              Thời gian vào: ${timeString} - ${dateString}
            </div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Tên dịch vụ</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Số lượng</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Đơn giá</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Thành tiền</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;"></th>
              </tr>
            </thead>
            <tbody>
              ${orderItems.length > 0 ? orderItemsTableHTML : '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #9ca3af;">Chưa có dịch vụ nào</td></tr>'}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-bottom: 30px; padding-top: 15px; border-top: 2px solid #e5e7eb;">
            <strong style="font-size: 18px; color: #1f2937;">Tổng tiền: ${totalAmount.toLocaleString('vi-VN')}₫</strong>
          </div>
          
          <div>
            <h4 style="margin-bottom: 15px; color: #1f2937; font-size: 16px; font-weight: 600;">Thông tin khách hàng</h4>
            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
              <div style="flex: 1; position: relative;">
                <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">Tên khách hàng:</label>
                <input 
                  type="text" 
                  id="customerNameSearch" 
                  class="input" 
                  placeholder="Tìm kiếm hoặc tạo khách hàng mới" 
                  value="${customerName}" 
                  autocomplete="off"
                  oninput="filterCustomersByName(this.value)"
                  onfocus="showCustomerNameDropdown()"
                  style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: #1f2937; color: white;" />
                <input type="hidden" id="selectedCustomerId" />
                <input type="hidden" id="newCustomerName" />
                <div id="customerNameDropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #1f2937; border: 1px solid #374151; border-radius: 8px; margin-top: 4px; max-height: 200px; overflow-y: auto; z-index: 1000;">
                  <div id="customerNameList"></div>
                  <div id="createCustomerNameOption" style="display: none; padding: 10px; border-top: 1px solid #374151; cursor: pointer; color: #06b6d4;" onclick="createNewCustomerFromName()">
                    <strong>+ Tạo khách hàng mới: "<span id="newCustomerNameText"></span>"</strong>
                  </div>
                </div>
              </div>
              <div style="flex: 1; position: relative;">
                <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">Số điện thoại:</label>
                <input 
                  type="text" 
                  id="customerPhoneSearch" 
                  class="input" 
                  placeholder="Tìm kiếm hoặc tạo khách hàng mới" 
                  value="${customerPhone}" 
                  autocomplete="off"
                  oninput="handlePhoneInput(this)"
                  onfocus="showCustomerPhoneDropdown()"
                  pattern="[0-9]*"
                  style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: #1f2937; color: white;" />
                <input type="hidden" id="newCustomerPhone" />
                <div id="customerPhoneDropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #1f2937; border: 1px solid #374151; border-radius: 8px; margin-top: 4px; max-height: 200px; overflow-y: auto; z-index: 1000;">
                  <div id="customerPhoneList"></div>
                  <div id="createCustomerPhoneOption" style="display: none; padding: 10px; border-top: 1px solid #374151; cursor: pointer; color: #06b6d4;" onclick="createNewCustomerFromPhone()">
                    <strong>+ Tạo khách hàng mới: "<span id="newCustomerPhoneText"></span>"</strong>
                  </div>
                </div>
              </div>
            </div>
            <button onclick="processPayment('${order.id}', '${tableId}')" 
                    style="width: 100%; padding: 14px; background: #10b981; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s;"
                    onmouseover="this.style.background='#059669'" 
                    onmouseout="this.style.background='#10b981'">
              Thanh toán
            </button>
          </div>
        </div>
        
        <!-- Right Column: Danh sách dịch vụ -->
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; max-height: 450px; overflow-y: auto;">
          <h3 style="margin-bottom: 12px; color: #1f2937; font-size: 16px; font-weight: 600;">Danh sách dịch vụ</h3>
          
          <!-- Bộ lọc -->
          <div style="margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;">
            <select id="filterCategory" onchange="filterMenuItemsInModal('${order.id}', '${tableId}')" 
                    style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: white;">
              <option value="">Tất cả loại món ăn</option>
              ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
            </select>
            <input type="text" id="filterMenuItemName" 
                   placeholder="Tìm kiếm tên món ăn..." 
                   oninput="filterMenuItemsInModal('${order.id}', '${tableId}')"
                   style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: white;" />
          </div>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Tên</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Đơn giá</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #e5e7eb; font-weight: 600; color: #374151; width:30px"></th>
              </tr>
            </thead>
            <tbody id="filteredMenuItemsTable">
              ${menuItemsTableHTML}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  `;
  
  // Initialize customer dropdown after modal is displayed
  setTimeout(() => {
    initializeCustomerSearch();
    setupCustomerDropdownEvents();
  }, 100);
}

// Hàm filter menu items trong modal
window.filterMenuItemsInModal = function(orderId, tableId) {
  const categoryFilter = document.getElementById('filterCategory')?.value || '';
  const nameFilter = document.getElementById('filterMenuItemName')?.value || ''; // Lấy giá trị từ input
  const allMenuItems = window.allMenuItems || [];
  
  // Lọc menu items
  let filteredItems = allMenuItems.filter(item => {
    // Lọc theo category
    const categoryMatch = !categoryFilter || (item.category?.id === categoryFilter || item.category?.$id === categoryFilter);
    
    // Lọc theo tên (case-insensitive)
    const nameMatch = !nameFilter || item.name.toLowerCase().includes(nameFilter.toLowerCase());
    
    return categoryMatch && nameMatch;
  });
  
  // Render lại bảng
  const tbody = document.getElementById('filteredMenuItemsTable');
  if (!tbody) return;
  
  if (filteredItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #9ca3af;">Không tìm thấy dịch vụ nào</td></tr>';
  } else {
    tbody.innerHTML = filteredItems.map(item => {
      const price = parseFloat(item.price || 0);
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${price.toLocaleString('vi-VN')}₫</td>
          <td style="padding: 10px; text-align: center; border: 1px solid #e5e7eb;">
            <button onclick="addMenuItemToOrderFromDetails('${orderId}', '${item.id}', '${item.name}', ${price}, '${tableId}')" 
                    style="background: #10b981; border: none; cursor: pointer; width: 25px; height: 25px; border-radius: 4px; color: white; font-size: 24px; font-weight: bold; display: flex; align-items: center; justify-content: center;"
                    title="Thêm">
              +
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

// Thêm menu item từ modal chi tiết
window.addMenuItemToOrderFromDetails = async function(orderId, menuItemId, menuItemName, price, tableId) {
  try {
    // Sử dụng API mới để thêm OrderItem
    await api.addOrderItem(orderId, menuItemId, price);
    
    // Reload modal chi tiết - Lấy OrderItems từ collection order_items
    const table = await api.getTableById(tableId);
    const menuItems = await api.getActiveMenuItems();
    const categories = await api.getCategories();
    const updatedOrder = await api.getOrderById(orderId);
    const orderItems = await api.getOrderItemsByOrderId(orderId);
    const content = document.getElementById('modalContent');
    
    // Lưu giá trị filter hiện tại
    const currentCategoryFilter = document.getElementById('filterCategory')?.value || '';
    const currentNameFilter = document.getElementById('filterMenuItemName')?.value || '';
    
    await displayOrderDetailsModal(content, updatedOrder, table, menuItems, tableId, orderItems, categories);
    
    // Khôi phục giá trị filter sau khi reload
    setTimeout(() => {
      const categorySelect = document.getElementById('filterCategory');
      const nameInput = document.getElementById('filterMenuItemName');
      if (categorySelect) categorySelect.value = currentCategoryFilter;
      if (nameInput) nameInput.value = currentNameFilter;
      if (currentCategoryFilter || currentNameFilter) {
        window.filterMenuItemsInModal(orderId, tableId);
      }
    }, 100);
  } catch (error) {
    console.error('Error adding menu item:', error);
    alert('Lỗi khi thêm dịch vụ: ' + error.message);
  }
}

// Giảm số lượng order item từ modal chi tiết (hoặc xóa nếu số lượng = 0)
window.removeOrderItemFromDetails = async function(orderId, menuItemId, tableId) {
  try {
    // Sử dụng API mới để giảm/xóa OrderItem trong collection order_items
    await api.decreaseOrderItem(orderId, menuItemId);
    
    // Reload modal chi tiết - Lấy OrderItems từ collection order_items
    const table = await api.getTableById(tableId);
    const menuItems = await api.getActiveMenuItems();
    const categories = await api.getCategories();
    const updatedOrder = await api.getOrderById(orderId);
    const orderItems = await api.getOrderItemsByOrderId(orderId);
    const content = document.getElementById('modalContent');
    
    // Lưu giá trị filter hiện tại
    const currentCategoryFilter = document.getElementById('filterCategory')?.value || '';
    const currentNameFilter = document.getElementById('filterMenuItemName')?.value || '';
    
    await displayOrderDetailsModal(content, updatedOrder, table, menuItems, tableId, orderItems, categories);
    
    // Khôi phục giá trị filter sau khi reload
    setTimeout(() => {
      const categorySelect = document.getElementById('filterCategory');
      const nameInput = document.getElementById('filterMenuItemName');
      if (categorySelect) categorySelect.value = currentCategoryFilter;
      if (nameInput) nameInput.value = currentNameFilter;
      if (currentCategoryFilter || currentNameFilter) {
        window.filterMenuItemsInModal(orderId, tableId);
      }
    }, 100);
  } catch (error) {
    console.error('Error decreasing item quantity:', error);
    alert('Lỗi khi giảm số lượng dịch vụ: ' + error.message);
  }
}

// Customer search combobox functions
let allCustomers = [];

// Load all customers
async function loadAllCustomers() {
  try {
    allCustomers = await api.getCustomers();
  } catch (error) {
    console.error('Error loading customers:', error);
    allCustomers = [];
  }
}

// Setup customer dropdown events
function setupCustomerDropdownEvents() {
  document.addEventListener('click', function(event) {
    const nameDropdown = document.getElementById('customerNameDropdown');
    const nameSearchInput = document.getElementById('customerNameSearch');
    const phoneDropdown = document.getElementById('customerPhoneDropdown');
    const phoneSearchInput = document.getElementById('customerPhoneSearch');
    
    if (nameDropdown && nameSearchInput && 
        !nameDropdown.contains(event.target) && 
        event.target !== nameSearchInput) {
      hideCustomerNameDropdown();
    }
    
    if (phoneDropdown && phoneSearchInput && 
        !phoneDropdown.contains(event.target) && 
        event.target !== phoneSearchInput) {
      hideCustomerPhoneDropdown();
    }
  });
}

// Initialize customer search
async function initializeCustomerSearch() {
  await loadAllCustomers();
  const customerNameList = document.getElementById('customerNameList');
  const customerPhoneList = document.getElementById('customerPhoneList');
  if (customerNameList) {
    renderCustomerNameList(allCustomers);
  }
  if (customerPhoneList) {
    renderCustomerPhoneList(allCustomers);
  }
}

// Render customer list for name search
function renderCustomerNameList(filteredCustomers) {
  const customerList = document.getElementById('customerNameList');
  if (!customerList) return;
  
  if (filteredCustomers.length === 0) {
    customerList.innerHTML = '<div style="padding: 10px; color: #9ca3af;">Không tìm thấy khách hàng</div>';
  } else {
    customerList.innerHTML = filteredCustomers.map(c => {
      const escapedName = (c.name || '').replace(/'/g, "&#39;").replace(/"/g, "&quot;");
      const escapedPhone = (c.phone || '').replace(/'/g, "&#39;").replace(/"/g, "&quot;");
      const displayText = `${escapedName}${c.phone ? ' - ' + escapedPhone : ''}`;
      return `
        <div style="padding: 10px; cursor: pointer; color: white;" 
             onmouseover="this.style.background='#374151'; this.style.color='white';" 
             onmouseout="this.style.background='transparent'; this.style.color='white';"
             onclick="selectCustomer('${c.id}', '${escapedName}', '${escapedPhone}')">
          ${displayText}
        </div>
      `;
    }).join('');
  }
}

// Render customer list for phone search
function renderCustomerPhoneList(filteredCustomers) {
  const customerList = document.getElementById('customerPhoneList');
  if (!customerList) return;
  
  if (filteredCustomers.length === 0) {
    customerList.innerHTML = '<div style="padding: 10px; color: #9ca3af;">Không tìm thấy khách hàng</div>';
  } else {
    customerList.innerHTML = filteredCustomers.map(c => {
      const escapedName = (c.name || '').replace(/'/g, "&#39;").replace(/"/g, "&quot;");
      const escapedPhone = (c.phone || '').replace(/'/g, "&#39;").replace(/"/g, "&quot;");
      const displayText = `${escapedName}${c.phone ? ' - ' + escapedPhone : ''}`;
      return `
        <div style="padding: 10px; cursor: pointer; color: white;" 
             onmouseover="this.style.background='#374151'; this.style.color='white';" 
             onmouseout="this.style.background='transparent'; this.style.color='white';"
             onclick="selectCustomer('${c.id}', '${escapedName}', '${escapedPhone}')">
          ${displayText}
        </div>
      `;
    }).join('');
  }
}

// Filter customers by name
window.filterCustomersByName = function(searchText) {
  const searchLower = (searchText || '').toLowerCase().trim();
  const customerList = document.getElementById('customerNameList');
  const createOption = document.getElementById('createCustomerNameOption');
  const newCustomerNameText = document.getElementById('newCustomerNameText');
  const newCustomerNameInput = document.getElementById('newCustomerName');
  const customerIdInput = document.getElementById('selectedCustomerId');
  
  if (!customerList) return;
  
  // Reset hidden inputs
  if (customerIdInput) customerIdInput.value = '';
  if (newCustomerNameInput) newCustomerNameInput.value = '';
  
  if (searchLower.length === 0) {
    renderCustomerNameList(allCustomers);
    if (createOption) createOption.style.display = 'none';
    showCustomerNameDropdown();
    return;
  }
  
  const filtered = allCustomers.filter(c => {
    const name = (c.name || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    return name.includes(searchLower) || phone.includes(searchLower);
  });
  
  renderCustomerNameList(filtered);
  
  // Check if search text doesn't match any customer
  const exactMatch = allCustomers.find(c => 
    (c.name || '').toLowerCase() === searchLower || 
    (c.phone || '').toLowerCase() === searchLower
  );
  
  // Kiểm tra xem có đủ cả tên và số điện thoại không
  const phoneInput = document.getElementById('customerPhoneSearch');
  const hasPhone = phoneInput?.value?.trim() || '';
  
  if (!exactMatch && searchText.trim().length > 0 && hasPhone) {
    // Show option to create new customer (chỉ khi có đủ cả tên và số điện thoại)
    if (createOption && newCustomerNameText) {
      newCustomerNameText.textContent = searchText.trim();
      createOption.style.display = 'block';
    }
    if (newCustomerNameInput) {
      newCustomerNameInput.value = searchText.trim();
    }
  } else {
    if (createOption) createOption.style.display = 'none';
    if (newCustomerNameInput) newCustomerNameInput.value = '';
  }
  
  showCustomerNameDropdown();
}

// Handle phone input - only allow numbers
window.handlePhoneInput = function(inputElement) {
  // Chỉ cho phép số
  const value = inputElement.value.replace(/[^0-9]/g, '');
  if (inputElement.value !== value) {
    inputElement.value = value;
  }
  // Gọi filter function
  filterCustomersByPhone(value);
}

// Filter customers by phone
window.filterCustomersByPhone = function(searchText) {
  const searchLower = (searchText || '').toLowerCase().trim();
  const customerList = document.getElementById('customerPhoneList');
  const createOption = document.getElementById('createCustomerPhoneOption');
  const newCustomerPhoneText = document.getElementById('newCustomerPhoneText');
  const newCustomerPhoneInput = document.getElementById('newCustomerPhone');
  const customerIdInput = document.getElementById('selectedCustomerId');
  
  if (!customerList) return;
  
  // Reset hidden inputs
  if (customerIdInput) customerIdInput.value = '';
  if (newCustomerPhoneInput) newCustomerPhoneInput.value = '';
  
  if (searchLower.length === 0) {
    renderCustomerPhoneList(allCustomers);
    if (createOption) createOption.style.display = 'none';
    showCustomerPhoneDropdown();
    return;
  }
  
  const filtered = allCustomers.filter(c => {
    const name = (c.name || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    return name.includes(searchLower) || phone.includes(searchLower);
  });
  
  renderCustomerPhoneList(filtered);
  
  // Check if search text doesn't match any customer
  const exactMatch = allCustomers.find(c => 
    (c.name || '').toLowerCase() === searchLower || 
    (c.phone || '').toLowerCase() === searchLower
  );
  
  // Kiểm tra xem có đủ cả tên và số điện thoại không
  const nameInput = document.getElementById('customerNameSearch');
  const hasName = nameInput?.value?.trim() || '';
  
  if (!exactMatch && searchText.trim().length > 0 && hasName) {
    // Show option to create new customer (chỉ khi có đủ cả tên và số điện thoại)
    if (createOption && newCustomerPhoneText) {
      newCustomerPhoneText.textContent = searchText.trim();
      createOption.style.display = 'block';
    }
    if (newCustomerPhoneInput) {
      newCustomerPhoneInput.value = searchText.trim();
    }
  } else {
    if (createOption) createOption.style.display = 'none';
    if (newCustomerPhoneInput) newCustomerPhoneInput.value = '';
  }
  
  showCustomerPhoneDropdown();
}

// Show customer name dropdown
window.showCustomerNameDropdown = function() {
  const dropdown = document.getElementById('customerNameDropdown');
  if (dropdown) {
    dropdown.style.display = 'block';
  }
}

// Hide customer name dropdown
window.hideCustomerNameDropdown = function() {
  const dropdown = document.getElementById('customerNameDropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

// Show customer phone dropdown
window.showCustomerPhoneDropdown = function() {
  const dropdown = document.getElementById('customerPhoneDropdown');
  if (dropdown) {
    dropdown.style.display = 'block';
  }
}

// Hide customer phone dropdown
window.hideCustomerPhoneDropdown = function() {
  const dropdown = document.getElementById('customerPhoneDropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

// Select customer
window.selectCustomer = function(customerId, customerName, customerPhone) {
  const nameInput = document.getElementById('customerNameSearch');
  const phoneInput = document.getElementById('customerPhoneSearch');
  const customerIdInput = document.getElementById('selectedCustomerId');
  
  // Decode HTML entities
  const decodedName = customerName.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  const decodedPhone = customerPhone.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  
  if (nameInput) {
    nameInput.value = decodedName || '';
  }
  if (phoneInput) {
    phoneInput.value = decodedPhone || '';
  }
  if (customerIdInput) {
    customerIdInput.value = customerId || '';
  }
  
  // Clear new customer inputs
  const newCustomerNameInput = document.getElementById('newCustomerName');
  const newCustomerPhoneInput = document.getElementById('newCustomerPhone');
  if (newCustomerNameInput) newCustomerNameInput.value = '';
  if (newCustomerPhoneInput) newCustomerPhoneInput.value = '';
  
  hideCustomerNameDropdown();
  hideCustomerPhoneDropdown();
  console.log('Selected customer:', { id: customerId, name: decodedName, phone: decodedPhone });
}

// Create new customer from name
window.createNewCustomerFromName = async function() {
  const newCustomerNameInput = document.getElementById('newCustomerName');
  const phoneInput = document.getElementById('customerPhoneSearch');
  const customerNameInput = document.getElementById('customerNameSearch');
  
  const name = newCustomerNameInput?.value?.trim() || customerNameInput?.value?.trim() || '';
  const phone = phoneInput?.value?.trim() || '';
  
  // Kiểm tra đủ thông tin
  if (!name) {
    alert('Vui lòng nhập tên khách hàng');
    return;
  }
  
  if (!phone) {
    alert('Vui lòng nhập số điện thoại');
    return;
  }
  
  // Kiểm tra số điện thoại đã tồn tại chưa
  try {
    const existingCustomer = await api.getCustomerByPhone(phone);
    if (existingCustomer) {
      alert('Số điện thoại này đã được sử dụng bởi khách hàng: ' + (existingCustomer.name || ''));
      // Tự động chọn khách hàng đã tồn tại
      selectCustomer(existingCustomer.id, existingCustomer.name || '', existingCustomer.phone || '');
      return;
    }
  } catch (error) {
    // Nếu không tìm thấy thì tiếp tục tạo mới
  }
  
  try {
    const newCustomer = await api.createCustomer({
      name: name,
      phone: phone
    });
    
    // Reload customers list
    await loadAllCustomers();
    
    // Select the newly created customer
    selectCustomer(newCustomer.id, newCustomer.name, newCustomer.phone || '');
    
    console.log('Created new customer:', newCustomer);
    alert('Đã tạo khách hàng mới thành công!');
  } catch (error) {
    console.error('Error creating customer:', error);
    alert('Lỗi khi tạo khách hàng mới: ' + error.message);
  }
}

// Create new customer from phone
window.createNewCustomerFromPhone = async function() {
  const newCustomerPhoneInput = document.getElementById('newCustomerPhone');
  const nameInput = document.getElementById('customerNameSearch');
  const phoneInput = document.getElementById('customerPhoneSearch');
  
  const phone = newCustomerPhoneInput?.value?.trim() || phoneInput?.value?.trim() || '';
  const name = nameInput?.value?.trim() || '';
  
  // Kiểm tra đủ thông tin
  if (!phone) {
    alert('Vui lòng nhập số điện thoại');
    return;
  }
  
  if (!name) {
    alert('Vui lòng nhập tên khách hàng');
    return;
  }
  
  // Kiểm tra số điện thoại đã tồn tại chưa
  try {
    const existingCustomer = await api.getCustomerByPhone(phone);
    if (existingCustomer) {
      alert('Số điện thoại này đã được sử dụng bởi khách hàng: ' + (existingCustomer.name || ''));
      // Tự động chọn khách hàng đã tồn tại
      selectCustomer(existingCustomer.id, existingCustomer.name || '', existingCustomer.phone || '');
      return;
    }
  } catch (error) {
    // Nếu không tìm thấy thì tiếp tục tạo mới
  }
  
  try {
    const newCustomer = await api.createCustomer({
      name: name,
      phone: phone
    });
    
    // Reload customers list
    await loadAllCustomers();
    
    // Select the newly created customer
    selectCustomer(newCustomer.id, newCustomer.name, newCustomer.phone || '');
    
    console.log('Created new customer:', newCustomer);
    alert('Đã tạo khách hàng mới thành công!');
  } catch (error) {
    console.error('Error creating customer:', error);
    alert('Lỗi khi tạo khách hàng mới: ' + error.message);
  }
}

// Xử lý thanh toán
window.processPayment = async function(orderId, tableId) {
  try {
    const customerName = document.getElementById('customerNameSearch')?.value?.trim() || '';
    const customerPhone = document.getElementById('customerPhoneSearch')?.value?.trim() || '';
    const selectedCustomerId = document.getElementById('selectedCustomerId')?.value || '';
    const newCustomerName = document.getElementById('newCustomerName')?.value?.trim() || '';
    const newCustomerPhone = document.getElementById('newCustomerPhone')?.value?.trim() || '';
    
    // Tìm hoặc tạo khách hàng
    let customer = null;
    
    // Nếu đã chọn khách hàng từ dropdown
    if (selectedCustomerId) {
      customer = await api.getCustomerById(selectedCustomerId);
    }
    
    // Nếu chưa chọn, thử tìm theo số điện thoại
    if (!customer && customerPhone) {
      customer = await api.getCustomerByPhone(customerPhone);
    }
    
    // Nếu vẫn chưa tìm thấy, thử tìm theo tên
    if (!customer && customerName) {
      customer = await api.getCustomerByName(customerName);
    }
    
    // Nếu không tìm thấy và có đủ thông tin, tạo khách hàng mới
    if (!customer) {
      const finalName = newCustomerName || customerName || '';
      const finalPhone = newCustomerPhone || customerPhone || '';
      
      // Chỉ tạo mới nếu có đủ cả tên và số điện thoại
      if (finalName && finalPhone) {
        // Kiểm tra số điện thoại đã tồn tại chưa
        const existingCustomer = await api.getCustomerByPhone(finalPhone);
        if (existingCustomer) {
          // Nếu đã tồn tại, sử dụng khách hàng đó
          customer = existingCustomer;
          console.log('Using existing customer with phone:', finalPhone);
        } else {
          // Tạo mới
          customer = await api.createCustomer({
            name: finalName,
            phone: finalPhone
          });
          console.log('Created new customer:', customer);
        }
      } else if (finalName || finalPhone) {
        // Nếu thiếu thông tin, hiển thị cảnh báo
        alert('Vui lòng nhập đầy đủ tên khách hàng và số điện thoại để tạo khách hàng mới');
        return;
      }
    }
    
    // Lấy lại orderItems để tính lại totalAmount
    const orderItems = await api.getOrderItemsByOrderId(orderId);
    
    // Tính lại tổng tiền từ orderItems
    let totalAmount = 0;
    if (orderItems && orderItems.length > 0) {
      totalAmount = orderItems.reduce((sum, item) => {
        const quantity = item.quantity || 1;
        const price = parseFloat(item.price || 0);
        return sum + (price * quantity);
      }, 0);
    }
    
    console.log('Calculated totalAmount:', totalAmount);
    console.log('OrderItems:', orderItems);
    
    // Cập nhật order với thông tin khách hàng và totalAmount
    const order = await api.getOrderById(orderId);
    console.log('Order before update:', order);
    console.log('Order totalAmount before update:', order.totalAmount);
    
    // Tạo object chỉ chứa các trường cần cập nhật, không gửi orderItems
    const orderUpdate = {
      id: order.id,
      customer: customer || order.customer,
      tableName: order.tableName,
      waiter: order.waiter,
      orderType: order.orderType,
      status: 'completed',
      totalAmount: totalAmount || 0,
      createdAt: order.createdAt
      // KHÔNG gửi orderItems để tránh backend tính lại totalAmount
    };
    
    console.log('Order to send:', orderUpdate);
    console.log('totalAmount to send:', orderUpdate.totalAmount);
    
    const updatedOrder = await api.updateOrder(orderId, orderUpdate);
    console.log('Order after update:', updatedOrder);
    console.log('totalAmount after update:', updatedOrder.totalAmount);
    // Cập nhật trạng thái bàn về "Trống"
    await updateTableStatusDirect(tableId, 'Trống');
    
    alert('Thanh toán thành công!');
    closeModal();
    loadTables();
    loadStatus();
  } catch (error) {
    console.error('Error processing payment:', error);
    alert('Lỗi khi thanh toán: ' + error.message);
  }
}

// Xử lý double click vào bàn
window.handleTableDoubleClick = async function(tableId, status) {
  const statusStr = String(status || '').toLowerCase().trim();
  
  // Nếu bàn trống → hiển thị form sửa thông tin bàn
  if (statusStr === 'trống') {
    if (typeof openModal === 'function') {
      openModal('editTable', tableId);
    } else if (typeof openTableModal === 'function') {
      openTableModal('editTable', tableId);
    }
  } 
  // Nếu bàn đang sử dụng → hiển thị form hóa đơn
  
}

// Mở modal hóa đơn cho bàn


// Hiển thị form hóa đơn với menu items
async function displayOrderForm(content, order, table, menuItems) {
  const orderItems = order.orderItems || [];
  const totalAmount = parseFloat(order.totalAmount) || 0;
  
  // Nhóm menu items theo category
  const itemsByCategory = {};
  menuItems.forEach(item => {
    const categoryName = item.category?.name || 'Khác';
    if (!itemsByCategory[categoryName]) {
      itemsByCategory[categoryName] = [];
    }
    itemsByCategory[categoryName].push(item);
  });
  
  // Render menu items
  let menuItemsHTML = '';
  for (const [categoryName, items] of Object.entries(itemsByCategory)) {
    menuItemsHTML += `
      <div style="margin-bottom: 20px;">
        <h4 style="margin-bottom: 10px; color: #06b6d4;">${categoryName}</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
          ${items.map(item => `
            <div style="border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px; cursor: pointer;" 
                 onclick="addMenuItemToOrder('${order.id}', '${item.id}', '${item.name}', ${item.price})">
              <div style="font-weight: 600;">${item.name}</div>
              <div style="color: #06b6d4; margin-top: 5px;">₫ ${parseFloat(item.price || 0).toLocaleString('vi-VN')}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Render order items hiện tại
  let orderItemsHTML = '';
  if (orderItems.length === 0) {
    orderItemsHTML = '<div style="text-align: center; padding: 20px; color: #9ca3af;">Chưa có dịch vụ nào</div>';
  } else {
    orderItemsHTML = orderItems.map((item, index) => {
      const itemId = item.id || index.toString();
      const menuItemId = item.menuItem?.id || item.menuItem?.$id || '';
      const currentQuantity = item.quantity || 1;
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #e5e7eb;">
          <div style="flex: 1;">
            <div style="font-weight: 600;">${item.menuItem?.name || 'N/A'}</div>
            <div style="color: #06b6d4; margin-top: 5px;">₫ ${parseFloat(item.price || 0).toLocaleString('vi-VN')}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <button onclick="updateOrderItemQuantity('${order.id}', '${menuItemId}', ${currentQuantity - 1})" 
                    style="width: 30px; height: 30px; border: 1px solid #e5e7eb; background: white; border-radius: 4px; cursor: pointer;">-</button>
            <span style="min-width: 30px; text-align: center;">${currentQuantity}</span>
            <button onclick="updateOrderItemQuantity('${order.id}', '${menuItemId}', ${currentQuantity + 1})" 
                    style="width: 30px; height: 30px; border: 1px solid #e5e7eb; background: white; border-radius: 4px; cursor: pointer;">+</button>
            <button onclick="removeOrderItem('${order.id}', '${menuItemId}')" 
                    style="padding: 5px 10px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Xóa</button>
          </div>
        </div>
      `;
    }).join('');
  }
  
  content.innerHTML = `
    <div style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
      <h3>Hóa đơn - ${table.name || 'Bàn'}</h3>
      
      <div style="margin-top: 20px;">
        <h4>Dịch vụ đã chọn</h4>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; margin-top: 10px;">
          ${orderItemsHTML}
        </div>
        <div style="margin-top: 15px; padding: 15px; background: #f3f4f6; border-radius: 8px; text-align: right;">
          <strong style="font-size: 18px;">Tổng tiền: ₫ ${totalAmount.toLocaleString('vi-VN')}</strong>
        </div>
      </div>
      
      <div style="margin-top: 30px;">
        <h4>Thêm dịch vụ</h4>
        <div style="max-height: 400px; overflow-y: auto; margin-top: 10px;">
          ${menuItemsHTML}
        </div>
      </div>
      
      <div class="modal-actions" style="margin-top: 20px;">
        <button type="button" onclick="closeModal()" class="pill">Đóng</button>
        <button type="button" onclick="saveOrderItems('${order.id}')" class="btn">Lưu</button>
      </div>
    </div>
  `;
}

// Thêm menu item vào order
window.addMenuItemToOrder = async function(orderId, menuItemId, menuItemName, price) {
  try {
    const order = await api.getOrderById(orderId);
    if (!order) {
      alert('Không tìm thấy hóa đơn');
      return;
    }
    
    const orderItems = order.orderItems || [];
    
    // Kiểm tra xem item đã có chưa (so sánh với id của menuItem)
    const existingItemIndex = orderItems.findIndex(item => {
      const itemMenuId = item.menuItem?.id || item.menuItem?.$id || (typeof item.menuItem === 'string' ? item.menuItem : null);
      return itemMenuId === menuItemId;
    });
    
    if (existingItemIndex !== -1) {
      // Tăng số lượng
      orderItems[existingItemIndex].quantity = (orderItems[existingItemIndex].quantity || 1) + 1;
    } else {
      // Thêm mới
      orderItems.push({
        menuItem: { id: menuItemId },
        quantity: 1,
        price: price
      });
    }
    
    // Tính lại tổng tiền
    const totalAmount = orderItems.reduce((sum, item) => {
      return sum + (parseFloat(item.price || 0) * (item.quantity || 1));
    }, 0);
    
    order.orderItems = orderItems;
    order.totalAmount = totalAmount;
    
    await api.updateOrder(orderId, order);
    
    // Reload form
    const table = window.currentTable || (window.currentTableId ? await api.getTableById(window.currentTableId) : null);
    const menuItems = await api.getActiveMenuItems();
    const updatedOrder = await api.getOrderById(orderId);
    const content = document.getElementById('modalContent');
    await displayOrderForm(content, updatedOrder, table, menuItems);
  } catch (error) {
    console.error('Error adding menu item:', error);
    alert('Lỗi khi thêm dịch vụ: ' + error.message);
  }
}

// Cập nhật số lượng order item
window.updateOrderItemQuantity = async function(orderId, menuItemId, newQuantity) {
  if (newQuantity < 1) {
    await removeOrderItem(orderId, menuItemId);
    return;
  }
  
  try {
    const order = await api.getOrderById(orderId);
    if (!order) {
      alert('Không tìm thấy hóa đơn');
      return;
    }
    
    const orderItems = order.orderItems || [];
    const itemIndex = orderItems.findIndex(item => {
      const itemMenuId = item.menuItem?.id || item.menuItem?.$id || (typeof item.menuItem === 'string' ? item.menuItem : null);
      return itemMenuId === menuItemId;
    });
    
    if (itemIndex !== -1) {
      orderItems[itemIndex].quantity = newQuantity;
      
      // Tính lại tổng tiền
      const totalAmount = orderItems.reduce((sum, item) => {
        return sum + (parseFloat(item.price || 0) * (item.quantity || 1));
      }, 0);
      
      order.orderItems = orderItems;
      order.totalAmount = totalAmount;
      
      await api.updateOrder(orderId, order);
      
      // Reload form
      const table = await api.getTableById(order.table?.id);
      const menuItems = await api.getActiveMenuItems();
      const updatedOrder = await api.getOrderById(orderId);
      const content = document.getElementById('modalContent');
      await displayOrderForm(content, updatedOrder, table, menuItems);
    }
  } catch (error) {
    console.error('Error updating quantity:', error);
    alert('Lỗi khi cập nhật số lượng: ' + error.message);
  }
}

// Xóa order item
window.removeOrderItem = async function(orderId, menuItemId) {
  try {
    const order = await api.getOrderById(orderId);
    if (!order) {
      alert('Không tìm thấy hóa đơn');
      return;
    }
    
    const orderItems = order.orderItems || [];
    const filteredItems = orderItems.filter(item => {
      const itemMenuId = item.menuItem?.id || item.menuItem?.$id || (typeof item.menuItem === 'string' ? item.menuItem : null);
      return itemMenuId !== menuItemId;
    });
    
    // Tính lại tổng tiền
    const totalAmount = filteredItems.reduce((sum, item) => {
      return sum + (parseFloat(item.price || 0) * (item.quantity || 1));
    }, 0);
    
    order.orderItems = filteredItems;
    order.totalAmount = totalAmount;
    
    await api.updateOrder(orderId, order);
    
    // Reload form
    const table = window.currentTable || (window.currentTableId ? await api.getTableById(window.currentTableId) : null);
    const menuItems = await api.getActiveMenuItems();
    const updatedOrder = await api.getOrderById(orderId);
    const content = document.getElementById('modalContent');
    await displayOrderForm(content, updatedOrder, table, menuItems);
  } catch (error) {
    console.error('Error removing item:', error);
    alert('Lỗi khi xóa dịch vụ: ' + error.message);
  }
}

// Lưu order items
window.saveOrderItems = async function(orderId) {
  try {
    // Order đã được lưu tự động khi thêm/xóa/sửa
    // Chỉ cần đóng modal và reload
    if (typeof closeModal === 'function') {
      closeModal();
    } else {
      const backdrop = document.getElementById('modalBackdrop');
      if (backdrop) backdrop.style.display = 'none';
    }
    loadTables();
    if (typeof loadOrders === 'function') {
      loadOrders();
    }
  } catch (error) {
    console.error('Error saving order:', error);
    alert('Lỗi khi lưu hóa đơn: ' + error.message);
  }
}

// Lưu dữ liệu bàn gốc để filter
let allTables = [];

async function loadTables() {
  try {
    allTables = await api.getTables();
    filterTables();
  } catch (error) {
    console.error('Error loading tables:', error);
    const grid = document.getElementById('tablesGrid');
    if (grid) {
      grid.innerHTML = '<div class="empty-state">Lỗi khi tải dữ liệu</div>';
    }
  }
}

// Hàm filter bàn
window.filterTables = function() {
  const grid = document.getElementById('tablesGrid');
  if (!grid) return;
  
  const nameFilter = (document.getElementById('filterTableName')?.value || '').toLowerCase();
  const areaFilter = (document.getElementById('filterTableArea')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('filterTableStatus')?.value || '';
  
  const filtered = allTables.filter(t => {
    const nameMatch = !nameFilter || (t.name || '').toLowerCase().includes(nameFilter);
    const areaMatch = !areaFilter || (t.area || '').toLowerCase().includes(areaFilter);
    
    // So sánh trạng thái
    let statusMatch = true;
    if (statusFilter) {
      // Lấy trạng thái thực tế từ database
      const tableStatus = (t.status || '').trim();
      const filterStatus = statusFilter.trim();
      
      // Mapping giữa các giá trị có thể có
      const statusMap = {
        'Trống': ['Trống', 'empty', 'available'],
        'Đặt trước': ['Đặt trước', 'reserved', 'Reserved'],
        'Đang sử dụng': ['Đang sử dụng', 'occupied', 'Occupied', 'Đang sử dụng'],
        'Sửa chữa': ['Sửa chữa', 'maintenance', 'Maintenance']
      };
      
      // Tìm mapping cho filterStatus
      const filterValues = statusMap[filterStatus] || [filterStatus];
      
      // So sánh với giá trị thực tế và label
      const statusLabel = getStatusLabel(tableStatus);
      statusMatch = filterValues.includes(tableStatus) || filterValues.includes(statusLabel) || tableStatus === filterStatus || statusLabel === filterStatus;
    }
    
    return nameMatch && areaMatch && statusMatch;
  });
  
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state">Không tìm thấy bàn nào</div>';
  } else {
    grid.innerHTML = filtered.map((t) => {
        const status = getStatusLabel(t.status);
        const statusColor = getStatusColor(t.status);
        
        // Xác định nút hiển thị theo trạng thái
        let actionButtons = '';
        if (status === 'Trống') {
          actionButtons = `
            <button class="table-action-btn use-btn" onclick="useTable('${t.id}')">Sử dụng</button>
            <button class="table-action-btn reserve-btn" onclick="reserveTable('${t.id}')">Đặt trước</button>
          `;
        } else if (status === 'Đặt trước') {
          actionButtons = `
            <button class="table-action-btn use-btn" onclick="useTable('${t.id}')">Sử dụng</button>
          `;
        } else if (status === 'Đang sử dụng') {
          actionButtons = `
            <button class="table-action-btn payment-btn" onclick="showOrderDetails('${t.id}')">Chi tiết</button>
          `;
        } else if (status === 'Sửa chữa') {
          actionButtons = `
            <button class="table-action-btn use-btn" onclick="useTable('${t.id}')" disabled>Sử dụng</button>
            <button class="table-action-btn reserve-btn" onclick="reserveTable('${t.id}')" disabled>Đặt trước</button>
          `;
        }
        
        return `
          <div class="table-booking-card" style="border-top: 4px solid ${statusColor}" ondblclick="handleTableDoubleClick('${t.id}', '${status}')">
            <div class="table-card-header">
              <h4 class="table-card-title">${t.name || 'Bàn'}</h4>
            </div>
            <div class="table-card-info">
              <div class="table-area">${t.area || 'Khu vực'}</div>
              <div class="table-status-badge" style="background: ${statusColor}20; color: ${statusColor}; border-color: ${statusColor}40;">
                ${status}
              </div>
            </div>
            <div class="table-card-actions">
              ${actionButtons}
            </div>
          </div>
        `;
      }).join('');
  }
}

// Menu
let editingMenuItemId = null;
let categories = [];
let allMenuItems = []; // Lưu dữ liệu menu gốc để filter

async function loadCategories() {
  try {
    categories = await api.getCategories();
    // Cập nhật dropdown category filter
    const categorySelect = document.getElementById('filterMenuCategory');
    if (categorySelect) {
      const currentValue = categorySelect.value;
      categorySelect.innerHTML = '<option value="">Tất cả danh mục</option>' + 
        categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
      categorySelect.value = currentValue;
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

async function loadMenu() {
  try {
    await loadCategories();
    allMenuItems = await api.getMenuItems();
    filterMenu();
  } catch (error) {
    console.error('Error loading menu:', error);
    const tbody = document.getElementById('menuTable');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Lỗi khi tải dữ liệu</td></tr>';
    }
  }
}

// Hàm filter menu
window.filterMenu = function() {
  const tbody = document.getElementById('menuTable');
  if (!tbody) return;
  
  const nameFilter = (document.getElementById('filterMenuName')?.value || '').toLowerCase();
  const categoryFilter = document.getElementById('filterMenuCategory')?.value || '';
  const priceFilter = document.getElementById('filterMenuPrice')?.value || '';
  
  const filtered = allMenuItems.filter(m => {
    const nameMatch = !nameFilter || (m.name || '').toLowerCase().includes(nameFilter);
    const categoryMatch = !categoryFilter || (m.category?.id === categoryFilter || m.category?.$id === categoryFilter);
    
    let priceMatch = true;
    if (priceFilter) {
      const price = parseFloat(m.price || 0);
      if (priceFilter === '0-50000') {
        priceMatch = price < 50000;
      } else if (priceFilter === '50000-100000') {
        priceMatch = price >= 50000 && price < 100000;
      } else if (priceFilter === '100000-200000') {
        priceMatch = price >= 100000 && price < 200000;
      } else if (priceFilter === '200000-') {
        priceMatch = price >= 200000;
      }
    }
    
    return nameMatch && categoryMatch && priceMatch;
  });
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Không tìm thấy món nào</td></tr>';
  } else {
    tbody.innerHTML = filtered.map((m, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${m.name || '-'}</td>
          <td>${m.category?.name || '-'}</td>
          <td>₫ ${(parseFloat(m.price) || 0).toLocaleString('vi-VN')}</td>
          <td>${m.isActive ? 'Có' : 'Không'}</td>
          <td>
            <button class="pill" style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; border-color: rgba(6, 182, 212, 0.4);" onclick="openModal('editMenu', '${m.id}')">Sửa</button>
            <button class="pill danger" onclick="deleteMenuItem('${m.id}')" style="margin-left:4px">Xóa</button>
          </td>
        </tr>
      `).join('');
  }
}

// Orders
let tables = [];
let customers = [];
let menuItems = [];
let allOrders = []; // Lưu dữ liệu orders gốc để filter

async function loadOrdersData() {
  try {
    [tables, customers, menuItems] = await Promise.all([
      api.getTables(),
      api.getCustomers(),
      api.getActiveMenuItems()
    ]);
  } catch (error) {
    console.error('Error loading orders data:', error);
  }
}

async function loadOrders() {
  try {
    await loadOrdersData();
    allOrders = await api.getOrders();
    filterOrders();
  } catch (error) {
    console.error('Error loading orders:', error);
    const tbody = document.getElementById('ordersAdmin');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Lỗi khi tải dữ liệu</td></tr>';
    }
  }
}

// Hàm filter orders
window.filterOrders = function() {
  const tbody = document.getElementById('ordersAdmin');
  if (!tbody) return;
  
  const statusFilter = document.getElementById('filterOrderStatus')?.value || '';
  const customerFilter = (document.getElementById('filterOrderCustomer')?.value || '').toLowerCase();
  
  const filtered = allOrders.filter(o => {
    const statusMatch = !statusFilter || o.status === statusFilter;
    const customerMatch = !customerFilter || (o.customer?.name || '').toLowerCase().includes(customerFilter);
    
    return statusMatch && customerMatch;
  });
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Không tìm thấy đơn hàng nào</td></tr>';
  } else {
    tbody.innerHTML = filtered.map(o => `
        <tr>
          <td>${o.id || '-'}</td>
          <td>${o.tableName || '-'}</td>
          <td>${o.customer?.name || '-'}</td>
          <td>₫ ${(parseFloat(o.totalAmount) || 0).toLocaleString('vi-VN')}</td>
          <td><span class="status-${o.status}">${o.status || '-'}</span></td>
          <td>
            <button class="pill" style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; border-color: rgba(6, 182, 212, 0.4);" onclick="openModal('viewOrder', '${o.id}')">Xem</button>
          </td>
        </tr>
      `).join('');
  }
}

// Customers
let editingCustomerId = null;

async function loadCustomers() {
  try {
    const customers = await api.getCustomers();
    const tbody = document.getElementById('customersTable');
    
    if (customers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Chưa có khách hàng nào</td></tr>';
    } else {
      tbody.innerHTML = customers.map((c, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${c.name || '-'}</td>
          <td>${c.phone || '-'}</td>
          <td>${c.type || '-'}</td>
          <td>${c.points || 0}</td>
          <td>
            <button class="pill" style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; border-color: rgba(6, 182, 212, 0.4);" onclick="openModal('editCustomer', '${c.id}')">Sửa</button>
            <button class="pill danger" onclick="deleteCustomer('${c.id}')" style="margin-left:4px">Xóa</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading customers:', error);
    document.getElementById('customersTable').innerHTML = '<tr><td colspan="6" class="empty-state">Lỗi khi tải dữ liệu</td></tr>';
  }
}

// Inventory
let editingInventoryId = null;

async function loadInventory() {
  try {
    const items = await api.getInventory();
    const tbody = document.getElementById('inventoryTable');
    
    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Chưa có dữ liệu kho</td></tr>';
    } else {
      tbody.innerHTML = items.map((it, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${it.itemName || '-'}</td>
          <td>${it.quantity || 0}</td>
          <td>${it.unit || '-'}</td>
          <td>₫ ${(parseFloat(it.unitPrice) || 0).toLocaleString('vi-VN')}</td>
          <td>${it.supplier || '-'}</td>
          <td>
            <button class="pill" style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; border-color: rgba(6, 182, 212, 0.4);" onclick="openModal('editInventory', '${it.id}')">Sửa</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading inventory:', error);
    document.getElementById('inventoryTable').innerHTML = '<tr><td colspan="7" class="empty-state">Lỗi khi tải dữ liệu</td></tr>';
  }
}

// Employees
// editingEmployeeId is declared in modals.js

// Helper function to format role for display
function formatRole(role) {
  if (!role) return '-';
  // Map old English values to Vietnamese
  const roleMap = {
    'ADMIN': 'Quản trị viên',
    'waiter': 'Phục vụ',
    'cashier': 'Thu ngân',
    'chef': 'Đầu bếp',
    'manager': 'Quản lý',
    'Phục_vụ': 'Phục vụ',
    'Thu_ngân': 'Thu ngân',
    'Đầu_bếp': 'Đầu bếp',
    'Quản_lý': 'Quản lý'
  };
  return roleMap[role] || role.replace(/_/g, ' ');
}

async function loadEmployees() {
  try {
    const employees = await api.getEmployees();
    const employeeRole = sessionStorage.getItem('employeeRole');
    
    // Filter employees dựa trên quyền
    let filteredEmployees = employees;
    
    // Nếu không phải ADMIN, ẩn các nhân viên có role ADMIN
    if (employeeRole !== 'ADMIN') {
      filteredEmployees = employees.filter(emp => {
        const empRole = emp.role;
        // Ẩn nhân viên có role ADMIN
        return empRole !== 'ADMIN';
      });
    }
    
    const tbody = document.getElementById('employeesTable');
    
    if (filteredEmployees.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Chưa có nhân viên nào</td></tr>';
    } else {
      tbody.innerHTML = filteredEmployees.map((e, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${e.name || '-'}</td>
          <td>${formatRole(e.role)}</td>
          <td>${e.phone || '-'}</td>
          <td>₫ ${(parseFloat(e.salary) || 0).toLocaleString('vi-VN')}</td>
          <td>${e.status ? 'Hoạt động' : 'Không hoạt động'}</td>
          <td>
            <button class="pill" style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; border-color: rgba(6, 182, 212, 0.4);" onclick="openModal('editEmployee', '${e.id}')">Sửa</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading employees:', error);
    document.getElementById('employeesTable').innerHTML = '<tr><td colspan="7" class="empty-state">Lỗi khi tải dữ liệu</td></tr>';
  }
}

// Payments
async function loadPayments() {
  try {
    await loadOrdersData();
    window.orders = await api.getOrders();
    const payments = await api.getPayments();
    const tbody = document.getElementById('paymentsTable');
    
    if (payments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Chưa có thanh toán nào</td></tr>';
    } else {
      tbody.innerHTML = payments.map((p, i) => {
        const date = p.createdAt ? new Date(p.createdAt).toLocaleString('vi-VN') : '-';
        return `
          <tr>
            <td>${i + 1}</td>
            <td>${p.order?.id || '-'}</td>
            <td>₫ ${(parseFloat(p.amount) || 0).toLocaleString('vi-VN')}</td>
            <td>${p.method || '-'}</td>
            <td>${date}</td>
          </tr>
        `;
      }).join('');
    }
  } catch (error) {
    console.error('Error loading payments:', error);
    document.getElementById('paymentsTable').innerHTML = '<tr><td colspan="5" class="empty-state">Lỗi khi tải dữ liệu</td></tr>';
  }
}

// Settings
async function loadSettings() {
  await loadCategories();
  await loadCategoriesTable();
}

async function loadCategoriesTable() {
  try {
    const categories = await api.getCategories();
    const tbody = document.getElementById('categoriesTable');
    
    if (categories.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Chưa có danh mục nào</td></tr>';
    } else {
      tbody.innerHTML = categories.map((c, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${c.name || '-'}</td>
          <td>${c.description || '-'}</td>
          <td>
            <button class="pill" style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; border-color: rgba(6, 182, 212, 0.4);" onclick="openModal('editCategory', '${c.id}')">Sửa</button>
            <button class="pill danger" onclick="deleteCategory('${c.id}')" style="margin-left:4px">Xóa</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    document.getElementById('categoriesTable').innerHTML = '<tr><td colspan="4" class="empty-state">Lỗi khi tải dữ liệu</td></tr>';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  showPage('tables');
  loadStatus();
  loadCategoriesTable();
  
  // Load orders data for payment modal
  loadOrdersData();
});

