package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.dto.EventStaffAssignmentDto;
import com.hotel.restaurant.entity.EventBooking;
import com.hotel.restaurant.entity.EventStaffAssignment;
import com.hotel.restaurant.entity.Staff;
import com.hotel.restaurant.repository.EventBookingRepository;
import com.hotel.restaurant.repository.EventStaffAssignmentRepository;
import com.hotel.restaurant.repository.StaffRepository;
import com.hotel.restaurant.service.EventStaffAssignmentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventStaffAssignmentServiceImpl implements EventStaffAssignmentService {

    private final EventStaffAssignmentRepository repository;
    private final EventBookingRepository eventBookingRepository;
    private final StaffRepository staffRepository;

    public EventStaffAssignmentServiceImpl(EventStaffAssignmentRepository repository,
                                         EventBookingRepository eventBookingRepository,
                                         StaffRepository staffRepository) {
        this.repository = repository;
        this.eventBookingRepository = eventBookingRepository;
        this.staffRepository = staffRepository;
    }

    @Override
    @Transactional
    public EventStaffAssignmentDto assignStaff(EventStaffAssignmentDto dto) {
        EventBooking booking = eventBookingRepository.findById(dto.getEventBookingId())
                .orElseThrow(() -> new RuntimeException("Event Booking not found"));
        
        Staff staff = staffRepository.findById(dto.getStaffId())
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        // Staff availability check
        if (repository.existsByStaff_StaffIdAndEventBooking_EventDate(dto.getStaffId(), booking.getEventDate())) {
            throw new RuntimeException("Staff member is already assigned to another event on this date.");
        }

        EventStaffAssignment assignment = new EventStaffAssignment();
        assignment.setEventBooking(booking);
        assignment.setStaff(staff);
        assignment.setRole(dto.getRole());
        assignment.setNotes(dto.getNotes());
        assignment.setAssignedAt(LocalDateTime.now());
        assignment.setStatus("ASSIGNED");

        EventStaffAssignment saved = repository.save(assignment);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventStaffAssignmentDto> getAssignmentsByEvent(Integer eventBookingId) {
        return repository.findByEventBooking_BookingId(eventBookingId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventStaffAssignmentDto> getAssignmentsByStaff(Integer staffId) {
        return repository.findByStaff_StaffId(staffId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EventStaffAssignmentDto updateStatus(Integer assignmentId, String status) {
        EventStaffAssignment assignment = repository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        assignment.setStatus(status);
        return mapToDto(repository.save(assignment));
    }

    @Override
    @Transactional
    public void deleteAssignment(Integer assignmentId) {
        repository.deleteById(assignmentId);
    }

    private EventStaffAssignmentDto mapToDto(EventStaffAssignment entity) {
        EventStaffAssignmentDto dto = new EventStaffAssignmentDto();
        dto.setAssignmentId(entity.getAssignmentId());
        dto.setEventBookingId(entity.getEventBooking().getBookingId());
        dto.setEventType(entity.getEventBooking().getEventType());
        dto.setEventDate(entity.getEventBooking().getEventDate().toString());
        dto.setEventTime(entity.getEventBooking().getEventTime().toString());
        dto.setVenuePreference(entity.getEventBooking().getVenuePreference());
        
        dto.setStaffId(entity.getStaff().getStaffId());
        dto.setStaffName(entity.getStaff().getFirstName() + " " + entity.getStaff().getLastName());
        
        dto.setRole(entity.getRole());
        dto.setNotes(entity.getNotes());
        dto.setAssignedAt(entity.getAssignedAt());
        dto.setStatus(entity.getStatus());
        return dto;
    }
}
