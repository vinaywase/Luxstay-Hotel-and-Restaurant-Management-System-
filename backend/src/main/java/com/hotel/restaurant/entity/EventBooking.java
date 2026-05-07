package com.hotel.restaurant.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Integer bookingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Customer customer;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "event_type", nullable = false)
    private String eventType; // Wedding, Engagement, Conference, Birthday Party, Corporate Event

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "event_time", nullable = false)
    private LocalTime eventTime;

    @Column(name = "venue_preference")
    private String venuePreference;

    @Column(name = "guest_count", nullable = false)
    private Integer guestCount;

    @Column(name = "budget_range")
    private String budgetRange;

    @Column(name = "special_requirements", length = 1000)
    private String specialRequirements;

    @Column(name = "status", nullable = false)
    private String status = "PENDING"; 
    // PENDING, APPROVED, ADVANCE_PAID, EVENT_COMPLETED, FULLY_PAID
    // REJECTED, CANCELLATION_REQUESTED, CANCELLED, REFUND_INITIATED, REFUNDED

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost; // Venue base cost

    @Column(name = "grand_total", precision = 10, scale = 2)
    private BigDecimal grandTotal; // Total including services and menu

    @Column(name = "advance_paid", precision = 10, scale = 2)
    private BigDecimal advancePaid = BigDecimal.ZERO;

    @Column(name = "balance_due", precision = 10, scale = 2)
    private BigDecimal balanceDue = BigDecimal.ZERO;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "refund_status")
    private String refundStatus; // REQUESTED, APPROVED, PROCESSED, REJECTED

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
