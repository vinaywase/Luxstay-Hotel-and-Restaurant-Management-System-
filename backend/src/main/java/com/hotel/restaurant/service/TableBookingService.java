package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.TableBookingDto;
import java.util.List;

public interface TableBookingService {
    TableBookingDto createBooking(TableBookingDto dto);
    TableBookingDto getBookingById(Integer id);
    List<TableBookingDto> getBookingsByCustomerId(Integer customerId);
    List<TableBookingDto> getAllBookings();
    TableBookingDto updateBooking(Integer id, TableBookingDto dto);
    TableBookingDto updateBookingStatus(Integer id, String status);
    void deleteBooking(Integer id);

    boolean checkAvailability(Integer tableId, java.time.LocalDate bookingDate,
                             java.time.LocalTime bookingTime, Integer durationHours);
}
