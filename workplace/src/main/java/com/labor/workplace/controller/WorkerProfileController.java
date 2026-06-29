package com.labor.workplace.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.labor.workplace.entity.WorkerProfile;
import com.labor.workplace.service.WorkerProfileService;

@RestController
@RequestMapping("/workers")
public class WorkerProfileController {

    private final WorkerProfileService workerProfileService;

    public WorkerProfileController(
            WorkerProfileService workerProfileService) {

        this.workerProfileService = workerProfileService;
    }

    @PostMapping
    public WorkerProfile saveWorker(
            @RequestBody WorkerProfile workerProfile) {

        return workerProfileService
                .saveWorkerProfile(workerProfile);
    }

    @GetMapping
    public List<WorkerProfile> getAllWorkers() {

        return workerProfileService.getAllWorkers();
    }

    @GetMapping("/skill/{skill}")
    public List<WorkerProfile> getWorkersBySkill(
            @PathVariable String skill) {

        return workerProfileService.getWorkersBySkill(skill);
    }

    @GetMapping("/location/{location}")
    public List<WorkerProfile> getWorkersByLocation(
            @PathVariable String location) {

        return workerProfileService
                .getWorkersByLocation(location);
    }

    @GetMapping("/user/{userId}")
    public WorkerProfile getWorkerByUserId(
            @PathVariable Long userId) {

        return workerProfileService
                .getWorkerByUserId(userId);
    }

    @PutMapping("/{id}/availability")
    public WorkerProfile updateAvailability(
            @PathVariable Long id,
            @RequestParam String availability) {
        return workerProfileService.updateAvailability(id, availability);
    }
}