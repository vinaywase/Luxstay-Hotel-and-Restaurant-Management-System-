package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.dto.EventCostSummaryDto;
import com.hotel.restaurant.entity.*;
import com.hotel.restaurant.repository.*;
import com.hotel.restaurant.service.EventAddonService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventAddonServiceImpl implements EventAddonService {

    private final EventBookingRepository bookingRepository;
    private final EventServicePackageRepository packageRepository;
    private final EventBookingServiceRepository bookingServiceRepository;
    private final EventMenuSelectionRepository menuSelectionRepository;
    private final FoodItemRepository foodItemRepository;
    private final EventPaymentRepository paymentRepository;

    public EventAddonServiceImpl(EventBookingRepository bookingRepository,
                               EventServicePackageRepository packageRepository,
                               EventBookingServiceRepository bookingServiceRepository,
                               EventMenuSelectionRepository menuSelectionRepository,
                               FoodItemRepository foodItemRepository,
                               EventPaymentRepository paymentRepository) {
        this.bookingRepository = bookingRepository;
        this.packageRepository = packageRepository;
        this.bookingServiceRepository = bookingServiceRepository;
        this.menuSelectionRepository = menuSelectionRepository;
        this.foodItemRepository = foodItemRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    @Transactional
    public void addService(Integer bookingId, Integer packageId, Integer quantity) {
        EventBooking booking = bookingRepository.findById(bookingId).orElseThrow();
        EventServicePackage pkg = packageRepository.findById(packageId).orElseThrow();

        EventBookingService service = new EventBookingService();
        service.setEventBooking(booking);
        service.setServicePackage(pkg);
        service.setQuantity(quantity);
        service.setUnitPrice(pkg.getBasePrice());
        service.calculateTotalPrice();

        bookingServiceRepository.save(service);
        recalculateGrandTotal(booking);
    }

    @Override
    @Transactional
    public void removeService(Integer bookingId, Integer bookingServiceId) {
        EventBooking booking = bookingRepository.findById(bookingId).orElseThrow();
        bookingServiceRepository.deleteById(bookingServiceId);
        recalculateGrandTotal(booking);
    }

    @Override
    @Transactional
    public void addMenuSelection(Integer bookingId, Integer foodItemId, Integer quantity, String type) {
        EventBooking booking = bookingRepository.findById(bookingId).orElseThrow();
        FoodItem item = foodItemRepository.findById(foodItemId).orElseThrow();

        EventMenuSelection selection = new EventMenuSelection();
        selection.setEventBooking(booking);
        selection.setFoodItem(item);
        selection.setQuantity(quantity);
        selection.setItemType(EventMenuSelection.ItemType.valueOf(type));
        selection.setUnitPrice(item.getPrice());
        selection.calculateTotalPrice();

        menuSelectionRepository.save(selection);
        recalculateGrandTotal(booking);
    }

    @Override
    @Transactional
    public void removeMenuSelection(Integer bookingId, Integer menuSelectionId) {
        EventBooking booking = bookingRepository.findById(bookingId).orElseThrow();
        menuSelectionRepository.deleteById(menuSelectionId);
        recalculateGrandTotal(booking);
    }

    @Override
    @Transactional
    public void recalculateGrandTotal(EventBooking booking) {
        BigDecimal servicesTotal = bookingServiceRepository.findByEventBooking_BookingId(booking.getBookingId())
                .stream().map(EventBookingService::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal menuTotal = menuSelectionRepository.findByEventBooking_BookingId(booking.getBookingId())
                .stream().map(EventMenuSelection::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal venueCost = booking.getTotalCost() != null ? booking.getTotalCost() : BigDecimal.ZERO;
        
        BigDecimal grandTotal = venueCost.add(servicesTotal).add(menuTotal);
        booking.setGrandTotal(grandTotal);
        
        BigDecimal advancePaid = booking.getAdvancePaid() != null ? booking.getAdvancePaid() : BigDecimal.ZERO;
        booking.setBalanceDue(grandTotal.subtract(advancePaid));

        bookingRepository.save(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public EventCostSummaryDto getCostSummary(Integer bookingId) {
        EventBooking booking = bookingRepository.findById(bookingId).orElseThrow();
        List<EventBookingService> services = bookingServiceRepository.findByEventBooking_BookingId(bookingId);
        List<EventMenuSelection> menuSelections = menuSelectionRepository.findByEventBooking_BookingId(bookingId);
        List<EventPayment> payments = paymentRepository.findByEventBooking_BookingId(bookingId);

        EventCostSummaryDto dto = new EventCostSummaryDto();
        dto.setBookingId(bookingId);
        dto.setCustomerName(booking.getFullName());
        dto.setEventDate(booking.getEventDate().toString());
        dto.setEventTime(booking.getEventTime().toString());
        dto.setVenueName(booking.getVenuePreference());
        dto.setGuestCount(booking.getGuestCount());
        dto.setVenueBaseCost(booking.getTotalCost());
        dto.setGrandTotal(booking.getGrandTotal());
        dto.setAdvancePaid(booking.getAdvancePaid());
        dto.setBalanceDue(booking.getBalanceDue());
        dto.setBookingStatus(booking.getStatus());

        dto.setSelectedServices(services.stream().map(s -> {
            EventCostSummaryDto.ServiceItemDto item = new EventCostSummaryDto.ServiceItemDto();
            item.setServiceName(s.getServicePackage().getPackageName());
            item.setServiceType(s.getServicePackage().getServiceType().name());
            item.setPricingType(s.getServicePackage().getPricingType().name());
            item.setQuantity(s.getQuantity());
            item.setTotalPrice(s.getTotalPrice());
            return item;
        }).collect(Collectors.toList()));
        dto.setServicesTotal(services.stream().map(EventBookingService::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add));

        dto.setMenuItems(menuSelections.stream().map(m -> {
            EventCostSummaryDto.MenuItemDto item = new EventCostSummaryDto.MenuItemDto();
            item.setItemName(m.getFoodItem().getName());
            item.setItemType(m.getItemType().name());
            item.setQuantity(m.getQuantity());
            item.setUnitPrice(m.getUnitPrice());
            item.setTotalPrice(m.getTotalPrice());
            return item;
        }).collect(Collectors.toList()));
        dto.setCateringTotal(menuSelections.stream().map(EventMenuSelection::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add));

        dto.setPayments(payments.stream().map(p -> {
            EventCostSummaryDto.PaymentItemDto item = new EventCostSummaryDto.PaymentItemDto();
            item.setPaymentType(p.getPaymentType().name());
            item.setAmount(p.getAmount());
            item.setPaymentMethod(p.getPaymentMethod().name());
            item.setPaidAt(p.getPaidAt().toString());
            item.setStatus(p.getPaymentStatus().name());
            return item;
        }).collect(Collectors.toList()));

        return dto;
    }
}
