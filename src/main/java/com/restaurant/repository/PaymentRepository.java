package com.restaurant.repository;

import com.restaurant.model.Payment;
import com.restaurant.model.enums.PaymentMethod;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    @Query("{ 'order.$id': ?0 }")
    List<Payment> findByOrderId(String orderId);
    
    List<Payment> findByMethod(PaymentMethod method);
    List<Payment> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}

