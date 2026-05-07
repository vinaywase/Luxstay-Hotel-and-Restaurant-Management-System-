package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.exception.ResourceNotFoundException;
import com.hotel.restaurant.dto.ServiceRequestDto;
import com.hotel.restaurant.entity.Customer;
import com.hotel.restaurant.entity.ServiceRequest;
import com.hotel.restaurant.entity.Staff;
import com.hotel.restaurant.repository.CustomerRepository;
import com.hotel.restaurant.repository.ServiceRequestRepository;
import com.hotel.restaurant.repository.StaffRepository;
import com.hotel.restaurant.entity.Reservation;
import com.hotel.restaurant.entity.Bill;
import com.hotel.restaurant.repository.ReservationRepository;
import com.hotel.restaurant.repository.BillRepository;
import com.hotel.restaurant.service.ServiceRequestService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceRequestServiceImpl implements ServiceRequestService {

    private final ServiceRequestRepository requestRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final ReservationRepository reservationRepository;
    private final BillRepository billRepository;

    public ServiceRequestServiceImpl(ServiceRequestRepository requestRepository,
            CustomerRepository customerRepository,
            StaffRepository staffRepository,
            ReservationRepository reservationRepository,
            BillRepository billRepository) {
        this.requestRepository = requestRepository;
        this.customerRepository = customerRepository;
        this.staffRepository = staffRepository;
        this.reservationRepository = reservationRepository;
        this.billRepository = billRepository;
    }

    private ServiceRequestDto mapToDto(ServiceRequest entity) {
        if (entity == null)
            return null;
        ServiceRequestDto dto = new ServiceRequestDto();
        dto.setServiceRequestId(entity.getServiceRequestId());
        if (entity.getCustomer() != null)
            dto.setCustomerId(entity.getCustomer().getCustomerId());
        if (entity.getStaff() != null)
            dto.setStaffId(entity.getStaff().getStaffId());
        dto.setRequestType(entity.getRequestType());
        dto.setRequestDate(entity.getRequestDate());
        dto.setStatus(entity.getStatus());
        dto.setCost(entity.getCost());
        if (entity.getBill() != null)
            dto.setBillId(entity.getBill().getBillId());
        return dto;
    }

    private ServiceRequest mapToEntity(ServiceRequestDto dto) {
        if (dto == null)
            return null;
        ServiceRequest entity = new ServiceRequest();
        entity.setRequestType(dto.getRequestType());
        entity.setRequestDate(dto.getRequestDate());
        if (dto.getStatus() != null)
            entity.setStatus(dto.getStatus());
        if (dto.getCost() != null)
            entity.setCost(dto.getCost());
        return entity;
    }

    @Override
    public List<ServiceRequestDto> getAllServiceRequests() {
        return requestRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public ServiceRequestDto getServiceRequestById(Integer id) {
        return requestRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found with id: " + id));
    }

    @Override
    @Transactional
    public ServiceRequestDto createServiceRequest(ServiceRequestDto dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Staff staff = null;
        if (dto.getStaffId() != null) {
            staff = staffRepository.findById(dto.getStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        }

        ServiceRequest req = mapToEntity(dto);
        req.setCustomer(customer);
        req.setStaff(staff);

        // LINK TO BILL
        Reservation activeRes = reservationRepository.findByCustomerAndStatus(customer, "checked-in")
                .orElse(null);
        if (activeRes != null) {
            Bill bill = billRepository.findByReservation(activeRes).orElse(null);
            if (bill == null) {
                bill = new Bill();
                bill.setReservation(activeRes);
                bill.setTotalAmount(activeRes.getTotalCost());
                bill.setBillDate(java.time.LocalDateTime.now());
                bill.setPaymentStatus("pending");
                bill = billRepository.save(bill);
            }
            req.setBill(bill);
        }

        req = requestRepository.save(req);
        return mapToDto(req);
    }

    @Override
    @Transactional
    public ServiceRequestDto updateServiceRequest(Integer id, ServiceRequestDto dto) {
        ServiceRequest existing = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found"));
        existing.setRequestType(dto.getRequestType());
        existing.setRequestDate(dto.getRequestDate());
        if (dto.getStatus() != null)
            existing.setStatus(dto.getStatus());
        existing = requestRepository.save(existing);
        return mapToDto(existing);
    }

    @Override
    @Transactional
    public void deleteServiceRequest(Integer id) {
        requestRepository.deleteById(id);
    }

    @Override
    public List<ServiceRequestDto> getServiceRequestsByCustomerId(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return requestRepository.findByCustomerAndBillIsNull(customer).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }
}
