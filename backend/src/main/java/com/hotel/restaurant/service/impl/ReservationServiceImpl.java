package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.exception.ResourceNotFoundException;

import com.hotel.restaurant.dto.ReservationDto;
import com.hotel.restaurant.entity.Customer;
import com.hotel.restaurant.entity.Reservation;
import com.hotel.restaurant.entity.Room;
import com.hotel.restaurant.repository.CustomerRepository;
import com.hotel.restaurant.repository.ReservationRepository;
import com.hotel.restaurant.repository.RoomRepository;
import com.hotel.restaurant.service.ReservationService;
import com.hotel.restaurant.service.BillService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final CustomerRepository customerRepository;
    private final RoomRepository roomRepository;
    private final BillService billService;

    public ReservationServiceImpl(ReservationRepository reservationRepository,
            CustomerRepository customerRepository,
            RoomRepository roomRepository,
            BillService billService) {
        this.reservationRepository = reservationRepository;
        this.customerRepository = customerRepository;
        this.roomRepository = roomRepository;
        this.billService = billService;
    }

    private ReservationDto mapToDto(Reservation entity) {
        if (entity == null)
            return null;
        ReservationDto dto = new ReservationDto();
        dto.setReservationId(entity.getReservationId());
        if (entity.getCustomer() != null)
            dto.setCustomerId(entity.getCustomer().getCustomerId());
        if (entity.getRoom() != null)
            dto.setRoomId(entity.getRoom().getRoomId());
        dto.setCheckInDate(entity.getCheckInDate());
        dto.setCheckOutDate(entity.getCheckOutDate());
        dto.setCheckInTime(entity.getCheckInTime());
        dto.setCheckOutTime(entity.getCheckOutTime());
        dto.setTotalCost(entity.getTotalCost());
        dto.setStatus(entity.getStatus());
        dto.setBookingType(entity.getBookingType());
        return dto;
    }

    private Reservation mapToEntity(ReservationDto dto) {
        if (dto == null)
            return null;
        Reservation entity = new Reservation();
        entity.setCheckInDate(dto.getCheckInDate());
        entity.setCheckOutDate(dto.getCheckOutDate());
        entity.setCheckInTime(dto.getCheckInTime());
        entity.setCheckOutTime(dto.getCheckOutTime());
        if (dto.getStatus() != null)
            entity.setStatus(dto.getStatus());
        if (dto.getBookingType() != null)
            entity.setBookingType(dto.getBookingType());
        return entity;
    }

    @Override
    public List<ReservationDto> getAllReservations() {
        return reservationRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public ReservationDto getReservationById(Integer id) {
        return reservationRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + id));
    }

    @Override
    @Transactional
    public ReservationDto createReservation(ReservationDto dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        // Check for date overlap with existing active reservations instead of room
        // status
        List<Reservation> overlapping = reservationRepository.findOverlappingReservations(
                room.getRoomId(), dto.getCheckInDate(), dto.getCheckOutDate());
        if (!overlapping.isEmpty()) {
            throw new RuntimeException("Room is already booked for the selected dates");
        }

        long days = ChronoUnit.DAYS.between(dto.getCheckInDate(), dto.getCheckOutDate());
        if (days <= 0) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        BigDecimal totalCost = room.getPricePerNight().multiply(BigDecimal.valueOf(days));

        Reservation reservation = mapToEntity(dto);
        reservation.setCustomer(customer);
        reservation.setRoom(room);
        reservation.setTotalCost(totalCost);

        // Don't set room to occupied here — that happens when staff checks in the guest

        reservation = reservationRepository.save(reservation);
        return mapToDto(reservation);
    }

    @Override
    @Transactional
    public ReservationDto updateReservation(Integer id, ReservationDto dto) {
        Reservation existing = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        String oldStatus = existing.getStatus();
        existing.setStatus(dto.getStatus());

        // Auto-record check-in/check-out times and update room status
        if ("checked-in".equalsIgnoreCase(dto.getStatus()) && !"checked-in".equalsIgnoreCase(oldStatus)) {
            existing.setCheckInTime(LocalTime.now());
            if (existing.getRoom() != null) {
                existing.getRoom().setStatus("occupied");
                roomRepository.save(existing.getRoom());
            }
        } else if ("checked-out".equalsIgnoreCase(dto.getStatus()) && !"checked-out".equalsIgnoreCase(oldStatus)) {
            existing.setCheckOutTime(LocalTime.now());
            if (existing.getRoom() != null) {
                existing.getRoom().setStatus("available");
                roomRepository.save(existing.getRoom());
            }
            // AUTOMATIC BILL GENERATION ON CHECKOUT
            billService.generateCompleteBill(existing.getCustomer().getCustomerId());
        }

        // Also allow manual time overrides from the DTO
        if (dto.getCheckInTime() != null) {
            existing.setCheckInTime(dto.getCheckInTime());
        }
        if (dto.getCheckOutTime() != null) {
            existing.setCheckOutTime(dto.getCheckOutTime());
        }

        existing = reservationRepository.save(existing);
        return mapToDto(existing);
    }

    @Override
    @Transactional
    public void deleteReservation(Integer id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        // Delete associated bills first to prevent foreign key constraint violations
        if (reservation.getBills() != null && !reservation.getBills().isEmpty()) {
            List<Integer> billIds = reservation.getBills().stream()
                    .map(com.hotel.restaurant.entity.Bill::getBillId)
                    .collect(Collectors.toList());
            for (Integer billId : billIds) {
                billService.deleteBill(billId);
            }
        }

        // Release the room if occupied by this reservation
        if (reservation.getRoom() != null && "occupied".equalsIgnoreCase(reservation.getRoom().getStatus())
                && "checked-in".equalsIgnoreCase(reservation.getStatus())) {
            reservation.getRoom().setStatus("available");
            roomRepository.save(reservation.getRoom());
        }

        reservationRepository.deleteById(id);
    }
}
