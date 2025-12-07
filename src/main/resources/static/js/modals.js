// Modal management for all forms

// Global variables for editing
let editingEmployeeId = null;

// Table Modals
function openTableModal(type, id) {
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  
  if (type === 'newTable') {
    editingTableId = null;
    content.innerHTML = `
      <h3>Thêm bàn mới</h3>
      <form id="tableForm" onsubmit="saveTable(event)">
        <div class="form-row">
          <input class="input" name="name" placeholder="Tên bàn" required />
          <input class="input" name="area" placeholder="Khu vực" required />
        </div>
        <div style="margin-top:10px">
          <select class="input" name="status" required>
            <option value="Trống">Trống</option>
            <option value="Đặt trước">Đặt trước</option>
            <option value="Đang sử dụng">Đang sử dụng</option>
            <option value="Sửa chữa">Sửa chữa</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" onclick="closeModal()" class="pill">Hủy</button>
          <button type="submit" class="btn">Lưu</button>
        </div>
      </form>
    `;
  } else if (type === 'editTable') {
    editingTableId = id;
    api.getTableById(id).then(table => {
      if (table) {
        content.innerHTML = `
          <h3>Chỉnh sửa bàn</h3>
          <form id="tableForm" onsubmit="saveTable(event)">
            <div class="form-row">
              <input class="input" name="name" value="${table.name || ''}" placeholder="Tên bàn" required />
              <input class="input" name="area" value="${table.area || ''}" placeholder="Khu vực" required />
            </div>
            <div style="margin-top:10px">
              <select class="input" name="status" required>
                <option value="Trống" ${(table.status === 'Trống' || table.status === 'available') ? 'selected' : ''}>Trống</option>
                <option value="Đặt trước" ${(table.status === 'Đặt trước' || table.status === 'reserved') ? 'selected' : ''}>Đặt trước</option>
                <option value="Đang sử dụng" ${(table.status === 'Đang sử dụng' || table.status === 'occupied') ? 'selected' : ''}>Đang sử dụng</option>
                <option value="Sửa chữa" ${(table.status === 'Sửa chữa' || table.status === 'maintenance') ? 'selected' : ''}>Sửa chữa</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" onclick="closeModal()" class="pill">Hủy</button>
              <button type="submit" class="btn">Cập nhật</button>
            </div>
          </form>
        `;
      }
    });
  }
  
  backdrop.style.display = 'flex';
}

async function saveTable(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const table = {
    name: formData.get('name'),
    area: formData.get('area'),
    status: formData.get('status')
  };

  try {
    if (editingTableId) {
      await api.updateTable(editingTableId, table);
    } else {
      await api.createTable(table);
    }
    closeModal();
    loadTables();
    loadStatus();
  } catch (error) {
    alert('Lỗi khi lưu bàn: ' + error.message);
  }
}

async function deleteTable(id) {
  if (confirm('Bạn có chắc muốn xóa bàn này?')) {
    try {
      await api.deleteTable(id);
      loadTables();
      loadStatus();
    } catch (error) {
      alert('Lỗi khi xóa bàn: ' + error.message);
    }
  }
}

