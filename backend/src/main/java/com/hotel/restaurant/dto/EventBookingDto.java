package com.hotel.restaurant.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
public class EventBookingDto {
    private Integer bookingId;
    private Integer customerId;
    private String customerName;
    private String fullName;
    private String email;
    private String phone;
    private String eventType;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String venuePreference;
    private Integer guestCount;
    private String budgetRange;
    private String specialRequirements;
    private String status;
    private String rejectionReason;
    private BigDecimal totalCost;
    private LocalDateTime createdAt;
}
