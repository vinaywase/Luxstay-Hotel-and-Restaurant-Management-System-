package com.hotel.restaurant.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FeedbackDto {

    private Integer feedbackId;

    @NotNull(message = "Customer ID is required")
    private Integer customerId;

    // Customer name for display (read-only, populated from entity)
    private String customerName;

    @NotNull(message = "Feedback date is required")
    private LocalDate feedbackDate;

    /**
     * Overall rating saved to DB (1–5).
     * Computed as average of category ratings sent from frontend.
     */
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    /**
     * Service category: ROOM, FOOD, SERVICE, EVENT, STAFF
     */
    @NotNull(message = "Service type is required")
    private String serviceType;

    private String comments;

    // ── Category-level ratings (used only on frontend; averaged → rating) ──

    // Room criteria
    private Integer ratingCleanliness;
    private Integer ratingComfort;
    private Integer ratingAmenities;
    private Integer ratingRoomValue;

    // Food criteria
    private Integer ratingTaste;
    private Integer ratingPresentation;
    private Integer ratingServiceSpeed;
    private Integer ratingFoodValue;

    // Service criteria
    private Integer ratingCommunication;
    private Integer ratingPunctuality;
    private Integer ratingEyeForDetail;
    private Integer ratingEfficiency;

    // Event criteria
    private Integer ratingOrganization;
    private Integer ratingVenue;
    private Integer ratingEventStaff;
    private Integer ratingOverallExperience;

    // Staff criteria
    private Integer ratingFriendliness;
    private Integer ratingProfessionalism;
    private Integer ratingHelpfulness;
    private Integer ratingResponseTime;
}