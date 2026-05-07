package com.hotel.restaurant.repository;

import com.hotel.restaurant.entity.EventServicePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventServicePackageRepository extends JpaRepository<EventServicePackage, Integer> {
    List<EventServicePackage> findByIsActiveTrue();
    List<EventServicePackage> findByServiceType(EventServicePackage.ServiceType serviceType);
}
