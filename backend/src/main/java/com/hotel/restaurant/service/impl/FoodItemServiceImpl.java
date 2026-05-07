package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.exception.ResourceNotFoundException;

import com.hotel.restaurant.dto.FoodItemDto;
import com.hotel.restaurant.entity.FoodItem;
import com.hotel.restaurant.repository.FoodItemRepository;
import com.hotel.restaurant.service.FoodItemService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FoodItemServiceImpl implements FoodItemService {

    private final FoodItemRepository foodItemRepository;

    public FoodItemServiceImpl(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    private FoodItemDto mapToDto(FoodItem entity) {
        if (entity == null) return null;
        FoodItemDto dto = new FoodItemDto();
        dto.setFoodItemId(entity.getFoodItemId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setPrice(entity.getPrice());
        dto.setCategory(entity.getCategory());
        dto.setAvailability(entity.getAvailability());
        return dto;
    }

    private FoodItem mapToEntity(FoodItemDto dto) {
        if (dto == null) return null;
        FoodItem entity = new FoodItem();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setCategory(dto.getCategory());
        if (dto.getAvailability() != null) entity.setAvailability(dto.getAvailability());
        return entity;
    }

    @Override
    public List<FoodItemDto> getAllFoodItems() {
        return foodItemRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public FoodItemDto getFoodItemById(Integer id) {
        return foodItemRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Food item not found with id: " + id));
    }

    @Override
    @Transactional
    public FoodItemDto createFoodItem(FoodItemDto dto) {
        FoodItem foodItem = mapToEntity(dto);
        foodItem = foodItemRepository.save(foodItem);
        return mapToDto(foodItem);
    }

    @Override
    @Transactional
    public FoodItemDto updateFoodItem(Integer id, FoodItemDto dto) {
        FoodItem existing = foodItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setCategory(dto.getCategory());
        existing.setAvailability(dto.getAvailability() != null ? dto.getAvailability() : existing.getAvailability());
        existing = foodItemRepository.save(existing);
        return mapToDto(existing);
    }

    @Override
    @Transactional
    public void deleteFoodItem(Integer id) {
        foodItemRepository.deleteById(id);
    }
}
