package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.EventStaffAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventStaffAssignmentRepository extends JpaRepository<EventStaffAssignment, Integer> {
    
    List<EventStaffAssignment> findByEventBooking_BookingId(Integer bookingId);
    
    List<EventStaffAssignment> findByStaff_StaffId(Integer staffId);
    
    // For staff availability check
    boolean existsByStaff_StaffIdAndEventBooking_EventDate(Integer staffId, java.time.LocalDate eventDate);
}
