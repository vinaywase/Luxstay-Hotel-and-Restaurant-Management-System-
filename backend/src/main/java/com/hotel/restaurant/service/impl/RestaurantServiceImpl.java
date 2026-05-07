package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.exception.ResourceNotFoundException;

import com.hotel.restaurant.dto.RestaurantDto;
import com.hotel.restaurant.entity.Restaurant;
import com.hotel.restaurant.repository.RestaurantRepository;
import com.hotel.restaurant.service.RestaurantService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public RestaurantServiceImpl(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    private RestaurantDto mapToDto(Restaurant entity) {
        if (entity == null) return null;
        RestaurantDto dto = new RestaurantDto();
        dto.setRestaurantId(entity.getRestaurantId());
        dto.setName(entity.getName());
        dto.setLocation(entity.getLocation());
        dto.setOpeningTime(entity.getOpeningTime());
        dto.setClosingTime(entity.getClosingTime());
        return dto;
    }

    private Restaurant mapToEntity(RestaurantDto dto) {
        if (dto == null) return null;
        Restaurant entity = new Restaurant();
        entity.setName(dto.getName());
        entity.setLocation(dto.getLocation());
        entity.setOpeningTime(dto.getOpeningTime());
        entity.setClosingTime(dto.getClosingTime());
        return entity;
    }

    @Override
    public List<RestaurantDto> getAllRestaurants() {
        return restaurantRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public RestaurantDto getRestaurantById(Integer id) {
        return restaurantRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + id));
    }

    @Override
    @Transactional
    public RestaurantDto createRestaurant(RestaurantDto dto) {
        Restaurant restaurant = mapToEntity(dto);
        restaurant = restaurantRepository.save(restaurant);
        return mapToDto(restaurant);
    }

    @Override
    @Transactional
    public RestaurantDto updateRestaurant(Integer id, RestaurantDto dto) {
        Restaurant existing = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        existing.setName(dto.getName());
        existing.setLocation(dto.getLocation());
        existing.setOpeningTime(dto.getOpeningTime());
        existing.setClosingTime(dto.getClosingTime());
        existing = restaurantRepository.save(existing);
        return mapToDto(existing);
    }

    @Override
    @Transactional
    public void deleteRestaurant(Integer id) {
        restaurantRepository.deleteById(id);
    }
}
