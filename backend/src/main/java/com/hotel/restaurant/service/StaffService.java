package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.StaffDto;
import java.util.List;

public interface StaffService {
    List<StaffDto> getAllStaff();
    StaffDto getStaffById(Integer id);
    StaffDto createStaff(StaffDto staffDto);
    StaffDto updateStaff(Integer id, StaffDto staffDto);
    void deleteStaff(Integer id);
}
