package com.hotel.restaurant.controller;

import com.hotel.restaurant.dto.FeedbackDto;
import com.hotel.restaurant.service.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    /** Admin + Staff: get all feedbacks */
    @GetMapping
    public ResponseEntity<List<FeedbackDto>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    /** Get single feedback by ID */
    @GetMapping("/{id}")
    public ResponseEntity<FeedbackDto> getFeedbackById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(feedbackService.getFeedbackById(id));
    }

    /**
     * Guest: get their own feedbacks
     * GET /api/feedbacks/customer/{customerId}
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<FeedbackDto>> getFeedbacksByCustomer(
            @PathVariable("customerId") Integer customerId) {
        return ResponseEntity.ok(feedbackService.getFeedbacksByCustomer(customerId));
    }

    /**
     * Filter by service type: ROOM | FOOD | SERVICE | EVENT | STAFF
     * GET /api/feedbacks/type/{serviceType}
     */
    @GetMapping("/type/{serviceType}")
    public ResponseEntity<List<FeedbackDto>> getFeedbacksByServiceType(
            @PathVariable String serviceType) {
        return ResponseEntity.ok(feedbackService.getFeedbacksByServiceType(serviceType));
    }

    /** Guest: submit new feedback */
    @PostMapping
    public ResponseEntity<FeedbackDto> createFeedback(
            @Validated @RequestBody FeedbackDto dto) {
        return new ResponseEntity<>(feedbackService.createFeedback(dto), HttpStatus.CREATED);
    }

    /** Guest: update their own feedback */
    @PutMapping("/{id}")
    public ResponseEntity<FeedbackDto> updateFeedback(
            @PathVariable("id") Integer id,
            @Validated @RequestBody FeedbackDto dto) {
        return ResponseEntity.ok(feedbackService.updateFeedback(id, dto));
    }

    /** Guest / Staff / Admin: delete feedback */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable("id") Integer id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
}
