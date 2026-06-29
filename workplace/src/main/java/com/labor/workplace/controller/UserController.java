package com.labor.workplace.controller;

import java.util.List;
import com.labor.workplace.dto.LoginRequest;
import com.labor.workplace.dto.LoginResponse;
import com.labor.workplace.dto.UserResponse;

import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.labor.workplace.entity.User;

import com.labor.workplace.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public User saveUser(@Valid @RequestBody User user) {
        return userService.saveUser(user);
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUserResponses();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {

        User user = userService.getUserById(id);

        return userService.convertToResponse(user);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id,
            @Valid @RequestBody User user) {
        return userService.updateUser(id, user);
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        return userService.deleteUser(id);
    }

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request) {

        return userService.login(request);
    }

    @GetMapping("/check-email")
    public boolean checkEmail(@RequestParam String email) {
        return userService.checkEmailExists(email);
    }

    @GetMapping("/security-question")
    public java.util.Map<String, String> getSecurityQuestion(@RequestParam String email) {
        String question = userService.getSecurityQuestion(email);
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("question", question);
        response.put("exists", question != null ? "true" : "false");
        return response;
    }

    @PostMapping("/reset-password")
    public org.springframework.http.ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> payload) {
        String email = payload.get("email");
        String securityAnswer = payload.get("securityAnswer");
        String newPassword = payload.get("newPassword");

        userService.resetPassword(email, securityAnswer, newPassword);
        return org.springframework.http.ResponseEntity.ok(java.util.Collections.singletonMap("message", "Password reset successful"));
    }
}