package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    List<Room> findByStatus(String status);
    boolean existsByRoomNumber(String roomNumber);
}
