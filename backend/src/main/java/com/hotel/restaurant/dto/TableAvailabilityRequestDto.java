package com.hotel.restaurant.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class TableAvailabilityRequestDto {
    private Integer tableId;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private Integer durationHours;
}