package com.restaurant.repository;

import com.restaurant.model.Table;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TableRepository extends MongoRepository<Table, String> {
    List<Table> findByStatus(String status);
    List<Table> findByArea(String area);
    Table findByName(String name);
}








