package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.ServiceRequest;
import com.hotel.restaurant.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Integer> {
    List<ServiceRequest> findByCustomerAndBillIsNull(Customer customer);
    
    List<ServiceRequest> findByBill_BillId(Integer billId);

    Long countByBill_BillId(Integer billId);
}
