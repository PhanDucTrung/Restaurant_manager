# Hệ Thống Quản Lý Nhà Hàng

Hệ thống quản lý nhà hàng sử dụng Spring Boot và MongoDB.

## Công nghệ sử dụng

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data MongoDB**
- **MongoDB**
- **Maven**

## Cấu trúc dự án

```
src/main/java/com/restaurant/
├── RestaurantApplication.java       # Main application class
├── model/                           # Entity classes
│   ├── Table.java
│   ├── Category.java
│   ├── MenuItem.java
│   ├── Customer.java
│   ├── Order.java
│   ├── OrderItem.java
│   ├── Payment.java
│   ├── Employee.java
│   ├── Inventory.java
│   └── enums/                       # Enum classes
├── repository/                      # Repository interfaces
├── service/                         # Service classes
└── controller/                      # REST Controllers
```

## Cài đặt và chạy

### Yêu cầu

- Java 17 hoặc cao hơn
- Maven 3.6+
- MongoDB 4.4+ (đang chạy trên localhost:27017)

### Cấu hình MongoDB

1. Cài đặt MongoDB và đảm bảo MongoDB đang chạy
2. Cấu hình trong `application.properties`:
   ```properties
   spring.data.mongodb.host=localhost
   spring.data.mongodb.port=27017
   spring.data.mongodb.database=restaurant_db
   ```

### Chạy ứng dụng

```bash
# Build project
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run
```

Ứng dụng sẽ chạy tại: `http://localhost:8080`

## API Endpoints

### Quản lý Bàn (Tables)
- `GET /api/tables` - Lấy danh sách tất cả bàn
- `GET /api/tables/{id}` - Lấy thông tin bàn theo ID
- `POST /api/tables` - Tạo bàn mới
- `PUT /api/tables/{id}` - Cập nhật bàn
- `DELETE /api/tables/{id}` - Xóa bàn
- `GET /api/tables/status/{status}` - Lấy bàn theo trạng thái
- `GET /api/tables/area/{area}` - Lấy bàn theo khu vực

