# Ví dụ sử dụng API

## 1. Quản lý Bàn (Tables)

### Tạo bàn mới
```bash
POST http://localhost:8080/api/tables
Content-Type: application/json

{
  "name": "Bàn 1",
  "area": "Tầng 1",
  "status": "available"
}
```

### Lấy danh sách bàn
```bash
GET http://localhost:8080/api/tables
```

### Lấy bàn theo trạng thái
```bash
GET http://localhost:8080/api/tables/status/available
```

## 2. Quản lý Danh mục (Categories)

### Tạo danh mục mới
```bash
POST http://localhost:8080/api/categories
Content-Type: application/json

{
  "name": "Đồ ăn",
  "description": "Các món ăn chính"
}
```

## 3. Quản lý Menu (Menu Items)

### Tạo món ăn mới
```bash
POST http://localhost:8080/api/menu-items
Content-Type: application/json

{
  "category": {
    "id": "category_id_here"
  },
  "name": "Phở Bò",
  "price": 50000,
  "unit": "Tô",
  "isActive": true
}
```

### Lấy món theo danh mục
```bash
GET http://localhost:8080/api/menu-items/category/{categoryId}
```

## 4. Quản lý Khách hàng (Customers)

### Tạo khách hàng mới
```bash
POST http://localhost:8080/api/customers
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "phone": "0123456789",
  "type": "normal",
  "points": 0
}
```

### Tìm khách hàng theo số điện thoại
```bash
GET http://localhost:8080/api/customers/phone/0123456789
```

## 5. Quản lý Hóa đơn (Orders)

### Tạo hóa đơn mới
```bash
POST http://localhost:8080/api/orders
Content-Type: application/json

{
  "customer": {
    "id": "customer_id_here"
  },
  "table": {
    "id": "table_id_here"
  },
  "waiter": {
    "id": "employee_id_here"
  },
  "orderType": "dine_in",
  "status": "pending",
  "orderItems": [
    {
      "menuItem": {
        "id": "menu_item_id_here"
      },
      "quantity": 2,
      "price": 50000,
      "note": "Không hành"
    }
  ]
}
```

### Lấy hóa đơn theo khách hàng
```bash
GET http://localhost:8080/api/orders/customer/{customerId}
```

## 6. Quản lý Thanh toán (Payments)

### Tạo thanh toán
```bash
POST http://localhost:8080/api/payments
Content-Type: application/json

{
  "order": {
    "id": "order_id_here"
  },
  "amount": 100000,
  "method": "cash"
}
```

### Tính doanh thu
```bash
GET http://localhost:8080/api/payments/revenue?start=2024-01-01T00:00:00&end=2024-01-31T23:59:59
```

## 7. Quản lý Nhân viên (Employees)

### Tạo nhân viên mới
```bash
POST http://localhost:8080/api/employees
Content-Type: application/json

{
  "name": "Trần Thị B",
  "phone": "0987654321",
  "role": "waiter",
  "salary": 5000000,
  "status": true
}
```

### Lấy nhân viên theo vai trò
```bash
GET http://localhost:8080/api/employees/role/waiter
```

## 8. Quản lý Nhập kho (Inventory)

### Tạo nhập kho
```bash
POST http://localhost:8080/api/inventory
Content-Type: application/json

{
  "itemName": "Thịt bò",
  "unit": "kg",
  "quantity": 50,
  "unitPrice": 200000,
  "supplier": "Công ty ABC",
  "note": "Nhập kho tháng 1"
}
```

### Tìm kiếm kho
```bash
GET http://localhost:8080/api/inventory/search?itemName=thịt
```

### Lấy sản phẩm hết hạn
```bash
GET http://localhost:8080/api/inventory/expired?date=2024-12-31T23:59:59
```

## Lưu ý

- Tất cả các ID trong MongoDB là String (ObjectId được convert thành String)
- Khi tạo Order, hệ thống sẽ tự động tính `totalAmount` dựa trên các `orderItems`
- Khi tạo Payment, `createdAt` sẽ tự động được set là thời gian hiện tại
- Các enum values: `available`, `occupied`, `reserved` (TableStatus); `normal`, `member`, `vip` (CustomerType); `dine_in`, `takeaway`, `delivery` (OrderType); `pending`, `serving`, `completed`, `cancelled` (OrderStatus); `cash`, `card`, `banking`, `e_wallet` (PaymentMethod); `waiter`, `cashier`, `chef`, `manager` (EmployeeRole)














