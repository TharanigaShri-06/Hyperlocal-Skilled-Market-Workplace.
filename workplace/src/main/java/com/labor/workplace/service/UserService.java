package com.labor.workplace.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.labor.workplace.entity.User;
import com.labor.workplace.entity.WorkerProfile;
import com.labor.workplace.entity.Booking;
import com.labor.workplace.repository.UserRepository;
import com.labor.workplace.repository.WorkerProfileRepository;
import com.labor.workplace.repository.BookingRepository;
import com.labor.workplace.dto.UserResponse;
import com.labor.workplace.dto.LoginRequest;
import com.labor.workplace.dto.LoginResponse;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final BookingRepository bookingRepository;

    public UserService(
            UserRepository userRepository,
            WorkerProfileRepository workerProfileRepository,
            BookingRepository bookingRepository) {
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.bookingRepository = bookingRepository;
    }

    public User saveUser(User user) {
        if ("ADMIN".equalsIgnoreCase(user.getRole()) || "SUPERADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Registration for ADMIN or SUPERADMIN role is prohibited.");
        }
        if (user.getPhone() == null || !user.getPhone().matches("^\\d{10}$")) {
            throw new RuntimeException("Phone number must contain exactly 10 digits");
        }
        if (user.getEmail() != null) {
            user.setEmail(user.getEmail().trim().toLowerCase());
        }
        Optional<User> existing = userRepository.findByEmail(user.getEmail());
        if (existing.isPresent()) {
            throw new RuntimeException("Email is already registered!");
        }
        return userRepository.save(user);
    }

    public User saveAdmin(User admin) {
        admin.setRole("ADMIN");
        if (admin.getPhone() == null || !admin.getPhone().matches("^\\d{10}$")) {
            throw new RuntimeException("Phone number must contain exactly 10 digits");
        }
        if (admin.getEmail() != null) {
            admin.setEmail(admin.getEmail().trim().toLowerCase());
        }
        if (admin.getPrivateQuestion() == null || admin.getPrivateQuestion().trim().isEmpty()) {
            admin.setPrivateQuestion("What city were you born in?");
        }
        if (admin.getSecurityAnswer() == null || admin.getSecurityAnswer().trim().isEmpty()) {
            admin.setSecurityAnswer(admin.getCity() != null ? admin.getCity() : "Admin");
        }
        Optional<User> existing = userRepository.findByEmail(admin.getEmail());
        if (existing.isPresent()) {
            throw new RuntimeException("Email is already registered!");
        }
        return userRepository.save(admin);
    }

    public User saveUserByAdmin(User user, String adminEmail) {
        if ("ADMIN".equalsIgnoreCase(user.getRole()) || "SUPERADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Only WORKER or CUSTOMER users can be registered by Admin.");
        }
        if (user.getPhone() == null || !user.getPhone().matches("^\\d{10}$")) {
            throw new RuntimeException("Phone number must contain exactly 10 digits");
        }

        String cleanAdminEmail = adminEmail != null ? adminEmail.trim().toLowerCase() : null;

        if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
            user.setEmail(user.getEmail().trim().toLowerCase());
        } else if (cleanAdminEmail != null) {
            user.setEmail(cleanAdminEmail);
        } else {
            throw new RuntimeException("Email is required");
        }

        user.setCreatedByAdminEmail(cleanAdminEmail);

        if (cleanAdminEmail != null) {
            Optional<User> adminOpt = userRepository.findAll().stream()
                    .filter(u -> u.getEmail() != null && u.getEmail().trim().equalsIgnoreCase(cleanAdminEmail) &&
                            ("ADMIN".equalsIgnoreCase(u.getRole()) || "SUPERADMIN".equalsIgnoreCase(u.getRole())))
                    .findFirst();
            if (adminOpt.isPresent()) {
                User admin = adminOpt.get();
                user.setCreatedByAdminId(admin.getUserId());
                user.setCreatedByAdminName(admin.getName());
            }
        }

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User updateUser(Long id, User updatedUser) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser != null) {
            if (updatedUser.getPhone() == null || !updatedUser.getPhone().matches("^\\d{10}$")) {
                throw new RuntimeException("Phone number must contain exactly 10 digits");
            }
            existingUser.setName(updatedUser.getName());
            existingUser.setEmail(updatedUser.getEmail() != null ? updatedUser.getEmail().trim().toLowerCase() : existingUser.getEmail());
            existingUser.setPhone(updatedUser.getPhone());
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().trim().isEmpty()) {
                existingUser.setPassword(updatedUser.getPassword());
            }
            existingUser.setCity(updatedUser.getCity());
            existingUser.setDistrict(updatedUser.getDistrict());
            existingUser.setState(updatedUser.getState());
            if (updatedUser.getRole() != null) {
                existingUser.setRole(updatedUser.getRole());
            }
            if (updatedUser.getPrivateQuestion() != null) {
                existingUser.setPrivateQuestion(updatedUser.getPrivateQuestion());
            }
            if (updatedUser.getSecurityAnswer() != null) {
                existingUser.setSecurityAnswer(updatedUser.getSecurityAnswer());
            }
            return userRepository.save(existingUser);
        }
        return null;
    }

    public User updateUserByAdmin(Long id, User updatedUser, String adminEmail) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser != null) {
            if (adminEmail != null && existingUser.getCreatedByAdminEmail() != null
                    && !existingUser.getCreatedByAdminEmail().equalsIgnoreCase(adminEmail.trim())) {
                throw new RuntimeException("Unauthorized: You can only update users registered by your email ID.");
            }
            return updateUser(id, updatedUser);
        }
        return null;
    }

    public boolean checkEmailExists(String email) {
        if (email == null) return false;
        String clean = email.trim().toLowerCase();
        return userRepository.findAll().stream().anyMatch(u -> u.getEmail() != null && clean.equalsIgnoreCase(u.getEmail().trim()));
    }

    public String getSecurityQuestion(String email) {
        if (email == null) return null;
        String clean = email.trim().toLowerCase();
        return userRepository.findAll().stream()
                .filter(u -> u.getEmail() != null && clean.equalsIgnoreCase(u.getEmail().trim()))
                .map(User::getPrivateQuestion)
                .filter(q -> q != null && !q.trim().isEmpty())
                .findFirst()
                .orElse(null);
    }

    public boolean resetPassword(String email, String securityAnswer, String newPassword) {
        if (email == null) throw new RuntimeException("Email is required");
        String clean = email.trim().toLowerCase();
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getEmail() != null && clean.equalsIgnoreCase(u.getEmail().trim()))
                .collect(Collectors.toList());

        if (!users.isEmpty()) {
            boolean updatedAny = false;
            for (User u : users) {
                if (u.getSecurityAnswer() != null && u.getSecurityAnswer().trim().equalsIgnoreCase(securityAnswer.trim())) {
                    u.setPassword(newPassword);
                    userRepository.save(u);
                    updatedAny = true;
                }
            }
            if (updatedAny) return true;
            throw new RuntimeException("Invalid security answer!");
        }
        throw new RuntimeException("Email not found!");
    }

    @Transactional
    public String deleteUser(Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return "User not found";
        }

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            String adminEmail = user.getEmail() != null ? user.getEmail().trim().toLowerCase() : "";
            Long adminId = user.getUserId();

            // Find all user accounts associated with this admin email/id (managed workers, worker profiles with admin email, customers)
            List<User> managedUsers = userRepository.findAll().stream()
                    .filter(u -> !u.getUserId().equals(adminId) && (
                            (u.getCreatedByAdminEmail() != null && u.getCreatedByAdminEmail().trim().equalsIgnoreCase(adminEmail)) ||
                            (u.getCreatedByAdminId() != null && u.getCreatedByAdminId().equals(adminId)) ||
                            (u.getEmail() != null && u.getEmail().trim().equalsIgnoreCase(adminEmail))
                    ))
                    .collect(Collectors.toList());

            for (User managedUser : managedUsers) {
                WorkerProfile profile = workerProfileRepository.findByUserUserId(managedUser.getUserId());
                if (profile != null) {
                    List<Booking> bookings = bookingRepository.findByWorkerWorkerId(profile.getWorkerId());
                    if (!bookings.isEmpty()) {
                        bookingRepository.deleteAll(bookings);
                    }
                    workerProfileRepository.delete(profile);
                }
                List<Booking> customerBookings = bookingRepository.findByCustomerUserId(managedUser.getUserId());
                if (!customerBookings.isEmpty()) {
                    bookingRepository.deleteAll(customerBookings);
                }
                userRepository.delete(managedUser);
            }

            // Clean up any remaining worker profiles or bookings associated with this admin or matching adminEmail
            List<WorkerProfile> orphanProfiles = workerProfileRepository.findAll().stream()
                    .filter(wp -> wp.getUser() == null || wp.getUser().getUserId().equals(adminId) ||
                            (wp.getUser().getEmail() != null && wp.getUser().getEmail().trim().equalsIgnoreCase(adminEmail)) ||
                            (wp.getUser().getCreatedByAdminEmail() != null && wp.getUser().getCreatedByAdminEmail().trim().equalsIgnoreCase(adminEmail)) ||
                            (wp.getUser().getCreatedByAdminId() != null && wp.getUser().getCreatedByAdminId().equals(adminId)))
                    .collect(Collectors.toList());

            for (WorkerProfile wp : orphanProfiles) {
                List<Booking> bookings = bookingRepository.findByWorkerWorkerId(wp.getWorkerId());
                if (!bookings.isEmpty()) {
                    bookingRepository.deleteAll(bookings);
                }
                workerProfileRepository.delete(wp);
            }

            List<Booking> adminCustomerBookings = bookingRepository.findByCustomerUserId(adminId);
            if (!adminCustomerBookings.isEmpty()) {
                bookingRepository.deleteAll(adminCustomerBookings);
            }
        } else if ("WORKER".equalsIgnoreCase(user.getRole())) {
            WorkerProfile profile = workerProfileRepository.findByUserUserId(id);
            if (profile != null) {
                List<Booking> bookings = bookingRepository.findByWorkerWorkerId(profile.getWorkerId());
                if (!bookings.isEmpty()) {
                    bookingRepository.deleteAll(bookings);
                }
                workerProfileRepository.delete(profile);
            }
        } else if ("CUSTOMER".equalsIgnoreCase(user.getRole())) {
            List<Booking> bookings = bookingRepository.findByCustomerUserId(id);
            if (!bookings.isEmpty()) {
                bookingRepository.deleteAll(bookings);
            }
        }

        userRepository.delete(user);
        return "User Deleted Successfully";
    }

    @Transactional
    public String deleteUserByAdmin(Long id, String adminEmail) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser == null) {
            return "User not found";
        }
        if (adminEmail != null && !adminEmail.trim().isEmpty()) {
            String cleanAdminEmail = adminEmail.trim().toLowerCase();
            String createdBy = existingUser.getCreatedByAdminEmail() != null ? existingUser.getCreatedByAdminEmail().trim().toLowerCase() : "";
            String userEmail = existingUser.getEmail() != null ? existingUser.getEmail().trim().toLowerCase() : "";

            boolean isCreatedByEmailMatch = createdBy.equalsIgnoreCase(cleanAdminEmail);
            boolean isUserEmailMatch = userEmail.equalsIgnoreCase(cleanAdminEmail);
            boolean isCreatedByIdMatch = false;

            if (existingUser.getCreatedByAdminId() != null) {
                Optional<User> adminOpt = userRepository.findById(existingUser.getCreatedByAdminId());
                if (adminOpt.isPresent() && adminOpt.get().getEmail() != null
                        && adminOpt.get().getEmail().trim().equalsIgnoreCase(cleanAdminEmail)) {
                    isCreatedByIdMatch = true;
                }
            }

            if (!isCreatedByEmailMatch && !isUserEmailMatch && !isCreatedByIdMatch) {
                throw new RuntimeException("Unauthorized: You can only delete worker accounts created under your admin email ID.");
            }
        }
        return deleteUser(id);
    }

    public LoginResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new RuntimeException("Password is required");
        }
        String cleanEmail = request.getEmail().trim().toLowerCase();

        List<User> matchingUsers = userRepository.findAll().stream()
                .filter(u -> cleanEmail.equalsIgnoreCase(u.getEmail() != null ? u.getEmail().trim() : ""))
                .collect(Collectors.toList());

        if (!matchingUsers.isEmpty()) {
            User user = matchingUsers.stream()
                    .filter(u -> "SUPERADMIN".equalsIgnoreCase(u.getRole()) || "ADMIN".equalsIgnoreCase(u.getRole()))
                    .findFirst()
                    .orElse(matchingUsers.get(0));

            if (!user.getPassword().equals(request.getPassword())) {
                throw new RuntimeException("Invalid Password");
            }
            return new LoginResponse(
                    user.getUserId(),
                    user.getName(),
                    user.getRole(),
                    user.getEmail());
        }

        throw new RuntimeException("Email not registered");
    }

    public List<UserResponse> getUsersCreatedByAdmin(String adminEmail) {
        if (adminEmail == null || adminEmail.trim().isEmpty()) return List.of();
        String cleanEmail = adminEmail.trim().toLowerCase();

        Long adminId = userRepository.findAll().stream()
                .filter(u -> u.getEmail() != null && u.getEmail().trim().equalsIgnoreCase(cleanEmail) &&
                        ("ADMIN".equalsIgnoreCase(u.getRole()) || "SUPERADMIN".equalsIgnoreCase(u.getRole())))
                .map(User::getUserId)
                .findFirst()
                .orElse(null);

        return userRepository.findAll().stream()
                .filter(u -> (
                        (u.getCreatedByAdminEmail() != null && u.getCreatedByAdminEmail().trim().equalsIgnoreCase(cleanEmail)) ||
                        (u.getEmail() != null && u.getEmail().trim().equalsIgnoreCase(cleanEmail)) ||
                        (adminId != null && u.getCreatedByAdminId() != null && u.getCreatedByAdminId().equals(adminId))
                ))
                .filter(u -> !"SUPERADMIN".equalsIgnoreCase(u.getRole()) && !(adminId != null && u.getUserId().equals(adminId)))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse convertToResponse(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getCity(),
                user.getDistrict(),
                user.getState(),
                user.getRole(),
                user.getCreatedByAdminEmail(),
                user.getCreatedByAdminId(),
                user.getCreatedByAdminName());
    }

    public List<UserResponse> getAllUserResponses() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public void seedAdmin() {
        Optional<User> adminOpt = userRepository.findByEmail("adminworkplace@gmail.com");
        if (adminOpt.isEmpty()) {
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail("adminworkplace@gmail.com");
            admin.setPhone("9999999999");
            admin.setPassword("admin123");
            admin.setCity("Chennai");
            admin.setDistrict("Chennai");
            admin.setState("Tamil Nadu");
            admin.setRole("SUPERADMIN");
            admin.setPrivateQuestion("What city were you born in?");
            admin.setSecurityAnswer("Chennai");
            userRepository.save(admin);
            System.out.println("Super Admin seeded successfully: adminworkplace@gmail.com / admin123");
        } else {
            User admin = adminOpt.get();
            if (!"SUPERADMIN".equalsIgnoreCase(admin.getRole())) {
                admin.setRole("SUPERADMIN");
                userRepository.save(admin);
                System.out.println("Updated existing system admin to SUPERADMIN: adminworkplace@gmail.com");
            }
        }
    }

    public List<java.util.Map<String, Object>> getAdminStats() {
        List<User> admins = userRepository.findByRole("ADMIN");
        List<java.util.Map<String, Object>> statsList = new java.util.ArrayList<>();

        for (User admin : admins) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("adminId", admin.getUserId());
            map.put("name", admin.getName());
            map.put("email", admin.getEmail());
            map.put("phone", admin.getPhone());
            map.put("city", admin.getCity());
            map.put("district", admin.getDistrict());
            map.put("state", admin.getState());

            List<User> createdUsers = userRepository.findByCreatedByAdminEmail(admin.getEmail().toLowerCase());
            List<WorkerProfile> registeredWorkers = new java.util.ArrayList<>();
            for (User u : createdUsers) {
                if ("WORKER".equalsIgnoreCase(u.getRole())) {
                    WorkerProfile wp = workerProfileRepository.findByUserUserId(u.getUserId());
                    if (wp != null) {
                        registeredWorkers.add(wp);
                    }
                }
            }

            map.put("registeredWorkerCount", registeredWorkers.size());
            map.put("registeredWorkers", registeredWorkers);
            map.put("totalUsersCount", createdUsers.size());

            statsList.add(map);
        }
        return statsList;
    }

    public void seedUsersAndWorkers(WorkerProfileRepository workerProfileRepository) {
        long nonAdminCount = userRepository.findAll().stream()
                .filter(u -> !"ADMIN".equalsIgnoreCase(u.getRole()) && !"SUPERADMIN".equalsIgnoreCase(u.getRole()))
                .count();

        if (nonAdminCount == 0) {
            // Seed Customers
            User c1 = new User(null, "Ramesh Kumar", "ramesh@gmail.com", "9876543210", "Ramesh@123", "Coimbatore", "Coimbatore", "Tamil Nadu", "CUSTOMER", "What was the name of your first pet?", "Tommy");
            User c2 = new User(null, "Priya Sharma", "priya@gmail.com", "9876543211", "Priya@123", "Pune", "Pune", "Maharashtra", "CUSTOMER", "What city were you born in?", "Pune");
            User c3 = new User(null, "Anitha Murthy", "anitha@gmail.com", "9876543212", "Anitha@123", "Bengaluru", "Bengaluru", "Karnataka", "CUSTOMER", "What is your mother's maiden name?", "Murthy");
            User c4 = new User(null, "Kavitha Rajan", "kavitha@gmail.com", "9876543213", "Kavitha@123", "Kochi", "Ernakulam", "Kerala", "CUSTOMER", "What was the name of your high school?", "Model School");

            userRepository.save(c1);
            userRepository.save(c2);
            userRepository.save(c3);
            userRepository.save(c4);

            // Seed Workers
            User w1 = new User(null, "Suresh Thangam", "suresh@gmail.com", "8765432100", "Suresh@123", "Coimbatore", "Coimbatore", "Tamil Nadu", "WORKER", "What city were you born in?", "Coimbatore");
            User w2 = new User(null, "Arun Kumar", "arun@gmail.com", "8765432101", "Arun@123", "Pune", "Pune", "Maharashtra", "WORKER", "What city were you born in?", "Pune");
            User w3 = new User(null, "Lakshmi Prasad", "lakshmi@gmail.com", "8765432102", "Lakshmi@123", "Bengaluru", "Bengaluru", "Karnataka", "WORKER", "What city were you born in?", "Bengaluru");
            User w4 = new User(null, "Manoj Singh", "manoj@gmail.com", "8765432103", "Manoj@123", "Kochi", "Ernakulam", "Kerala", "WORKER", "What city were you born in?", "Kochi");
            User w5 = new User(null, "Selvi Ramasamy", "selvi@gmail.com", "8765432104", "Selvi@123", "Coimbatore", "Coimbatore", "Tamil Nadu", "WORKER", "What city were you born in?", "Coimbatore");
            User w6 = new User(null, "Deepak Mehta", "deepak@gmail.com", "8765432105", "Deepak@123", "Visakhapatnam", "Visakhapatnam", "Andhra Pradesh", "WORKER", "What city were you born in?", "Visakhapatnam");

            userRepository.save(w1);
            userRepository.save(w2);
            userRepository.save(w3);
            userRepository.save(w4);
            userRepository.save(w5);
            userRepository.save(w6);

            // Profiles
            WorkerProfile p1 = new WorkerProfile();
            p1.setUser(w1);
            p1.setSkill("Plumber");
            p1.setExperience(7);
            p1.setLocation("Coimbatore");
            p1.setAvailability("AVAILABLE");
            p1.setRating(4.8);
            workerProfileRepository.save(p1);

            WorkerProfile p2 = new WorkerProfile();
            p2.setUser(w2);
            p2.setSkill("Electrician");
            p2.setExperience(5);
            p2.setLocation("Pune");
            p2.setAvailability("AVAILABLE");
            p2.setRating(4.5);
            workerProfileRepository.save(p2);

            WorkerProfile p3 = new WorkerProfile();
            p3.setUser(w3);
            p3.setSkill("Carpenter");
            p3.setExperience(9);
            p3.setLocation("Bengaluru");
            p3.setAvailability("AVAILABLE");
            p3.setRating(4.9);
            workerProfileRepository.save(p3);

            WorkerProfile p4 = new WorkerProfile();
            p4.setUser(w4);
            p4.setSkill("AC Technician");
            p4.setExperience(6);
            p4.setLocation("Kochi");
            p4.setAvailability("AVAILABLE");
            p4.setRating(4.2);
            workerProfileRepository.save(p4);

            WorkerProfile p5 = new WorkerProfile();
            p5.setUser(w5);
            p5.setSkill("Painter");
            p5.setExperience(12);
            p5.setLocation("Coimbatore");
            p5.setAvailability("AVAILABLE");
            p5.setRating(5.0);
            workerProfileRepository.save(p5);

            WorkerProfile p6 = new WorkerProfile();
            p6.setUser(w6);
            p6.setSkill("Electrician");
            p6.setExperience(4);
            p6.setLocation("Visakhapatnam");
            p6.setAvailability("AVAILABLE");
            p6.setRating(4.6);
            workerProfileRepository.save(p6);

            System.out.println("Customer and Worker profiles seeded successfully!");
        }
    }
}