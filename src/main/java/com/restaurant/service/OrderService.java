package com.restaurant.service;

import com.restaurant.model.Order;
import com.restaurant.model.OrderItem;
import com.restaurant.model.MenuItem;
import com.restaurant.model.enums.OrderStatus;
import com.restaurant.model.enums.OrderType;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.OrderItemRepository;
import com.restaurant.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.bson.types.ObjectId;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private MenuItemRepository menuItemRepository;
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public Optional<Order> getOrderById(String id) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            // Load OrderItems từ collection riêng
            List<OrderItem> orderItems = orderItemRepository.findByOrderId(id);
            
            // Populate MenuItem cho mỗi OrderItem
            for (OrderItem orderItem : orderItems) {
                if (orderItem.getMenuItem() != null) {
                    MenuItem menuItem = orderItem.getMenuItem();
                    String menuItemId = menuItem.getId();
                    
                    // Luôn load lại MenuItem từ database để đảm bảo có đầy đủ thông tin
                    if (menuItemId != null) {
                        menuItemRepository.findById(menuItemId).ifPresent(orderItem::setMenuItem);
                    }
                }
            }
            
            order.setOrderItems(orderItems);
            return Optional.of(order);
        }
        return orderOpt;
    }
    
    @Transactional
    public Order createOrder(Order order) {
        if (order.getCreatedAt() == null) {
            order.setCreatedAt(LocalDateTime.now());
        }
        if (order.getStatus() == null) {
            order.setStatus(OrderStatus.pending);
        }
        if (order.getTotalAmount() == null) {
            order.setTotalAmount(BigDecimal.ZERO);
        }
        
        Order savedOrder = orderRepository.save(order);
        
        // Save order items and calculate total
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            BigDecimal total = BigDecimal.ZERO;
            for (OrderItem item : order.getOrderItems()) {
                item.setOrder(savedOrder);
                orderItemRepository.save(item);
                total = total.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
            savedOrder.setTotalAmount(total);
            savedOrder = orderRepository.save(savedOrder);
        }
        
        return savedOrder;
    }
    
    @Transactional
    public Order updateOrder(String id, Order order) {
        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        
        existingOrder.setCustomer(order.getCustomer());
        existingOrder.setTableName(order.getTableName());
        existingOrder.setWaiter(order.getWaiter());
        existingOrder.setOrderType(order.getOrderType());
        existingOrder.setStatus(order.getStatus());
        
        // Update totalAmount nếu có trong request (ưu tiên từ request)
        if (order.getTotalAmount() != null) {
            System.out.println("Updating totalAmount from request: " + order.getTotalAmount());
            existingOrder.setTotalAmount(order.getTotalAmount());
        } else {
            System.out.println("totalAmount is null in request, will calculate from orderItems if available");
        }
        
        // Update order items (chỉ nếu có orderItems trong request)
        // Lưu ý: Nếu có orderItems trong request, sẽ tính lại totalAmount từ orderItems
        // Nhưng nếu đã có totalAmount trong request, sẽ ưu tiên dùng totalAmount từ request
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            // Delete old items
            orderItemRepository.findByOrderId(id).forEach(orderItemRepository::delete);
            
            // Save new items
            BigDecimal total = BigDecimal.ZERO;
            for (OrderItem item : order.getOrderItems()) {
                item.setOrder(existingOrder);
                orderItemRepository.save(item);
                total = total.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
            // Chỉ cập nhật totalAmount từ orderItems nếu không có totalAmount trong request
            if (order.getTotalAmount() == null) {
                System.out.println("Calculating totalAmount from orderItems: " + total);
                existingOrder.setTotalAmount(total);
            } else {
                System.out.println("Keeping totalAmount from request: " + existingOrder.getTotalAmount());
            }
        }
        
        System.out.println("Final totalAmount before save: " + existingOrder.getTotalAmount());
        Order savedOrder = orderRepository.save(existingOrder);
        System.out.println("Final totalAmount after save: " + savedOrder.getTotalAmount());
        return savedOrder;
    }
    
    public void deleteOrder(String id) {
        // Delete order items first
        orderItemRepository.findByOrderId(id).forEach(orderItemRepository::delete);
        orderRepository.deleteById(id);
    }
    
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
    
    public List<Order> getOrdersByCustomer(String customerId) {
        return orderRepository.findByCustomerId(customerId);
    }
    
    public List<Order> getOrdersByTableName(String tableName) {
        return orderRepository.findByTableName(tableName);
    }
    
    // Thêm hoặc tăng số lượng OrderItem
    @Transactional
    public OrderItem addOrIncreaseOrderItem(String orderId, String menuItemId, BigDecimal price) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("MenuItem not found with id: " + menuItemId));
        
        // Kiểm tra xem đã có OrderItem với order và menuItem này chưa
        System.out.println("DEBUG: Checking for existing OrderItem - orderId: " + orderId + ", menuItemId: " + menuItemId);
        
        // Thử query với repository trước
        Optional<OrderItem> existingItem = orderItemRepository.findByOrderIdAndMenuItemId(orderId, menuItemId);
        System.out.println("DEBUG: Repository query result: " + existingItem);
        
        // Nếu query không tìm thấy, thử dùng MongoTemplate với ObjectId
        if (!existingItem.isPresent()) {
            System.out.println("DEBUG: Repository query returned empty, trying MongoTemplate with ObjectId...");
            try {
                ObjectId orderObjectId = new ObjectId(orderId);
                ObjectId menuItemObjectId = new ObjectId(menuItemId);
                
                Query query = new Query();
                query.addCriteria(Criteria.where("order.$id").is(orderObjectId));
                query.addCriteria(Criteria.where("menuItem.$id").is(menuItemObjectId));
                
                OrderItem foundItem = mongoTemplate.findOne(query, OrderItem.class);
                if (foundItem != null) {
                    existingItem = Optional.of(foundItem);
                    System.out.println("DEBUG: Found OrderItem via MongoTemplate: " + foundItem.getId());
                } else {
                    System.out.println("DEBUG: MongoTemplate also returned null");
                }
            } catch (Exception e) {
                System.out.println("DEBUG: Error using MongoTemplate: " + e.getMessage());
            }
        }
        
        // Nếu vẫn không tìm thấy, thử tìm thủ công (fallback)
        if (!existingItem.isPresent()) {
            System.out.println("DEBUG: All queries failed, trying fallback...");
            List<OrderItem> allOrderItems = orderItemRepository.findByOrderId(orderId);
            System.out.println("DEBUG: Found " + allOrderItems.size() + " OrderItems for this order");
            
            for (OrderItem item : allOrderItems) {
                if (item.getMenuItem() != null) {
                    // Populate MenuItem nếu chưa có
                    String itemMenuItemId = item.getMenuItem().getId();
                    if (itemMenuItemId == null) {
                        // Thử load MenuItem từ DB
                        menuItemRepository.findById(menuItemId).ifPresent(item::setMenuItem);
                        itemMenuItemId = item.getMenuItem() != null ? item.getMenuItem().getId() : null;
                    }
                    
                    System.out.println("DEBUG: OrderItem " + item.getId() + " has menuItemId: " + itemMenuItemId);
                    if (menuItemId.equals(itemMenuItemId)) {
                        existingItem = Optional.of(item);
                        System.out.println("DEBUG: Found matching OrderItem via fallback!");
                        break;
                    }
                }
            }
        }
        
        OrderItem orderItem;
        if (existingItem.isPresent()) {
            // Đã có → tăng số lượng
            System.out.println("DEBUG: Found existing OrderItem, increasing quantity");
            orderItem = existingItem.get();
            int currentQuantity = orderItem.getQuantity() != null ? orderItem.getQuantity() : 1;
            orderItem.setQuantity(currentQuantity + 1);
            System.out.println("DEBUG: Updated quantity from " + currentQuantity + " to " + orderItem.getQuantity());
        } else {
            // Chưa có → tạo mới
            System.out.println("DEBUG: No existing OrderItem found, creating new one");
            orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(1);
            orderItem.setPrice(price != null ? price : menuItem.getPrice());
        }
        
        orderItem = orderItemRepository.save(orderItem);
        System.out.println("DEBUG: Saved OrderItem with id: " + orderItem.getId());
        
        // Cập nhật totalAmount của Order
        updateOrderTotalAmount(orderId);
        
        return orderItem;
    }
    
    // Giảm số lượng OrderItem hoặc xóa nếu quantity = 0
    @Transactional
    public void decreaseOrRemoveOrderItem(String orderId, String menuItemId) {
        System.out.println("DEBUG: Decreasing/Removing OrderItem - orderId: " + orderId + ", menuItemId: " + menuItemId);
        
        // Thử query với repository trước
        Optional<OrderItem> existingItem = orderItemRepository.findByOrderIdAndMenuItemId(orderId, menuItemId);
        System.out.println("DEBUG: Repository query result: " + existingItem);
        
        // Nếu query không tìm thấy, thử dùng MongoTemplate với ObjectId
        if (!existingItem.isPresent()) {
            System.out.println("DEBUG: Repository query returned empty, trying MongoTemplate with ObjectId...");
            try {
                ObjectId orderObjectId = new ObjectId(orderId);
                ObjectId menuItemObjectId = new ObjectId(menuItemId);
                
                Query query = new Query();
                query.addCriteria(Criteria.where("order.$id").is(orderObjectId));
                query.addCriteria(Criteria.where("menuItem.$id").is(menuItemObjectId));
                
                OrderItem foundItem = mongoTemplate.findOne(query, OrderItem.class);
                if (foundItem != null) {
                    existingItem = Optional.of(foundItem);
                    System.out.println("DEBUG: Found OrderItem via MongoTemplate: " + foundItem.getId());
                } else {
                    System.out.println("DEBUG: MongoTemplate also returned null");
                }
            } catch (Exception e) {
                System.out.println("DEBUG: Error using MongoTemplate: " + e.getMessage());
            }
        }
        
        // Nếu vẫn không tìm thấy, thử tìm thủ công (fallback)
        if (!existingItem.isPresent()) {
            System.out.println("DEBUG: All queries failed, trying fallback...");
            List<OrderItem> allOrderItems = orderItemRepository.findByOrderId(orderId);
            System.out.println("DEBUG: Found " + allOrderItems.size() + " OrderItems for this order");
            
            for (OrderItem item : allOrderItems) {
                if (item.getMenuItem() != null) {
                    String itemMenuItemId = item.getMenuItem().getId();
                    if (itemMenuItemId == null) {
                        menuItemRepository.findById(menuItemId).ifPresent(item::setMenuItem);
                        itemMenuItemId = item.getMenuItem() != null ? item.getMenuItem().getId() : null;
                    }
                    
                    System.out.println("DEBUG: OrderItem " + item.getId() + " has menuItemId: " + itemMenuItemId);
                    if (menuItemId.equals(itemMenuItemId)) {
                        existingItem = Optional.of(item);
                        System.out.println("DEBUG: Found matching OrderItem via fallback!");
                        break;
                    }
                }
            }
        }
        
        if (existingItem.isPresent()) {
            OrderItem orderItem = existingItem.get();
            int currentQuantity = orderItem.getQuantity() != null ? orderItem.getQuantity() : 1;
            
            System.out.println("DEBUG: Current quantity: " + currentQuantity);
            
            if (currentQuantity > 1) {
                // Giảm số lượng
                orderItem.setQuantity(currentQuantity - 1);
                orderItemRepository.save(orderItem);
                System.out.println("DEBUG: Decreased quantity to: " + orderItem.getQuantity());
            } else {
                // Xóa OrderItem
                orderItemRepository.delete(orderItem);
                System.out.println("DEBUG: Deleted OrderItem: " + orderItem.getId());
            }
            
            // Cập nhật totalAmount của Order
            updateOrderTotalAmount(orderId);
            System.out.println("DEBUG: Updated totalAmount for order: " + orderId);
        } else {
            System.out.println("DEBUG: OrderItem not found, cannot decrease/remove");
        }
    }
    
    // Cập nhật totalAmount của Order dựa trên các OrderItems
    @Transactional
    private void updateOrderTotalAmount(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        BigDecimal total = BigDecimal.ZERO;
        
        for (OrderItem item : orderItems) {
            BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(itemTotal);
        }
        
        order.setTotalAmount(total);
        orderRepository.save(order);
    }
    
    // Lấy danh sách OrderItems của một Order từ collection order_items
    public List<OrderItem> getOrderItemsByOrderId(String orderId) {
        // Tìm trong order_items với id của order
        // Query MongoDB: { 'order.$id': ObjectId("692bf52fb4e4ad002951c762") }
        System.out.println("DEBUG: Finding OrderItems for orderId: " + orderId);
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        System.out.println("DEBUG: Query returned " + orderItems.size() + " OrderItems");
        
        // Nếu không tìm thấy, thử tìm tất cả và filter (fallback để debug)
        if (orderItems.isEmpty()) {
            System.out.println("DEBUG: Query returned empty, trying fallback...");
            List<OrderItem> allItems = orderItemRepository.findAll();
            System.out.println("DEBUG: Total OrderItems in DB: " + allItems.size());
            for (OrderItem item : allItems) {
                if (item.getOrder() != null) {
                    System.out.println("DEBUG: OrderItem " + item.getId() + " has order: " + item.getOrder().getId());
                }
            }
            orderItems = allItems.stream()
                .filter(item -> {
                    if (item.getOrder() != null) {
                        String itemOrderId = item.getOrder().getId();
                        return orderId.equals(itemOrderId);
                    }
                    return false;
                })
                .collect(java.util.stream.Collectors.toList());
            System.out.println("DEBUG: Fallback found " + orderItems.size() + " items");
        }
        
        // Populate MenuItem cho mỗi OrderItem
        for (OrderItem orderItem : orderItems) {
            if (orderItem.getMenuItem() != null) {
                MenuItem menuItem = orderItem.getMenuItem();
                String menuItemId = menuItem.getId();
                
                // Luôn load lại MenuItem từ database để đảm bảo có đầy đủ thông tin
                if (menuItemId != null) {
                    menuItemRepository.findById(menuItemId).ifPresent(orderItem::setMenuItem);
                }
            }
        }
        
        return orderItems;
    }
    
    // Test: Lấy OrderItem theo orderId và menuItemId
    public Optional<OrderItem> getOrderItemByOrderIdAndMenuItemId(String orderId, String menuItemId) {
        System.out.println("TEST: Finding OrderItem - orderId: " + orderId + ", menuItemId: " + menuItemId);
        
        // Thử query trực tiếp
        Optional<OrderItem> result = orderItemRepository.findByOrderIdAndMenuItemId(orderId, menuItemId);
        
        if (result.isPresent()) {
            System.out.println("TEST: Found OrderItem via query: " + result.get().getId());
        } else {
            System.out.println("TEST: Query returned empty, trying fallback...");
            
            // Fallback: Tìm tất cả OrderItems của order
            List<OrderItem> allOrderItems = orderItemRepository.findByOrderId(orderId);
            System.out.println("TEST: Found " + allOrderItems.size() + " OrderItems for this order");
            
            for (OrderItem item : allOrderItems) {
                if (item.getMenuItem() != null) {
                    String itemMenuItemId = item.getMenuItem().getId();
                    System.out.println("TEST: OrderItem " + item.getId() + " has menuItemId: " + itemMenuItemId);
                    if (menuItemId.equals(itemMenuItemId)) {
                        System.out.println("TEST: Found matching OrderItem via fallback: " + item.getId());
                        return Optional.of(item);
                    }
                }
            }
            System.out.println("TEST: No matching OrderItem found");
        }
        
        return result;
    }
}









