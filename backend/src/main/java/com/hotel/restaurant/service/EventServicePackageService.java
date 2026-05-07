package com.hotel.restaurant.service;

import com.hotel.restaurant.entity.EventServicePackage;
import java.util.List;

public interface EventServicePackageService {
    EventServicePackage savePackage(EventServicePackage pkg);
    List<EventServicePackage> getAllPackages();
    void deactivatePackage(Integer id);
}
