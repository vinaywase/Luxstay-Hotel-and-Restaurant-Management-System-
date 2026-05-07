package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.ServiceRequestDto;
import java.util.List;

public interface ServiceRequestService {
    List<ServiceRequestDto> getAllServiceRequests();
    ServiceRequestDto getServiceRequestById(Integer id);
    ServiceRequestDto createServiceRequest(ServiceRequestDto dto);
    ServiceRequestDto updateServiceRequest(Integer id, ServiceRequestDto dto);
    void deleteServiceRequest(Integer id);
    List<ServiceRequestDto> getServiceRequestsByCustomerId(Integer customerId);
}
