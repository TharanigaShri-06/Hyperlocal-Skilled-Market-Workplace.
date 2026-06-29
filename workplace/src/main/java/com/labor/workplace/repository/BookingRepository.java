package com.labor.workplace.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.labor.workplace.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByWorkerWorkerId(Long workerId);

    List<Booking> findByCustomerUserId(Long userId);
}