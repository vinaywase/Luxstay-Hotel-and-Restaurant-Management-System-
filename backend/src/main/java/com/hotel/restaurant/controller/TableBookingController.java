package com.hotel.restaurant.controller;

import com.hotel.restaurant.dto.TableBookingDto;
import com.hotel.restaurant.service.TableBookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/table-bookings")
public class TableBookingController {

    private final TableBookingService tableBookingService;

    public TableBookingController(TableBookingService tableBookingService) {
        this.tableBookingService = tableBookingService;
    }

    @GetMapping
    public ResponseEntity<List<TableBookingDto>> getAllBookings() {
        return ResponseEntity.ok(tableBookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TableBookingDto> getBookingById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(tableBookingService.getBookingById(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<TableBookingDto>> getBookingsByCustomerId(@PathVariable("customerId") Integer customerId) {
        return ResponseEntity.ok(tableBookingService.getBookingsByCustomerId(customerId));
    }

    @PostMapping
    public ResponseEntity<TableBookingDto> createBooking(@Validated @RequestBody TableBookingDto dto) {
        return new ResponseEntity<>(tableBookingService.createBooking(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TableBookingDto> updateBooking(@PathVariable("id") Integer id,
                                                         @Validated @RequestBody TableBookingDto dto) {
        return ResponseEntity.ok(tableBookingService.updateBooking(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TableBookingDto> updateBookingStatus(@PathVariable("id") Integer id,
                                                               @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(tableBookingService.updateBookingStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable("id") Integer id) {
        tableBookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
