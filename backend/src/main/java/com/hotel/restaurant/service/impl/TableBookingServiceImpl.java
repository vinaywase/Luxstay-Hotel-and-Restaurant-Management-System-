package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.dto.TableBookingDto;
import com.hotel.restaurant.entity.*;
import com.hotel.restaurant.exception.ResourceNotFoundException;
import com.hotel.restaurant.repository.*;
import com.hotel.restaurant.service.TableBookingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TableBookingServiceImpl implements TableBookingService {

    private final TableBookingRepository tableBookingRepository;
    private final RestaurantTableRepository tableRepository;
    private final RestaurantRepository restaurantRepository;
    private final CustomerRepository customerRepository;
    private final RestaurantOrderRepository orderRepository;

    public TableBookingServiceImpl(
            TableBookingRepository tableBookingRepository,
            RestaurantTableRepository tableRepository,
            RestaurantRepository restaurantRepository,
            CustomerRepository customerRepository,
            RestaurantOrderRepository orderRepository) {
        this.tableBookingRepository = tableBookingRepository;
        this.tableRepository = tableRepository;
        this.restaurantRepository = restaurantRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
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

    private TableBookingDto mapToDto(TableBooking entity) {
        if (entity == null) return null;
        TableBookingDto dto = new TableBookingDto();
        dto.setBookingId(entity.getBookingId());
        if (entity.getTable() != null) dto.setTableId(entity.getTable().getRestaurantTableId());
        if (entity.getRestaurant() != null) dto.setRestaurantId(entity.getRestaurant().getRestaurantId());
        if (entity.getCustomer() != null) dto.setCustomerId(entity.getCustomer().getCustomerId());
        if (entity.getOrder() != null) dto.setOrderId(entity.getOrder().getRestaurantOrderId());
        dto.setBookingDate(entity.getBookingDate());
        dto.setBookingTime(entity.getBookingTime());
        dto.setDurationHours(entity.getDurationHours());
        dto.setPersonsCount(entity.getPersonsCount());
        dto.setStatus(entity.getStatus());
        return dto;
    }

    @Override
    @Transactional
    public TableBookingDto createBooking(TableBookingDto dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + dto.getCustomerId()));
        Restaurant restaurant = restaurantRepository.findById(dto.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + dto.getRestaurantId()));
        RestaurantTable table = tableRepository.findById(dto.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + dto.getTableId()));

        // Validate table belongs to restaurant
        if (table.getRestaurant() == null || !table.getRestaurant().getRestaurantId().equals(restaurant.getRestaurantId())) {
            throw new IllegalArgumentException("Selected table does not belong to the selected restaurant.");
        }

        // Validate capacity
        if (dto.getPersonsCount() > table.getSeatingCapacity()) {
            throw new IllegalArgumentException("Table seating capacity is smaller than the requested persons count.");
        }

        // Check for conflicts
        List<TableBooking> conflicts = tableBookingRepository.findConflictingBookings(
                table.getRestaurantTableId(),
                dto.getBookingDate(),
                dto.getBookingTime(),
                dto.getBookingTime().plusHours(dto.getDurationHours() != null ? dto.getDurationHours() : 2));

        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Table is already booked for the specified time slot.");
        }

        TableBooking booking = new TableBooking();
        booking.setCustomer(customer);
        booking.setRestaurant(restaurant);
        booking.setTable(table);
        booking.setBookingDate(dto.getBookingDate());
        booking.setBookingTime(dto.getBookingTime());
        booking.setDurationHours(dto.getDurationHours() != null ? dto.getDurationHours() : 2);
        booking.setPersonsCount(dto.getPersonsCount());
        if (dto.getStatus() != null) {
            booking.setStatus(dto.getStatus());
        }

        if (dto.getOrderId() != null) {
            RestaurantOrder order = orderRepository.findById(dto.getOrderId()).orElse(null);
            booking.setOrder(order);
        }

        TableBooking saved = tableBookingRepository.save(booking);
        return mapToDto(saved);
    }

    @Override
    public TableBookingDto getBookingById(Integer id) {
        TableBooking booking = tableBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return mapToDto(booking);
    }

    @Override
    public List<TableBookingDto> getBookingsByCustomerId(Integer customerId) {
        return tableBookingRepository.findByCustomer_CustomerId(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TableBookingDto> getAllBookings() {
        return tableBookingRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TableBookingDto updateBooking(Integer id, TableBookingDto dto) {
        TableBooking existing = tableBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        // Note: For simplicity, updating table/time should validate conflicts again, but skipping complex update validation here
        if (dto.getPersonsCount() != null) existing.setPersonsCount(dto.getPersonsCount());
        if (dto.getStatus() != null) existing.setStatus(dto.getStatus());
        if (dto.getDurationHours() != null) existing.setDurationHours(dto.getDurationHours());

        if (dto.getOrderId() != null) {
            RestaurantOrder order = orderRepository.findById(dto.getOrderId()).orElse(null);
            existing.setOrder(order);
        }

        return mapToDto(tableBookingRepository.save(existing));
    }

    @Override
    @Transactional
    public TableBookingDto updateBookingStatus(Integer id, String status) {
        TableBooking booking = tableBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        
        String oldStatus = booking.getStatus();
        booking.setStatus(status);

        // Sync physical table status when status changes
        if (!status.equalsIgnoreCase(oldStatus)) {
            RestaurantTable table = booking.getTable();
            if (table != null) {
                switch (status.toLowerCase()) {
                    case "occupied" -> {
                        int newOccupied = table.getOccupiedSeats() + booking.getPersonsCount();
                        table.setOccupiedSeats(Math.min(newOccupied, table.getSeatingCapacity()));
                        updateTableStatus(table);
                        tableRepository.save(table);
                    }
                    case "completed", "cancelled" -> {
                        int released = table.getOccupiedSeats() - booking.getPersonsCount();
                        table.setOccupiedSeats(Math.max(released, 0));
                        updateTableStatus(table);
                        tableRepository.save(table);
                    }
                }
            }
        }

        return mapToDto(tableBookingRepository.save(booking));
    }

    @Override
    @Transactional
    public void deleteBooking(Integer id) {
        TableBooking booking = tableBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        // If the booking was occupied, release the seats before deleting
        if ("occupied".equalsIgnoreCase(booking.getStatus())) {
            RestaurantTable table = booking.getTable();
            if (table != null) {
                int released = table.getOccupiedSeats() - booking.getPersonsCount();
                table.setOccupiedSeats(Math.max(released, 0));
                updateTableStatus(table);
                tableRepository.save(table);
            }
        }

        tableBookingRepository.delete(booking);
    }

    @Override
    public boolean checkAvailability(Integer tableId, java.time.LocalDate bookingDate,
                                    java.time.LocalTime bookingTime, Integer durationHours) {
        int hours = (durationHours != null) ? durationHours : 2;
        java.time.LocalTime endTime = bookingTime.plusHours(hours);

        java.util.List<TableBooking> conflicts = tableBookingRepository
                .findConflictingBookings(tableId, bookingDate, bookingTime, endTime);

        return conflicts.isEmpty();
    }
}
