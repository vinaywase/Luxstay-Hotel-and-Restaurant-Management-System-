package com.hotel.restaurant.service;

import com.hotel.restaurant.entity.EventPayment;
import java.math.BigDecimal;

public interface EventPaymentService {
    EventPayment recordPayment(Integer bookingId, BigDecimal amount, String type, String method, String transactionId, String notes);
}
