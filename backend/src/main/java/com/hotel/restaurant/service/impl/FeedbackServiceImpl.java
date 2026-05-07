package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.dto.FeedbackDto;
import com.hotel.restaurant.entity.Customer;
import com.hotel.restaurant.entity.Feedback;
import com.hotel.restaurant.exception.ResourceNotFoundException;
import com.hotel.restaurant.repository.CustomerRepository;
import com.hotel.restaurant.repository.FeedbackRepository;
import com.hotel.restaurant.service.FeedbackService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final CustomerRepository customerRepository;

    public FeedbackServiceImpl(FeedbackRepository feedbackRepository,
            CustomerRepository customerRepository) {
        this.feedbackRepository = feedbackRepository;
        this.customerRepository = customerRepository;
    }

    // ── Mapping helpers ────────────────────────────────────────────────────────

    private FeedbackDto mapToDto(Feedback e) {
        if (e == null)
            return null;
        FeedbackDto dto = new FeedbackDto();
        dto.setFeedbackId(e.getFeedbackId());
        if (e.getCustomer() != null) {
            dto.setCustomerId(e.getCustomer().getCustomerId());
            // Populate display name (adjust field to match your Customer entity)
            String firstName = e.getCustomer().getFirstName() != null ? e.getCustomer().getFirstName() : "Guest";
            String lastName = e.getCustomer().getLastName() != null ? e.getCustomer().getLastName() : "";
            dto.setCustomerName((firstName + " " + lastName).trim());
        }
        dto.setFeedbackDate(e.getFeedbackDate());
        dto.setRating(e.getRating());
        dto.setServiceType(e.getServiceType());
        dto.setComments(e.getComments());

        // Room
        dto.setRatingCleanliness(e.getRatingCleanliness());
        dto.setRatingComfort(e.getRatingComfort());
        dto.setRatingAmenities(e.getRatingAmenities());
        dto.setRatingRoomValue(e.getRatingRoomValue());

        // Food
        dto.setRatingTaste(e.getRatingTaste());
        dto.setRatingPresentation(e.getRatingPresentation());
        dto.setRatingServiceSpeed(e.getRatingServiceSpeed());
        dto.setRatingFoodValue(e.getRatingFoodValue());

        // Service
        dto.setRatingCommunication(e.getRatingCommunication());
        dto.setRatingPunctuality(e.getRatingPunctuality());
        dto.setRatingEyeForDetail(e.getRatingEyeForDetail());
        dto.setRatingEfficiency(e.getRatingEfficiency());

        // Event
        dto.setRatingOrganization(e.getRatingOrganization());
        dto.setRatingVenue(e.getRatingVenue());
        dto.setRatingEventStaff(e.getRatingEventStaff());
        dto.setRatingOverallExperience(e.getRatingOverallExperience());

        // Staff
        dto.setRatingFriendliness(e.getRatingFriendliness());
        dto.setRatingProfessionalism(e.getRatingProfessionalism());
        dto.setRatingHelpfulness(e.getRatingHelpfulness());
        dto.setRatingResponseTime(e.getRatingResponseTime());

        return dto;
    }

    private void mapCategoryRatingsToEntity(FeedbackDto dto, Feedback e) {
        String type = dto.getServiceType();
        if (type == null)
            return;

        switch (type.toUpperCase()) {
            case "ROOM" -> {
                e.setRatingCleanliness(dto.getRatingCleanliness());
                e.setRatingComfort(dto.getRatingComfort());
                e.setRatingAmenities(dto.getRatingAmenities());
                e.setRatingRoomValue(dto.getRatingRoomValue());
            }
            case "FOOD" -> {
                e.setRatingTaste(dto.getRatingTaste());
                e.setRatingPresentation(dto.getRatingPresentation());
                e.setRatingServiceSpeed(dto.getRatingServiceSpeed());
                e.setRatingFoodValue(dto.getRatingFoodValue());
            }
            case "SERVICE" -> {
                e.setRatingCommunication(dto.getRatingCommunication());
                e.setRatingPunctuality(dto.getRatingPunctuality());
                e.setRatingEyeForDetail(dto.getRatingEyeForDetail());
                e.setRatingEfficiency(dto.getRatingEfficiency());
            }
            case "EVENT" -> {
                e.setRatingOrganization(dto.getRatingOrganization());
                e.setRatingVenue(dto.getRatingVenue());
                e.setRatingEventStaff(dto.getRatingEventStaff());
                e.setRatingOverallExperience(dto.getRatingOverallExperience());
            }
            case "STAFF" -> {
                e.setRatingFriendliness(dto.getRatingFriendliness());
                e.setRatingProfessionalism(dto.getRatingProfessionalism());
                e.setRatingHelpfulness(dto.getRatingHelpfulness());
                e.setRatingResponseTime(dto.getRatingResponseTime());
            }
        }
    }

    /**
     * Computes average of non-null category ratings for a given service type.
     * Falls back to dto.getRating() if all sub-ratings are null.
     */
    private int computeOverallRating(FeedbackDto dto) {
        List<Integer> vals = switch (dto.getServiceType().toUpperCase()) {
            case "ROOM" -> Arrays.asList(dto.getRatingCleanliness(), dto.getRatingComfort(),
                    dto.getRatingAmenities(), dto.getRatingRoomValue());
            case "FOOD" -> Arrays.asList(dto.getRatingTaste(), dto.getRatingPresentation(),
                    dto.getRatingServiceSpeed(), dto.getRatingFoodValue());
            case "SERVICE" -> Arrays.asList(dto.getRatingCommunication(), dto.getRatingPunctuality(),
                    dto.getRatingEyeForDetail(), dto.getRatingEfficiency());
            case "EVENT" -> Arrays.asList(dto.getRatingOrganization(), dto.getRatingVenue(),
                    dto.getRatingEventStaff(), dto.getRatingOverallExperience());
            case "STAFF" -> Arrays.asList(dto.getRatingFriendliness(), dto.getRatingProfessionalism(),
                    dto.getRatingHelpfulness(), dto.getRatingResponseTime());
            default -> List.of();
        };

        List<Integer> nonNull = vals.stream().filter(Objects::nonNull).collect(Collectors.toList());
        if (nonNull.isEmpty()) {
            return dto.getRating() != null ? dto.getRating() : 3; // default fallback
        }
        double avg = nonNull.stream().mapToInt(Integer::intValue).average().orElse(3.0);
        return (int) Math.round(avg);
    }

    // ── Service methods ────────────────────────────────────────────────────────

    @Override
    public List<FeedbackDto> getAllFeedbacks() {
        return feedbackRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public FeedbackDto getFeedbackById(Integer id) {
        return feedbackRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));
    }

    @Override
    public List<FeedbackDto> getFeedbacksByCustomer(Integer customerId) {
        return feedbackRepository.findByCustomer_CustomerId(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackDto> getFeedbacksByServiceType(String serviceType) {
        return feedbackRepository.findByServiceType(serviceType.toUpperCase()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FeedbackDto createFeedback(FeedbackDto dto) {
        Customer cust = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + dto.getCustomerId()));

        Feedback fb = new Feedback();
        fb.setCustomer(cust);
        fb.setFeedbackDate(dto.getFeedbackDate());
        fb.setServiceType(dto.getServiceType().toUpperCase());
        fb.setComments(dto.getComments());

        // Compute and persist overall rating from sub-ratings
        fb.setRating(computeOverallRating(dto));

        // Persist individual category ratings
        mapCategoryRatingsToEntity(dto, fb);

        return mapToDto(feedbackRepository.save(fb));
    }

    @Override
    @Transactional
    public FeedbackDto updateFeedback(Integer id, FeedbackDto dto) {
        Feedback existing = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));

        existing.setComments(dto.getComments());

        // Allow updating category ratings and recompute overall
        if (dto.getServiceType() != null) {
            existing.setServiceType(dto.getServiceType().toUpperCase());
            mapCategoryRatingsToEntity(dto, existing);
            existing.setRating(computeOverallRating(dto));
        } else if (dto.getRating() != null) {
            existing.setRating(dto.getRating());
        }

        return mapToDto(feedbackRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteFeedback(Integer id) {
        if (!feedbackRepository.existsById(id)) {
            throw new ResourceNotFoundException("Feedback not found with id: " + id);
        }
        feedbackRepository.deleteById(id);
    }
}