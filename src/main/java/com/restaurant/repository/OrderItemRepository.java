package com.restaurant.repository;

import com.restaurant.model.OrderItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderItemRepository extends MongoRepository<OrderItem, String> {
    // Query với DBRef format: { order: { $ref: "orders", $id: ObjectId(...) } }
    // MongoDB sẽ tự động convert String sang ObjectId khi query
    @Query("{ 'order.$id': ?0 }")
    List<OrderItem> findByOrderId(String orderId);
    
    @Query("{ 'menuItem.$id': ?0 }")
    List<OrderItem> findByMenuItemId(String menuItemId);
    
    @Query("{ 'order.$id': ?0, 'menuItem.$id': ?1 }")
    Optional<OrderItem> findByOrderIdAndMenuItemId(String orderId, String menuItemId);
}

