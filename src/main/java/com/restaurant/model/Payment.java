package com.restaurant.model;

import com.restaurant.model.enums.PaymentMethod;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "payments")
public class Payment {
    @Id
    private String id;
    
    @DBRef
    private Order order;
    
    private BigDecimal amount;
    private PaymentMethod method; // cash, card, banking, e_wallet
    private LocalDateTime createdAt;
    
    public Payment() {
    }
    
    public Payment(String id, Order order, BigDecimal amount, PaymentMethod method, LocalDateTime createdAt) {
        this.id = id;
        this.order = order;
        this.amount = amount;
        this.method = method;
        this.createdAt = createdAt;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public Order getOrder() {
        return order;
    }
    
    public void setOrder(Order order) {
        this.order = order;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public PaymentMethod getMethod() {
        return method;
    }
    
    public void setMethod(PaymentMethod method) {
        this.method = method;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}


