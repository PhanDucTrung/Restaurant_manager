package com.restaurant.service;

import com.restaurant.model.Employee;
import com.restaurant.model.enums.EmployeeRole;
import com.restaurant.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmployeeService {
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }
    
    public List<Employee> getActiveEmployees() {
        return employeeRepository.findByStatusTrue();
    }
    
    public Optional<Employee> getEmployeeById(String id) {
        return employeeRepository.findById(id);
    }
    
    public Employee createEmployee(Employee employee) {
        if (employee.getStatus() == null) {
            employee.setStatus(true);
        }
        
        // Kiểm tra account trùng lặp
        if (employee.getAccount() != null && !employee.getAccount().trim().isEmpty()) {
            String account = employee.getAccount().trim();
            List<Employee> existingEmployees = employeeRepository.findAll().stream()
                .filter(emp -> emp.getAccount() != null && emp.getAccount().equals(account))
                .collect(Collectors.toList());
            
            if (!existingEmployees.isEmpty()) {
                throw new RuntimeException("Tài khoản '" + account + "' đã tồn tại. Vui lòng chọn tài khoản khác.");
            }
        }
        
        return employeeRepository.save(employee);
    }
    
    public Employee updateEmployee(String id, Employee employee) {
        Employee existingEmployee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        
        existingEmployee.setName(employee.getName());
        existingEmployee.setPhone(employee.getPhone());
        existingEmployee.setRole(employee.getRole());
        existingEmployee.setSalary(employee.getSalary());
        existingEmployee.setStatus(employee.getStatus());
        
        // Cập nhật account và password nếu có
        if (employee.getAccount() != null && !employee.getAccount().trim().isEmpty()) {
            String newAccount = employee.getAccount().trim();
            String currentAccount = existingEmployee.getAccount() != null ? existingEmployee.getAccount().trim() : null;
            
            // Chỉ kiểm tra trùng nếu account thay đổi
            if (!newAccount.equals(currentAccount)) {
                List<Employee> existingEmployees = employeeRepository.findAll().stream()
                    .filter(emp -> !emp.getId().equals(id) && // Loại trừ chính nhân viên đang sửa
                            emp.getAccount() != null && emp.getAccount().equals(newAccount))
                    .collect(Collectors.toList());
                
                if (!existingEmployees.isEmpty()) {
                    throw new RuntimeException("Tài khoản '" + newAccount + "' đã tồn tại. Vui lòng chọn tài khoản khác.");
                }
            }
            
            existingEmployee.setAccount(newAccount);
        }
        
        if (employee.getPassword() != null && !employee.getPassword().isEmpty()) {
            existingEmployee.setPassword(employee.getPassword());
        }
        
        return employeeRepository.save(existingEmployee);
    }
    
    public void deleteEmployee(String id) {
        employeeRepository.deleteById(id);
    }
    
    public List<Employee> getEmployeesByRole(EmployeeRole role) {
        return employeeRepository.findByRole(role);
    }
}










