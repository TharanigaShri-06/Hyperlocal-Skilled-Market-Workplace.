package com.labor.workplace.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.labor.workplace.entity.Booking;
import com.labor.workplace.service.BookingService;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public Booking saveBooking(@RequestBody Booking booking) {
        return bookingService.saveBooking(booking);
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PutMapping("/{id}/accept")
    public Booking acceptBooking(
            @PathVariable Long id) {

        return bookingService.acceptBooking(id);
    }

    @PutMapping("/{id}/reject")
    public Booking rejectBooking(
            @PathVariable Long id) {

        return bookingService.rejectBooking(id);
    }

    @GetMapping("/worker/{workerId}")
    public List<Booking> getBookingsByWorker(
            @PathVariable Long workerId) {

        return bookingService.getBookingsByWorker(workerId);
    }

    @GetMapping("/customer/{userId}")
    public List<Booking> getBookingsByCustomer(
            @PathVariable Long userId) {

        return bookingService.getBookingsByCustomer(userId);
    }

    @PutMapping("/{id}/rate")
    public Booking rateBooking(
            @PathVariable Long id,
            @RequestParam double rating) {

        return bookingService.rateBooking(id, rating);
    }

}