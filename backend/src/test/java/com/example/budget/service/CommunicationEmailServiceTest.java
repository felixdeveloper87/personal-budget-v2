package com.example.budget.service;

import com.example.budget.dto.CommunicationEmailSendResponse;
import com.example.budget.dto.SendCommunicationEmailRequest;
import com.example.budget.model.User;
import com.example.budget.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommunicationEmailServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ResendEmailClient resendEmailClient;
    @InjectMocks
    private CommunicationEmailService communicationEmailService;

    @Test
    void sendsOnlyDistinctConfiguredCommunicationAddresses() {
        User admin = new User();
        admin.setAdmin(true);

        User first = new User();
        first.setCommunicationEmail("first@example.com");
        User duplicate = new User();
        duplicate.setCommunicationEmail("first@example.com");
        User second = new User();
        second.setCommunicationEmail("second@example.com");
        when(userRepository.findAllByApprovedTrueAndCommunicationEmailIsNotNull())
                .thenReturn(List.of(first, duplicate, second));

        SendCommunicationEmailRequest request = new SendCommunicationEmailRequest();
        request.setSubject("Product update");
        request.setText("Hello");

        CommunicationEmailSendResponse result = communicationEmailService.sendToConfiguredRecipients(request, admin);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<String>> recipients = ArgumentCaptor.forClass(List.class);
        verify(resendEmailClient).sendBatch(recipients.capture(), org.mockito.ArgumentMatchers.eq("Product update"), org.mockito.ArgumentMatchers.eq("Hello"));
        assertThat(recipients.getValue()).containsExactly("first@example.com", "second@example.com");
        assertThat(result.recipientCount()).isEqualTo(2);
    }
}
