package com.hotel.restaurant.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class TableBookingDto {
    private Integer bookingId;
    private Integer tableId;
    private Integer restaurantId;
    private Integer customerId;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private Integer durationHours;
    private Integer personsCount;
    private String status;
    private Integer orderId;
}