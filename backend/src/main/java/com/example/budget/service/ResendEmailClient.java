package com.example.budget.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/** Small server-side client for Resend's batch e-mail endpoint. */
@Component
public class ResendEmailClient {
    private static final URI BATCH_EMAILS_URI = URI.create("https://api.resend.com/emails/batch");
    private static final int MAX_RECIPIENTS_PER_BATCH = 100;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String from;

    public ResendEmailClient(
            ObjectMapper objectMapper,
            @Value("${app.email.resend.api-key:}") String apiKey,
            @Value("${app.email.resend.from:}") String from) {
        this(objectMapper, HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build(), apiKey, from);
    }

    // Kept package-visible so this integration can be tested without network access.
    ResendEmailClient(ObjectMapper objectMapper, HttpClient httpClient, String apiKey, String from) {
        this.objectMapper = objectMapper;
        this.httpClient = httpClient;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.from = from == null ? "" : from.trim();
    }

    public void sendBatch(List<String> recipients, String subject, String text) {
        if (apiKey.isBlank() || from.isBlank()) {
            throw new IllegalStateException("Outbound email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.");
        }
        if (recipients.isEmpty()) {
            throw new IllegalArgumentException("There are no communication email addresses to send to.");
        }
        if (recipients.size() > MAX_RECIPIENTS_PER_BATCH) {
            throw new IllegalArgumentException("A communication send is limited to 100 recipients at a time.");
        }

        List<Map<String, Object>> messages = recipients.stream()
                .map(recipient -> Map.<String, Object>of(
                        "from", from,
                        "to", List.of(recipient),
                        "subject", subject.trim(),
                        "text", text.trim()))
                .toList();

        try {
            String json = objectMapper.writeValueAsString(messages);
            HttpRequest request = HttpRequest.newBuilder(BATCH_EMAILS_URI)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .timeout(Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Resend did not accept this email. Check the sender domain and Resend configuration.");
            }
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Could not prepare the email message.", e);
        } catch (IOException e) {
            throw new IllegalStateException("Could not reach the email provider. Please try again.", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Email sending was interrupted. Please try again.", e);
        }
    }
}
