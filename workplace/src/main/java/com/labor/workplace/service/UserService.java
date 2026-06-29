
package com.labor.workplace.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;
import com.labor.workplace.entity.User;
import com.labor.workplace.entity.WorkerProfile;
import com.labor.workplace.entity.Booking;
import com.labor.workplace.repository.UserRepository;
import com.labor.workplace.repository.WorkerProfileRepository;
import com.labor.workplace.repository.BookingRepository;
import java.util.Optional;
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
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Registration for ADMIN role is prohibited.");
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

            existingUser.setEmail(updatedUser.getEmail());

            existingUser.setPhone(updatedUser.getPhone());

            existingUser.setPassword(updatedUser.getPassword());

            existingUser.setCity(updatedUser.getCity());

            existingUser.setDistrict(updatedUser.getDistrict());

            existingUser.setState(updatedUser.getState());

            existingUser.setRole(updatedUser.getRole());

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

    public boolean checkEmailExists(String email) {
        if (email == null) return false;
        Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
        return userOpt.isPresent();
    }

    public String getSecurityQuestion(String email) {
        if (email == null) return null;
        Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
        if (userOpt.isPresent()) {
            return userOpt.get().getPrivateQuestion();
        }
        return null;
    }

    public boolean resetPassword(String email, String securityAnswer, String newPassword) {
        if (email == null) throw new RuntimeException("Email is required");
        Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getSecurityAnswer() == null || !user.getSecurityAnswer().equalsIgnoreCase(securityAnswer.trim())) {
                throw new RuntimeException("Invalid security answer!");
            }
            user.setPassword(newPassword);
            userRepository.save(user);
            return true;
        }
        throw new RuntimeException("Email not found!");
    }

    @Transactional
    public String deleteUser(Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return "User not found";
        }

        // 1. If worker, delete worker profile & bookings
        if ("WORKER".equalsIgnoreCase(user.getRole())) {
            WorkerProfile profile = workerProfileRepository.findByUserUserId(id);
            if (profile != null) {
                List<Booking> bookings = bookingRepository.findByWorkerWorkerId(profile.getWorkerId());
                bookingRepository.deleteAll(bookings);
                workerProfileRepository.delete(profile);
            }
        } else if ("CUSTOMER".equalsIgnoreCase(user.getRole())) {
            // 2. If customer, delete customer bookings
            List<Booking> bookings = bookingRepository.findByCustomerUserId(id);
            bookingRepository.deleteAll(bookings);
        }

        // 3. Delete user
        userRepository.delete(user);
        return "User Deleted Successfully";
    }

    public LoginResponse login(
            LoginRequest request) {
        if (request.getEmail() == null) {
            throw new RuntimeException("Email is required");
        }
        String email = request.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User u = userOpt.get();
            if (!u.getPassword().equals(request.getPassword())) {
                throw new RuntimeException("Invalid Password");
            }
            return new LoginResponse(
                    u.getUserId(),
                    u.getName(),
                    u.getRole());
        }

        throw new RuntimeException("Email not registered");
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
                user.getRole());
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
            admin.setName("System Admin");
            admin.setEmail("adminworkplace@gmail.com");
            admin.setPhone("9999999999");
            admin.setPassword("admin123");
            admin.setCity("Chennai");
            admin.setDistrict("Chennai");
            admin.setState("Tamil Nadu");
            admin.setRole("ADMIN");
            admin.setPrivateQuestion("What city were you born in?");
            admin.setSecurityAnswer("Chennai");
            userRepository.save(admin);
            System.out.println("System Admin seeded successfully: adminworkplace@gmail.com / admin123");
        }
    }

    public void seedUsersAndWorkers(WorkerProfileRepository workerProfileRepository) {
        long nonAdminCount = userRepository.findAll().stream()
                .filter(u -> !"ADMIN".equalsIgnoreCase(u.getRole()))
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