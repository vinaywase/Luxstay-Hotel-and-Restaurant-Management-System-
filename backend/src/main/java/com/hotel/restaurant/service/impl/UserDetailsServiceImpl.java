package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.entity.Customer;
import com.hotel.restaurant.entity.Staff;
import com.hotel.restaurant.repository.CustomerRepository;
import com.hotel.restaurant.repository.StaffRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final StaffRepository staffRepository;
    private final CustomerRepository customerRepository;

    public UserDetailsServiceImpl(StaffRepository staffRepository, CustomerRepository customerRepository) {
        this.staffRepository = staffRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try Staff first
        Staff staff = staffRepository.findByUsername(username).orElse(null);
        if (staff != null) {
            return new User(staff.getUsername(), staff.getPassword(), 
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + staff.getRole())));
        }

        // Try Customer
        Customer customer = customerRepository.findByUsername(username).orElse(null);
        if (customer != null) {
            return new User(customer.getUsername(), customer.getPassword(), 
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
        }

        throw new UsernameNotFoundException("User not found with username: " + username);
    }
}
