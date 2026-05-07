package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.exception.ResourceNotFoundException;

import com.hotel.restaurant.dto.MenuDto;
import com.hotel.restaurant.entity.FoodItem;
import com.hotel.restaurant.entity.Menu;
import com.hotel.restaurant.repository.FoodItemRepository;
import com.hotel.restaurant.repository.MenuRepository;
import com.hotel.restaurant.service.MenuService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuServiceImpl implements MenuService {

    private final MenuRepository menuRepository;
    private final FoodItemRepository foodItemRepository;

    public MenuServiceImpl(MenuRepository menuRepository, FoodItemRepository foodItemRepository) {
        this.menuRepository = menuRepository;
        this.foodItemRepository = foodItemRepository;
    }

    private MenuDto mapToDto(Menu entity) {
        if (entity == null) return null;
        MenuDto dto = new MenuDto();
        dto.setMenuId(entity.getMenuId());
        if (entity.getFoodItem() != null) dto.setFoodItemId(entity.getFoodItem().getFoodItemId());
        dto.setAvailable(entity.getAvailable());
        return dto;
    }

    private Menu mapToEntity(MenuDto dto) {
        if (dto == null) return null;
        Menu entity = new Menu();
        if (dto.getAvailable() != null) entity.setAvailable(dto.getAvailable());
        return entity;
    }

    @Override
    public List<MenuDto> getAllMenus() {
        return menuRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public MenuDto getMenuById(Integer id) {
        return menuRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Menu not found with id: " + id));
    }

    @Override
    @Transactional
    public MenuDto createMenu(MenuDto dto) {
        FoodItem foodItem = foodItemRepository.findById(dto.getFoodItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found"));
        Menu menu = mapToEntity(dto);
        menu.setFoodItem(foodItem);
        menu = menuRepository.save(menu);
        return mapToDto(menu);
    }

    @Override
    @Transactional
    public MenuDto updateMenu(Integer id, MenuDto dto) {
        Menu existing = menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));
        existing.setAvailable(dto.getAvailable() != null ? dto.getAvailable() : existing.getAvailable());
        existing = menuRepository.save(existing);
        return mapToDto(existing);
    }

    @Override
    @Transactional
    public void deleteMenu(Integer id) {
        menuRepository.deleteById(id);
    }
}
