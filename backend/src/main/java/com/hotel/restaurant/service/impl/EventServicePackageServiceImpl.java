package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.entity.EventServicePackage;
import com.hotel.restaurant.repository.EventServicePackageRepository;
import com.hotel.restaurant.service.EventServicePackageService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EventServicePackageServiceImpl implements EventServicePackageService {

    private final EventServicePackageRepository repository;

    public EventServicePackageServiceImpl(EventServicePackageRepository repository) {
        this.repository = repository;
    }

    @Override
    public EventServicePackage savePackage(EventServicePackage pkg) {
        return repository.save(pkg);
    }

    @Override
    public List<EventServicePackage> getAllPackages() {
        return repository.findAll();
    }

    @Override
    public void deactivatePackage(Integer id) {
        EventServicePackage pkg = repository.findById(id).orElseThrow();
        pkg.setIsActive(false);
        repository.save(pkg);
    }
}
