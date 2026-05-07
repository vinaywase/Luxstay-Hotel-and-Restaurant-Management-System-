package com.hotel.restaurant.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InventoryDto {
    private Integer inventoryId;

    @NotNull(message = "Food item ID is required")
    private Integer foodItemId;

    @NotNull(message = "Quantity is required")
    private Integer quantity;
    private Integer minimumThreshold;
    private LocalDateTime lastUpdated;
}
