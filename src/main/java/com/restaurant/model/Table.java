package com.restaurant.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "tables")
public class Table {
    @Id
    private String id;
    
    private String name; // Tên bàn (Bàn 1, Bàn VIP…)
    private String area; // Khu vực (Tầng 1, Sảnh A…)
    private String status; // Trống, Đặt trước, Đang sử dụng, Sửa chữa
    
    @DBRef(lazy = true)
    private List<Order> orders = new ArrayList<>();
    
    public Table() {
    }
    
    public Table(String id, String name, String area, String status, List<Order> orders) {
        this.id = id;
        this.name = name;
        this.area = area;
        this.status = status;
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
    
    public String getArea() {
        return area;
    }
    
    public void setArea(String area) {
        this.area = area;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public List<Order> getOrders() {
        return orders;
    }
    
    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }
}
