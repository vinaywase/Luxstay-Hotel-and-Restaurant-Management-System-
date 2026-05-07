package com.hotel.restaurant.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RestaurantOrderDto {
    private Integer restaurantOrderId;

    @NotNull(message = "Customer ID is required")
    private Integer customerId;

    private Integer staffId;

    private Integer restaurantTableId; 

    @NotNull(message = "Order date is required")
    private LocalDateTime orderDate;

    @NotNull(message = "Total cost is required")
    private BigDecimal totalCost;

    private String status;

    private String diningLocation;
    private List<Integer> foodItemIds;
    private Integer billId;
    private Integer tableBookingId;
}
