package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.Bill;
import com.hotel.restaurant.entity.Customer;
import com.hotel.restaurant.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Integer> {
    List<Bill> findByReservationCustomer(Customer customer);
    List<Bill> findByCustomer(Customer customer);
    Optional<Bill> findByReservation(Reservation reservation);

}
