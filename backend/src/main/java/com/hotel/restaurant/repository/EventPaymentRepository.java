package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.EventPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventPaymentRepository extends JpaRepository<EventPayment, Integer> {
    List<EventPayment> findByEventBooking_BookingId(Integer bookingId);
}
