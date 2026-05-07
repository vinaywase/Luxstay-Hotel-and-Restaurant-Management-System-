package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.Reservation;
import com.hotel.restaurant.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
       Optional<Reservation> findByCustomerAndStatus(Customer customer, String status);

       @Query("SELECT r FROM Reservation r WHERE r.room.roomId = :roomId " +
                     "AND r.status != 'canceled' " +
                     "AND ((r.checkInDate <= :checkOutDate AND r.checkOutDate >= :checkInDate))")
       List<Reservation> findOverlappingReservations(@Param("roomId") Integer roomId,
                     @Param("checkInDate") LocalDate checkInDate,
                     @Param("checkOutDate") LocalDate checkOutDate);
}
