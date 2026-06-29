package com.labor.workplace.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public EmailService() {
    }

    public void sendEmail(String recipientEmail, String subject, String body) {
        sendEmail(recipientEmail, null, null, null, subject, body);
    }

    public void sendEmail(String recipientEmail, String replyToEmail, String subject, String body) {
        sendEmail(recipientEmail, replyToEmail, null, replyToEmail, subject, body);
    }

    public void sendEmail(String recipientEmail, String fromEmail, String fromName, String replyToEmail, String subject, String body) {
        System.out.println("==================================================");
        System.out.println("[EMAIL SIMULATOR - NO MAIL SENT]");
        System.out.println("To: " + recipientEmail);
        if (fromEmail != null) {
            System.out.println("From: " + fromEmail + (fromName != null ? " (" + fromName + ")" : ""));
        }
        if (replyToEmail != null) {
            System.out.println("Reply-To: " + replyToEmail);
        }
        System.out.println("Subject: " + subject);
        System.out.println("Body:\n" + body);
        System.out.println("==================================================");
    }
}

