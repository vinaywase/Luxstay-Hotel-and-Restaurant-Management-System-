package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.EventRefund;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EventRefundRepository extends JpaRepository<EventRefund, Integer> {
    List<EventRefund> findByEventBooking_BookingId(Integer bookingId);
    Optional<EventRefund> findByEventBooking_BookingIdAndRefundStatusNot(Integer bookingId, EventRefund.RefundStatus status);
}
