package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.InventoryDto;
import java.util.List;

public interface InventoryService {
    List<InventoryDto> getAllInventory();
    InventoryDto getInventoryById(Integer id);
    InventoryDto createOrUpdateInventory(InventoryDto dto);
    InventoryDto updateInventory(Integer id, InventoryDto dto);
    void deleteInventory(Integer id);
    void deductInventory(Integer foodItemId, Integer quantity);
}
