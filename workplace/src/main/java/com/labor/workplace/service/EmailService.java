package com.labor.workplace.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:tharanigashric06@gmail.com}")
    private String officialSenderEmail;

    public EmailService() {
    }

    public void sendEmail(String recipientEmail, String subject, String body) {
        sendEmail(recipientEmail, null, null, null, subject, body);
    }

    public void sendEmail(String recipientEmail, String replyToEmail, String subject, String body) {
        sendEmail(recipientEmail, replyToEmail, null, replyToEmail, subject, body);
    }

    @Async
    public void sendEmail(String recipientEmail, String fromEmail, String fromName, String replyToEmail, String subject, String body) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                // Log to console for local monitoring & debugging
                System.out.println("==================================================");
                System.out.println("[REAL EMAIL NOTIFICATION DISPATCH]");
                System.out.println("Official Sender (From): " + officialSenderEmail);
                System.out.println("Recipient (To): " + recipientEmail);
                if (fromName != null || fromEmail != null) {
                    System.out.println("On Behalf Of: " + (fromName != null ? fromName : "") + " <" + (fromEmail != null ? fromEmail : "") + ">");
                }
                if (replyToEmail != null && !replyToEmail.trim().isEmpty()) {
                    System.out.println("Reply-To: " + replyToEmail);
                }
                System.out.println("Subject: " + subject);
                System.out.println("Body:\n" + body);
                System.out.println("==================================================");

                if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
                    System.err.println("[EMAIL WARNING] Recipient email address is missing. Skipping SMTP dispatch.");
                    return;
                }

                if (mailSender != null) {
                    SimpleMailMessage message = new SimpleMailMessage();
                    
                    String cleanTo = recipientEmail.trim();
                    message.setTo(cleanTo);

                    String cleanFrom = officialSenderEmail != null ? officialSenderEmail.trim() : null;
                    if (cleanFrom != null && cleanFrom.contains("@")) {
                        if (cleanFrom.indexOf("@") != cleanFrom.lastIndexOf("@")) {
                            cleanFrom = cleanFrom.substring(0, cleanFrom.lastIndexOf("@")).trim();
                        }
                        message.setFrom(cleanFrom);
                    }

                    if (replyToEmail != null && !replyToEmail.trim().isEmpty() && replyToEmail.contains("@")) {
                        String cleanReplyTo = replyToEmail.trim();
                        if (cleanReplyTo.contains("<") && cleanReplyTo.contains(">")) {
                            cleanReplyTo = cleanReplyTo.substring(cleanReplyTo.indexOf("<") + 1, cleanReplyTo.indexOf(">")).trim();
                        }
                        message.setReplyTo(cleanReplyTo);
                    }

                    message.setSubject(subject != null ? subject : "SkillLocal Marketplace Notification");
                    message.setText(body != null ? body : "");

                    mailSender.send(message);
                    System.out.println("[EMAIL SUCCESS] Real email dispatched successfully to: " + cleanTo);
                } else {
                    System.out.println("[EMAIL INFO] JavaMailSender is not initialized. Pre-configured email log displayed above.");
                }
            } catch (Exception e) {
                System.err.println("[EMAIL ERROR] Could not dispatch real email via SMTP server: " + e.getMessage());
                System.err.println("(Note: Booking transaction in database completed successfully.)");
            }
        });
    }
}


