package com.example.budget.service;

import com.example.budget.model.PushSubscription;
import com.example.budget.repository.PushSubscriptionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * Sends Web Push notifications to every browser a user has subscribed.
 * Disabled until both VAPID keys are configured.
 */
@Service
public class PushNotificationService {
    private static final Logger log = LoggerFactory.getLogger(PushNotificationService.class);
    private static final Duration TTL = Duration.ofHours(24);
    private static final Duration VAPID_LIFETIME = Duration.ofHours(12);

    /** Push services browsers actually use. Anything else is rejected (no SSRF). */
    private static final List<String> ALLOWED_HOST_SUFFIXES = List.of(
            "fcm.googleapis.com",
            "push.services.mozilla.com",
            "notify.windows.com",
            "push.apple.com");

    private final PushSubscriptionRepository subscriptionRepository;
    private final ObjectMapper objectMapper;
    private final String publicKey;
    private final byte[] publicKeyBytes;
    private final byte[] privateKeyBytes;
    private final String subject;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ExecutorService executor = Executors.newFixedThreadPool(2, runnable -> {
        Thread thread = new Thread(runnable, "web-push");
        thread.setDaemon(true);
        return thread;
    });

    public PushNotificationService(
            PushSubscriptionRepository subscriptionRepository,
            ObjectMapper objectMapper,
            @Value("${app.push.vapid.public-key:}") String publicKey,
            @Value("${app.push.vapid.private-key:}") String privateKey,
            @Value("${app.push.vapid.subject:${app.web.public-url:https://www.personalbudget.co.uk}}") String subject) {
        this.subscriptionRepository = subscriptionRepository;
        this.objectMapper = objectMapper;
        boolean configured = !publicKey.isBlank() && !privateKey.isBlank();
        this.publicKey = configured ? publicKey.trim() : null;
        this.publicKeyBytes = configured ? WebPushCrypto.b64Decode(publicKey) : null;
        this.privateKeyBytes = configured ? WebPushCrypto.b64Decode(privateKey) : null;
        this.subject = subject;
        if (!configured) {
            log.info("Web Push is disabled: VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY are not set");
        }
    }

    public boolean isEnabled() {
        return publicKey != null;
    }

    /** The VAPID public key browsers need to subscribe, or null when disabled. */
    public String publicKey() {
        return publicKey;
    }

    public static boolean isAllowedEndpoint(String endpoint) {
        try {
            URI uri = URI.create(endpoint);
            String host = uri.getHost();
            if (!"https".equalsIgnoreCase(uri.getScheme()) || host == null) {
                return false;
            }
            String normalized = host.toLowerCase(Locale.ROOT);
            return ALLOWED_HOST_SUFFIXES.stream()
                    .anyMatch(suffix -> normalized.equals(suffix) || normalized.endsWith("." + suffix));
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    /**
     * Stores (or re-assigns) a browser subscription. An endpoint belongs to one
     * browser profile, so whoever signs in there last receives its pushes.
     */
    @Transactional
    public void subscribe(Long userId, String endpoint, String p256dh, String auth, String userAgent) {
        if (!isAllowedEndpoint(endpoint)) {
            throw new IllegalArgumentException("Unsupported push service endpoint");
        }
        try {
            WebPushCrypto.decodePublicKey(WebPushCrypto.b64Decode(p256dh));
            if (WebPushCrypto.b64Decode(auth).length != 16) {
                throw new IllegalArgumentException("Invalid push subscription auth secret");
            }
        } catch (java.security.GeneralSecurityException | IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid push subscription keys");
        }
        PushSubscription subscription = subscriptionRepository.findByEndpoint(endpoint)
                .orElseGet(PushSubscription::new);
        subscription.setUserId(userId);
        subscription.setEndpoint(endpoint);
        subscription.setP256dh(p256dh);
        subscription.setAuth(auth);
        subscription.setUserAgent(userAgent == null ? null : truncateTo(userAgent, 512));
        subscriptionRepository.save(subscription);
    }

    public void unsubscribe(Long userId, String endpoint) {
        subscriptionRepository.deleteByEndpointAndUserId(endpoint, userId);
    }

    /**
     * Queues a notification for every device of the user. Inside a transaction it
     * waits for the commit, so a rollback never produces a phantom notification.
     */
    public void sendToUser(Long userId, PushMessage message) {
        if (!isEnabled() || userId == null) {
            return;
        }
        Runnable task = () -> deliver(userId, message);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    executor.execute(task);
                }
            });
        } else {
            executor.execute(task);
        }
    }

    private void deliver(Long userId, PushMessage message) {
        try {
            byte[] payload = payload(message);
            for (PushSubscription subscription : subscriptionRepository.findByUserId(userId)) {
                deliver(subscription, payload);
            }
        } catch (RuntimeException exception) {
            log.warn("Could not deliver push notifications to user {}", userId, exception);
        }
    }

    private void deliver(PushSubscription subscription, byte[] payload) {
        String endpoint = subscription.getEndpoint();
        if (!isAllowedEndpoint(endpoint)) {
            subscriptionRepository.deleteByEndpoint(endpoint);
            return;
        }
        try {
            URI uri = URI.create(endpoint);
            String audience = uri.getScheme() + "://" + uri.getHost() + (uri.getPort() > 0 ? ":" + uri.getPort() : "");
            String authorization = WebPushCrypto.vapidAuthorization(
                    audience,
                    subject,
                    Instant.now().plus(VAPID_LIFETIME).getEpochSecond(),
                    publicKeyBytes,
                    privateKeyBytes);
            byte[] body = WebPushCrypto.encrypt(
                    payload,
                    WebPushCrypto.b64Decode(subscription.getP256dh()),
                    WebPushCrypto.b64Decode(subscription.getAuth()));

            HttpRequest request = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", authorization)
                    .header("TTL", String.valueOf(TTL.toSeconds()))
                    .header("Urgency", "normal")
                    .header("Content-Encoding", "aes128gcm")
                    .header("Content-Type", "application/octet-stream")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int status = response.statusCode();
            if (status == 404 || status == 410) {
                // The browser unsubscribed or the subscription expired.
                subscriptionRepository.deleteByEndpoint(endpoint);
            } else if (status >= 400) {
                log.warn("Push service {} answered {}: {}", uri.getHost(), status, truncate(response.body()));
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
        } catch (Exception exception) {
            log.warn("Could not send push notification to subscription {}", subscription.getId(), exception);
        }
    }

    private byte[] payload(PushMessage message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("title", message.title());
        body.put("body", message.body());
        body.put("url", message.url() == null ? "/" : message.url());
        if (message.tag() != null) {
            body.put("tag", message.tag());
        }
        try {
            return objectMapper.writeValueAsString(body).getBytes(StandardCharsets.UTF_8);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialise push payload", exception);
        }
    }

    private static String truncateTo(String value, int max) {
        return value.length() > max ? value.substring(0, max) : value;
    }

    private static String truncate(String value) {
        if (value == null) return "";
        return value.length() > 300 ? value.substring(0, 300) + "…" : value;
    }

    @PreDestroy
    void shutdown() throws InterruptedException {
        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);
    }

    /** {@code url} is an in-app path such as {@code /household}; {@code tag} replaces an older notification with the same tag. */
    public record PushMessage(String title, String body, String url, String tag) {}
}
