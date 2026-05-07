package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.exception.ResourceNotFoundException;
import com.hotel.restaurant.dto.BillDto;
import com.hotel.restaurant.entity.Bill;
import com.hotel.restaurant.entity.Reservation;
import com.hotel.restaurant.entity.RestaurantOrder;
import com.hotel.restaurant.repository.BillRepository;
import com.hotel.restaurant.repository.ReservationRepository;
import com.hotel.restaurant.repository.RestaurantOrderRepository;
import com.hotel.restaurant.repository.ServiceRequestRepository;
import com.hotel.restaurant.repository.CustomerRepository;
import com.hotel.restaurant.service.BillService;
import com.hotel.restaurant.entity.ServiceRequest;
import com.hotel.restaurant.entity.Customer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@Service
public class BillServiceImpl implements BillService {

    private final BillRepository billRepository;
    private final ReservationRepository reservationRepository;
    private final RestaurantOrderRepository orderRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final CustomerRepository customerRepository;

    public BillServiceImpl(BillRepository billRepository,
            ReservationRepository reservationRepository,
            RestaurantOrderRepository orderRepository,
            ServiceRequestRepository serviceRequestRepository,
            CustomerRepository customerRepository) {
        this.billRepository = billRepository;
        this.reservationRepository = reservationRepository;
        this.orderRepository = orderRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.customerRepository = customerRepository;
    }

    private BillDto mapToDto(Bill entity) {
        if (entity == null)
            return null;
        BillDto dto = new BillDto();
        dto.setBillId(entity.getBillId());
        if (entity.getCustomer() != null) {
            dto.setCustomerId(entity.getCustomer().getCustomerId());
            dto.setCustomerName(entity.getCustomer().getFirstName() + " " + entity.getCustomer().getLastName());
        }
        dto.setServiceType(entity.getServiceType());
        dto.setBookingId(entity.getBookingId());
        dto.setOrderId(entity.getOrderId());
        dto.setServiceRequestId(entity.getServiceRequestId());
        dto.setEventBookingId(entity.getEventBookingId());

        if (entity.getReservation() != null)
            dto.setReservationId(entity.getReservation().getReservationId());

        if (entity.getOrders() != null) {
            dto.setRestaurantOrderIds(entity.getOrders().stream()
                    .map(RestaurantOrder::getRestaurantOrderId).collect(Collectors.toList()));
        }

        if (entity.getServiceRequests() != null) {
            dto.setServiceRequestIds(entity.getServiceRequests().stream()
                    .map(ServiceRequest::getServiceRequestId).collect(Collectors.toList()));
        }

        dto.setTotalAmount(entity.getTotalAmount());
        dto.setBillDate(entity.getBillDate());
        dto.setPaymentStatus(entity.getPaymentStatus());
        return dto;
    }

    private Bill mapToEntity(BillDto dto) {
        if (dto == null)
            return null;
        Bill entity = new Bill();
        entity.setTotalAmount(dto.getTotalAmount());
        entity.setServiceType(dto.getServiceType());
        entity.setBookingId(dto.getBookingId());
        entity.setOrderId(dto.getOrderId());
        entity.setServiceRequestId(dto.getServiceRequestId());
        entity.setEventBookingId(dto.getEventBookingId());
        if (dto.getBillDate() != null)
            entity.setBillDate(dto.getBillDate());
        if (dto.getPaymentStatus() != null)
            entity.setPaymentStatus(dto.getPaymentStatus());
        return entity;
    }

