package com.hotel.restaurant.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RefundEligibilityDto {
    private Integer bookingId;
    private LocalDate eventDate;
    private Long daysUntilEvent;
    private BigDecimal advancePaid;
    private String refundPolicy; // FULL_REFUND, PARTIAL_REFUND, NO_REFUND
    private BigDecimal refundAmount;
    private BigDecimal deductionAmount;
    private Double deductionPercentage;
    private Boolean isEligible;
    private String reason;
}