### Quản lý Danh mục (Categories)
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/categories/{id}` - Lấy thông tin danh mục theo ID
- `POST /api/categories` - Tạo danh mục mới
- `PUT /api/categories/{id}` - Cập nhật danh mục
- `DELETE /api/categories/{id}` - Xóa danh mục

### Quản lý Menu (Menu Items)
- `GET /api/menu-items` - Lấy danh sách món ăn/đồ uống
- `GET /api/menu-items/active` - Lấy danh sách món đang hoạt động
- `GET /api/menu-items/{id}` - Lấy thông tin món theo ID
- `POST /api/menu-items` - Tạo món mới
- `PUT /api/menu-items/{id}` - Cập nhật món
- `DELETE /api/menu-items/{id}` - Xóa món
- `GET /api/menu-items/category/{categoryId}` - Lấy món theo danh mục

### Quản lý Khách hàng (Customers)
- `GET /api/customers` - Lấy danh sách khách hàng
- `GET /api/customers/{id}` - Lấy thông tin khách hàng theo ID
- `POST /api/customers` - Tạo khách hàng mới
- `PUT /api/customers/{id}` - Cập nhật khách hàng
- `DELETE /api/customers/{id}` - Xóa khách hàng
- `GET /api/customers/phone/{phone}` - Tìm khách hàng theo số điện thoại
- `GET /api/customers/type/{type}` - Lấy khách hàng theo loại

### Quản lý Hóa đơn (Orders)
- `GET /api/orders` - Lấy danh sách hóa đơn
- `GET /api/orders/{id}` - Lấy thông tin hóa đơn theo ID
- `POST /api/orders` - Tạo hóa đơn mới
- `PUT /api/orders/{id}` - Cập nhật hóa đơn
- `DELETE /api/orders/{id}` - Xóa hóa đơn
- `GET /api/orders/status/{status}` - Lấy hóa đơn theo trạng thái
- `GET /api/orders/customer/{customerId}` - Lấy hóa đơn theo khách hàng
- `GET /api/orders/table/{tableId}` - Lấy hóa đơn theo bàn

### Quản lý Thanh toán (Payments)
- `GET /api/payments` - Lấy danh sách thanh toán
- `GET /api/payments/{id}` - Lấy thông tin thanh toán theo ID
- `POST /api/payments` - Tạo thanh toán mới
- `PUT /api/payments/{id}` - Cập nhật thanh toán
- `DELETE /api/payments/{id}` - Xóa thanh toán
- `GET /api/payments/order/{orderId}` - Lấy thanh toán theo hóa đơn
- `GET /api/payments/method/{method}` - Lấy thanh toán theo phương thức
- `GET /api/payments/revenue?start={start}&end={end}` - Tính doanh thu theo khoảng thời gian

### Quản lý Nhân viên (Employees)
- `GET /api/employees` - Lấy danh sách nhân viên
- `GET /api/employees/active` - Lấy danh sách nhân viên đang làm việc
- `GET /api/employees/{id}` - Lấy thông tin nhân viên theo ID
- `POST /api/employees` - Tạo nhân viên mới
- `PUT /api/employees/{id}` - Cập nhật nhân viên
- `DELETE /api/employees/{id}` - Xóa nhân viên
- `GET /api/employees/role/{role}` - Lấy nhân viên theo vai trò

### Quản lý Nhập kho (Inventory)
- `GET /api/inventory` - Lấy danh sách kho
- `GET /api/inventory/{id}` - Lấy thông tin kho theo ID
- `POST /api/inventory` - Tạo nhập kho mới
- `PUT /api/inventory/{id}` - Cập nhật kho
- `DELETE /api/inventory/{id}` - Xóa kho
- `GET /api/inventory/search?itemName={name}` - Tìm kiếm theo tên
- `GET /api/inventory/date-range?start={start}&end={end}` - Lấy theo khoảng thời gian
- `GET /api/inventory/expired?date={date}` - Lấy sản phẩm hết hạn

## Cấu trúc Database (MongoDB Collections)

### Collections:
- `tables` - Bàn ăn
- `categories` - Danh mục món
- `menu_items` - Món ăn/đồ uống
- `customers` - Khách hàng
- `orders` - Hóa đơn
- `order_items` - Chi tiết món đã gọi
- `payments` - Thanh toán
- `employees` - Nhân viên
- `inventory` - Nhập kho

## Data Model

### Ký hiệu:
- **PK** = Primary Key (Khóa chính)
- **FK** = Foreign Key (Khóa ngoại)

### 1. Bảng `tables` - Bàn ăn

| Field | Type | Note |
|-------|------|------|
| `id` | String | **PK** - Mã bàn (MongoDB ObjectId) |
| `name` | String | Tên bàn (Bàn 1, Bàn VIP…) |
| `area` | String | Khu vực (Tầng 1, Sảnh A…) |
| `status` | Enum | available, occupied, reserved |
| `orders` | Array[DBRef] | **FK** → orders - Danh sách đơn hàng |

### 2. Bảng `categories` - Danh mục món

| Field | Type | Note |
|-------|------|------|
| `id` | String | **PK** - Mã danh mục (MongoDB ObjectId) |
| `name` | String | Tên danh mục |
| `description` | String | Mô tả |

### 3. Bảng `menu_items` - Món ăn/đồ uống

| Field | Type | Note |
|-------|------|------|
| `id` | String | **PK** - Mã món (MongoDB ObjectId) |
| `category` | DBRef | **FK** → categories - Danh mục |
| `name` | String | Tên món |
| `price` | BigDecimal | Giá (DECIMAL(12,2)) |
| `unit` | String | Đơn vị (Phần, Ly…) |
| `isActive` | Boolean | Trạng thái hoạt động |

### 4. Bảng `customers` - Khách hàng

| Field | Type | Note |
|-------|------|------|
| `id` | String | **PK** - Mã khách hàng (MongoDB ObjectId) |
| `name` | String | Tên khách hàng |
| `phone` | String | Số điện thoại |
| `type` | Enum | normal, member, vip |
| `points` | Integer | Điểm tích lũy |

### 5. Bảng `orders` - Hóa đơn/Đơn hàng

| Field | Type | Note |
|-------|------|------|
| `id` | String | **PK** - Mã đơn hàng (MongoDB ObjectId) |
| `customer` | DBRef | **FK** → customers - Khách hàng |
| `table` | DBRef | **FK** → tables - Bàn (optional) |
| `waiter` | DBRef | **FK** → employees - Nhân viên phục vụ (optional) |
| `orderType` | Enum | dine_in, takeaway, delivery |
| `status` | Enum | pending, serving, completed, cancelled |
| `createdAt` | LocalDateTime | Thời gian tạo |
| `totalAmount` | BigDecimal | Tổng tiền (DECIMAL(12,2)) |
| `orderItems` | Array[Embedded] | Chi tiết món đã gọi |

### 6. Bảng `order_items` - Chi tiết món đã gọi (Embedded trong orders)

| Field | Type | Note |
|-------|------|------|
| `id` | String | **PK** - Mã chi tiết (MongoDB ObjectId) |
| `menuItem` | DBRef | **FK** → menu_items - Món ăn |
| `quantity` | Integer | Số lượng |
| `price` | BigDecimal | Giá tại thời điểm bán (DECIMAL(12,2)) |
| `note` | String | Ghi chú |

### 7. Bảng `payments` - Thanh toán

| Field | Type | Note |
|-------|------|------|
| `id` | String | **PK** - Mã thanh toán (MongoDB ObjectId) |
| `order` | DBRef | **FK** → orders - Hóa đơn |
| `amount` | BigDecimal | Số tiền thanh toán |
| `method` | Enum | cash, card, banking, e_wallet |
| `createdAt` | LocalDateTime | Thời gian thanh toán |

### 8. Bảng `employees` - Nhân viên

| Field | Type | Note |
|-------|------|------|
| `id` | String | **PK** - Mã nhân viên (MongoDB ObjectId) |
| `name` | String | Tên nhân viên |
| `phone` | String | Số điện thoại |
| `role` | Enum | waiter, cashier, chef, manager |
| `salary` | BigDecimal | Lương |
| `status` | Boolean | Trạng thái (Active/Inactive) |

### 9. Bảng `inventory` - Nhập kho

| Field | Type | Note |
|-------|------|------|
| `id` | String | **PK** - Mã nhập kho (MongoDB ObjectId) |
| `itemName` | String | Tên nguyên liệu/sản phẩm |
| `quantity` | Integer | Số lượng |
| `unit` | String | Đơn vị (kg, lít…) |
| `unitPrice` | BigDecimal | Giá đơn vị |
| `supplier` | String | Nhà cung cấp |
| `importDate` | LocalDateTime | Ngày nhập |
| `expiryDate` | LocalDateTime | Ngày hết hạn (optional) |
| `note` | String | Ghi chú |

### Mối quan hệ (Relationships)

```
customers (1) ────────< (n) orders
tables (1) ───────────< (n) orders
employees (1) ────────< (n) orders (waiter_id optional)
orders (1) ───────────< (n) order_items
menu_items (1) ───────< (n) order_items
orders (1) ───────────< (n) payments
categories (1) ───────< (n) menu_items
```

### Ghi chú về MongoDB:
- MongoDB sử dụng `String` (ObjectId) làm Primary Key thay vì `INT`
- Sử dụng `@DBRef` để tham chiếu giữa các collections
- `order_items` được lưu dưới dạng embedded document trong `orders`
- Tất cả các trường `id` đều là MongoDB ObjectId tự động tạo

## Ghi chú

- MongoDB sẽ tự động tạo database và collections khi ứng dụng chạy lần đầu
- Tất cả các API đều hỗ trợ CORS (`@CrossOrigin(origins = "*")`)
- Sử dụng `@DBRef` để tham chiếu giữa các documents trong MongoDB
.


#   R e s t a u r a n t  
 