    @Override
    public List<BillDto> getAllBills() {
        return billRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public BillDto getBillById(Integer id) {
        return billRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + id));
    }

    @Override
    @Transactional
    public BillDto createBill(BillDto dto) {
        Bill bill = mapToEntity(dto);

        if (dto.getReservationId() != null) {
            Reservation res = reservationRepository.findById(dto.getReservationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));
            bill.setReservation(res);
        }

        if (dto.getRestaurantOrderIds() != null && !dto.getRestaurantOrderIds().isEmpty()) {
            List<RestaurantOrder> orders = orderRepository.findAllById(dto.getRestaurantOrderIds());
            bill.setOrders(orders);
            orders.forEach(o -> o.setBill(bill));
        }

        if (dto.getServiceRequestIds() != null && !dto.getServiceRequestIds().isEmpty()) {
            List<ServiceRequest> services = serviceRequestRepository.findAllById(dto.getServiceRequestIds());
            bill.setServiceRequests(services);
            services.forEach(s -> s.setBill(bill));
        }


        Bill savedBill = billRepository.save(bill);
        return mapToDto(savedBill);
    }

    @Override
    @Transactional
    public BillDto updateBill(Integer id, BillDto dto) {
        Bill existing = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
        existing.setTotalAmount(dto.getTotalAmount());
        if (dto.getPaymentStatus() != null)
            existing.setPaymentStatus(dto.getPaymentStatus());
        if (dto.getBillDate() != null)
            existing.setBillDate(dto.getBillDate());
        existing = billRepository.save(existing);
        return mapToDto(existing);
    }

    @Override
    @Transactional
    public void deleteBill(Integer id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + id));

        // Step 1: Unlink all orders from this bill (set bill_id = NULL)
        List<RestaurantOrder> orders = orderRepository.findByBill_BillId(id);
        if (orders != null && !orders.isEmpty()) {
            for (RestaurantOrder order : orders) {
                order.setBill(null);
            }
            orderRepository.saveAll(orders);
        }

        // Step 2: Unlink all service requests from this bill (set bill_id = NULL)
        List<ServiceRequest> services = serviceRequestRepository.findByBill_BillId(id);
        if (services != null && !services.isEmpty()) {
            for (ServiceRequest sr : services) {
                sr.setBill(null);
            }
            serviceRequestRepository.saveAll(services);
        }

        // Step 3: Now safely delete the bill
        billRepository.delete(bill);
    }

    @Override
    @Transactional
    public BillDto generateCompleteBill(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Bill bill = new Bill();
        bill.setCustomer(customer);
        BigDecimal total = BigDecimal.ZERO;

        Reservation res = reservationRepository.findByCustomerAndStatus(customer, "checked-in")
                .orElse(null);
        if (res != null) {
            bill.setReservation(res);
            total = total.add(res.getTotalCost());
        }

        List<RestaurantOrder> orders = orderRepository.findByCustomerAndBillIsNull(customer);
        for (RestaurantOrder order : orders) {
            total = total.add(order.getTotalCost());
        }

        List<ServiceRequest> services = serviceRequestRepository.findByCustomerAndBillIsNull(customer);
        for (ServiceRequest service : services) {
            total = total.add(service.getCost());
        }


        bill.setTotalAmount(total);
        bill.setBillDate(java.time.LocalDateTime.now());
        bill.setPaymentStatus("pending");

        Bill savedBill = billRepository.save(bill);

        for (RestaurantOrder order : orders) {
            order.setBill(savedBill);
        }
        for (ServiceRequest service : services) {
            service.setBill(savedBill);
        }
        savedBill.setOrders(orders);
        savedBill.setServiceRequests(services);

        orderRepository.saveAll(orders);
        serviceRequestRepository.saveAll(services);

        return mapToDto(savedBill);
    }

    @Override
    @Transactional
    public BillDto generateBillForService(Integer customerId, String serviceType, Integer referenceId,
            BigDecimal amount) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Bill bill = new Bill();
        bill.setCustomer(customer);
        bill.setServiceType(serviceType);
        bill.setTotalAmount(amount);
        bill.setBillDate(java.time.LocalDateTime.now());
        bill.setPaymentStatus("paid");

        if ("Room".equalsIgnoreCase(serviceType)) {
            bill.setBookingId(referenceId);
            reservationRepository.findById(referenceId).ifPresent(bill::setReservation);
        } else if ("Order".equalsIgnoreCase(serviceType)) {
            bill.setOrderId(referenceId);
            final Bill finalBillForOrder = bill;
            orderRepository.findById(referenceId).ifPresent(o -> {
                finalBillForOrder.setOrders(List.of(o));
                o.setBill(finalBillForOrder);
                orderRepository.save(o);
            });
        } else if ("Service".equalsIgnoreCase(serviceType)) {
            bill.setServiceRequestId(referenceId);
            final Bill finalBillForService = bill;
            serviceRequestRepository.findById(referenceId).ifPresent(s -> {
                finalBillForService.setServiceRequests(List.of(s));
                s.setBill(finalBillForService);
                serviceRequestRepository.save(s);
            });
        } else if ("Event".equalsIgnoreCase(serviceType)) {
            bill.setEventBookingId(referenceId);
        }

        Bill savedBill = billRepository.save(bill);
        return mapToDto(savedBill);
    }

    @Override
    public List<BillDto> getBillsByCustomerId(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return billRepository.findByCustomer(customer).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getBillReceipt(Integer billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + billId));

        Map<String, Object> receipt = new LinkedHashMap<>();
        receipt.put("billId", bill.getBillId());

        if (bill.getCustomer() != null) {
            receipt.put("customerName", bill.getCustomer().getFirstName() + " " + bill.getCustomer().getLastName());
        }

        receipt.put("serviceType", bill.getServiceType());
        receipt.put("totalAmount", bill.getTotalAmount());
        receipt.put("billDate", bill.getBillDate());
        receipt.put("paymentStatus", bill.getPaymentStatus());

        if (bill.getBookingId() != null)
            receipt.put("referenceId", "BOOK-" + bill.getBookingId());
        else if (bill.getOrderId() != null)
            receipt.put("referenceId", "ORD-" + bill.getOrderId());
        else if (bill.getServiceRequestId() != null)
            receipt.put("referenceId", "SVC-" + bill.getServiceRequestId());
        else if (bill.getEventBookingId() != null)
            receipt.put("referenceId", "EVT-" + bill.getEventBookingId());
        else
            receipt.put("referenceId", null);

        return receipt;
    }
}