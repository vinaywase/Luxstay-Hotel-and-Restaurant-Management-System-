package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    java.util.Optional<Customer> findByEmail(String email);
    java.util.Optional<Customer> findByUsername(String username);
}
