package com.restaurant.controller;

import com.restaurant.model.Order;
import com.restaurant.model.OrderItem;
import com.restaurant.model.enums.OrderStatus;
import com.restaurant.service.OrderService;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(order));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable String id, @RequestBody Order order) {
        try {
            return ResponseEntity.ok(orderService.updateOrder(id, order));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status));
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getOrdersByCustomer(@PathVariable String customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
    }
    
    @GetMapping("/table/{tableName}")
    public ResponseEntity<List<Order>> getOrdersByTable(@PathVariable String tableName) {
        return ResponseEntity.ok(orderService.getOrdersByTableName(tableName));
    }
    
    // Thêm hoặc tăng số lượng OrderItem
    @PostMapping("/{orderId}/items")
    public ResponseEntity<OrderItem> addOrderItem(
            @PathVariable String orderId,
            @RequestParam String menuItemId,
            @RequestParam(required = false) BigDecimal price) {
        try {
            return ResponseEntity.ok(orderService.addOrIncreaseOrderItem(orderId, menuItemId, price));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Giảm số lượng hoặc xóa OrderItem
    @DeleteMapping("/{orderId}/items/{menuItemId}")
    public ResponseEntity<Void> decreaseOrderItem(
            @PathVariable String orderId,
            @PathVariable String menuItemId) {
        try {
            orderService.decreaseOrRemoveOrderItem(orderId, menuItemId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Lấy danh sách OrderItems của một Order
    @GetMapping("/{orderId}/items")
    public ResponseEntity<List<OrderItem>> getOrderItems(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getOrderItemsByOrderId(orderId));
    }
    
    // Test: Tìm OrderItem theo orderId và menuItemId
    @GetMapping("/{orderId}/items/{menuItemId}")
    public ResponseEntity<OrderItem> getOrderItemByOrderAndMenuItem(
            @PathVariable String orderId,
            @PathVariable String menuItemId) {
        try {
            return orderService.getOrderItemByOrderIdAndMenuItemId(orderId, menuItemId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}









