package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.RefundEligibilityDto;
import com.hotel.restaurant.entity.EventBooking;

public interface RefundPolicyService {
    RefundEligibilityDto calculateRefundEligibility(EventBooking booking);
}
