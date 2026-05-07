package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Integer> {

    // ── Existing ──
    List<RestaurantTable> findByStatus(String status);

    boolean existsByTableNumber(String tableNumber);

    @Query("SELECT t FROM RestaurantTable t WHERE t.occupiedSeats < t.seatingCapacity")
    List<RestaurantTable> findTablesWithAvailableSeats();

    // ── New: Get tables by restaurant ──
    List<RestaurantTable> findByRestaurant_RestaurantId(Integer restaurantId);
}