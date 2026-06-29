package com.labor.workplace.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.labor.workplace.entity.WorkerProfile;

public interface WorkerProfileRepository
        extends JpaRepository<WorkerProfile, Long> {
    List<WorkerProfile> findBySkill(String skill);

    List<WorkerProfile> findByLocation(String location);

    WorkerProfile findByUserUserId(Long userId);
}