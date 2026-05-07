package com.hotel.restaurant.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Integer feedbackId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Customer customer;

    @Column(name = "feedback_date", nullable = false)
    private LocalDate feedbackDate;

    /**
     * Overall rating (1–5), averaged from category sub-ratings.
     */
    @Column(name = "rating", nullable = false)
    private Integer rating;

    /**
     * Service category: ROOM, FOOD, SERVICE, EVENT, STAFF
     */
    @Column(name = "service_type", nullable = false, length = 20)
    private String serviceType;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    // ── Room criteria ──────────────────────────────────────────────────────────
    @Column(name = "rating_cleanliness")
    private Integer ratingCleanliness;

    @Column(name = "rating_comfort")
    private Integer ratingComfort;

    @Column(name = "rating_amenities")
    private Integer ratingAmenities;

    @Column(name = "rating_room_value")
    private Integer ratingRoomValue;

    // ── Food criteria ──────────────────────────────────────────────────────────
    @Column(name = "rating_taste")
    private Integer ratingTaste;

    @Column(name = "rating_presentation")
    private Integer ratingPresentation;

    @Column(name = "rating_service_speed")
    private Integer ratingServiceSpeed;

    @Column(name = "rating_food_value")
    private Integer ratingFoodValue;

    // ── Service criteria ───────────────────────────────────────────────────────
    @Column(name = "rating_communication")
    private Integer ratingCommunication;

    @Column(name = "rating_punctuality")
    private Integer ratingPunctuality;

    @Column(name = "rating_eye_for_detail")
    private Integer ratingEyeForDetail;

    @Column(name = "rating_efficiency")
    private Integer ratingEfficiency;

    // ── Event criteria ─────────────────────────────────────────────────────────
    @Column(name = "rating_organization")
    private Integer ratingOrganization;

    @Column(name = "rating_venue")
    private Integer ratingVenue;

    @Column(name = "rating_event_staff")
    private Integer ratingEventStaff;

    @Column(name = "rating_overall_experience")
    private Integer ratingOverallExperience;

    // ── Staff criteria ─────────────────────────────────────────────────────────
    @Column(name = "rating_friendliness")
    private Integer ratingFriendliness;

    @Column(name = "rating_professionalism")
    private Integer ratingProfessionalism;

    @Column(name = "rating_helpfulness")
    private Integer ratingHelpfulness;

    @Column(name = "rating_response_time")
    private Integer ratingResponseTime;
}