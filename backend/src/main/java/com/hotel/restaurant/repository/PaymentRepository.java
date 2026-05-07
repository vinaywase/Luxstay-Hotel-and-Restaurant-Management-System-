package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    // findByBillId — Bill entity मध्ये billId आहे म्हणून हे काम करतं
    @Query("SELECT p FROM Payment p WHERE p.bill.billId = :billId")
    List<Payment> findByBillId(@Param("billId") Integer billId);

    // deleteByBillId — @Query add केला, नाहीतर Spring "id" शोधतो आणि error येतो
    @Modifying
    @Query("DELETE FROM Payment p WHERE p.bill.billId = :billId")
    void deleteByBillId(@Param("billId") Integer billId);
}