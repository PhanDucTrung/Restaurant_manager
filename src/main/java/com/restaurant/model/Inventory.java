package com.restaurant.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "inventory")
public class Inventory {
    @Id
    private String id;
    
    private String itemName; // Tên nguyên liệu/sản phẩm
    private String unit; // Đơn vị (kg, lít, thùng...)
    private Integer quantity; // Số lượng
    private BigDecimal unitPrice; // Giá đơn vị
    private LocalDateTime importDate; // Ngày nhập kho
    private LocalDateTime expiryDate; // Ngày hết hạn (nếu có)
    private String supplier; // Nhà cung cấp
    private String note; // Ghi chú
    
    public Inventory() {
    }
    
    public Inventory(String id, String itemName, String unit, Integer quantity, BigDecimal unitPrice,
                     LocalDateTime importDate, LocalDateTime expiryDate, String supplier, String note) {
        this.id = id;
        this.itemName = itemName;
        this.unit = unit;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.importDate = importDate;
        this.expiryDate = expiryDate;
        this.supplier = supplier;
        this.note = note;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getItemName() {
        return itemName;
    }
    
    public void setItemName(String itemName) {
        this.itemName = itemName;
    }
    
    public String getUnit() {
        return unit;
    }
    
    public void setUnit(String unit) {
        this.unit = unit;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
    
    public LocalDateTime getImportDate() {
        return importDate;
    }
    
    public void setImportDate(LocalDateTime importDate) {
        this.importDate = importDate;
    }
    
    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }
    
    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }
    
    public String getSupplier() {
        return supplier;
    }
    
    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }
    
    public String getNote() {
        return note;
    }
    
    public void setNote(String note) {
        this.note = note;
    }
}
