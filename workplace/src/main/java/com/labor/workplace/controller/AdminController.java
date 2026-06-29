package com.labor.workplace.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.labor.workplace.entity.Booking;
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
}