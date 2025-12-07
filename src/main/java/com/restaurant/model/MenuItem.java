package com.restaurant.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;

@Document(collection = "menu_items")
public class MenuItem {
    @Id
    private String id;
    
    @DBRef
    private Category category;
    
    private String name;
    private BigDecimal price; // DECIMAL(12,2)
    private String unit; // VARCHAR(50)
    private Boolean isActive = true;
    
    public MenuItem() {
    }
    
    public MenuItem(String id, Category category, String name, BigDecimal price, String unit, Boolean isActive) {
        this.id = id;
        this.category = category;
        this.name = name;
        this.price = price;
        this.unit = unit;
        this.isActive = isActive;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public Category getCategory() {
        return category;
    }
    
    public void setCategory(Category category) {
        this.category = category;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public String getUnit() {
        return unit;
    }
    
    public void setUnit(String unit) {
        this.unit = unit;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
