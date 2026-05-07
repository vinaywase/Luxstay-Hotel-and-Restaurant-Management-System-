package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.ReservationDto;
import java.util.List;

public interface ReservationService {
    List<ReservationDto> getAllReservations();
    ReservationDto getReservationById(Integer id);
    ReservationDto createReservation(ReservationDto dto);
    ReservationDto updateReservation(Integer id, ReservationDto dto);
    void deleteReservation(Integer id);
}
