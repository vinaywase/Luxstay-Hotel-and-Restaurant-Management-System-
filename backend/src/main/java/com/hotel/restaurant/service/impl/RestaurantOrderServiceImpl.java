package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.exception.ResourceNotFoundException;
import com.hotel.restaurant.dto.RestaurantOrderDto;
import com.hotel.restaurant.entity.Customer;
import com.hotel.restaurant.entity.RestaurantOrder;
import com.hotel.restaurant.entity.RestaurantTable;
import com.hotel.restaurant.entity.Staff;
import com.hotel.restaurant.entity.Bill;
import com.hotel.restaurant.entity.FoodItem;
import com.hotel.restaurant.entity.Reservation;
import com.hotel.restaurant.repository.CustomerRepository;
import com.hotel.restaurant.repository.RestaurantOrderRepository;
import com.hotel.restaurant.repository.RestaurantTableRepository;
import com.hotel.restaurant.repository.StaffRepository;
import com.hotel.restaurant.repository.BillRepository;
import com.hotel.restaurant.repository.ReservationRepository;
import com.hotel.restaurant.repository.FoodItemRepository;
import com.hotel.restaurant.repository.ServiceRequestRepository;
import com.hotel.restaurant.service.RestaurantOrderService;
import com.hotel.restaurant.service.RestaurantTableService;
import com.hotel.restaurant.service.TableBookingService;
import com.hotel.restaurant.service.InventoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RestaurantOrderServiceImpl implements RestaurantOrderService {

    private final RestaurantOrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final RestaurantTableRepository tableRepository;
    private final RestaurantTableService tableService;
    private final InventoryService inventoryService;
    private final FoodItemRepository foodItemRepository;
    private final ReservationRepository reservationRepository;
    private final BillRepository billRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final TableBookingService tableBookingService;

    public RestaurantOrderServiceImpl(RestaurantOrderRepository orderRepository,
            CustomerRepository customerRepository,
            StaffRepository staffRepository,
            RestaurantTableRepository tableRepository,
            RestaurantTableService tableService,
            InventoryService inventoryService,
            FoodItemRepository foodItemRepository,
            ReservationRepository reservationRepository,
            BillRepository billRepository,
            ServiceRequestRepository serviceRequestRepository,
            TableBookingService tableBookingService) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.staffRepository = staffRepository;
        this.tableRepository = tableRepository;
        this.tableService = tableService;
        this.inventoryService = inventoryService;
        this.foodItemRepository = foodItemRepository;
        this.reservationRepository = reservationRepository;
        this.billRepository = billRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.tableBookingService = tableBookingService;
    }

    private RestaurantOrderDto mapToDto(RestaurantOrder entity) {
        if (entity == null)
            return null;
        RestaurantOrderDto dto = new RestaurantOrderDto();
        dto.setRestaurantOrderId(entity.getRestaurantOrderId());
        if (entity.getCustomer() != null)
            dto.setCustomerId(entity.getCustomer().getCustomerId());
        if (entity.getStaff() != null)
            dto.setStaffId(entity.getStaff().getStaffId());
        if (entity.getRestaurantTable() != null)
            dto.setRestaurantTableId(entity.getRestaurantTable().getRestaurantTableId());
        dto.setOrderDate(entity.getOrderDate());
        dto.setTotalCost(entity.getTotalCost());
        dto.setStatus(entity.getStatus());
        dto.setDiningLocation(entity.getDiningLocation());
        if (entity.getFoodItems() != null) {
            dto.setFoodItemIds(
                    entity.getFoodItems().stream().map(FoodItem::getFoodItemId).collect(Collectors.toList()));
        }
        if (entity.getBill() != null) {
            dto.setBillId(entity.getBill().getBillId());
        }
        return dto;
    }

    private RestaurantOrder mapToEntity(RestaurantOrderDto dto) {
        if (dto == null)
            return null;
        RestaurantOrder entity = new RestaurantOrder();
        entity.setOrderDate(dto.getOrderDate());
        entity.setTotalCost(dto.getTotalCost());
        if (dto.getStatus() != null)
            entity.setStatus(dto.getStatus());
        if (dto.getDiningLocation() != null)
            entity.setDiningLocation(dto.getDiningLocation());
        return entity;
    }

    @Override
    public List<RestaurantOrderDto> getAllOrders() {
        return orderRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public RestaurantOrderDto getOrderById(Integer id) {
        return orderRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Restaurant order not found with id: " + id));
    }

    @Override
    @Transactional
    public RestaurantOrderDto createOrder(RestaurantOrderDto dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Staff staff = null;
        if (dto.getStaffId() != null) {
            staff = staffRepository.findById(dto.getStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        }

        RestaurantTable table = null;
        if (dto.getRestaurantTableId() != null) {
            table = tableRepository.findById(dto.getRestaurantTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant table not found"));
        }

        RestaurantOrder order = mapToEntity(dto);
        order.setCustomer(customer);
        order.setStaff(staff);
        order.setRestaurantTable(table);

        if (dto.getFoodItemIds() != null && !dto.getFoodItemIds().isEmpty()) {
            List<FoodItem> items = foodItemRepository.findAllById(dto.getFoodItemIds());
            order.setFoodItems(items);

            for (Integer foodItemId : dto.getFoodItemIds()) {
                inventoryService.deductInventory(foodItemId, 1);
            }
        }

        order = orderRepository.save(order);

        Reservation activeRes = reservationRepository.findByCustomerAndStatus(customer, "checked-in")
                .orElse(null);

        Bill bill = null;
        if (activeRes != null) {
            bill = billRepository.findByReservation(activeRes).orElse(null);
            if (bill == null) {
                bill = new Bill();
                bill.setReservation(activeRes);
                bill.setTotalAmount(activeRes.getTotalCost());
                bill.setBillDate(java.time.LocalDateTime.now());
                bill.setPaymentStatus("pending");
                bill = billRepository.save(bill);
            }
        } else {
            bill = new Bill();
            bill.setTotalAmount(order.getTotalCost());
            bill.setBillDate(java.time.LocalDateTime.now());
            bill.setPaymentStatus("pending");
            bill = billRepository.save(bill);
        }

        order.setBill(bill);
        order = orderRepository.save(order);

        if ("cafeteria".equalsIgnoreCase(dto.getDiningLocation()) && dto.getRestaurantTableId() != null) {
            if (dto.getTableBookingId() != null) {
                tableBookingService.updateBookingStatus(dto.getTableBookingId(), "occupied");
                com.hotel.restaurant.dto.TableBookingDto bookingDto = new com.hotel.restaurant.dto.TableBookingDto();
                bookingDto.setOrderId(order.getRestaurantOrderId());
                tableBookingService.updateBooking(dto.getTableBookingId(), bookingDto);
            } else {
                tableService.occupySeat(dto.getRestaurantTableId());
            }
        }

        return mapToDto(order);
    }

    @Override
    @Transactional
    public RestaurantOrderDto updateOrder(Integer id, RestaurantOrderDto dto) {
        RestaurantOrder existing = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant order not found"));
        existing.setStatus(dto.getStatus() != null ? dto.getStatus() : existing.getStatus());
        existing = orderRepository.save(existing);
        return mapToDto(existing);
    }

    @Override
    @Transactional
    public RestaurantOrderDto updateOrderStatus(Integer id, String status) {
        RestaurantOrder existing = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant order not found with id: " + id));

        String oldStatus = existing.getStatus();
        existing.setStatus(status);
        existing = orderRepository.save(existing);

        if ("completed".equalsIgnoreCase(status) && !"completed".equalsIgnoreCase(oldStatus)) {
            if ("cafeteria".equalsIgnoreCase(existing.getDiningLocation())) {
                if (existing.getTableBooking() != null) {
                    tableService.updateBookingStatus(existing.getTableBooking().getBookingId(), "completed");
                } else if (existing.getRestaurantTable() != null) {
                    tableService.releaseSeat(existing.getRestaurantTable().getRestaurantTableId());
                }
            }
        }

        return mapToDto(existing);
    }

    @Override
    @Transactional
    public void deleteOrder(Integer id) {
        RestaurantOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant order not found with id: " + id));

        // Step 1: Clear food items associations
        order.getFoodItems().clear();
        orderRepository.save(order);

        // Step 2: Unlink from Bill and check for orphaned bill
        if (order.getBill() != null) {
            Bill bill = order.getBill();
            Integer billId = bill.getBillId();

            // SET bill_id = NULL in this order (Unlink)
            order.setBill(null);
            orderRepository.save(order);

            // Check if this bill is now orphaned (using direct repository counts)
            long otherOrdersCount = orderRepository.countByBill_BillId(billId);
            long otherServicesCount = serviceRequestRepository.countByBill_BillId(billId);
            
            // Reload bill to check for Reservation/Event (fresh state)
            Bill currentBill = billRepository.findById(billId).orElse(null);
            if (currentBill != null) {
                boolean hasReservation = currentBill.getReservation() != null;
                // boolean hasEvent = currentBill.getEvent() != null; // REMOVED

                if (otherOrdersCount == 0 && otherServicesCount == 0 && !hasReservation) {
                    // Safe to delete orphaned bill
                    billRepository.delete(currentBill);
                } else {
                    // Just deduct order cost from shared bill
                    if (currentBill.getTotalAmount() != null && order.getTotalCost() != null) {
                        currentBill.setTotalAmount(currentBill.getTotalAmount().subtract(order.getTotalCost()));
                        billRepository.save(currentBill);
                    }
                }
            }
        }

        // Step 3: Physical table seat release
        if ("cafeteria".equalsIgnoreCase(order.getDiningLocation()) && order.getRestaurantTable() != null) {
            tableService.releaseSeat(order.getRestaurantTable().getRestaurantTableId());
        }

        // Step 4: Delete the order
        orderRepository.delete(order);
    }

    @Override
    public List<RestaurantOrderDto> getOrdersByCustomerId(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return orderRepository.findByCustomer(customer).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }
}