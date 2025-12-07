package com.restaurant.model;

import com.restaurant.model.enums.OrderStatus;
import com.restaurant.model.enums.OrderType;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    
    @DBRef
    private Customer customer;
    
    private String tableName; // Tên bàn (lưu dạng text)
    
    @DBRef
    private Employee waiter; // Optional
    
    private OrderType orderType; // dine_in, takeaway, delivery
    private OrderStatus status; // pending, serving, completed, cancelled
    private LocalDateTime createdAt;
    private BigDecimal totalAmount = BigDecimal.ZERO;
    
    @DBRef
    private List<OrderItem> orderItems = new ArrayList<>();
    
    @DBRef(lazy = true)
    private List<Payment> payments = new ArrayList<>();
    
    public Order() {
    }
    
    public Order(String id, Customer customer, String tableName, Employee waiter, OrderType orderType, 
                 OrderStatus status, LocalDateTime createdAt, BigDecimal totalAmount, 
                 List<OrderItem> orderItems, List<Payment> payments) {
        this.id = id;
        this.customer = customer;
        this.tableName = tableName;
        this.waiter = waiter;
        this.orderType = orderType;
        this.status = status;
        this.createdAt = createdAt;
        this.totalAmount = totalAmount;
        this.orderItems = orderItems != null ? orderItems : new ArrayList<>();
        this.payments = payments != null ? payments : new ArrayList<>();
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public Customer getCustomer() {
        return customer;
    }
    
    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
    
    public String getTableName() {
        return tableName;
    }
    
    public void setTableName(String tableName) {
        this.tableName = tableName;
    }
    
    public Employee getWaiter() {
        return waiter;
    }
    
    public void setWaiter(Employee waiter) {
        this.waiter = waiter;
    }
    
    public OrderType getOrderType() {
        return orderType;
    }
    
    public void setOrderType(OrderType orderType) {
        this.orderType = orderType;
    }
    
    public OrderStatus getStatus() {
        return status;
    }
    
    public void setStatus(OrderStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public List<OrderItem> getOrderItems() {
        return orderItems;
    }
    
    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }
    
    public List<Payment> getPayments() {
        return payments;
    }
    
    public void setPayments(List<Payment> payments) {
        this.payments = payments;
    }
}
