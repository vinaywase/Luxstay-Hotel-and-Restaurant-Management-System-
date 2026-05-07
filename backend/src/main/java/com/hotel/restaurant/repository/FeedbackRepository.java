package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    /** All feedbacks for a specific customer (Guest "My Feedbacks") */
    List<Feedback> findByCustomer_CustomerId(Integer customerId);

    /** Filter by service type (ROOM / FOOD / SERVICE / EVENT / STAFF) */
    List<Feedback> findByServiceType(String serviceType);

    /** All feedbacks for a customer filtered by service type */
    List<Feedback> findByCustomer_CustomerIdAndServiceType(Integer customerId, String serviceType);
}