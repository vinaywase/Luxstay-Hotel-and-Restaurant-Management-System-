package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.exception.ResourceNotFoundException;
import com.hotel.restaurant.dto.CustomerDto;
import com.hotel.restaurant.entity.Customer;
import com.hotel.restaurant.repository.CustomerRepository;
import com.hotel.restaurant.service.CustomerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    private CustomerDto mapToDto(Customer entity) {
        if (entity == null) return null;
        CustomerDto dto = new CustomerDto();
        dto.setCustomerId(entity.getCustomerId());
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setEmail(entity.getEmail());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setAddress(entity.getAddress());
        dto.setLoyaltyPoints(entity.getLoyaltyPoints());
        dto.setRegistrationDate(entity.getRegistrationDate());
        return dto;
    }

    private Customer mapToEntity(CustomerDto dto) {
        if (dto == null) return null;
        Customer entity = new Customer();
        entity.setFirstName(dto.getFirstName());
        entity.setLastName(dto.getLastName());
        entity.setEmail(dto.getEmail());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setAddress(dto.getAddress());
        if (dto.getLoyaltyPoints() != null) entity.setLoyaltyPoints(dto.getLoyaltyPoints());
        if (dto.getRegistrationDate() != null) entity.setRegistrationDate(dto.getRegistrationDate());
        return entity;
    }

    @Override
    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public CustomerDto getCustomerById(Integer id) {
        return customerRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    @Override
    @Transactional
    public CustomerDto createCustomer(CustomerDto customerDto) {
        if (customerRepository.existsByEmail(customerDto.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        Customer customer = mapToEntity(customerDto);
        customer = customerRepository.save(customer);
        return mapToDto(customer);
    }

    @Override
    @Transactional
    public CustomerDto updateCustomer(Integer id, CustomerDto customerDto) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // Name & Address update
        existing.setFirstName(customerDto.getFirstName());
        existing.setLastName(customerDto.getLastName());
        existing.setAddress(customerDto.getAddress());

        // Phone Number update
        existing.setPhoneNumber(customerDto.getPhoneNumber());

        // Email update - duplicate check
        if (!existing.getEmail().equals(customerDto.getEmail())) {
            if (customerRepository.existsByEmail(customerDto.getEmail())) {
                throw new IllegalArgumentException("Email already in use");
            }
            existing.setEmail(customerDto.getEmail());
        }

        // Loyalty Points update
        if (customerDto.getLoyaltyPoints() != null) {
            existing.setLoyaltyPoints(customerDto.getLoyaltyPoints());
        }

        existing = customerRepository.save(existing);
        return mapToDto(existing);
    }

    @Override
    @Transactional
    public void deleteCustomer(Integer id) {
        customerRepository.deleteById(id);
    }
}