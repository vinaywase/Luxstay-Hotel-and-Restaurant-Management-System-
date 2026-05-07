package com.hotel.restaurant.service;

import com.hotel.restaurant.entity.EventBooking;

public interface EmailNotificationService {
    void sendBookingApproved(EventBooking booking);
    void sendBookingRejected(EventBooking booking, String reason);
    void sendPaymentReceipt(EventBooking booking, java.math.BigDecimal amount, String type);
    void sendFinalBalanceDue(EventBooking booking);
    void sendCancellationRequestToAdmin(EventBooking booking);
    void sendRefundApproved(EventBooking booking, java.math.BigDecimal amount);
    void sendRefundRejected(EventBooking booking, String reason);
    void sendRefundProcessed(EventBooking booking, java.math.BigDecimal amount);
}
