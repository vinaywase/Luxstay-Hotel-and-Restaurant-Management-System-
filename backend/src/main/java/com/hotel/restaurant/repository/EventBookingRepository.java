package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.EventBooking;
import com.hotel.restaurant.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventBookingRepository extends JpaRepository<EventBooking, Integer> {
    List<EventBooking> findByCustomer(Customer customer);
    List<EventBooking> findByStatus(String status);
    
    // For double-booking check
    java.util.Optional<EventBooking> findByVenuePreferenceAndEventDateAndEventTimeAndStatus(
        String venue, java.time.LocalDate date, java.time.LocalTime time, String status);
}
