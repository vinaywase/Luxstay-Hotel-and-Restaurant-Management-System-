package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.exception.ResourceNotFoundException;
import com.hotel.restaurant.dto.InventoryDto;
import com.hotel.restaurant.entity.FoodItem;
import com.hotel.restaurant.entity.Inventory;
import com.hotel.restaurant.repository.FoodItemRepository;
import com.hotel.restaurant.repository.InventoryRepository;
import com.hotel.restaurant.service.InventoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final FoodItemRepository foodItemRepository;

    public InventoryServiceImpl(InventoryRepository inventoryRepository, FoodItemRepository foodItemRepository) {
        this.inventoryRepository = inventoryRepository;
        this.foodItemRepository = foodItemRepository;
    }

    private InventoryDto mapToDto(Inventory entity) {
        if (entity == null) return null;
        InventoryDto dto = new InventoryDto();
        dto.setInventoryId(entity.getInventoryId());
        if (entity.getFoodItem() != null) dto.setFoodItemId(entity.getFoodItem().getFoodItemId());
        dto.setQuantity(entity.getQuantity());
        dto.setMinimumThreshold(entity.getMinimumThreshold());
        dto.setLastUpdated(entity.getLastUpdated());
        return dto;
    }

    private Inventory mapToEntity(InventoryDto dto) {
        if (dto == null) return null;
        Inventory entity = new Inventory();
        entity.setQuantity(dto.getQuantity());
        if (dto.getMinimumThreshold() != null) {
            entity.setMinimumThreshold(dto.getMinimumThreshold());
        }
        if (dto.getLastUpdated() != null) {
            entity.setLastUpdated(dto.getLastUpdated());
        }
        return entity;
    }

    @Override
    public List<InventoryDto> getAllInventory() {
        return inventoryRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public InventoryDto getInventoryById(Integer id) {
        return inventoryRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with id: " + id));
    }

    @Override
    @Transactional
    public InventoryDto createOrUpdateInventory(InventoryDto dto) {
        FoodItem foodItem = foodItemRepository.findById(dto.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("FoodItem not found"));
        Inventory inventory = mapToEntity(dto);
        inventory.setFoodItem(foodItem);
        inventory.setLastUpdated(LocalDateTime.now());
        inventory = inventoryRepository.save(inventory);
        return mapToDto(inventory);
    }

    @Override
    @Transactional
    public InventoryDto updateInventory(Integer id, InventoryDto dto) {
        Inventory existing = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
        existing.setQuantity(dto.getQuantity());
        existing.setLastUpdated(LocalDateTime.now());
        existing = inventoryRepository.save(existing);
        return mapToDto(existing);
    }

    @Override
    @Transactional
    public void deleteInventory(Integer id) {
        inventoryRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deductInventory(Integer foodItemId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByFoodItem_FoodItemId(foodItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for food item id: " + foodItemId));
        
        if (inventory.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient inventory for food item: " + inventory.getFoodItem().getName());
        }
        
        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventory.setLastUpdated(LocalDateTime.now());
        
        // TRIGGER ALERT IF STOCK IS LOW
        if (inventory.getQuantity() <= inventory.getMinimumThreshold()) {
            System.out.println("ALERT: Low stock for food item: " + inventory.getFoodItem().getName() + 
                               ". Current quantity: " + inventory.getQuantity());
        }

        inventoryRepository.save(inventory);
    }
}
