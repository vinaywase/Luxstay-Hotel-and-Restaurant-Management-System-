package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.EventBookingDto;
import java.util.List;

public interface EventBookingService {
    EventBookingDto createBooking(EventBookingDto dto);
    EventBookingDto updateBookingStatus(Integer bookingId, String status, String rejectionReason, java.math.BigDecimal cost);
    List<EventBookingDto> getAllBookings();
    List<EventBookingDto> getBookingsByCustomerId(Integer customerId);
    EventBookingDto getBookingById(Integer bookingId);
}
