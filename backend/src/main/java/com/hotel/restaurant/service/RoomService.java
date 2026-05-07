package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.RoomDto;
import java.util.List;

public interface RoomService {
    List<RoomDto> getAllRooms();
    RoomDto getRoomById(Integer id);
    RoomDto createRoom(RoomDto roomDto);
    RoomDto updateRoom(Integer id, RoomDto roomDto);
    void deleteRoom(Integer id);
    List<RoomDto> getAvailableRooms();
}
