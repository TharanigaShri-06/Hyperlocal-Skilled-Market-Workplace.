package com.labor.workplace.dto;

public class UserResponse {

    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String city;
    private String district;
    private String state;
    private String role;
    private String createdByAdminEmail;
    private Long createdByAdminId;
    private String createdByAdminName;

    public UserResponse() {
    }

    public UserResponse(Long userId,
            String name,
            String email,
            String phone,
            String city,
            String district,
            String state,
            String role) {
        this(userId, name, email, phone, city, district, state, role, null, null, null);
    }

    public UserResponse(Long userId,
            String name,
            String email,
            String phone,
            String city,
            String district,
            String state,
            String role,
            String createdByAdminEmail) {
        this(userId, name, email, phone, city, district, state, role, createdByAdminEmail, null, null);
    }

    public UserResponse(Long userId,
            String name,
            String email,
            String phone,
            String city,
            String district,
            String state,
            String role,
            String createdByAdminEmail,
            Long createdByAdminId,
            String createdByAdminName) {

        this.userId = userId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.city = city;
        this.district = district;
        this.state = state;
        this.role = role;
        this.createdByAdminEmail = createdByAdminEmail;
        this.createdByAdminId = createdByAdminId;
        this.createdByAdminName = createdByAdminName;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getCity() {
        return city;
    }

    public String getDistrict() {
        return district;
    }

    public String getState() {
        return state;
    }

    public String getPhone() {
        return phone;
    }

    public String getRole() {
        return role;
    }

    public String getCreatedByAdminEmail() {
        return createdByAdminEmail;
    }

    public Long getCreatedByAdminId() {
        return createdByAdminId;
    }

    public String getCreatedByAdminName() {
        return createdByAdminName;
    }
}