package com.restaurant.service;

import com.restaurant.model.Table;
import com.restaurant.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TableService {
    
    @Autowired
    private TableRepository tableRepository;
    
    public List<Table> getAllTables() {
        return tableRepository.findAll();
    }
    
    public Optional<Table> getTableById(String id) {
        return tableRepository.findById(id);
    }
    
    public Table createTable(Table table) {
        if (table.getStatus() == null || table.getStatus().trim().isEmpty()) {
            table.setStatus("Trống");
        }
        return tableRepository.save(table);
    }
    
    public Table updateTable(String id, Table table) {
        Table existingTable = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + id));
        
        existingTable.setName(table.getName());
        existingTable.setArea(table.getArea());
        existingTable.setStatus(table.getStatus());
        
        // Update orders if provided
        if (table.getOrders() != null) {
            existingTable.setOrders(table.getOrders());
        }
        
        return tableRepository.save(existingTable);
    }
    
    public void deleteTable(String id) {
        tableRepository.deleteById(id);
    }
    
    public List<Table> getTablesByStatus(String status) {
        return tableRepository.findByStatus(status);
    }
    
    public List<Table> getTablesByArea(String area) {
        return tableRepository.findByArea(area);
    }
}








