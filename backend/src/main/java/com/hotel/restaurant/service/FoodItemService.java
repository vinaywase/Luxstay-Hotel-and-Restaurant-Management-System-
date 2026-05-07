package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.FoodItemDto;
import java.util.List;

public interface FoodItemService {
    List<FoodItemDto> getAllFoodItems();
    FoodItemDto getFoodItemById(Integer id);
    FoodItemDto createFoodItem(FoodItemDto dto);
    FoodItemDto updateFoodItem(Integer id, FoodItemDto dto);
    void deleteFoodItem(Integer id);
}
