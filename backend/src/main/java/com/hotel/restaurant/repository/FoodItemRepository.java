package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Integer> {
    List<FoodItem> findByCategory(String category);
    List<FoodItem> findByAvailabilityTrue();
}
