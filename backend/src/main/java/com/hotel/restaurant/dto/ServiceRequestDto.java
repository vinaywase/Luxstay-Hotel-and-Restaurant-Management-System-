package com.hotel.restaurant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
public class ServiceRequestDto {
    private Integer serviceRequestId;

    @NotNull(message = "Customer ID is required")
    private Integer customerId;

    private Integer staffId;

    @NotBlank(message = "Request type is required")
    private String requestType;

    @NotNull(message = "Request date is required")
    private LocalDateTime requestDate;

    private String status;
    private BigDecimal cost;
    private Integer billId;
}
