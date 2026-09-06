package com.example.budget.service;

import com.example.budget.dto.CommunicationEmailSendResponse;
import com.example.budget.dto.SendCommunicationEmailRequest;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.model.User;
import com.example.budget.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class CommunicationEmailService {
    private static final int RESEND_BATCH_SIZE = 100;
    private final UserRepository userRepository;
    private final ResendEmailClient resendEmailClient;

    public CommunicationEmailService(UserRepository userRepository, ResendEmailClient resendEmailClient) {
        this.userRepository = userRepository;
        this.resendEmailClient = resendEmailClient;
    }

    /** Sends only to administrator-selected, approved accounts with a communication address. */
    public CommunicationEmailSendResponse sendToConfiguredRecipients(SendCommunicationEmailRequest request, User principal) {
        requireAdmin(principal);
        Set<Long> selectedUserIds = new LinkedHashSet<>(request.getRecipientUserIds());
        if (selectedUserIds.size() != request.getRecipientUserIds().size()) {
            throw new IllegalArgumentException("Each communication recipient may only be selected once.");
        }
        List<User> selectedUsers = userRepository.findAllByApprovedTrueAndCommunicationEmailIsNotNull().stream()
                .filter(user -> selectedUserIds.contains(user.getId()))
                .toList();
        if (selectedUsers.size() != selectedUserIds.size()) {
            throw new IllegalArgumentException(
                    "Every selected recipient must be approved and have a communication email configured.");
        }
        List<String> recipients = selectedUsers.stream()
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
