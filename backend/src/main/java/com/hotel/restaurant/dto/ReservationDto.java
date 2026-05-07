package com.hotel.restaurant.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ReservationDto {
    private Integer reservationId;

    @NotNull(message = "Customer ID is required")
    private Integer customerId;

    @NotNull(message = "Room ID is required")
    private Integer roomId;

    @NotNull(message = "Check-in date is required")
    private LocalDate checkInDate;

    @NotNull(message = "Check-out date is required")
    private LocalDate checkOutDate;

    private LocalTime checkInTime;
    private LocalTime checkOutTime;

    private BigDecimal totalCost;
    private String status;
    private String bookingType;
}
