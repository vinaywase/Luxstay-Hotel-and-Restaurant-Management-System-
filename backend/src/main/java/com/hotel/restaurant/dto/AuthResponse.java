package com.hotel.restaurant.dto;

public class AuthResponse {
    private String token;
    private String role;
    private Integer customerId;
    private Integer staffId;
    private String name;

    public AuthResponse() {}

    public AuthResponse(String token, String role, Integer customerId, Integer staffId, String name) {
        this.token = token;
        this.role = role;
        this.customerId = customerId;
        this.staffId = staffId;
        this.name = name;
    }

    public AuthResponse(String token, String role) {
        this.token = token;
        this.role = role;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Integer getCustomerId() { return customerId; }
    public void setCustomerId(Integer customerId) { this.customerId = customerId; }
    public Integer getStaffId() { return staffId; }
    public void setStaffId(Integer staffId) { this.staffId = staffId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
