package com.hotel.restaurant.service;

import com.hotel.restaurant.dto.EventCostSummaryDto;
import com.hotel.restaurant.entity.EventBooking;



public interface EventAddonService {
    void addService(Integer bookingId, Integer packageId, Integer quantity);
    void removeService(Integer bookingId, Integer bookingServiceId);
    void addMenuSelection(Integer bookingId, Integer foodItemId, Integer quantity, String type);
    void removeMenuSelection(Integer bookingId, Integer menuSelectionId);
    void recalculateGrandTotal(EventBooking booking);
    EventCostSummaryDto getCostSummary(Integer bookingId);
}
