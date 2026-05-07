package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.dto.RefundEligibilityDto;
import com.hotel.restaurant.entity.EventBooking;
import com.hotel.restaurant.entity.EventRefund;
import com.hotel.restaurant.service.RefundPolicyService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class RefundPolicyServiceImpl implements RefundPolicyService {

    @Override
    public RefundEligibilityDto calculateRefundEligibility(EventBooking booking) {
        RefundEligibilityDto dto = new RefundEligibilityDto();
        dto.setBookingId(booking.getBookingId());
        dto.setEventDate(booking.getEventDate());
        dto.setAdvancePaid(booking.getAdvancePaid());

        if ("EVENT_COMPLETED".equals(booking.getStatus()) || "FULLY_PAID".equals(booking.getStatus())) {
            dto.setIsEligible(false);
            dto.setRefundPolicy(EventRefund.RefundPolicy.NO_REFUND.name());
            dto.setRefundAmount(BigDecimal.ZERO);
            dto.setDeductionAmount(booking.getAdvancePaid());
            dto.setDeductionPercentage(100.0);
            dto.setReason("Event already completed or fully paid.");
            return dto;
        }

        long daysUntilEvent = ChronoUnit.DAYS.between(LocalDate.now(), booking.getEventDate());
        dto.setDaysUntilEvent(daysUntilEvent);

        BigDecimal advance = booking.getAdvancePaid();
        if (advance == null || advance.compareTo(BigDecimal.ZERO) <= 0) {
            dto.setIsEligible(false);
            dto.setRefundPolicy(EventRefund.RefundPolicy.NO_REFUND.name());
            dto.setRefundAmount(BigDecimal.ZERO);
            dto.setDeductionAmount(BigDecimal.ZERO);
            dto.setDeductionPercentage(0.0);
            dto.setReason("No advance payment found to refund.");
            return dto;
        }

        if (daysUntilEvent > 30) {
            setRefundDetails(dto, advance, 1.0, EventRefund.RefundPolicy.FULL_REFUND, "Full refund for cancellation > 30 days.");
        } else if (daysUntilEvent >= 15) {
            setRefundDetails(dto, advance, 0.5, EventRefund.RefundPolicy.PARTIAL_REFUND, "50% refund for cancellation between 15-30 days.");
        } else if (daysUntilEvent >= 7) {
            setRefundDetails(dto, advance, 0.25, EventRefund.RefundPolicy.PARTIAL_REFUND, "25% refund for cancellation between 7-14 days.");
        } else {
            setRefundDetails(dto, advance, 0.0, EventRefund.RefundPolicy.NO_REFUND, "No refund for cancellation < 7 days.");
        }

        return dto;
    }

    private void setRefundDetails(RefundEligibilityDto dto, BigDecimal advance, double refundRatio, EventRefund.RefundPolicy policy, String reason) {
        BigDecimal refundAmount = advance.multiply(BigDecimal.valueOf(refundRatio)).setScale(2, RoundingMode.HALF_UP);
        dto.setRefundAmount(refundAmount);
        dto.setDeductionAmount(advance.subtract(refundAmount));
        dto.setDeductionPercentage((1.0 - refundRatio) * 100);
        dto.setRefundPolicy(policy.name());
        dto.setIsEligible(refundAmount.compareTo(BigDecimal.ZERO) > 0);
        dto.setReason(reason);
    }
}
