package com.hotel.restaurant.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RestaurantTableDto {

    private Integer restaurantTableId;

    @NotBlank(message = "Table number is required")
    private String tableNumber;

    @NotNull(message = "Seating capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer seatingCapacity;

    private String status;

    private Integer occupiedSeats;

    private Integer availableSeats;

    // ── NEW: Links table to a restaurant ──
    private Integer restaurantId;
}