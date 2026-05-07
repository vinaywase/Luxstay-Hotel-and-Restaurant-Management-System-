package com.hotel.restaurant.service;

import com.hotel.restaurant.entity.EventRefund;
import java.math.BigDecimal;
import java.util.List;

public interface EventRefundService {
    EventRefund requestRefund(Integer bookingId, String reason);
    EventRefund approveRefund(Integer refundId, BigDecimal overrideAmount, String adminNotes);
    EventRefund rejectRefund(Integer refundId, String adminNotes);
    EventRefund processRefund(Integer refundId);
    List<EventRefund> getAllRefunds();
    EventRefund getRefundDetails(Integer refundId);
}
