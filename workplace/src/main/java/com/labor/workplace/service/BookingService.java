package com.labor.workplace.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.labor.workplace.entity.Booking;
import com.labor.workplace.entity.User;
import com.labor.workplace.entity.WorkerProfile;
import com.labor.workplace.repository.BookingRepository;
import com.labor.workplace.repository.UserRepository;
import com.labor.workplace.repository.WorkerProfileRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final EmailService emailService;

    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            WorkerProfileRepository workerProfileRepository,
            EmailService emailService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.emailService = emailService;
    }

    public Booking saveBooking(Booking booking) {
        booking.setStatus("PENDING");
        if (booking.getCustomer() != null && booking.getCustomer().getUserId() != null) {
            User customer = userRepository.findById(booking.getCustomer().getUserId()).orElse(null);
            booking.setCustomer(customer);
        }
        if (booking.getWorker() != null && booking.getWorker().getWorkerId() != null) {
            WorkerProfile worker = workerProfileRepository.findById(booking.getWorker().getWorkerId()).orElse(null);
            booking.setWorker(worker);
        }

        Booking savedBooking = bookingRepository.save(booking);

        if (savedBooking.getWorker() != null && savedBooking.getWorker().getUser() != null) {
            String workerEmail = savedBooking.getWorker().getUser().getEmail();
            String workerName = savedBooking.getWorker().getUser().getName();
            String customerName = savedBooking.getCustomer() != null ? savedBooking.getCustomer().getName() : "Customer";
            String customerEmail = savedBooking.getCustomer() != null ? savedBooking.getCustomer().getEmail() : null;
            String customerPhone = savedBooking.getCustomer() != null ? savedBooking.getCustomer().getPhone() : "N/A";
            String date = savedBooking.getBookingDate() != null ? savedBooking.getBookingDate().toString() : "N/A";
            String desc = savedBooking.getWorkDescription();

            if (workerEmail != null && !workerEmail.trim().isEmpty()) {
                String subject = "New Booking Request - " + customerName;
                String body = "Hello " + workerName + ",\n\n"
                        + "I would like to book your services on SkillLocal!\n\n"
                        + "Here are my details and the job description:\n"
                        + "- My Name: " + customerName + "\n"
                        + "- My Phone: " + customerPhone + "\n"
                        + "- My Email: " + (customerEmail != null ? customerEmail : "N/A") + "\n"
                        + "- Scheduled Date: " + date + "\n\n"
                        + "Job Description:\n"
                        + "\"" + desc + "\"\n\n"
                        + "Please log in to your SkillLocal Dashboard to accept or reject this request.\n\n"
                        + "Best regards,\n"
                        + customerName + " (via SkillLocal)";
                emailService.sendEmail(workerEmail, customerEmail, customerName, customerEmail, subject, body);
            }
        }

        return savedBooking;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking acceptBooking(Long id) {
        Booking booking = bookingRepository.findById(id).orElse(null);

        if (booking != null) {
            booking.setStatus("ACCEPTED");
            Booking savedBooking = bookingRepository.save(booking);

            if (savedBooking.getWorker() != null && savedBooking.getWorker().getUser() != null) {
                String workerEmail = savedBooking.getWorker().getUser().getEmail();
                String workerName = savedBooking.getWorker().getUser().getName();
                String customerName = savedBooking.getCustomer() != null ? savedBooking.getCustomer().getName() : "Customer";
                String customerEmail = savedBooking.getCustomer() != null ? savedBooking.getCustomer().getEmail() : null;
                String desc = savedBooking.getWorkDescription();

                if (customerEmail != null && !customerEmail.trim().isEmpty()) {
                    String subject = "Booking Accepted - " + workerName;
                    String body = "Hello " + customerName + ",\n\n"
                            + "I have accepted your booking proposal on SkillLocal for the following job:\n"
                            + "\"" + desc + "\"\n\n"
                            + "I will be available on the scheduled date. Please coordinate with me at your convenience.\n"
                            + "My Phone: " + (savedBooking.getWorker().getUser().getPhone() != null ? savedBooking.getWorker().getUser().getPhone() : "N/A") + "\n"
                            + "My Email: " + workerEmail + "\n\n"
                            + "Best regards,\n"
                            + workerName + " (via SkillLocal)";
                    emailService.sendEmail(customerEmail, workerEmail, workerName, workerEmail, subject, body);
                }
            }

            return savedBooking;
        }

        return null;
    }

    public Booking rejectBooking(Long id) {
        Booking booking = bookingRepository.findById(id).orElse(null);

        if (booking != null) {
            booking.setStatus("REJECTED");
            Booking savedBooking = bookingRepository.save(booking);

            if (savedBooking.getWorker() != null && savedBooking.getWorker().getUser() != null) {
                String workerEmail = savedBooking.getWorker().getUser().getEmail();
                String workerName = savedBooking.getWorker().getUser().getName();
                String customerName = savedBooking.getCustomer() != null ? savedBooking.getCustomer().getName() : "Customer";
                String customerEmail = savedBooking.getCustomer() != null ? savedBooking.getCustomer().getEmail() : null;
                String desc = savedBooking.getWorkDescription();

                if (customerEmail != null && !customerEmail.trim().isEmpty()) {
                    String subject = "Booking Declined - " + workerName;
                    String body = "Hello " + customerName + ",\n\n"
                            + "I am writing to let you know that I have declined your booking proposal on SkillLocal for the following job:\n"
                            + "\"" + desc + "\"\n\n"
                            + "I apologize for any inconvenience caused. You can search for other available workers on the SkillLocal Dashboard.\n\n"
                            + "Best regards,\n"
                            + workerName + " (via SkillLocal)";
                    emailService.sendEmail(customerEmail, workerEmail, workerName, workerEmail, subject, body);
                }
            }

            return savedBooking;
        }

        return null;
    }

    public List<Booking> getBookingsByWorker(Long workerId) {
        return bookingRepository.findByWorkerWorkerId(workerId);
    }

    public List<Booking> getBookingsByCustomer(Long userId) {
        return bookingRepository.findByCustomerUserId(userId);
    }

    public Booking rateBooking(Long id, double rating) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking != null && "ACCEPTED".equalsIgnoreCase(booking.getStatus())) {
            booking.setRating(rating);
            Booking savedBooking = bookingRepository.saveAndFlush(booking);

            WorkerProfile worker = booking.getWorker();
            if (worker != null) {
                List<Booking> workerBookings = bookingRepository.findByWorkerWorkerId(worker.getWorkerId());
                double sum = 0;
                int count = 0;
                for (Booking b : workerBookings) {
                    Double r = b.getRating();
                    if (b.getBookingId().equals(booking.getBookingId())) {
                        r = rating;
                    }
                    if (r != null && r > 0) {
                        sum += r;
                        count++;
                    }
                }
                double averageRating = count > 0 ? sum / count : 5.0;
                worker.setRating(averageRating);
                workerProfileRepository.saveAndFlush(worker);
            }
            return savedBooking;
        }
        return null;
    }
}