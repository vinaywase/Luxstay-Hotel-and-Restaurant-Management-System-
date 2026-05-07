package com.hotel.restaurant.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MenuDto {
    private Integer menuId;

    @NotNull(message = "Food item ID is required")
    private Integer foodItemId;

    private Boolean available;
}
