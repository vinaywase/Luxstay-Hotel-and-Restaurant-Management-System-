package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.RestaurantTableDto;
import com.hotel.restaurant.dto.TableBookingDto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface RestaurantTableService {

    // ── Existing ──
    List<RestaurantTableDto> getAllTables();

    RestaurantTableDto getTableById(Integer id);

    RestaurantTableDto createTable(RestaurantTableDto dto);

    RestaurantTableDto updateTable(Integer id, RestaurantTableDto dto);

    void deleteTable(Integer id);

    List<RestaurantTableDto> getAvailableTables();

    RestaurantTableDto occupySeat(Integer tableId);

    RestaurantTableDto releaseSeat(Integer tableId);

    // ── New: Cafeteria Booking ──
    List<RestaurantTableDto> getTablesByRestaurant(Integer restaurantId);

    boolean checkAvailability(Integer tableId, LocalDate bookingDate,
            LocalTime bookingTime, Integer durationHours);

    TableBookingDto bookTable(TableBookingDto dto);

    List<TableBookingDto> getAllBookings();

    List<TableBookingDto> getBookingsByCustomer(Integer customerId);

    TableBookingDto getBookingById(Integer bookingId);

    TableBookingDto updateBookingStatus(Integer bookingId, String status);
}