package com.restaurant.repository;

import com.restaurant.model.Inventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryRepository extends MongoRepository<Inventory, String> {
    List<Inventory> findByItemNameContaining(String itemName);
    List<Inventory> findByImportDateBetween(LocalDateTime start, LocalDateTime end);
    List<Inventory> findByExpiryDateBefore(LocalDateTime date);
}