// Menu Modals
async function openMenuModal(type, id) {
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  
  // Ensure categories are loaded
  if (typeof loadCategories === 'function') {
    await loadCategories();
  }
  
  // Get categories from pages.js or use empty array
  const availableCategories = typeof categories !== 'undefined' ? categories : [];
  
  if (type === 'newMenu') {
    editingMenuItemId = null;
    
    content.innerHTML = `
      <h3>Thêm món mới</h3>
      <form id="menuForm" onsubmit="saveMenuItem(event)">
        <div style="margin-top:10px">
          <input class="input" name="name" placeholder="Tên món" required />
        </div>
        <div class="form-row" style="margin-top:10px">
          <input class="input" type="number" name="price" placeholder="Giá" step="0.01" required />
          <input class="input" name="unit" placeholder="Đơn vị" value="Phần" />
        </div>
        <div style="margin-top:10px; position: relative;">
          <input 
            type="text" 
            class="input" 
            id="categorySearch" 
            placeholder="Tìm kiếm hoặc tạo danh mục mới" 
            autocomplete="off"
            oninput="filterCategories(this.value)"
            onfocus="showCategoryDropdown()"
            required />
          <input type="hidden" name="categoryId" id="categoryId" />
          <input type="hidden" name="newCategoryName" id="newCategoryName" />
          <div id="categoryDropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #1f2937; border: 1px solid #374151; border-radius: 8px; margin-top: 4px; max-height: 200px; overflow-y: auto; z-index: 1000;">
            <div id="categoryList"></div>
            <div id="createCategoryOption" style="display: none; padding: 10px; border-top: 1px solid #374151; cursor: pointer; color: #06b6d4;" onclick="createNewCategory()">
              <strong>+ Tạo danh mục mới: "<span id="newCategoryText"></span>"</strong>
            </div>
          </div>
        </div>
        <div style="margin-top:10px">
          <label><input type="checkbox" name="isActive" checked /> Hoạt động</label>
        </div>
        <div class="modal-actions">
          <button type="button" onclick="closeModal()" class="pill">Hủy</button>
          <button type="submit" class="btn">Lưu</button>
        </div>
      </form>
    `;
    
    // Initialize category dropdown
    setTimeout(() => {
      initializeCategorySearch();
      setupCategoryDropdownEvents();
    }, 100);
  } else if (type === 'editMenu') {
    editingMenuItemId = id;
    fetch(`${API_BASE_URL}/menu-items/${id}`)
      .then(r => r.json())
      .then(item => {
        const categoryOptions = categories.map(c => 
          `<option value="${c.id}" ${item.category?.id === c.id ? 'selected' : ''}>${c.name}</option>`
        ).join('');
        
        content.innerHTML = `
          <h3>Chỉnh sửa món</h3>
          <form id="menuForm" onsubmit="saveMenuItem(event)">
            <div style="margin-top:10px">
              <input class="input" name="name" value="${item.name || ''}" placeholder="Tên món" required />
            </div>
            <div class="form-row" style="margin-top:10px">
              <input class="input" type="number" name="price" value="${item.price || ''}" placeholder="Giá" step="0.01" required />
              <input class="input" name="unit" value="${item.unit || ''}" placeholder="Đơn vị" />
            </div>
            <div style="margin-top:10px">
              <select class="input" name="categoryId" required>
                <option value="">Chọn danh mục</option>
                ${categoryOptions}
              </select>
            </div>
            <div style="margin-top:10px">
              <label><input type="checkbox" name="isActive" ${item.isActive ? 'checked' : ''} /> Hoạt động</label>
            </div>
            <div class="modal-actions">
              <button type="button" onclick="closeModal()" class="pill">Hủy</button>
              <button type="submit" class="btn">Cập nhật</button>
            </div>
          </form>
        `;
      });
  }
  
  backdrop.style.display = 'flex';
}

// Setup category dropdown events
function setupCategoryDropdownEvents() {
  // Close dropdown when clicking outside
  document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('categoryDropdown');
    const searchInput = document.getElementById('categorySearch');
    
    if (dropdown && searchInput && 
        !dropdown.contains(event.target) && 
        event.target !== searchInput) {
      hideCategoryDropdown();
    }
  });
}

// Initialize category search
function initializeCategorySearch() {
  const categoryList = document.getElementById('categoryList');
  if (categoryList) {
    // Get categories from pages.js or use empty array
    const availableCategories = typeof categories !== 'undefined' ? categories : [];
    renderCategoryList(availableCategories);
  }
}

