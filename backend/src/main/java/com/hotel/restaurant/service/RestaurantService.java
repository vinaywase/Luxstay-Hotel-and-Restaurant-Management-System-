package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.RestaurantDto;
import java.util.List;

public interface RestaurantService {
    List<RestaurantDto> getAllRestaurants();
    RestaurantDto getRestaurantById(Integer id);
    RestaurantDto createRestaurant(RestaurantDto dto);
    RestaurantDto updateRestaurant(Integer id, RestaurantDto dto);
    void deleteRestaurant(Integer id);
}
