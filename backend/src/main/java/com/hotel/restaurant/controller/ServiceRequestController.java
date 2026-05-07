package com.hotel.restaurant.controller;

import com.hotel.restaurant.dto.ServiceRequestDto;
import com.hotel.restaurant.service.ServiceRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-requests")
public class ServiceRequestController {
    
    private final ServiceRequestService serviceRequestService;

    public ServiceRequestController(ServiceRequestService serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequestDto>> getAllServiceRequests() {
        return ResponseEntity.ok(serviceRequestService.getAllServiceRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestDto> getServiceRequestById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestById(id));
    }

    @PostMapping
    public ResponseEntity<ServiceRequestDto> requestService(@Validated @RequestBody ServiceRequestDto dto) {
        return new ResponseEntity<>(serviceRequestService.createServiceRequest(dto), HttpStatus.CREATED);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ServiceRequestDto>> getServiceRequestsByCustomerId(@PathVariable("customerId") Integer customerId) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestsByCustomerId(customerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceRequestDto> updateServiceRequest(@PathVariable("id") Integer id, @Validated @RequestBody ServiceRequestDto dto) {
        return ResponseEntity.ok(serviceRequestService.updateServiceRequest(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceRequest(@PathVariable("id") Integer id) {
        serviceRequestService.deleteServiceRequest(id);
        return ResponseEntity.noContent().build();
    }
}
