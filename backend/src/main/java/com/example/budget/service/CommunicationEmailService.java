package com.example.budget.service;

import com.example.budget.dto.CommunicationEmailSendResponse;
import com.example.budget.dto.SendCommunicationEmailRequest;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.model.User;
import com.example.budget.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommunicationEmailService {
    private static final int RESEND_BATCH_SIZE = 100;
    private final UserRepository userRepository;
    private final ResendEmailClient resendEmailClient;

    public CommunicationEmailService(UserRepository userRepository, ResendEmailClient resendEmailClient) {
        this.userRepository = userRepository;
        this.resendEmailClient = resendEmailClient;
    }

    /** Sends only to approved accounts that have an administrator-entered communication address. */
    public CommunicationEmailSendResponse sendToConfiguredRecipients(SendCommunicationEmailRequest request, User principal) {
        requireAdmin(principal);
        List<String> recipients = userRepository.findAllByApprovedTrueAndCommunicationEmailIsNotNull().stream()
                .map(User::getCommunicationEmail)
                .map(String::trim)
                .filter(email -> !email.isEmpty())
                .distinct()
                .toList();
        for (int start = 0; start < recipients.size(); start += RESEND_BATCH_SIZE) {
            int end = Math.min(start + RESEND_BATCH_SIZE, recipients.size());
            resendEmailClient.sendBatch(recipients.subList(start, end), request.getSubject(), request.getText());
        }
        return new CommunicationEmailSendResponse(recipients.size());
    }

    private void requireAdmin(User principal) {
        if (principal == null || !principal.isAdmin()) {
            throw new AccessDeniedException("Administrator access required.");
        }
    }
}
