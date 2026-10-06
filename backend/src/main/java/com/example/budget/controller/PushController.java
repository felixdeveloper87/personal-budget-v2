package com.example.budget.controller;

import com.example.budget.dto.PushSubscriptionRequest;
import com.example.budget.model.User;
import com.example.budget.service.PushNotificationService;
import com.example.budget.service.PushNotificationService.PushMessage;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/push")
@CrossOrigin
public class PushController {
    private final PushNotificationService pushNotificationService;

    public PushController(PushNotificationService pushNotificationService) {
        this.pushNotificationService = pushNotificationService;
    }

    @GetMapping("/config")
    public Map<String, Object> config() {
        return pushNotificationService.isEnabled()
                ? Map.of("enabled", true, "publicKey", pushNotificationService.publicKey())
                : Map.of("enabled", false);
    }

    @PostMapping("/subscriptions")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void subscribe(
            @Valid @RequestBody PushSubscriptionRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            Authentication authentication) {
        requireEnabled();
        User user = (User) authentication.getPrincipal();
        pushNotificationService.subscribe(
                user.getId(),
                request.endpoint(),
                request.keys().p256dh(),
                request.keys().auth(),
                userAgent);
    }

    @PostMapping("/subscriptions/remove")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unsubscribe(@Valid @RequestBody RemoveRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        pushNotificationService.unsubscribe(user.getId(), request.endpoint());
    }

    @PostMapping("/test")
    public ResponseEntity<Void> test(Authentication authentication) {
        requireEnabled();
        User user = (User) authentication.getPrincipal();
        pushNotificationService.sendToUser(user.getId(), new PushMessage(
                "Personal Budget",
                "Push notifications are on. You'll hear from us when something needs your attention.",
                "/",
                "push-test"));
        return ResponseEntity.accepted().build();
    }

    private void requireEnabled() {
        if (!pushNotificationService.isEnabled()) {
            throw new IllegalArgumentException("Push notifications are not configured on this server");
        }
    }

    public record RemoveRequest(@NotBlank String endpoint) {}
}
