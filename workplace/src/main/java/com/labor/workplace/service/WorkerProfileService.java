package com.labor.workplace.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.labor.workplace.entity.WorkerProfile;
import com.labor.workplace.entity.User;
import com.labor.workplace.repository.WorkerProfileRepository;
import com.labor.workplace.repository.UserRepository;

@Service
public class WorkerProfileService {

    private final WorkerProfileRepository workerProfileRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public WorkerProfileService(
            WorkerProfileRepository workerProfileRepository,
            UserRepository userRepository,
            EmailService emailService) {
        this.workerProfileRepository = workerProfileRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public WorkerProfile saveWorkerProfile(WorkerProfile workerProfile) {
        if (workerProfile.getRating() <= 0) {
            workerProfile.setRating(3.0);
        }
        // Resolve full User details from database
        if (workerProfile.getUser() != null && workerProfile.getUser().getUserId() != null) {
            User user = userRepository.findById(workerProfile.getUser().getUserId()).orElse(null);
            workerProfile.setUser(user);
        }

        WorkerProfile savedProfile = workerProfileRepository.save(workerProfile);

        if (savedProfile.getUser() != null) {
            String email = savedProfile.getUser().getEmail();
            String name = savedProfile.getUser().getName();
            if (email != null && !email.trim().isEmpty()) {
                String subject = "Welcome to SkillLocal!";
                String body = "Hello " + name + ",\n\n"
                        + "Welcome to SkillLocal! Your Worker Profile is now active. "
                        + "You will receive real-time job and booking proposals directly in your inbox.\n\n"
                        + "Best regards,\n"
                        + "The SkillLocal Team";
                emailService.sendEmail(email, subject, body);
            }
        }

        return savedProfile;
    }

    public List<WorkerProfile> getAllWorkers() {
        return workerProfileRepository.findAll();
    }

    public List<WorkerProfile> getWorkersBySkill(String skill) {
        return workerProfileRepository.findBySkill(skill);
    }

    public List<WorkerProfile> getWorkersByLocation(String location) {
        return workerProfileRepository.findByLocation(location);
    }

    public WorkerProfile getWorkerByUserId(Long userId) {
        return workerProfileRepository.findByUserUserId(userId);
    }

    public WorkerProfile updateAvailability(Long id, String availability) {
        WorkerProfile worker = workerProfileRepository.findById(id).orElse(null);
        if (worker != null) {
            worker.setAvailability(availability.toUpperCase());
            return workerProfileRepository.save(worker);
        }
        return null;
    }
}