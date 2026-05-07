package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.EventBookingService;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventBookingServiceRepository extends JpaRepository<EventBookingService, Integer> {
    List<EventBookingService> findByEventBooking_BookingId(Integer bookingId);
}
