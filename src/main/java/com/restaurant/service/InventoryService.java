package com.restaurant.service;

import com.restaurant.model.Inventory;
import com.restaurant.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }
    
    public Optional<Inventory> getInventoryById(String id) {
        return inventoryRepository.findById(id);
    }
    
    public Inventory createInventory(Inventory inventory) {
        if (inventory.getImportDate() == null) {
            inventory.setImportDate(LocalDateTime.now());
        }
        return inventoryRepository.save(inventory);
    }
    
    public Inventory updateInventory(String id, Inventory inventory) {
        Inventory existingInventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found with id: " + id));
        
        existingInventory.setItemName(inventory.getItemName());
        existingInventory.setUnit(inventory.getUnit());
        existingInventory.setQuantity(inventory.getQuantity());
        existingInventory.setUnitPrice(inventory.getUnitPrice());
        existingInventory.setImportDate(inventory.getImportDate());
        existingInventory.setExpiryDate(inventory.getExpiryDate());
        existingInventory.setSupplier(inventory.getSupplier());
        existingInventory.setNote(inventory.getNote());
        
        return inventoryRepository.save(existingInventory);
    }
    
    public void deleteInventory(String id) {
        inventoryRepository.deleteById(id);
    }
    
    public List<Inventory> searchInventoryByName(String itemName) {
        return inventoryRepository.findByItemNameContaining(itemName);
    }
    
    public List<Inventory> getInventoryByDateRange(LocalDateTime start, LocalDateTime end) {
        return inventoryRepository.findByImportDateBetween(start, end);
    }
    
    public List<Inventory> getExpiredItems(LocalDateTime date) {
        return inventoryRepository.findByExpiryDateBefore(date);
    }
}














