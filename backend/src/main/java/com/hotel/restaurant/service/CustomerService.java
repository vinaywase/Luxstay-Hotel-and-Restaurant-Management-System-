package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.CustomerDto;
import java.util.List;

public interface CustomerService {
    List<CustomerDto> getAllCustomers();
    CustomerDto getCustomerById(Integer id);
    CustomerDto createCustomer(CustomerDto customerDto);
    CustomerDto updateCustomer(Integer id, CustomerDto customerDto);
    void deleteCustomer(Integer id);
}
