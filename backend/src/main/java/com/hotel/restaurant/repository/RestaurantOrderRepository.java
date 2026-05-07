package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.RestaurantOrder;
import com.hotel.restaurant.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RestaurantOrderRepository extends JpaRepository<RestaurantOrder, Integer> {
    List<RestaurantOrder> findByCustomer(Customer customer);
    List<RestaurantOrder> findByCustomerAndBillIsNull(Customer customer);

    @Override
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"foodItems"})
    @org.springframework.lang.NonNull
    List<RestaurantOrder> findAll();

    List<RestaurantOrder> findByBill_BillId(Integer billId);

    Long countByBill_BillId(Integer billId);
}
