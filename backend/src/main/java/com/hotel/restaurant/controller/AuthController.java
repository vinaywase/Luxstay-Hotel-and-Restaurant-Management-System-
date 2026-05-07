package com.hotel.restaurant.controller;

import com.hotel.restaurant.dto.AuthResponse;
import com.hotel.restaurant.dto.LoginRequest;
import com.hotel.restaurant.entity.Staff;
import com.hotel.restaurant.entity.Customer;
import com.hotel.restaurant.repository.StaffRepository;
import com.hotel.restaurant.repository.CustomerRepository;
import com.hotel.restaurant.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Staff staff = staffRepository.findByUsername(loginRequest.getUsername()).orElse(null);
        if (staff != null && staff.getPassword().equals(loginRequest.getPassword())) {
            String token = jwtUtil.generateToken(staff.getUsername(), staff.getRole());
            return ResponseEntity.ok(new AuthResponse(token, staff.getRole(), null, staff.getStaffId(), staff.getFirstName()));
        }

        // Try searching in Customer table
        Customer customer = customerRepository.findByUsername(loginRequest.getUsername()).orElse(null);
        if (customer != null && customer.getPassword().equals(loginRequest.getPassword())) {
            String token = jwtUtil.generateToken(customer.getUsername(), "CUSTOMER");
            return ResponseEntity.ok(new AuthResponse(token, "CUSTOMER", customer.getCustomerId(), null, customer.getFirstName()));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Staff user) {
        if (staffRepository.findByUsername(user.getUsername()).isPresent() || customerRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (customerRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Email already in use");
        }
        
        // Create corresponding Customer record
        Customer customer = new Customer();
        if (user.getFullName() != null && user.getFullName().contains(" ")) {
            int spaceIdx = user.getFullName().lastIndexOf(' ');
            customer.setFirstName(user.getFullName().substring(0, spaceIdx));
            customer.setLastName(user.getFullName().substring(spaceIdx + 1));
        } else {
            customer.setFirstName(user.getFullName() != null ? user.getFullName() : "Unknown");
            customer.setLastName("");
        }
        customer.setEmail(user.getEmail());
        customer.setPhoneNumber(user.getMobileNumber() != null ? user.getMobileNumber() : "0000000000");
        customer.setAddress(user.getAddress());
        customer.setUsername(user.getUsername());
        customer.setPassword(user.getPassword()); // In a real app, hash this!
        customerRepository.save(customer);
        
        return ResponseEntity.ok("User registered successfully");
    }
}
