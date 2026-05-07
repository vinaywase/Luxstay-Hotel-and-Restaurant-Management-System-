package com.hotel.restaurant.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_refunds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventRefund {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refund_id")
    private Integer refundId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "customer"})
    private EventBooking eventBooking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_payment_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "eventBooking"})
    private EventPayment originalPayment;

    @Column(name = "refund_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "refund_reason", length = 500)
    private String refundReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_policy", nullable = false)
    private RefundPolicy refundPolicy;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_status")
    private RefundStatus refundStatus = RefundStatus.REQUESTED;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt = LocalDateTime.now();

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "processed_by")
    private Integer processedBy; // Admin staff ID

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    public enum RefundPolicy {
        FULL_REFUND, PARTIAL_REFUND, NO_REFUND
    }

    public enum RefundStatus {
        REQUESTED, APPROVED, PROCESSED, REJECTED
    }
}
