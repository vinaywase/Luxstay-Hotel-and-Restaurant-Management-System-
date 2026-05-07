package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.entity.EventBooking;
import com.hotel.restaurant.entity.EventPayment;
import com.hotel.restaurant.repository.EventBookingRepository;
import com.hotel.restaurant.repository.EventPaymentRepository;
import com.hotel.restaurant.service.EventAddonService;
import com.hotel.restaurant.service.EventPaymentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class EventPaymentServiceImpl implements EventPaymentService {

    private final EventPaymentRepository paymentRepository;
    private final EventBookingRepository bookingRepository;
    private final EventAddonService addonService;

    @Value("${event.advance.percentage:0.30}")
    private double advancePercentage;

    public EventPaymentServiceImpl(EventPaymentRepository paymentRepository,
                                 EventBookingRepository bookingRepository,
                                 EventAddonService addonService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.addonService = addonService;
    }

    @Override
    @Transactional
    public EventPayment recordPayment(Integer bookingId, BigDecimal amount, String type, String method, String transactionId, String notes) {
        EventBooking booking = bookingRepository.findById(bookingId).orElseThrow();
        
        EventPayment.PaymentType pType = EventPayment.PaymentType.valueOf(type);
        
        if (pType == EventPayment.PaymentType.FINAL && !"EVENT_COMPLETED".equals(booking.getStatus())) {
            throw new RuntimeException("Final payment can only be recorded after event is completed.");
        }

        EventPayment payment = new EventPayment();
        payment.setEventBooking(booking);
        payment.setAmount(amount);
        payment.setPaymentType(pType);
        payment.setPaymentMethod(EventPayment.PaymentMethod.valueOf(method));
        payment.setTransactionId(transactionId);
        payment.setNotes(notes);
        payment.setPaymentStatus(EventPayment.PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());

        EventPayment saved = paymentRepository.save(payment);

        // Update booking financials
        if (pType == EventPayment.PaymentType.ADVANCE) {
            booking.setAdvancePaid(booking.getAdvancePaid().add(amount));
            booking.setStatus("ADVANCE_PAID");
        } else if (pType == EventPayment.PaymentType.FINAL) {
            booking.setStatus("FULLY_PAID");
        }
        
        addonService.recalculateGrandTotal(booking);
        return saved;
    }
}
