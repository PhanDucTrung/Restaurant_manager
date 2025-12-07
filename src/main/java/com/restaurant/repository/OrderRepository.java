package com.restaurant.repository;

import com.restaurant.model.Order;
import com.restaurant.model.enums.OrderStatus;
import com.restaurant.model.enums.OrderType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByOrderType(OrderType orderType);
    
    @Query("{ 'customer.$id': ?0 }")
    List<Order> findByCustomerId(String customerId);
    
    List<Order> findByTableName(String tableName);
    
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("{ 'waiter.$id': ?0 }")
    List<Order> findByWaiterId(String waiterId);
}

