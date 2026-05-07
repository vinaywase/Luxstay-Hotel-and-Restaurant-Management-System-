package com.hotel.restaurant.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class EventCostSummaryDto {
    private Integer bookingId;
    private String customerName;
    private String eventDate;
    private String eventTime;
    private String venueName;
    private Integer guestCount;
    private BigDecimal venueBaseCost;
    private List<ServiceItemDto> selectedServices;
    private BigDecimal servicesTotal;
    private List<MenuItemDto> menuItems;
    private BigDecimal cateringTotal;
    private BigDecimal grandTotal;
    private BigDecimal advancePaid;
    private BigDecimal balanceDue;
    private List<PaymentItemDto> payments;
    private RefundSummaryDto refund;
    private String bookingStatus;

    @Data
    public static class ServiceItemDto {
        private String serviceName;
        private String serviceType;
        private String pricingType;
        private Integer quantity;
        private BigDecimal totalPrice;
    }

    @Data
    public static class MenuItemDto {
        private String itemName;
        private String itemType;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }

    @Data
    public static class PaymentItemDto {
        private String paymentType;
        private BigDecimal amount;
        private String paymentMethod;
        private String paidAt;
        private String status;
    }

    @Data
    public static class RefundSummaryDto {
        private String refundStatus;
        private BigDecimal refundAmount;
        private String processedAt;
    }
}
