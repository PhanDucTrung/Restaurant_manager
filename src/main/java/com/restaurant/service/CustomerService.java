package com.restaurant.service;

import com.restaurant.model.Customer;
import com.restaurant.model.enums.CustomerType;
import com.restaurant.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {
    
    @Autowired
    private CustomerRepository customerRepository;
    
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }
    
    public Optional<Customer> getCustomerById(String id) {
        return customerRepository.findById(id);
    }
    
    public Customer createCustomer(Customer customer) {
        if (customer.getType() == null) {
            customer.setType(CustomerType.normal);
        }
        if (customer.getPoints() == null) {
            customer.setPoints(0);
        }
        return customerRepository.save(customer);
    }
    
    public Customer updateCustomer(String id, Customer customer) {
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        
        existingCustomer.setName(customer.getName());
        existingCustomer.setPhone(customer.getPhone());
        existingCustomer.setType(customer.getType());
        existingCustomer.setPoints(customer.getPoints());
        
        return customerRepository.save(existingCustomer);
    }
    
    public void deleteCustomer(String id) {
        customerRepository.deleteById(id);
    }
    
    public Customer getCustomerByPhone(String phone) {
        return customerRepository.findByPhone(phone);
    }
    
    public Customer getCustomerByName(String name) {
        return customerRepository.findByName(name);
    }
    
    public List<Customer> getCustomersByType(CustomerType type) {
        return customerRepository.findByType(type);
    }
}









