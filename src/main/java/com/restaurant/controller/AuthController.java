package com.restaurant.controller;

import com.restaurant.model.Employee;
import com.restaurant.repository.EmployeeRepository;
import com.restaurant.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String account = credentials.get("account");
            String password = credentials.get("password");
            
            if (account == null || password == null) {
                response.put("success", false);
                response.put("message", "Tài khoản và mật khẩu không được để trống");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            System.out.println("AuthController: Login attempt - Account: '" + account + "', Password length: " + (password != null ? password.length() : 0));
            
            Employee employee = authService.authenticate(account, password);
            
            if (employee != null) {
                System.out.println("AuthController: Login successful for: " + employee.getName());
                response.put("success", true);
                response.put("message", "Đăng nhập thành công");
                
                // Tạo object employee để trả về (không bao gồm password)
                Map<String, Object> employeeData = new HashMap<>();
                employeeData.put("id", employee.getId());
                employeeData.put("name", employee.getName());
                employeeData.put("phone", employee.getPhone());
                
                // Convert EmployeeRole enum to String để tránh lỗi serialize
                if (employee.getRole() != null) {
                    employeeData.put("role", employee.getRole().name());
                } else {
                    employeeData.put("role", null);
                }
                
                employeeData.put("account", employee.getAccount());
                employeeData.put("status", employee.getStatus());
                
                response.put("employee", employeeData);
                return ResponseEntity.ok(response);
            } else {
                System.out.println("AuthController: Login failed - Account: '" + account + "'");
                response.put("success", false);
                response.put("message", "Tài khoản hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            // Log lỗi để debug
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đăng xuất thành công");
        return ResponseEntity.ok(response);
    }
    
    // Debug endpoint - chỉ dùng trong development
    @GetMapping("/debug/employees")
    public ResponseEntity<Map<String, Object>> debugEmployees() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Employee> allEmployees = employeeRepository.findAll();
            List<Map<String, Object>> employeesData = new ArrayList<>();
            
            for (Employee emp : allEmployees) {
                Map<String, Object> empData = new HashMap<>();
                empData.put("id", emp.getId());
                empData.put("name", emp.getName());
                empData.put("account", emp.getAccount());
                empData.put("hasPassword", emp.getPassword() != null);
                empData.put("passwordLength", emp.getPassword() != null ? emp.getPassword().length() : 0);
                empData.put("status", emp.getStatus());
                employeesData.add(empData);
            }
            
            response.put("total", allEmployees.size());
            response.put("employees", employeesData);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}

