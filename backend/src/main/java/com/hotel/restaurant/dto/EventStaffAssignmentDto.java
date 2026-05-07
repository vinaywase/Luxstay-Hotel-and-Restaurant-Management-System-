package com.hotel.restaurant.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventStaffAssignmentDto {
    private Integer assignmentId;
    private Integer eventBookingId;
    private String eventType;
    private String eventDate;
    private String eventTime;
    private String venuePreference;
    
    private Integer staffId;
    private String staffName;
    
    private String role;
    private String notes;
    private LocalDateTime assignedAt;
    private String status;
}
