package com.hotel.restaurant.controller;

import com.hotel.restaurant.dto.EventStaffAssignmentDto;
import com.hotel.restaurant.service.EventStaffAssignmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/event-staff")
public class EventStaffAssignmentController {

    private final EventStaffAssignmentService service;

    public EventStaffAssignmentController(EventStaffAssignmentService service) {
        this.service = service;
    }

    @PostMapping("/assign")
    public ResponseEntity<EventStaffAssignmentDto> assignStaff(@RequestBody EventStaffAssignmentDto dto) {
        return new ResponseEntity<>(service.assignStaff(dto), HttpStatus.CREATED);
    }

    @GetMapping("/event/{eventBookingId}")
    public ResponseEntity<List<EventStaffAssignmentDto>> getAssignmentsByEvent(@PathVariable Integer eventBookingId) {
        return ResponseEntity.ok(service.getAssignmentsByEvent(eventBookingId));
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<EventStaffAssignmentDto>> getAssignmentsByStaff(@PathVariable Integer staffId) {
        return ResponseEntity.ok(service.getAssignmentsByStaff(staffId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EventStaffAssignmentDto> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Integer id) {
        service.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }
}
