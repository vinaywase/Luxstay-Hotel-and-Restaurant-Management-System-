package com.hotel.restaurant.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class BillDto {
    private Integer billId;
    private Integer customerId;
    private String customerName;
    private String serviceType;
    private Integer bookingId;
    private Integer orderId;
    private Integer serviceRequestId;
    private Integer eventBookingId;
    
    private Integer reservationId;
    private List<Integer> restaurantOrderIds;
    private List<Integer> serviceRequestIds;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than zero")
    private BigDecimal totalAmount;

    private LocalDateTime billDate;

    private String paymentStatus;

}
