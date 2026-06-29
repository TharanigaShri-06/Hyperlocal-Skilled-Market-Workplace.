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

        this.userId = userId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.city = city;
        this.district = district;
        this.state = state;
        this.role = role;
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
}