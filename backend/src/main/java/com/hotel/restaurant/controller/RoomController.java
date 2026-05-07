package com.hotel.restaurant.controller;

import com.hotel.restaurant.dto.RoomDto;
import com.hotel.restaurant.dto.ReservationDto;
import com.hotel.restaurant.service.RoomService;
import com.hotel.restaurant.service.ReservationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;
    private final ReservationService reservationService;

    public RoomController(RoomService roomService, ReservationService reservationService) {
        this.roomService = roomService;
        this.reservationService = reservationService;
    }

    @GetMapping
    public ResponseEntity<List<RoomDto>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDto> getRoomById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @GetMapping("/available")
    public ResponseEntity<List<RoomDto>> getAvailableRooms() {
        return ResponseEntity.ok(roomService.getAvailableRooms());
    }

    @PostMapping("/book")
    public ResponseEntity<ReservationDto> bookRoom(@Validated @RequestBody ReservationDto dto) {
        return new ResponseEntity<>(reservationService.createReservation(dto), HttpStatus.CREATED);
    }

    @PostMapping
    public ResponseEntity<RoomDto> createRoom(@Validated @RequestBody RoomDto roomDto) {
        return new ResponseEntity<>(roomService.createRoom(roomDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomDto> updateRoom(@PathVariable("id") Integer id, @Validated @RequestBody RoomDto roomDto) {
        return ResponseEntity.ok(roomService.updateRoom(id, roomDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable("id") Integer id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
