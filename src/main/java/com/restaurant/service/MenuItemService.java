package com.restaurant.service;

import com.restaurant.model.MenuItem;
import com.restaurant.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenuItemService {
    
    @Autowired
    private MenuItemRepository menuItemRepository;
    
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }
    
    public List<MenuItem> getActiveMenuItems() {
        return menuItemRepository.findByIsActiveTrue();
    }
    
    public Optional<MenuItem> getMenuItemById(String id) {
        return menuItemRepository.findById(id);
    }
    
    public MenuItem createMenuItem(MenuItem menuItem) {
        if (menuItem.getIsActive() == null) {
            menuItem.setIsActive(true);
        }
        return menuItemRepository.save(menuItem);
    }
    
    public MenuItem updateMenuItem(String id, MenuItem menuItem) {
        MenuItem existingMenuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MenuItem not found with id: " + id));
        
        existingMenuItem.setCategory(menuItem.getCategory());
        existingMenuItem.setName(menuItem.getName());
        existingMenuItem.setPrice(menuItem.getPrice());
        existingMenuItem.setUnit(menuItem.getUnit());
        existingMenuItem.setIsActive(menuItem.getIsActive());
        
        return menuItemRepository.save(existingMenuItem);
    }
    
    public void deleteMenuItem(String id) {
        menuItemRepository.deleteById(id);
    }
    
    public List<MenuItem> getMenuItemsByCategory(String categoryId) {
        return menuItemRepository.findByCategoryId(categoryId);
    }
}














