package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.dto.EventBookingDto;
import com.hotel.restaurant.entity.Customer;
import com.hotel.restaurant.entity.EventBooking;
import com.hotel.restaurant.exception.ResourceNotFoundException;
import com.hotel.restaurant.repository.CustomerRepository;
import com.hotel.restaurant.repository.EventBookingRepository;
import com.hotel.restaurant.service.EventBookingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventBookingServiceImpl implements EventBookingService {

    private final EventBookingRepository bookingRepository;
    private final CustomerRepository customerRepository;

    public EventBookingServiceImpl(EventBookingRepository bookingRepository, CustomerRepository customerRepository) {
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
    }

    private EventBookingDto mapToDto(EventBooking entity) {
        if (entity == null) return null;
        EventBookingDto dto = new EventBookingDto();
        dto.setBookingId(entity.getBookingId());
        if (entity.getCustomer() != null) {
            dto.setCustomerId(entity.getCustomer().getCustomerId());
            dto.setCustomerName(entity.getCustomer().getFirstName() + " " + entity.getCustomer().getLastName());
        }
        dto.setFullName(entity.getFullName());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setEventType(entity.getEventType());
        dto.setEventDate(entity.getEventDate());
        dto.setEventTime(entity.getEventTime());
        dto.setVenuePreference(entity.getVenuePreference());
        dto.setGuestCount(entity.getGuestCount());
        dto.setBudgetRange(entity.getBudgetRange());
        dto.setSpecialRequirements(entity.getSpecialRequirements());
        dto.setStatus(entity.getStatus());
        dto.setRejectionReason(entity.getRejectionReason());
        dto.setTotalCost(entity.getTotalCost());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    private EventBooking mapToEntity(EventBookingDto dto) {
        if (dto == null) return null;
        EventBooking entity = new EventBooking();
        entity.setFullName(dto.getFullName());
        entity.setEmail(dto.getEmail());
        entity.setPhone(dto.getPhone());
        entity.setEventType(dto.getEventType());
        entity.setEventDate(dto.getEventDate());
        entity.setEventTime(dto.getEventTime());
        entity.setVenuePreference(dto.getVenuePreference());
        entity.setGuestCount(dto.getGuestCount());
        entity.setBudgetRange(dto.getBudgetRange());
        entity.setSpecialRequirements(dto.getSpecialRequirements());
        entity.setStatus("PENDING");
        entity.setCreatedAt(LocalDateTime.now());
        return entity;
    }

    @Override
    @Transactional
    public EventBookingDto createBooking(EventBookingDto dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        EventBooking entity = mapToEntity(dto);
        entity.setCustomer(customer);
        
        return mapToDto(bookingRepository.save(entity));
    }

    @Override
    @Transactional
    public EventBookingDto updateBookingStatus(Integer bookingId, String status, String rejectionReason, BigDecimal cost) {
        EventBooking entity = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if ("APPROVED".equals(status)) {
            // Double-booking check
            bookingRepository.findByVenuePreferenceAndEventDateAndEventTimeAndStatus(
                entity.getVenuePreference(), entity.getEventDate(), entity.getEventTime(), "APPROVED")
                .ifPresent(existing -> {
                    if (!existing.getBookingId().equals(entity.getBookingId())) {
                        throw new RuntimeException("Venue is already booked for this date and time.");
                    }
                });
        }

        entity.setStatus(status);
        if (rejectionReason != null) entity.setRejectionReason(rejectionReason);
        if (cost != null) {
            entity.setTotalCost(cost);
            // Initialize grandTotal if it's the first time setting cost
            if (entity.getGrandTotal() == null) {
                entity.setGrandTotal(cost);
                entity.setBalanceDue(cost);
            }
        }

        return mapToDto(bookingRepository.save(entity));
    }

    @Override
    public List<EventBookingDto> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<EventBookingDto> getBookingsByCustomerId(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return bookingRepository.findByCustomer(customer).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public EventBookingDto getBookingById(Integer bookingId) {
        return bookingRepository.findById(bookingId)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }
}
