package com.restaurant.service;

import com.restaurant.model.Employee;
import com.restaurant.model.enums.EmployeeRole;
import com.restaurant.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    public Employee authenticate(String account, String password) {
        try {
            if (account == null || account.trim().isEmpty() || 
                password == null || password.isEmpty()) {
                System.out.println("AuthService: Account or password is empty");
                return null;
            }
            
            String trimmedAccount = account.trim();
            System.out.println("AuthService: Searching for account: " + trimmedAccount);
            
            // Kiểm tra nếu đăng nhập bằng account "admin" và password "admin"
            if ("admin".equals(trimmedAccount) && "admin".equals(password)) {
                // Tìm xem tài khoản "admin" đã tồn tại chưa
                List<Employee> adminEmployees = employeeRepository.findAll().stream()
                    .filter(emp -> emp.getAccount() != null && emp.getAccount().equals("admin"))
                    .collect(java.util.stream.Collectors.toList());
                
                if (adminEmployees.isEmpty()) {
                    // Tạo tài khoản admin mới
                    System.out.println("AuthService: Creating new admin account 'admin'");
                    Employee newAdmin = new Employee();
                    newAdmin.setName("Admin");
                    newAdmin.setAccount("admin");
                    newAdmin.setPassword("admin");
                    newAdmin.setRole(EmployeeRole.ADMIN);
                    newAdmin.setStatus(true);
                    newAdmin.setPhone("");
                    
                    Employee savedAdmin = employeeRepository.save(newAdmin);
                    System.out.println("AuthService: Admin account 'admin' created successfully with ID: " + savedAdmin.getId());
                    return savedAdmin;
                } else {
                    // Tài khoản đã tồn tại, tiếp tục xử lý bình thường
                    System.out.println("AuthService: Account 'admin' already exists");
                }
            }
            
            // Tìm kiếm tất cả nhân viên có account này (có thể có nhiều)
            List<Employee> employees = employeeRepository.findAll().stream()
                .filter(emp -> emp.getAccount() != null && emp.getAccount().equals(trimmedAccount))
                .collect(java.util.stream.Collectors.toList());
            
            Employee employee = null;
            
            if (employees.isEmpty()) {
                // Nếu không tìm thấy chính xác, thử tìm không phân biệt hoa thường
                employees = employeeRepository.findAll().stream()
                    .filter(emp -> emp.getAccount() != null && 
                            emp.getAccount().equalsIgnoreCase(trimmedAccount))
                    .collect(java.util.stream.Collectors.toList());
            }
            
            if (!employees.isEmpty()) {
                // Nếu có nhiều nhân viên, ưu tiên nhân viên có status = true
                employee = employees.stream()
                    .filter(emp -> emp.getStatus() != null && emp.getStatus())
                    .findFirst()
                    .orElse(employees.get(0)); // Nếu không có active, lấy nhân viên đầu tiên
                
                if (employees.size() > 1) {
                    System.out.println("AuthService: Warning - Found " + employees.size() + " employees with account '" + trimmedAccount + "', using: " + employee.getName());
                }
            }
            
            if (employee == null) {
                System.out.println("AuthService: Employee not found with account: " + trimmedAccount);
                // Debug: In ra tất cả accounts để kiểm tra
                List<Employee> allEmps = employeeRepository.findAll();
                System.out.println("AuthService: Total employees in DB: " + allEmps.size());
                allEmps.forEach(emp -> {
                    System.out.println("  - Employee: " + emp.getName() + ", Account: '" + emp.getAccount() + "', HasPassword: " + (emp.getPassword() != null));
                });
                return null;
            }
            
            System.out.println("AuthService: Employee found - ID: " + employee.getId() + ", Name: " + employee.getName() + ", Account: '" + employee.getAccount() + "'");
            
            // Kiểm tra trạng thái hoạt động
            if (employee.getStatus() == null || !employee.getStatus()) {
                System.out.println("AuthService: Employee is not active (status: " + employee.getStatus() + ")");
                return null;
            }
            
            // Kiểm tra mật khẩu (so sánh trực tiếp vì chưa có mã hóa)
            if (employee.getPassword() == null || employee.getPassword().isEmpty()) {
                System.out.println("AuthService: Employee password is null or empty");
                return null;
            }
            
            // Debug: In ra password để kiểm tra (chỉ trong development)
            System.out.println("AuthService: Comparing passwords:");
            System.out.println("  - DB password: '" + employee.getPassword() + "' (length: " + employee.getPassword().length() + ")");
            System.out.println("  - Input password: '" + password + "' (length: " + password.length() + ")");
            System.out.println("  - Are equal: " + employee.getPassword().equals(password));
            
            if (!employee.getPassword().equals(password)) {
                System.out.println("AuthService: Password mismatch - passwords are not equal");
                return null;
            }
            
            System.out.println("AuthService: Authentication successful for: " + employee.getName());
            return employee;
        } catch (Exception e) {
            System.err.println("AuthService: Error during authentication: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}

