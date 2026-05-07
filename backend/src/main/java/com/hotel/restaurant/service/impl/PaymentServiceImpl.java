package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.exception.ResourceNotFoundException;
import com.hotel.restaurant.dto.PaymentDto;
import com.hotel.restaurant.entity.Bill;
import com.hotel.restaurant.entity.Payment;
import com.hotel.restaurant.repository.BillRepository;
import com.hotel.restaurant.repository.PaymentRepository;
import com.hotel.restaurant.service.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository, BillRepository billRepository) {
        this.paymentRepository = paymentRepository;
        this.billRepository = billRepository;
    }

    private PaymentDto mapToDto(Payment entity) {
        if (entity == null) return null;
        PaymentDto dto = new PaymentDto();
        dto.setPaymentId(entity.getPaymentId());
        if (entity.getBill() != null) dto.setBillId(entity.getBill().getBillId());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setAmountPaid(entity.getAmountPaid());
        dto.setPaymentDate(entity.getPaymentDate());
        return dto;
    }

    private Payment mapToEntity(PaymentDto dto) {
        if (dto == null) return null;
        Payment entity = new Payment();
        entity.setPaymentMethod(dto.getPaymentMethod());
        entity.setAmountPaid(dto.getAmountPaid());
        entity.setPaymentDate(dto.getPaymentDate());
        return entity;
    }

    @Override
    public List<PaymentDto> getAllPayments() {
        return paymentRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public PaymentDto getPaymentById(Integer id) {
        return paymentRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
    }

    @Override
    @Transactional
    public PaymentDto createPayment(PaymentDto dto) {
        Bill bill = billRepository.findById(dto.getBillId())
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
        Payment payment = mapToEntity(dto);
        payment.setBill(bill);
        payment = paymentRepository.save(payment);

        // Update bill payment status
        bill.setPaymentStatus("paid");
        billRepository.save(bill);

        return mapToDto(payment);
    }

    @Override
    @Transactional
    public PaymentDto updatePayment(Integer id, PaymentDto dto) {
        Payment existing = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        existing.setPaymentMethod(dto.getPaymentMethod());
        existing.setAmountPaid(dto.getAmountPaid());
        existing = paymentRepository.save(existing);
        return mapToDto(existing);
    }

    @Override
    @Transactional
    public void deletePayment(Integer id) {
        paymentRepository.deleteById(id);
    }
}
