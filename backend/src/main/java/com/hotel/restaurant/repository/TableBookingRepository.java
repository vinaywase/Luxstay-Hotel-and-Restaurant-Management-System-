package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.TableBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface TableBookingRepository extends JpaRepository<TableBooking, Integer> {

    List<TableBooking> findByCustomer_CustomerId(Integer customerId);

    List<TableBooking> findByTable_RestaurantTableId(Integer tableId);
    
    java.util.Optional<TableBooking> findByOrder_RestaurantOrderId(Integer orderId);

    @Query("""
                SELECT b FROM TableBooking b
                WHERE b.table.restaurantTableId = :tableId
                  AND b.bookingDate = :date
                  AND b.status NOT IN ('cancelled', 'completed')
                  AND b.bookingTime < :endTime
                  AND FUNCTION('ADDTIME', b.bookingTime,
                        FUNCTION('SEC_TO_TIME', b.durationHours * 3600)) > :startTime
            """)
    List<TableBooking> findConflictingBookings(
            @Param("tableId") Integer tableId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);
}