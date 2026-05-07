package com.hotel.restaurant.controller;

import com.hotel.restaurant.dto.EventCostSummaryDto;
import com.hotel.restaurant.entity.EventPayment;
import com.hotel.restaurant.entity.EventRefund;
import com.hotel.restaurant.entity.EventServicePackage;
import com.hotel.restaurant.service.EventAddonService;
import com.hotel.restaurant.service.EventPaymentService;
import com.hotel.restaurant.service.EventRefundService;
import com.hotel.restaurant.service.EventServicePackageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminEventActionController {

    private final EventServicePackageService packageService;
    private final EventAddonService addonService;
    private final EventPaymentService paymentService;
    private final EventRefundService refundService;

    public AdminEventActionController(EventServicePackageService packageService,
                                    EventAddonService addonService,
                                    EventPaymentService paymentService,
                                    EventRefundService refundService) {
        this.packageService = packageService;
        this.addonService = addonService;
        this.paymentService = paymentService;
        this.refundService = refundService;
    }

    // --- Service Packages ---
    @PostMapping("/service-packages")
    public ResponseEntity<EventServicePackage> createPackage(@RequestBody EventServicePackage pkg) {
        return ResponseEntity.ok(packageService.savePackage(pkg));
    }

    @GetMapping("/service-packages")
    public ResponseEntity<List<EventServicePackage>> listPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @PutMapping("/service-packages/{id}")
    public ResponseEntity<EventServicePackage> updatePackage(@PathVariable Integer id, @RequestBody EventServicePackage pkg) {
        pkg.setPackageId(id);
        return ResponseEntity.ok(packageService.savePackage(pkg));
    }

    @DeleteMapping("/service-packages/{id}")
    public ResponseEntity<Void> deactivatePackage(@PathVariable Integer id) {
        packageService.deactivatePackage(id);
        return ResponseEntity.noContent().build();
    }

    // --- Financials ---
    @GetMapping("/bookings/{id}/cost-summary")
    public ResponseEntity<EventCostSummaryDto> getCostSummary(@PathVariable Integer id) {
        return ResponseEntity.ok(addonService.getCostSummary(id));
    }

    @PostMapping("/bookings/{id}/payments")
    public ResponseEntity<EventPayment> recordPayment(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String type = payload.get("paymentType").toString();
        String method = payload.get("paymentMethod").toString();
        String transactionId = payload.getOrDefault("transactionId", "").toString();
        String notes = payload.getOrDefault("notes", "").toString();
        
        return ResponseEntity.ok(paymentService.recordPayment(id, amount, type, method, transactionId, notes));
    }

    // --- Refunds ---
    @GetMapping("/refunds")
    public ResponseEntity<List<EventRefund>> listRefunds() {
        return ResponseEntity.ok(refundService.getAllRefunds());
    }

    @GetMapping("/refunds/{refundId}")
    public ResponseEntity<EventRefund> getRefundDetails(@PathVariable Integer refundId) {
        return ResponseEntity.ok(refundService.getRefundDetails(refundId));
    }

    @PutMapping("/refunds/{refundId}/approve")
    public ResponseEntity<EventRefund> approveRefund(@PathVariable Integer refundId, @RequestBody Map<String, Object> payload) {
        BigDecimal amount = payload.get("amount") != null ? new BigDecimal(payload.get("amount").toString()) : null;
        String notes = payload.getOrDefault("notes", "").toString();
        return ResponseEntity.ok(refundService.approveRefund(refundId, amount, notes));
    }

    @PutMapping("/refunds/{refundId}/reject")
    public ResponseEntity<EventRefund> rejectRefund(@PathVariable Integer refundId, @RequestBody Map<String, String> payload) {
        String notes = payload.getOrDefault("notes", "").toString();
        return ResponseEntity.ok(refundService.rejectRefund(refundId, notes));
    }

    @PutMapping("/refunds/{refundId}/process")
    public ResponseEntity<EventRefund> processRefund(@PathVariable Integer refundId) {
        return ResponseEntity.ok(refundService.processRefund(refundId));
    }
}
