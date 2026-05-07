package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.EventStaffAssignmentDto;
import java.util.List;

public interface EventStaffAssignmentService {
    EventStaffAssignmentDto assignStaff(EventStaffAssignmentDto dto);
    List<EventStaffAssignmentDto> getAssignmentsByEvent(Integer eventBookingId);
    List<EventStaffAssignmentDto> getAssignmentsByStaff(Integer staffId);
    EventStaffAssignmentDto updateStatus(Integer assignmentId, String status);
    void deleteAssignment(Integer assignmentId);
}
