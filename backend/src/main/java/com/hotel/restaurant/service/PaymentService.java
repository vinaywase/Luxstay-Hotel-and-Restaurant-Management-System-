package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.PaymentDto;
import java.util.List;

public interface PaymentService {
    List<PaymentDto> getAllPayments();
    PaymentDto getPaymentById(Integer id);
    PaymentDto createPayment(PaymentDto dto);
    PaymentDto updatePayment(Integer id, PaymentDto dto);
    void deletePayment(Integer id);
}
