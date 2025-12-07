package com.restaurant.repository;

import com.restaurant.model.Customer;
import com.restaurant.model.enums.CustomerType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends MongoRepository<Customer, String> {
    Customer findByPhone(String phone);
    Customer findByName(String name);
    List<Customer> findByType(CustomerType type);
}









