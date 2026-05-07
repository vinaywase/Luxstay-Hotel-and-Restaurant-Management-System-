package com.hotel.restaurant.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_staff_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventStaffAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Integer assignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_booking_id", nullable = false)
    private EventBooking eventBooking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @Column(name = "role", nullable = false)
    private String role; // COORDINATOR, CATERING, DECORATION, SECURITY, AV_TECH

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();

    @Column(name = "status", nullable = false)
    private String status = "ASSIGNED"; // ASSIGNED, IN_PROGRESS, COMPLETED
}
