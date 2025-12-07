package com.restaurant.model;

import com.restaurant.model.enums.EmployeeRole;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "employees")
public class Employee {
    @Id
    private String id;
    
    private String name;
    private String phone;
    private EmployeeRole role; // waiter, cashier, chef, manager
    private BigDecimal salary;
    private Boolean status = true;
    private String account; // Tài khoản đăng nhập
    private String password; // Mật khẩu
    
    @DBRef(lazy = true)
    private List<Order> orders = new ArrayList<>();
    
    public Employee() {
    }
    
    public Employee(String id, String name, String phone, EmployeeRole role, BigDecimal salary, 
                    Boolean status, String account, String password, List<Order> orders) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.role = role;
        this.salary = salary;
        this.status = status;
        this.account = account;
        this.password = password;
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
    
    public EmployeeRole getRole() {
        return role;
    }
    
    public void setRole(EmployeeRole role) {
        this.role = role;
    }
    
    public BigDecimal getSalary() {
        return salary;
    }
    
    public void setSalary(BigDecimal salary) {
        this.salary = salary;
    }
    
    public Boolean getStatus() {
        return status;
    }
    
    public void setStatus(Boolean status) {
        this.status = status;
    }
    
    public List<Order> getOrders() {
        return orders;
    }
    
    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }
    
    public String getAccount() {
        return account;
    }
    
    public void setAccount(String account) {
        this.account = account;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}
