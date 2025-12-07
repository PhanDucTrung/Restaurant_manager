// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// API Helper Functions
const api = {
    // Tables
    async getTables() {
        const response = await fetch(`${API_BASE_URL}/tables`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    },
    
    async getTableById(id) {
        const response = await fetch(`${API_BASE_URL}/tables/${id}`);
        if (!response.ok) return null;
        return response.json();
    },
    
    async createTable(table) {
        const response = await fetch(`${API_BASE_URL}/tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(table)
        });
        return response.json();
    },
    
    async updateTable(id, table) {
        const response = await fetch(`${API_BASE_URL}/tables/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(table)
        });
        return response.json();
    },
    
    async deleteTable(id) {
        const response = await fetch(`${API_BASE_URL}/tables/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    },
    
    async getTablesByStatus(status) {
        const response = await fetch(`${API_BASE_URL}/tables/status/${status}`);
        return response.json();
    },
    
    // Categories
    async getCategories() {
        const response = await fetch(`${API_BASE_URL}/categories`);
        return response.json();
    },
    
    async createCategory(category) {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category)
        });
        return response.json();
    },
    
    async updateCategory(id, category) {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category)
        });
        return response.json();
    },
    
    async deleteCategory(id) {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    },
    
    // Menu Items
    async getMenuItems() {
        const response = await fetch(`${API_BASE_URL}/menu-items`);
        return response.json();
    },
    
    async getActiveMenuItems() {
        const response = await fetch(`${API_BASE_URL}/menu-items/active`);
        return response.json();
    },
    
    async createMenuItem(item) {
        const response = await fetch(`${API_BASE_URL}/menu-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        return response.json();
    },
    
    async updateMenuItem(id, item) {
        const response = await fetch(`${API_BASE_URL}/menu-items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        return response.json();
    },
    
    async deleteMenuItem(id) {
        const response = await fetch(`${API_BASE_URL}/menu-items/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    },
    
    // Customers
    async getCustomers() {
        const response = await fetch(`${API_BASE_URL}/customers`);
        return response.json();
    },
    
    async createCustomer(customer) {
        const response = await fetch(`${API_BASE_URL}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customer)
        });
        return response.json();
    },
    
    async updateCustomer(id, customer) {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customer)
        });
        return response.json();
    },
    
    async getCustomerById(id) {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`);
        if (!response.ok) return null;
        return response.json();
    },
    
    async getCustomerByPhone(phone) {
        const response = await fetch(`${API_BASE_URL}/customers/phone/${encodeURIComponent(phone)}`);
        if (!response.ok) return null;
        return response.json();
    },
    
    async getCustomerByName(name) {
        const response = await fetch(`${API_BASE_URL}/customers/name/${encodeURIComponent(name)}`);
        if (!response.ok) return null;
        return response.json();
    },
    
    async deleteCustomer(id) {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    },
    
    async getOrderById(id) {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`);
        if (!response.ok) return null;
        return response.json();
    },
    
    // Orders
    async getOrders() {
        const response = await fetch(`${API_BASE_URL}/orders`);
        return response.json();
    },
    
    async getOrdersByTableName(tableName) {
        const response = await fetch(`${API_BASE_URL}/orders/table/${encodeURIComponent(tableName)}`);
        if (!response.ok) return [];
        return response.json();
    },
    
    async getOrderItemsByOrderId(orderId) {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/items`);
        if (!response.ok) return [];
        return response.json();
    },
    
    async addOrderItem(orderId, menuItemId, price) {
        const url = new URL(`${API_BASE_URL}/orders/${orderId}/items`);
        url.searchParams.append('menuItemId', menuItemId);
        if (price) url.searchParams.append('price', price);
        
        const response = await fetch(url, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to add order item');
        return response.json();
    },
    
    async decreaseOrderItem(orderId, menuItemId) {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/items/${menuItemId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to decrease order item');
        return response.ok;
    },
    
    async createOrder(order) {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        return response.json();
    },
    
    async updateOrder(id, order) {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        return response.json();
    },
    
    async deleteOrder(id) {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    },
    
    // Payments
    async getPayments() {
        const response = await fetch(`${API_BASE_URL}/payments`);
        return response.json();
    },
    
    async createPayment(payment) {
        const response = await fetch(`${API_BASE_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payment)
        });
        return response.json();
    },
    
    // Employees
    async getEmployees() {
        const response = await fetch(`${API_BASE_URL}/employees`);
        return response.json();
    },
    
    async createEmployee(employee) {
        const response = await fetch(`${API_BASE_URL}/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employee)
        });
        const data = await response.json();
        if (!response.ok) {
            // Nếu có lỗi validation từ server
            if (data.message) {
                throw new Error(data.message);
            }
            throw new Error('Lỗi khi tạo nhân viên');
        }
        return data;
    },
    
    async updateEmployee(id, employee) {
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employee)
        });
        const data = await response.json();
        if (!response.ok) {
            // Nếu có lỗi validation từ server
            if (data.message) {
                throw new Error(data.message);
            }
            throw new Error('Lỗi khi cập nhật nhân viên');
        }
        return data;
    },
    
    // Inventory
    async getInventory() {
        const response = await fetch(`${API_BASE_URL}/inventory`);
        return response.json();
    },
    
    async createInventory(item) {
        const response = await fetch(`${API_BASE_URL}/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        return response.json();
    },
    
    async updateInventory(id, item) {
        const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        return response.json();
    }
};

// Error handling
window.addEventListener('error', (e) => {
    console.error('API Error:', e);
});







