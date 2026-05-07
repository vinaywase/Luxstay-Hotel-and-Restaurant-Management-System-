package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Integer> {
    Optional<Inventory> findByFoodItem_FoodItemId(Integer foodItemId);
}
