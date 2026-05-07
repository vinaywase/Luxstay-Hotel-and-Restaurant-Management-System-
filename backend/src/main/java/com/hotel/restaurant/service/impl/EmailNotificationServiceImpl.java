package com.hotel.restaurant.service.impl;

import com.hotel.restaurant.entity.EventBooking;
import com.hotel.restaurant.service.EmailNotificationService;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class EmailNotificationServiceImpl implements EmailNotificationService {

    private final JavaMailSender mailSender;

    public EmailNotificationServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@luxestay.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    @Override
    public void sendBookingApproved(EventBooking booking) {
        String body = String.format("Dear %s,\n\nYour event booking #%d (%s) has been APPROVED.\nTotal Cost: $%s\nPlease pay the 30%% advance of $%s to confirm your booking.\n\nRegards,\nLuxeStay Team",
                booking.getFullName(), booking.getBookingId(), booking.getEventType(), booking.getGrandTotal(), booking.getGrandTotal().multiply(new BigDecimal("0.30")));
        sendEmail(booking.getEmail(), "Booking Approved - LuxeStay", body);
    }

    @Override
    public void sendBookingRejected(EventBooking booking, String reason) {
        String body = String.format("Dear %s,\n\nWe regret to inform you that your booking #%d has been REJECTED.\nReason: %s\n\nRegards,\nLuxeStay Team",
                booking.getFullName(), booking.getBookingId(), reason);
        sendEmail(booking.getEmail(), "Booking Rejected - LuxeStay", body);
    }

    @Override
    public void sendPaymentReceipt(EventBooking booking, BigDecimal amount, String type) {
        String body = String.format("Dear %s,\n\nWe have received your %s payment of $%s for booking #%d.\nThank you for choosing LuxeStay.",
                booking.getFullName(), type, amount, booking.getBookingId());
        sendEmail(booking.getEmail(), "Payment Received - LuxeStay", body);
    }

    @Override
    public void sendFinalBalanceDue(EventBooking booking) {
        String body = String.format("Dear %s,\n\nYour event #%d has been completed. The final balance of $%s is now due.\n\nRegards,\nLuxeStay Team",
                booking.getFullName(), booking.getBookingId(), booking.getBalanceDue());
        sendEmail(booking.getEmail(), "Final Balance Due - LuxeStay", body);
    }

    @Override
    public void sendCancellationRequestToAdmin(EventBooking booking) {
        String body = String.format("Admin Notification,\n\nA cancellation request has been submitted for booking #%d by %s.\nEvent Date: %s\n\nPlease review in the dashboard.",
                booking.getBookingId(), booking.getFullName(), booking.getEventDate());
        sendEmail("admin@luxestay.com", "ACTION REQUIRED: Cancellation Request", body);
    }

    @Override
    public void sendRefundApproved(EventBooking booking, BigDecimal amount) {
        String body = String.format("Dear %s,\n\nYour refund request for booking #%d has been APPROVED.\nRefund Amount: $%s\nThe amount will be credited to your original payment method within 5-7 business days.",
                booking.getFullName(), booking.getBookingId(), amount);
        sendEmail(booking.getEmail(), "Refund Approved - LuxeStay", body);
    }

    @Override
    public void sendRefundRejected(EventBooking booking, String reason) {
        String body = String.format("Dear %s,\n\nYour refund request for booking #%d was REJECTED.\nReason: %s\n\nRegards,\nLuxeStay Team",
                booking.getFullName(), booking.getBookingId(), reason);
        sendEmail(booking.getEmail(), "Refund Rejected - LuxeStay", body);
    }

    @Override
    public void sendRefundProcessed(EventBooking booking, BigDecimal amount) {
        String body = String.format("Dear %s,\n\nYour refund of $%s for booking #%d has been PROCESSED and transferred.\n\nRegards,\nLuxeStay Team",
                booking.getFullName(), amount, booking.getBookingId());
        sendEmail(booking.getEmail(), "Refund Processed - LuxeStay", body);
    }
}
