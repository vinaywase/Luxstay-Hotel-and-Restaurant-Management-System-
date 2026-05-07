package com.hotel.restaurant.controller;

import com.hotel.restaurant.dto.BillDto;
import com.hotel.restaurant.service.BillService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping
    public ResponseEntity<List<BillDto>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillDto> getBillById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

    @PostMapping("/generate")
    public ResponseEntity<BillDto> generateBill(@RequestBody java.util.Map<String, Object> payload) {
        // ✅ FIXED: toString() using safe conversion — String/Integer both are handled
        Integer customerId = payload.get("customerId") != null
                ? Integer.valueOf(payload.get("customerId").toString())
                : null;
        String serviceType = (String) payload.get("serviceType");
        Integer referenceId = payload.get("referenceId") != null
                ? Integer.valueOf(payload.get("referenceId").toString())
                : null;
        java.math.BigDecimal amount = payload.get("amount") != null
                ? new java.math.BigDecimal(payload.get("amount").toString())
                : java.math.BigDecimal.ZERO;

        if (serviceType == null) {
            return new ResponseEntity<>(billService.generateCompleteBill(customerId), HttpStatus.CREATED);
        }

        return new ResponseEntity<>(billService.generateBillForService(customerId, serviceType, referenceId, amount),
                HttpStatus.CREATED);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BillDto>> getBillsByCustomerId(@PathVariable("customerId") Integer customerId) {
        return ResponseEntity.ok(billService.getBillsByCustomerId(customerId));
    }

    @GetMapping("/{id}/receipt")
    public ResponseEntity<Map<String, Object>> getBillReceipt(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(billService.getBillReceipt(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillDto> updateBill(@PathVariable("id") Integer id, @Validated @RequestBody BillDto dto) {
        return ResponseEntity.ok(billService.updateBill(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable("id") Integer id) {
        System.out.println("delete bill controller" + id);
        billService.deleteBill(id);
        return ResponseEntity.noContent().build();
    }
}
