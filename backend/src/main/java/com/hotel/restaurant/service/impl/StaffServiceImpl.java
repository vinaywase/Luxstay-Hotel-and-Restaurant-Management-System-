package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.exception.ResourceNotFoundException;

import com.hotel.restaurant.dto.StaffDto;
import com.hotel.restaurant.entity.Staff;
import com.hotel.restaurant.repository.StaffRepository;
import com.hotel.restaurant.service.StaffService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;

    public StaffServiceImpl(StaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    private StaffDto mapToDto(Staff entity) {
        if (entity == null) return null;
        StaffDto dto = new StaffDto();
        dto.setStaffId(entity.getStaffId());
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setEmail(entity.getEmail());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setPosition(entity.getPosition());
        dto.setHireDate(entity.getHireDate());
        dto.setUsername(entity.getUsername());
        dto.setRole(entity.getRole());
        return dto;
    }

    private Staff mapToEntity(StaffDto dto) {
        if (dto == null) return null;
        Staff entity = new Staff();
        entity.setFirstName(dto.getFirstName());
        entity.setLastName(dto.getLastName());
        entity.setEmail(dto.getEmail());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setPosition(dto.getPosition());
        if (dto.getHireDate() != null) entity.setHireDate(dto.getHireDate());
        entity.setUsername(dto.getUsername());
        entity.setPassword(dto.getPassword());
        entity.setRole(dto.getRole());
        return entity;
    }

    @Override
    public List<StaffDto> getAllStaff() {
        return staffRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public StaffDto getStaffById(Integer id) {
        return staffRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
    }

    @Override
    @Transactional
    public StaffDto createStaff(StaffDto staffDto) {
        if (staffRepository.existsByEmail(staffDto.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        Staff staff = mapToEntity(staffDto);
        staff = staffRepository.save(staff);
        return mapToDto(staff);
    }

    @Override
    @Transactional
    public StaffDto updateStaff(Integer id, StaffDto staffDto) {
        Staff existing = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        existing.setFirstName(staffDto.getFirstName());
        existing.setLastName(staffDto.getLastName());
        existing.setPosition(staffDto.getPosition());
        existing.setRole(staffDto.getRole());
        existing = staffRepository.save(existing);
        return mapToDto(existing);
    }

    @Override
    @Transactional
    public void deleteStaff(Integer id) {
        staffRepository.deleteById(id);
    }
}
