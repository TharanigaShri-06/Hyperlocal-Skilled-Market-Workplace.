package com.labor.workplace.dto;

public class LoginResponse {

    private Long userId;
    private String name;
    private String role;
    private String email;

    public LoginResponse() {
    }

    public LoginResponse(
            Long userId,
            String name,
            String role,
            String email) {

        this.userId = userId;
        this.name = name;
        this.role = role;
        this.email = email;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }

    public String getEmail() {
        return email;
    }
}