// Render category list
function renderCategoryList(filteredCategories) {
  const categoryList = document.getElementById('categoryList');
  if (!categoryList) return;
  
  if (filteredCategories.length === 0) {
    categoryList.innerHTML = '<div style="padding: 10px; color: #9ca3af;">Không tìm thấy danh mục</div>';
  } else {
    categoryList.innerHTML = filteredCategories.map(c => {
      const escapedName = (c.name || '').replace(/'/g, "&#39;").replace(/"/g, "&quot;");
      return `
        <div style="padding: 10px; cursor: pointer;" 
             onmouseover="this.style.background='#374151'" 
             onmouseout="this.style.background='transparent'"
             onclick="selectCategory('${c.id}', '${escapedName}')">
          ${c.name || ''}
        </div>
      `;
    }).join('');
  }
}

// Filter categories
window.filterCategories = function(searchText) {
  const searchLower = (searchText || '').toLowerCase().trim();
  const categoryList = document.getElementById('categoryList');
  const createOption = document.getElementById('createCategoryOption');
  const newCategoryText = document.getElementById('newCategoryText');
  const categoryIdInput = document.getElementById('categoryId');
  const newCategoryNameInput = document.getElementById('newCategoryName');
  
  if (!categoryList) return;
  
  // Reset hidden inputs
  if (categoryIdInput) categoryIdInput.value = '';
  if (newCategoryNameInput) newCategoryNameInput.value = '';
  
  if (!searchText || searchText.trim() === '') {
    // Show all categories
    renderCategoryList(categories);
    if (createOption) createOption.style.display = 'none';
    showCategoryDropdown();
    return;
  }
  
  // Get categories from pages.js or use empty array
  const availableCategories = typeof categories !== 'undefined' ? categories : [];
  
  // Filter categories
  const filtered = availableCategories.filter(c => 
    c.name.toLowerCase().includes(searchLower)
  );
  
  renderCategoryList(filtered);
  
  // Check if search text doesn't match any category
  const exactMatch = availableCategories.find(c => 
    c.name.toLowerCase() === searchLower
  );
  
  if (!exactMatch && searchText.trim().length > 0) {
    // Show option to create new category
    if (createOption && newCategoryText) {
      newCategoryText.textContent = searchText.trim();
      createOption.style.display = 'block';
    }
  } else {
    if (createOption) createOption.style.display = 'none';
  }
  
  showCategoryDropdown();
}

// Show category dropdown
function showCategoryDropdown() {
  const dropdown = document.getElementById('categoryDropdown');
  if (dropdown) {
    dropdown.style.display = 'block';
  }
}

// Hide category dropdown
function hideCategoryDropdown() {
  const dropdown = document.getElementById('categoryDropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

// Select category
window.selectCategory = function(categoryId, categoryName) {
  const searchInput = document.getElementById('categorySearch');
  const categoryIdInput = document.getElementById('categoryId');
  const newCategoryNameInput = document.getElementById('newCategoryName');
  
  // Decode HTML entities
  const decodedName = categoryName.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  
  if (searchInput) searchInput.value = decodedName;
  if (categoryIdInput) categoryIdInput.value = categoryId;
  if (newCategoryNameInput) newCategoryNameInput.value = '';
  
  hideCategoryDropdown();
}

// Create new category
window.createNewCategory = async function() {
  const searchInput = document.getElementById('categorySearch');
  const newCategoryNameInput = document.getElementById('newCategoryName');
  const categoryIdInput = document.getElementById('categoryId');
  
  if (!searchInput || !newCategoryNameInput) return;
  
  const categoryName = searchInput.value.trim();
  if (!categoryName) {
    alert('Vui lòng nhập tên danh mục');
    return;
  }
  
  try {
    // Create new category
    const newCategory = {
      name: categoryName,
      description: ''
    };
    
    const createdCategory = await api.createCategory(newCategory);
    
    // Update categories list
    categories.push(createdCategory);
    
    // Set the new category as selected
    if (categoryIdInput) categoryIdInput.value = createdCategory.id;
    if (newCategoryNameInput) newCategoryNameInput.value = '';
    
    hideCategoryDropdown();
    
    // Show success message
    const searchInputEl = document.getElementById('categorySearch');
    if (searchInputEl) {
      searchInputEl.style.borderColor = '#10b981';
      setTimeout(() => {
        if (searchInputEl) searchInputEl.style.borderColor = '';
      }, 1000);
    }
  } catch (error) {
    console.error('Error creating category:', error);
    alert('Lỗi khi tạo danh mục: ' + error.message);
  }
}

async function saveMenuItem(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  let categoryId = formData.get('categoryId');
  const searchInput = document.getElementById('categorySearch');
  const searchValue = searchInput ? searchInput.value.trim() : '';
  
  // If no categoryId is selected but there's text in search input, try to find or create
  if (!categoryId && searchValue) {
    // Get categories from pages.js or use empty array
    const availableCategories = typeof categories !== 'undefined' ? categories : [];
    
    // First, try to find exact match
    const exactMatch = availableCategories.find(c => 
      c.name.toLowerCase() === searchValue.toLowerCase()
    );
    
    if (exactMatch) {
      categoryId = exactMatch.id;
    } else {
      // Create new category
      try {
        const newCategory = {
          name: searchValue,
          description: ''
        };
        const createdCategory = await api.createCategory(newCategory);
        categoryId = createdCategory.id;
        // Update categories list
        if (typeof categories !== 'undefined') {
          categories.push(createdCategory);
        }
      } catch (error) {
        alert('Lỗi khi tạo danh mục mới: ' + error.message);
        return;
      }
    }
  }
  
  if (!categoryId) {
    alert('Vui lòng chọn hoặc tạo danh mục');
    return;
  }
  
  const item = {
    name: formData.get('name'),
    price: parseFloat(formData.get('price')),
    unit: formData.get('unit'),
    isActive: formData.get('isActive') === 'on',
    category: { id: categoryId }
  };

  try {
    if (editingMenuItemId) {
      await api.updateMenuItem(editingMenuItemId, item);
    } else {
      await api.createMenuItem(item);
    }
    closeModal();
    loadMenu();
  } catch (error) {
    alert('Lỗi khi lưu món: ' + error.message);
  }
}

async function deleteMenuItem(id) {
  if (confirm('Bạn có chắc muốn xóa món này?')) {
    try {
      await api.deleteMenuItem(id);
      loadMenu();
    } catch (error) {
      alert('Lỗi khi xóa món: ' + error.message);
    }
  }
}

// Order Modals
function openOrderModal(type, id) {
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  
  if (type === 'newOrder') {
    const tableOptions = tables.map(t => 
      `<option value="${t.id}">${t.name} - ${t.area}</option>`
    ).join('');
    const customerOptions = customers.map(c => 
      `<option value="${c.id}">${c.name} - ${c.phone}</option>`
    ).join('');
    
    content.innerHTML = `
      <h3>Tạo đơn hàng mới</h3>
      <form id="orderForm" onsubmit="saveOrder(event)">
        <div class="form-row" style="margin-top:10px">
          <select class="input" name="customerId" required>
            <option value="">Chọn khách hàng</option>
            ${customerOptions}
          </select>
          <select class="input" name="tableId">
            <option value="">Chọn bàn (tùy chọn)</option>
            ${tableOptions}
          </select>
        </div>
        <div style="margin-top:10px">
          <select class="input" name="orderType" required>
            <option value="dine_in">Tại chỗ</option>
            <option value="takeaway">Mang đi</option>
            <option value="delivery">Giao hàng</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" onclick="closeModal()" class="pill">Hủy</button>
          <button type="submit" class="btn">Tạo</button>
        </div>
      </form>
    `;
  } else if (type === 'viewOrder') {
    fetch(`${API_BASE_URL}/orders/${id}`)
      .then(r => r.json())
      .then(order => {
        const items = order.orderItems || [];
        content.innerHTML = `
          <h3>Đơn ${order.id || ''}</h3>
          <div style="margin-top:8px">
            <p><strong>Khách:</strong> ${order.customer?.name || '-'}</p>
            <p><strong>Bàn:</strong> ${order.tableName || '-'}</p>
            <p><strong>Tổng:</strong> ₫ ${(parseFloat(order.totalAmount) || 0).toLocaleString('vi-VN')}</p>
            <p><strong>Trạng thái:</strong> <span class="status-${order.status}">${order.status || '-'}</span></p>
            <div style="margin-top:12px">
              <strong>Chi tiết:</strong>
              <ul>
                ${items.map(item => `<li>${item.menuItem?.name || '-'} x${item.quantity} - ₫${(parseFloat(item.price) || 0).toLocaleString('vi-VN')}</li>`).join('')}
              </ul>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn" onclick="closeModal()">Đóng</button>
          </div>
        `;
      });
  }
  
  backdrop.style.display = 'flex';
}

async function saveOrder(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  // Lấy tên bàn nếu có tableId
  let tableName = null;
  const tableId = formData.get('tableId');
  if (tableId) {
    try {
      const table = await api.getTableById(tableId);
      if (table) {
        tableName = table.name;
      }
    } catch (error) {
      console.error('Error getting table:', error);
    }
  }
  
  const order = {
    customer: { id: formData.get('customerId') },
    tableName: tableName,
    orderType: formData.get('orderType'),
    status: 'pending',
    orderItems: []
  };

  try {
    await api.createOrder(order);
    closeModal();
    loadOrders();
    loadStatus();
  } catch (error) {
    alert('Lỗi khi tạo đơn: ' + error.message);
  }
}

// Customer Modals
function openCustomerModal(type, id) {
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  
  if (type === 'newCustomer') {
    editingCustomerId = null;
    content.innerHTML = `
      <h3>Thêm khách hàng mới</h3>
      <form id="customerForm" onsubmit="saveCustomer(event)">
        <div style="margin-top:10px">
          <input class="input" name="name" placeholder="Tên khách hàng" required />
        </div>
        <div class="form-row" style="margin-top:10px">
          <input class="input" name="phone" placeholder="Số điện thoại" required />
              <select class="input" name="type" required>
                <option value="normal">Thường</option>
                <option value="member">Thành viên</option>
                <option value="vip">VIP</option>
              </select>
        </div>
        <div class="modal-actions">
          <button type="button" onclick="closeModal()" class="pill">Hủy</button>
          <button type="submit" class="btn">Lưu</button>
        </div>
      </form>
    `;
  } else if (type === 'editCustomer') {
    editingCustomerId = id;
    api.getCustomers().then(customers => {
      const customer = customers.find(c => c.id === id);
      if (customer) {
        content.innerHTML = `
          <h3>Chỉnh sửa khách hàng</h3>
          <form id="customerForm" onsubmit="saveCustomer(event)">
            <div style="margin-top:10px">
              <input class="input" name="name" value="${customer.name || ''}" placeholder="Tên khách hàng" required />
            </div>
            <div class="form-row" style="margin-top:10px">
              <input class="input" name="phone" value="${customer.phone || ''}" placeholder="Số điện thoại" required />
              <select class="input" name="type" required>
                <option value="normal" ${customer.type === 'normal' ? 'selected' : ''}>Normal</option>
                <option value="member" ${customer.type === 'member' ? 'selected' : ''}>Member</option>
                <option value="vip" ${customer.type === 'vip' ? 'selected' : ''}>VIP</option>
              </select>
            </div>
            <div style="margin-top:10px">
              <input class="input" type="number" name="points" value="${customer.points || 0}" placeholder="Điểm" />
            </div>
            <div class="modal-actions">
              <button type="button" onclick="closeModal()" class="pill">Hủy</button>
              <button type="submit" class="btn">Cập nhật</button>
            </div>
          </form>
        `;
      }
    });
  }
  
  backdrop.style.display = 'flex';
}

async function saveCustomer(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const customer = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    type: formData.get('type'),
    points: parseInt(formData.get('points')) || 0
  };

  try {
    if (editingCustomerId) {
      await api.updateCustomer(editingCustomerId, customer);
    } else {
      await api.createCustomer(customer);
    }
    closeModal();
    loadCustomers();
  } catch (error) {
    alert('Lỗi khi lưu khách hàng: ' + error.message);
  }
}

async function deleteCustomer(id) {
  if (confirm('Bạn có chắc muốn xóa khách hàng này?')) {
    try {
      await api.deleteCustomer(id);
      loadCustomers();
    } catch (error) {
      alert('Lỗi khi xóa khách hàng: ' + error.message);
    }
  }
}

// Inventory Modals
function openInventoryModal(type, id) {
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  
  if (type === 'newInventory') {
    editingInventoryId = null;
    content.innerHTML = `
      <h3>Nhập kho mới</h3>
      <form id="inventoryForm" onsubmit="saveInventory(event)">
        <div style="margin-top:10px">
          <input class="input" name="itemName" placeholder="Tên nguyên liệu/sản phẩm" required />
        </div>
        <div class="form-row" style="margin-top:10px">
          <input class="input" type="number" name="quantity" placeholder="Số lượng" required />
          <input class="input" name="unit" placeholder="Đơn vị (kg, lít...)" required />
        </div>
        <div class="form-row" style="margin-top:10px">
          <input class="input" type="number" name="unitPrice" step="0.01" placeholder="Giá đơn vị" required />
          <input class="input" name="supplier" placeholder="Nhà cung cấp" />
        </div>
        <div style="margin-top:10px">
          <textarea class="input" name="note" placeholder="Ghi chú"></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" onclick="closeModal()" class="pill">Hủy</button>
          <button type="submit" class="btn">Lưu</button>
        </div>
      </form>
    `;
  } else if (type === 'editInventory') {
    editingInventoryId = id;
    fetch(`${API_BASE_URL}/inventory/${id}`)
      .then(r => r.json())
      .then(item => {
        content.innerHTML = `
          <h3>Chỉnh sửa kho</h3>
          <form id="inventoryForm" onsubmit="saveInventory(event)">
            <div style="margin-top:10px">
              <input class="input" name="itemName" value="${item.itemName || ''}" placeholder="Tên nguyên liệu/sản phẩm" required />
            </div>
            <div class="form-row" style="margin-top:10px">
              <input class="input" type="number" name="quantity" value="${item.quantity || ''}" placeholder="Số lượng" required />
              <input class="input" name="unit" value="${item.unit || ''}" placeholder="Đơn vị" required />
            </div>
            <div class="form-row" style="margin-top:10px">
              <input class="input" type="number" name="unitPrice" value="${item.unitPrice || ''}" step="0.01" placeholder="Giá đơn vị" required />
              <input class="input" name="supplier" value="${item.supplier || ''}" placeholder="Nhà cung cấp" />
            </div>
            <div style="margin-top:10px">
              <textarea class="input" name="note" placeholder="Ghi chú">${item.note || ''}</textarea>
            </div>
            <div class="modal-actions">
              <button type="button" onclick="closeModal()" class="pill">Hủy</button>
              <button type="submit" class="btn">Cập nhật</button>
            </div>
          </form>
        `;
      });
  }
  
  backdrop.style.display = 'flex';
}

async function saveInventory(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const item = {
    itemName: formData.get('itemName'),
    quantity: parseInt(formData.get('quantity')),
    unit: formData.get('unit'),
    unitPrice: parseFloat(formData.get('unitPrice')),
    supplier: formData.get('supplier'),
    note: formData.get('note')
  };

  try {
    if (editingInventoryId) {
      await api.updateInventory(editingInventoryId, item);
    } else {
      await api.createInventory(item);
    }
    closeModal();
    loadInventory();
  } catch (error) {
    alert('Lỗi khi lưu kho: ' + error.message);
  }
}

// Employee Modals
function openEmployeeModal(type, id) {
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  
  if (type === 'newEmployee') {
    editingEmployeeId = null;
    content.innerHTML = `
      <h3>Thêm nhân viên mới</h3>
      <form id="employeeForm" onsubmit="saveEmployee(event)">
        <div style="margin-top:10px">
          <input class="input" name="name" placeholder="Tên nhân viên" required />
        </div>
        <div class="form-row" style="margin-top:10px">
          <input class="input" name="phone" placeholder="Số điện thoại" required />
          <select class="input" name="role" required>
          
            <option value="Phục_vụ">Phục vụ</option>
            <option value="Thu_ngân">Thu ngân</option>
            <option value="Đầu_bếp">Đầu bếp</option>
            <option value="Quản_lý">Quản lý</option>
          </select>
        </div>
        <div style="margin-top:10px">
          <input class="input" type="number" name="salary" step="0.01" placeholder="Lương" required />
        </div>
        <div style="margin-top:10px">
          <label><input type="checkbox" name="status" checked /> Hoạt động</label>
        </div>
        <div style="margin-top:10px">
          <label style="display: block; margin-bottom: 5px; color: #e6eef6; font-size: 13px;">Tài khoản:</label>
          <input class="input" name="account" placeholder="Tài khoản" style="display: block !important; width: 100%;" />
        </div>
        <div style="margin-top:10px">
          <label style="display: block; margin-bottom: 5px; color: #e6eef6; font-size: 13px;">Mật khẩu:</label>
          <input class="input" type="password" name="password" placeholder="Mật khẩu" style="display: block !important; width: 100%;" />
        </div>
        <div class="modal-actions">
          <button type="button" onclick="closeModal()" class="pill">Hủy</button>
          <button type="submit" class="btn">Lưu</button>
        </div>
      </form>
    `;
  } else if (type === 'editEmployee') {
    editingEmployeeId = id;
    fetch(`${API_BASE_URL}/employees/${id}`)
      .then(r => r.json())
      .then(employee => {
        content.innerHTML = `
          <h3>Chỉnh sửa nhân viên</h3>
          <form id="employeeForm" onsubmit="saveEmployee(event)">
            <div style="margin-top:10px">
              <input class="input" name="name" value="${employee.name || ''}" placeholder="Tên nhân viên" required />
            </div>
            <div class="form-row" style="margin-top:10px">
              <input class="input" name="phone" value="${employee.phone || ''}" placeholder="Số điện thoại" required />
              <select class="input" name="role" required>
              
                <option value="Phục_vụ" ${employee.role === 'Phục_vụ' || employee.role === 'waiter' ? 'selected' : ''}>Phục vụ</option>
                <option value="Thu_ngân" ${employee.role === 'Thu_ngân' || employee.role === 'cashier' ? 'selected' : ''}>Thu ngân</option>
                <option value="Đầu_bếp" ${employee.role === 'Đầu_bếp' || employee.role === 'chef' ? 'selected' : ''}>Đầu bếp</option>
                <option value="Quản_lý" ${employee.role === 'Quản_lý' || employee.role === 'manager' ? 'selected' : ''}>Quản lý</option>
              </select>
            </div>
            <div style="margin-top:10px">
              <input class="input" type="number" name="salary" value="${employee.salary || ''}" step="0.01" placeholder="Lương" required />
            </div>
            <div style="margin-top:10px">
              <label><input type="checkbox" name="status" ${employee.status ? 'checked' : ''} /> Hoạt động</label>
            </div>
            <div style="margin-top:10px">
              <label style="display: block; margin-bottom: 5px; color: #e6eef6; font-size: 13px;">Tài khoản:</label>
              <input class="input" name="account" value="${employee.account || ''}" placeholder="Tài khoản" style="display: block !important; width: 100%;" />
            </div>
            <div style="margin-top:10px">
              <label style="display: block; margin-bottom: 5px; color: #e6eef6; font-size: 13px;">Mật khẩu:</label>
              <input class="input" type="password" name="password" placeholder="Mật khẩu" style="display: block !important; width: 100%;" />
            </div>
            <div class="modal-actions">
              <button type="button" onclick="closeModal()" class="pill">Hủy</button>
              <button type="submit" class="btn">Cập nhật</button>
            </div>
          </form>
        `;
      });
  }
  
  backdrop.style.display = 'flex';
}

window.saveEmployee = async function(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const employee = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    role: formData.get('role'),
    salary: parseFloat(formData.get('salary')),
    status: formData.get('status') === 'on'
  };

  // Luôn thêm account và password nếu có giá trị
  const account = formData.get('account');
  const password = formData.get('password');
  if (account) {
    employee.account = account;
  }
  if (password) {
    employee.password = password;
  }

  try {
    let response;
    if (editingEmployeeId) {
      response = await api.updateEmployee(editingEmployeeId, employee);
    } else {
      response = await api.createEmployee(employee);
    }
    
    // Kiểm tra nếu response có success = false (lỗi validation)
    if (response && response.success === false) {
      alert(response.message || 'Lỗi khi lưu nhân viên');
      return;
    }
    
    window.closeModal();
    // Call loadEmployees if available (from pages.js or local)
    if (typeof loadEmployees === 'function') {
      loadEmployees();
    } else {
      // Reload page as fallback
      window.location.reload();
    }
  } catch (error) {
    // Kiểm tra nếu error có message từ server
    const errorMessage = error.message || (error.response && error.response.message) || 'Lỗi khi lưu nhân viên';
    alert(errorMessage);
  }
}

// Payment Modals
async function openPaymentModal(type) {
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  
  if (type === 'newPayment') {
    // Load orders if not already loaded
    if (!window.orders || window.orders.length === 0) {
      await loadOrdersData();
      window.orders = await api.getOrders();
    }
    const orderOptions = window.orders.map(o => 
      `<option value="${o.id}">${o.id} - ${o.customer?.name || ''} - ₫${(parseFloat(o.totalAmount) || 0).toLocaleString('vi-VN')}</option>`
    ).join('');
    
    content.innerHTML = `
      <h3>Thêm thanh toán</h3>
      <form id="paymentForm" onsubmit="savePayment(event)">
        <div style="margin-top:10px">
          <select class="input" name="orderId" required>
            <option value="">Chọn đơn hàng</option>
            ${orderOptions}
          </select>
        </div>
        <div class="form-row" style="margin-top:10px">
          <input class="input" type="number" name="amount" step="0.01" placeholder="Số tiền" required />
          <select class="input" name="method" required>
            <option value="cash">Tiền mặt</option>
            <option value="card">Thẻ</option>
            <option value="banking">Chuyển khoản</option>
            <option value="e_wallet">Ví điện tử</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" onclick="closeModal()" class="pill">Hủy</button>
          <button type="submit" class="btn">Lưu</button>
        </div>
      </form>
    `;
  }
  
  backdrop.style.display = 'flex';
}

async function savePayment(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const payment = {
    order: { id: formData.get('orderId') },
    amount: parseFloat(formData.get('amount')),
    method: formData.get('method')
  };

  try {
    await api.createPayment(payment);
    closeModal();
    loadPayments();
  } catch (error) {
    alert('Lỗi khi lưu thanh toán: ' + error.message);
  }
}

// Category Modals
function openCategoryModal(type, id) {
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  
  if (type === 'newCategory') {
    editingCategoryId = null;
    content.innerHTML = `
      <h3>Thêm danh mục mới</h3>
      <form id="categoryForm" onsubmit="saveCategory(event)">
        <div style="margin-top:10px">
          <input class="input" name="name" placeholder="Tên danh mục" required />
        </div>
        <div style="margin-top:10px">
          <textarea class="input" name="description" placeholder="Mô tả"></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" onclick="closeModal()" class="pill">Hủy</button>
          <button type="submit" class="btn">Lưu</button>
        </div>
      </form>
    `;
  } else if (type === 'editCategory') {
    editingCategoryId = id;
    fetch(`${API_BASE_URL}/categories/${id}`)
      .then(r => r.json())
      .then(category => {
        content.innerHTML = `
          <h3>Chỉnh sửa danh mục</h3>
          <form id="categoryForm" onsubmit="saveCategory(event)">
            <div style="margin-top:10px">
              <input class="input" name="name" value="${category.name || ''}" placeholder="Tên danh mục" required />
            </div>
            <div style="margin-top:10px">
              <textarea class="input" name="description" placeholder="Mô tả">${category.description || ''}</textarea>
            </div>
            <div class="modal-actions">
              <button type="button" onclick="closeModal()" class="pill">Hủy</button>
              <button type="submit" class="btn">Cập nhật</button>
            </div>
          </form>
        `;
      });
  }
  
  backdrop.style.display = 'flex';
}

async function saveCategory(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const category = {
    name: formData.get('name'),
    description: formData.get('description')
  };

  try {
    if (editingCategoryId) {
      await api.updateCategory(editingCategoryId, category);
    } else {
      await api.createCategory(category);
    }
    closeModal();
    loadCategoriesTable();
    loadCategories();
    loadMenu();
  } catch (error) {
    alert('Lỗi khi lưu danh mục: ' + error.message);
  }
}

async function deleteCategory(id) {
  if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
    try {
      await api.deleteCategory(id);
      loadCategoriesTable();
      loadCategories();
      loadMenu();
    } catch (error) {
      alert('Lỗi khi xóa danh mục: ' + error.message);
    }
  }
}

// Universal Modal Functions
window.openModal = function(type, id) {
  switch(type) {
    case 'newTable':
    case 'editTable':
      openTableModal(type, id);
      break;
    case 'newMenu':
    case 'editMenu':
      openMenuModal(type, id);
      break;
    case 'newOrder':
    case 'viewOrder':
    case 'editOrder':
      openOrderModal(type, id);
      break;
    case 'newCustomer':
    case 'editCustomer':
      openCustomerModal(type, id);
      break;
    case 'newInventory':
    case 'editInventory':
      openInventoryModal(type, id);
      break;
    case 'newEmployee':
    case 'editEmployee':
      openEmployeeModal(type, id);
      break;
    case 'newPayment':
      openPaymentModal(type);
      break;
    case 'newCategory':
    case 'editCategory':
      openCategoryModal(type, id);
      break;
    default:
      console.error('Loại modal không xác định:', type);
  }
}

window.closeModal = function(e) {
  const backdrop = document.getElementById('modalBackdrop');
  if (e && e.target === backdrop) return;
  backdrop.style.display = 'none';
}

