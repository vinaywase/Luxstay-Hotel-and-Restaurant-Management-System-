package com.hotel.restaurant.controller;

import com.hotel.restaurant.dto.EventCostSummaryDto;
import com.hotel.restaurant.dto.RefundEligibilityDto;
import com.hotel.restaurant.entity.EventBooking;
import com.hotel.restaurant.entity.EventRefund;
import com.hotel.restaurant.repository.EventBookingRepository;
import com.hotel.restaurant.repository.EventRefundRepository;
import com.hotel.restaurant.service.EventAddonService;
import com.hotel.restaurant.service.EventRefundService;
import com.hotel.restaurant.service.RefundPolicyService;
import com.hotel.restaurant.service.EventServicePackageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class CustomerEventActionController {

    private final EventAddonService addonService;
    private final EventRefundService refundService;
    private final RefundPolicyService refundPolicyService;
    private final EventServicePackageService packageService;
    private final EventBookingRepository bookingRepository;
    private final EventRefundRepository eventRefundRepository;

    public CustomerEventActionController(EventAddonService addonService,
                                       EventRefundService refundService,
                                       RefundPolicyService refundPolicyService,
                                       EventServicePackageService packageService,
                                       EventBookingRepository bookingRepository,
                                       EventRefundRepository eventRefundRepository) {
        this.addonService = addonService;
        this.refundService = refundService;
        this.refundPolicyService = refundPolicyService;
        this.packageService = packageService;
        this.bookingRepository = bookingRepository;
        this.eventRefundRepository = eventRefundRepository;
    }

    // --- Services & Menu ---
    @GetMapping("/service-packages")
    public ResponseEntity<List<com.hotel.restaurant.entity.EventServicePackage>> listPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @PostMapping("/bookings/{id}/services")
    public ResponseEntity<Void> addService(@PathVariable Integer id, @RequestBody Map<String, Integer> payload) {
        addonService.addService(id, payload.get("packageId"), payload.getOrDefault("quantity", 1));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/bookings/{id}/services/{sid}")
    public ResponseEntity<Void> removeService(@PathVariable Integer id, @PathVariable Integer sid) {
        addonService.removeService(id, sid);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bookings/{id}/menu")
    public ResponseEntity<Void> addMenu(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
        addonService.addMenuSelection(id, 
            (Integer) payload.get("foodItemId"), 
            (Integer) payload.getOrDefault("quantity", 1),
            (String) payload.get("itemType"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/bookings/{id}/menu/{mid}")
    public ResponseEntity<Void> removeMenu(@PathVariable Integer id, @PathVariable Integer mid) {
        addonService.removeMenuSelection(id, mid);
        return ResponseEntity.ok().build();
    }

    // --- Summary & Cancellation ---
    @GetMapping("/bookings/{id}/cost-summary")
    public ResponseEntity<EventCostSummaryDto> getCostSummary(@PathVariable Integer id) {
        return ResponseEntity.ok(addonService.getCostSummary(id));
    }

    @PostMapping("/bookings/{id}/cancel")
    public ResponseEntity<Void> requestCancellation(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        EventBooking booking = bookingRepository.findById(id).orElseThrow();
        booking.setStatus("CANCELLATION_REQUESTED");
        booking.setCancellationReason(payload.get("reason"));
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);
        
        refundService.requestRefund(id, payload.get("reason"));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/bookings/{id}/refund-eligibility")
    public ResponseEntity<RefundEligibilityDto> checkRefundEligibility(@PathVariable Integer id) {
        EventBooking booking = bookingRepository.findById(id).orElseThrow();
        return ResponseEntity.ok(refundPolicyService.calculateRefundEligibility(booking));
    }

    @GetMapping("/bookings/{id}/refund")
    public ResponseEntity<List<EventRefund>> getRefundStatus(@PathVariable Integer id) {
        return ResponseEntity.ok(eventRefundRepository.findByEventBooking_BookingId(id));
    }
}
