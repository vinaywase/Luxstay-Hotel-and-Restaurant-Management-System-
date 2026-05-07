package com.hotel.restaurant.controller;

import com.hotel.restaurant.dto.EventBookingDto;
import com.hotel.restaurant.service.EventBookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/event-bookings")

public class EventBookingController {

    private final EventBookingService bookingService;

    public EventBookingController(EventBookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<EventBookingDto> createBooking(@RequestBody EventBookingDto dto) {
        return ResponseEntity.ok(bookingService.createBooking(dto));
    }

    @GetMapping
    public ResponseEntity<List<EventBookingDto>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<EventBookingDto>> getCustomerBookings(@PathVariable Integer customerId) {
        return ResponseEntity.ok(bookingService.getBookingsByCustomerId(customerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventBookingDto> getBooking(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EventBookingDto> updateStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> updates) {
        
        String status = (String) updates.get("status");
        String reason = (String) updates.get("rejectionReason");
        java.math.BigDecimal cost = updates.get("totalCost") != null ? 
                new java.math.BigDecimal(updates.get("totalCost").toString()) : null;

        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status, reason, cost));
    }
}
