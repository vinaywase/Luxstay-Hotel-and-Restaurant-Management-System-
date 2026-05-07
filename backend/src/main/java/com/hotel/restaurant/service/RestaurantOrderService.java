package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.RestaurantOrderDto;
import java.util.List;

public interface RestaurantOrderService {
    List<RestaurantOrderDto> getAllOrders();
    RestaurantOrderDto getOrderById(Integer id);
    RestaurantOrderDto createOrder(RestaurantOrderDto dto);
    RestaurantOrderDto updateOrder(Integer id, RestaurantOrderDto dto);
    RestaurantOrderDto updateOrderStatus(Integer id, String status);
    void deleteOrder(Integer id);
    List<RestaurantOrderDto> getOrdersByCustomerId(Integer customerId);
}
