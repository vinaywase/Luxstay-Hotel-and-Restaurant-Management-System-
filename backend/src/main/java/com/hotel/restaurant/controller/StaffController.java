package com.hotel.restaurant.controller;

import com.hotel.restaurant.dto.StaffDto;
import com.hotel.restaurant.service.StaffService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping
    public ResponseEntity<List<StaffDto>> getAllStaff() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffDto> getStaffById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(staffService.getStaffById(id));
    }

    @PostMapping
    public ResponseEntity<StaffDto> createStaff(@Validated @RequestBody StaffDto staffDto) {
        return new ResponseEntity<>(staffService.createStaff(staffDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffDto> updateStaff(@PathVariable("id") Integer id, @Validated @RequestBody StaffDto staffDto) {
        return ResponseEntity.ok(staffService.updateStaff(id, staffDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable("id") Integer id) {
        staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}
