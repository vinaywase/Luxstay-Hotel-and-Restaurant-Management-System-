package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.EventMenuSelection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventMenuSelectionRepository extends JpaRepository<EventMenuSelection, Integer> {
    List<EventMenuSelection> findByEventBooking_BookingId(Integer bookingId);
}
