package com.hotel.restaurant.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RefundResponseDto {
    private Integer refundId;
    private Integer bookingId;
    private String customerName;
    private String eventDate;
    private BigDecimal originalPaymentAmount;
    private BigDecimal refundAmount;
    private String refundPolicy;
    private String refundStatus;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
    private String adminNotes;
    private String refundReason;
}
