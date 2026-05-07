package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.dto.RefundEligibilityDto;
import com.hotel.restaurant.entity.EventBooking;
import com.hotel.restaurant.entity.EventRefund;
import com.hotel.restaurant.repository.EventBookingRepository;
import com.hotel.restaurant.repository.EventRefundRepository;
import com.hotel.restaurant.service.EventRefundService;
import com.hotel.restaurant.service.RefundPolicyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventRefundServiceImpl implements EventRefundService {

    private final EventRefundRepository refundRepository;
    private final EventBookingRepository bookingRepository;
    private final RefundPolicyService refundPolicyService;

    public EventRefundServiceImpl(EventRefundRepository refundRepository,
                                EventBookingRepository bookingRepository,
                                RefundPolicyService refundPolicyService) {
        this.refundRepository = refundRepository;
        this.bookingRepository = bookingRepository;
        this.refundPolicyService = refundPolicyService;
    }

    @Override
    @Transactional
    public EventRefund requestRefund(Integer bookingId, String reason) {
        EventBooking booking = bookingRepository.findById(bookingId).orElseThrow();
        
        if (!"CANCELLATION_REQUESTED".equals(booking.getStatus())) {
            throw new RuntimeException("Refund can only be requested after cancellation is initiated.");
        }

        // Check for active refund request
        refundRepository.findByEventBooking_BookingIdAndRefundStatusNot(bookingId, EventRefund.RefundStatus.REJECTED)
                .ifPresent(r -> { throw new RuntimeException("An active refund request already exists for this booking."); });

        RefundEligibilityDto eligibility = refundPolicyService.calculateRefundEligibility(booking);
        
        EventRefund refund = new EventRefund();
        refund.setEventBooking(booking);
        refund.setRefundAmount(eligibility.getRefundAmount());
        refund.setRefundReason(reason);
        refund.setRefundPolicy(EventRefund.RefundPolicy.valueOf(eligibility.getRefundPolicy()));
        refund.setRefundStatus(EventRefund.RefundStatus.REQUESTED);
        refund.setRequestedAt(LocalDateTime.now());

        booking.setRefundStatus("REQUESTED");
        bookingRepository.save(booking);

        return refundRepository.save(refund);
    }

    @Override
    @Transactional
    public EventRefund approveRefund(Integer refundId, BigDecimal overrideAmount, String adminNotes) {
        EventRefund refund = refundRepository.findById(refundId).orElseThrow();
        refund.setRefundStatus(EventRefund.RefundStatus.APPROVED);
        if (overrideAmount != null) {
            refund.setRefundAmount(overrideAmount);
        }
        refund.setAdminNotes(adminNotes);
        
        EventBooking booking = refund.getEventBooking();
        booking.setRefundStatus("APPROVED");
        bookingRepository.save(booking);

        return refundRepository.save(refund);
    }

    @Override
    @Transactional
    public EventRefund rejectRefund(Integer refundId, String adminNotes) {
        EventRefund refund = refundRepository.findById(refundId).orElseThrow();
        refund.setRefundStatus(EventRefund.RefundStatus.REJECTED);
        refund.setAdminNotes(adminNotes);

        EventBooking booking = refund.getEventBooking();
        booking.setRefundStatus("REJECTED");
        bookingRepository.save(booking);

        return refundRepository.save(refund);
    }

    @Override
    @Transactional
    public EventRefund processRefund(Integer refundId) {
        EventRefund refund = refundRepository.findById(refundId).orElseThrow();
        if (refund.getRefundStatus() != EventRefund.RefundStatus.APPROVED) {
            throw new RuntimeException("Refund must be approved before processing.");
        }

        refund.setRefundStatus(EventRefund.RefundStatus.PROCESSED);
        refund.setProcessedAt(LocalDateTime.now());

        EventBooking booking = refund.getEventBooking();
        booking.setStatus("REFUNDED");
        booking.setRefundStatus("PROCESSED");
        bookingRepository.save(booking);

        return refundRepository.save(refund);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventRefund> getAllRefunds() {
        return refundRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public EventRefund getRefundDetails(Integer refundId) {
        return refundRepository.findById(refundId).orElseThrow();
    }
}
