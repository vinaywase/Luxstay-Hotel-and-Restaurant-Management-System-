package com.hotel.restaurant.controller;

import com.hotel.restaurant.dto.RestaurantTableDto;
import com.hotel.restaurant.dto.TableAvailabilityRequestDto;
import com.hotel.restaurant.dto.TableBookingDto;
import com.hotel.restaurant.service.RestaurantTableService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tables")
public class RestaurantTableController {

    private final RestaurantTableService tableService;

    public RestaurantTableController(RestaurantTableService tableService) {
        this.tableService = tableService;
    }

    // ─────────────────────────────────────────
    // EXISTING ENDPOINTS (unchanged)
    // ─────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<RestaurantTableDto>> getAllTables() {
        return ResponseEntity.ok(tableService.getAllTables());
    }

    @GetMapping("/available")
    public ResponseEntity<List<RestaurantTableDto>> getAvailableTables() {
        return ResponseEntity.ok(tableService.getAvailableTables());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantTableDto> getTableById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(tableService.getTableById(id));
    }

    @PostMapping
    public ResponseEntity<RestaurantTableDto> createTable(
            @Validated @RequestBody RestaurantTableDto dto) {
        return new ResponseEntity<>(tableService.createTable(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantTableDto> updateTable(
            @PathVariable("id") Integer id,
            @Validated @RequestBody RestaurantTableDto dto) {
        return ResponseEntity.ok(tableService.updateTable(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable("id") Integer id) {
        tableService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/occupy")
    public ResponseEntity<RestaurantTableDto> occupySeat(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(tableService.occupySeat(id));
    }

    @PutMapping("/{id}/release")
    public ResponseEntity<RestaurantTableDto> releaseSeat(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(tableService.releaseSeat(id));
    }

    // ─────────────────────────────────────────
    // NEW ENDPOINTS (cafeteria booking feature)
    // ─────────────────────────────────────────

    // Get all tables belonging to a specific restaurant
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<RestaurantTableDto>> getTablesByRestaurant(
            @PathVariable Integer restaurantId) {
        return ResponseEntity.ok(tableService.getTablesByRestaurant(restaurantId));
    }

    // Check if a table is available for a given date, time, duration
    @PostMapping("/check-availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @RequestBody TableAvailabilityRequestDto request) {
        boolean available = tableService.checkAvailability(
                request.getTableId(),
                request.getBookingDate(),
                request.getBookingTime(),
                request.getDurationHours());
        return ResponseEntity.ok(Map.of(
                "available", available,
                "tableId", request.getTableId(),
                "message", available
                        ? "Table is available for the selected time slot"
                        : "Table is already booked for this time slot"));
    }

    // Book a cafeteria table
    @PostMapping("/book")
    public ResponseEntity<TableBookingDto> bookTable(
            @Validated @RequestBody TableBookingDto dto) {
        return new ResponseEntity<>(tableService.bookTable(dto), HttpStatus.CREATED);
    }

    // Get all bookings (Admin / Staff use)
    @GetMapping("/bookings")
    public ResponseEntity<List<TableBookingDto>> getAllBookings() {
        return ResponseEntity.ok(tableService.getAllBookings());
    }

    // Get bookings for a specific customer
    @GetMapping("/bookings/customer/{customerId}")
    public ResponseEntity<List<TableBookingDto>> getBookingsByCustomer(
            @PathVariable("customerId") Integer customerId) {
        return ResponseEntity.ok(tableService.getBookingsByCustomer(customerId));
    }

    // Get a single booking by ID
    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<TableBookingDto> getBookingById(
            @PathVariable Integer bookingId) {
        return ResponseEntity.ok(tableService.getBookingById(bookingId));
    }

    // Update booking status — Admin / Staff (confirmed, occupied, completed,
    // cancelled)
    @PutMapping("/bookings/{bookingId}/status")
    public ResponseEntity<TableBookingDto> updateBookingStatus(
            @PathVariable Integer bookingId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                tableService.updateBookingStatus(bookingId, body.get("status")));
    }

    // Cancel a booking — Customer can cancel their own booking
    @PutMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<TableBookingDto> cancelBooking(
            @PathVariable Integer bookingId) {
        return ResponseEntity.ok(tableService.updateBookingStatus(bookingId, "cancelled"));
    }
}
