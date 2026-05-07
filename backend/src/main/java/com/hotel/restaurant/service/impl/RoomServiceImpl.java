package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.exception.ResourceNotFoundException;

import com.hotel.restaurant.dto.RoomDto;
import com.hotel.restaurant.entity.Room;
import com.hotel.restaurant.repository.RoomRepository;
import com.hotel.restaurant.service.RoomService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;

    public RoomServiceImpl(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    private RoomDto mapToDto(Room entity) {
        if (entity == null) return null;
        RoomDto dto = new RoomDto();
        dto.setRoomId(entity.getRoomId());
        dto.setRoomNumber(entity.getRoomNumber());
        dto.setRoomType(entity.getRoomType());
        dto.setPricePerNight(entity.getPricePerNight());
        dto.setStatus(entity.getStatus());
        dto.setCapacity(entity.getCapacity());
        return dto;
    }

    private Room mapToEntity(RoomDto dto) {
        if (dto == null) return null;
        Room entity = new Room();
        entity.setRoomNumber(dto.getRoomNumber());
        entity.setRoomType(dto.getRoomType());
        entity.setPricePerNight(dto.getPricePerNight());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        entity.setCapacity(dto.getCapacity());
        return entity;
    }

    @Override
    public List<RoomDto> getAllRooms() {
        return roomRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public RoomDto getRoomById(Integer id) {
        return roomRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
    }

    @Override
    @Transactional
    public RoomDto createRoom(RoomDto roomDto) {
        if (roomRepository.existsByRoomNumber(roomDto.getRoomNumber())) {
            throw new IllegalArgumentException("Room number already exists");
        }
        Room room = mapToEntity(roomDto);
        room = roomRepository.save(room);
        return mapToDto(room);
    }

    @Override
    @Transactional
    public RoomDto updateRoom(Integer id, RoomDto roomDto) {
        Room existing = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        existing.setRoomType(roomDto.getRoomType());
        existing.setPricePerNight(roomDto.getPricePerNight());
        existing.setStatus(roomDto.getStatus() != null ? roomDto.getStatus() : existing.getStatus());
        existing.setCapacity(roomDto.getCapacity());
        existing = roomRepository.save(existing);
        return mapToDto(existing);
    }

    @Override
    @Transactional
    public void deleteRoom(Integer id) {
        roomRepository.deleteById(id);
    }

    @Override
    public List<RoomDto> getAvailableRooms() {
        return roomRepository.findByStatus("available").stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }
}
