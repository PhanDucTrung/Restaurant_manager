package com.restaurant.repository;

import com.restaurant.model.MenuItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends MongoRepository<MenuItem, String> {
    List<MenuItem> findByIsActiveTrue();
    
    @Query("{ 'category.$id': ?0 }")
    List<MenuItem> findByCategoryId(String categoryId);
    
    MenuItem findByName(String name);
}

