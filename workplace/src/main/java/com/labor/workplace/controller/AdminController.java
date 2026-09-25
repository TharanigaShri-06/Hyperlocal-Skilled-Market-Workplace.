package com.labor.workplace.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.labor.workplace.entity.Booking;
import com.labor.workplace.entity.User;
import com.labor.workplace.entity.WorkerProfile;
import com.labor.workplace.service.BookingService;
import com.labor.workplace.service.UserService;
import com.labor.workplace.service.WorkerProfileService;
import com.labor.workplace.dto.UserResponse;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final WorkerProfileService workerProfileService;
    private final BookingService bookingService;

    public AdminController(
            UserService userService,
            WorkerProfileService workerProfileService,
            BookingService bookingService) {

        this.userService = userService;
        this.workerProfileService = workerProfileService;
        this.bookingService = bookingService;
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUserResponses();
    }

    @GetMapping("/workers")
    public List<WorkerProfile> getAllWorkers() {
        return workerProfileService.getAllWorkers();
    }

    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    // --- SUPERADMIN ENDPOINTS ---

    @PostMapping("/create-admin")
    public User createAdmin(@RequestBody User admin) {
        return userService.saveAdmin(admin);
    }

    @PutMapping("/admins/{id}")
    public User updateAdmin(@PathVariable Long id, @RequestBody User admin) {
        return userService.updateUser(id, admin);
    }

    @DeleteMapping("/admins/{id}")
    public String deleteAdmin(@PathVariable Long id) {
        return userService.deleteUser(id);
    }

    @GetMapping("/admin-stats")
    public List<java.util.Map<String, Object>> getAdminStats() {
        return userService.getAdminStats();
    }

    // --- ADMIN DELEGATED USER MANAGEMENT ENDPOINTS ---

    @PostMapping("/register-user")
    public User registerUserByAdmin(@RequestBody User user, @RequestParam(required = false) String adminEmail) {
        return userService.saveUserByAdmin(user, adminEmail);
    }

    @GetMapping("/my-users")
    public List<UserResponse> getMyUsers(@RequestParam String adminEmail) {
        return userService.getUsersCreatedByAdmin(adminEmail);
    }

    @PutMapping("/users/{id}")
    public User updateUserByAdmin(@PathVariable Long id, @RequestBody User user, @RequestParam(required = false) String adminEmail) {
        return userService.updateUserByAdmin(id, user, adminEmail);
    }

    @DeleteMapping("/users/{id}")
    public String deleteUserByAdmin(@PathVariable Long id, @RequestParam(required = false) String adminEmail) {
        return userService.deleteUserByAdmin(id, adminEmail);
    }
}