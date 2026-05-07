package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.dto.TableBookingDto;
import com.hotel.restaurant.exception.ResourceNotFoundException;
import com.hotel.restaurant.dto.RestaurantTableDto;
import com.hotel.restaurant.entity.RestaurantTable;
import com.hotel.restaurant.repository.RestaurantTableRepository;
import com.hotel.restaurant.service.RestaurantTableService;
import com.hotel.restaurant.service.TableBookingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RestaurantTableServiceImpl implements RestaurantTableService {

    private final RestaurantTableRepository tableRepository;
    private final TableBookingService tableBookingService;

    public RestaurantTableServiceImpl(
            RestaurantTableRepository tableRepository,
            TableBookingService tableBookingService) {
        this.tableRepository = tableRepository;
        this.tableBookingService = tableBookingService;
    }

    // ─────────────────────────────────────────────────────
    // EXISTING PRIVATE HELPERS (unchanged)
    // ─────────────────────────────────────────────────────

    private RestaurantTableDto mapToDto(RestaurantTable entity) {
        if (entity == null)
            return null;
        RestaurantTableDto dto = new RestaurantTableDto();
        dto.setRestaurantTableId(entity.getRestaurantTableId());
        dto.setTableNumber(entity.getTableNumber());
        dto.setSeatingCapacity(entity.getSeatingCapacity());
        dto.setStatus(entity.getStatus());
        dto.setOccupiedSeats(entity.getOccupiedSeats());
        dto.setAvailableSeats(entity.getSeatingCapacity() - entity.getOccupiedSeats());
        if (entity.getRestaurant() != null) {
            dto.setRestaurantId(entity.getRestaurant().getRestaurantId());
        }
        return dto;
    }

    private RestaurantTable mapToEntity(RestaurantTableDto dto) {
        if (dto == null)
            return null;
        RestaurantTable entity = new RestaurantTable();
        entity.setTableNumber(dto.getTableNumber());
        entity.setSeatingCapacity(dto.getSeatingCapacity());
        if (dto.getStatus() != null)
            entity.setStatus(dto.getStatus());
        entity.setOccupiedSeats(dto.getOccupiedSeats() != null ? dto.getOccupiedSeats() : 0);
        
        if (dto.getRestaurantId() != null) {
            com.hotel.restaurant.entity.Restaurant restaurant = new com.hotel.restaurant.entity.Restaurant();
            restaurant.setRestaurantId(dto.getRestaurantId());
            entity.setRestaurant(restaurant);
        }
        
        return entity;
    }

    private void updateTableStatus(RestaurantTable table) {
        if (table.getOccupiedSeats() <= 0) {
            table.setOccupiedSeats(0);
            table.setStatus("available");
        } else if (table.getOccupiedSeats() >= table.getSeatingCapacity()) {
            table.setStatus("full");
        } else {
            table.setStatus("engaged");
        }
    }

    // ─────────────────────────────────────────────────────
    // EXISTING METHOD IMPLEMENTATIONS (unchanged)
    // ─────────────────────────────────────────────────────

    // ─────────────────────────────────────────────────────
    // EXISTING METHOD IMPLEMENTATIONS (unchanged)
    // ─────────────────────────────────────────────────────

    @Override
    public List<RestaurantTableDto> getAllTables() {
        return tableRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public RestaurantTableDto getTableById(Integer id) {
        return tableRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException(
                        "Restaurant table not found with id: " + id));
    }

    @Override
    @Transactional
    public RestaurantTableDto createTable(RestaurantTableDto dto) {
        RestaurantTable table = mapToEntity(dto);
        table = tableRepository.save(table);
        return mapToDto(table);
    }

    @Override
    @Transactional
    public RestaurantTableDto updateTable(Integer id, RestaurantTableDto dto) {
        RestaurantTable existing = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Restaurant table not found"));
        existing.setTableNumber(dto.getTableNumber());
        existing.setSeatingCapacity(dto.getSeatingCapacity());
        existing.setStatus(dto.getStatus() != null ? dto.getStatus() : existing.getStatus());
        
        if (dto.getRestaurantId() != null) {
            com.hotel.restaurant.entity.Restaurant restaurant = new com.hotel.restaurant.entity.Restaurant();
            restaurant.setRestaurantId(dto.getRestaurantId());
            existing.setRestaurant(restaurant);
        }
        
        existing = tableRepository.save(existing);
        return mapToDto(existing);
    }

    @Override
    @Transactional
    public void deleteTable(Integer id) {
        tableRepository.deleteById(id);
    }

    @Override
    public List<RestaurantTableDto> getAvailableTables() {
        return tableRepository.findTablesWithAvailableSeats()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RestaurantTableDto occupySeat(Integer tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Restaurant table not found with id: " + tableId));

        if (table.getOccupiedSeats() >= table.getSeatingCapacity()) {
            throw new RuntimeException(
                    "Restaurant table " + table.getTableNumber() + " is already full");
        }

        table.setOccupiedSeats(table.getOccupiedSeats() + 1);
        updateTableStatus(table);
        table = tableRepository.save(table);
        return mapToDto(table);
    }

    @Override
    @Transactional
    public RestaurantTableDto releaseSeat(Integer tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Restaurant table not found with id: " + tableId));

        if (table.getOccupiedSeats() > 0) {
            table.setOccupiedSeats(table.getOccupiedSeats() - 1);
        }
        updateTableStatus(table);
        table = tableRepository.save(table);
        return mapToDto(table);
    }

    // ─────────────────────────────────────────────────────
    // NEW METHOD IMPLEMENTATIONS: Cafeteria Booking
    // ─────────────────────────────────────────────────────

    @Override
    public List<RestaurantTableDto> getTablesByRestaurant(Integer restaurantId) {
        return tableRepository.findByRestaurant_RestaurantId(restaurantId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public boolean checkAvailability(Integer tableId, LocalDate bookingDate,
            LocalTime bookingTime, Integer durationHours) {
        // Delegating to specialized service
        // Since checkAvailability isn't in TableBookingService yet, I'll keep the logic or add it there.
        // Actually, TableBookingService.createBooking already does this.
        // Let's just keep the logic here for now or move it to TableBookingService.
        // For "proper" fix, I'll move it to TableBookingService.
        return tableBookingService.checkAvailability(tableId, bookingDate, bookingTime, durationHours);
    }

    @Override
    @Transactional
    public TableBookingDto bookTable(TableBookingDto dto) {
        return tableBookingService.createBooking(dto);
    }

    @Override
    public List<TableBookingDto> getAllBookings() {
        return tableBookingService.getAllBookings();
    }

    @Override
    public List<TableBookingDto> getBookingsByCustomer(Integer customerId) {
        return tableBookingService.getBookingsByCustomerId(customerId);
    }

    @Override
    public TableBookingDto getBookingById(Integer bookingId) {
        return tableBookingService.getBookingById(bookingId);
    }

    @Override
    @Transactional
    public TableBookingDto updateBookingStatus(Integer bookingId, String status) {
        return tableBookingService.updateBookingStatus(bookingId, status);
    }
}