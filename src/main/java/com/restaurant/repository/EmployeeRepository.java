package com.restaurant.repository;

import com.restaurant.model.Employee;
import com.restaurant.model.enums.EmployeeRole;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends MongoRepository<Employee, String> {
    List<Employee> findByRole(EmployeeRole role);
    List<Employee> findByStatusTrue();
    Employee findByPhone(String phone);
    
    // Tìm kiếm account chính xác (không phân biệt hoa thường)
    @Query("{ 'account': { $regex: '^?0$', $options: 'i' } }")
    Employee findByAccountIgnoreCase(String account);
    
    // Tìm kiếm chính xác (phân biệt hoa thường)
    Employee findByAccount(String account);
}













