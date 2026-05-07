package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.FeedbackDto;

import java.util.List;

public interface FeedbackService {

    List<FeedbackDto> getAllFeedbacks();

    FeedbackDto getFeedbackById(Integer id);

    /** Guest: get only their own feedbacks */
    List<FeedbackDto> getFeedbacksByCustomer(Integer customerId);

    /** Filter by service type */
    List<FeedbackDto> getFeedbacksByServiceType(String serviceType);

    FeedbackDto createFeedback(FeedbackDto dto);

    FeedbackDto updateFeedback(Integer id, FeedbackDto dto);

    void deleteFeedback(Integer id);
}