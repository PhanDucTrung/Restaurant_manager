package com.restaurant.model;

import com.restaurant.model.enums.CustomerType;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "customers")
public class Customer {
    @Id
    private String id;
    
    private String name;
    private String phone;
    private CustomerType type; // normal, member, vip
    private Integer points = 0;
    
    @DBRef(lazy = true)
    private List<Order> orders = new ArrayList<>();
    
    public Customer() {
    }
    
    public Customer(String id, String name, String phone, CustomerType type, Integer points, List<Order> orders) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.type = type;
        this.points = points;
        this.orders = orders != null ? orders : new ArrayList<>();
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public CustomerType getType() {
        return type;
    }
    
    public void setType(CustomerType type) {
        this.type = type;
    }
    
    public Integer getPoints() {
        return points;
    }
    
    public void setPoints(Integer points) {
        this.points = points;
    }
    
    public List<Order> getOrders() {
        return orders;
    }
    
    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }
}
