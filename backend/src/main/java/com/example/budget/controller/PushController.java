package com.example.budget.controller;

import com.example.budget.dto.PushSubscriptionRequest;
import com.example.budget.model.User;
import com.example.budget.repository.UserRepository;
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
    private final UserRepository userRepository;

    public PushController(PushNotificationService pushNotificationService, UserRepository userRepository) {
        this.pushNotificationService = pushNotificationService;
        this.userRepository = userRepository;
    }

    /** Per-user push preferences. They apply to every device the user subscribed. */
    @GetMapping("/preferences")
    public PreferencesResponse preferences(Authentication authentication) {
        User user = currentUser(authentication);
        return new PreferencesResponse(user.isPushBillsDue());
    }

    @PutMapping("/preferences")
    public PreferencesResponse updatePreferences(
            @RequestBody PreferencesResponse request,
            Authentication authentication) {
        User user = currentUser(authentication);
        user.setPushBillsDue(request.billsDue());
        return new PreferencesResponse(userRepository.save(user).isPushBillsDue());
    }

    private User currentUser(Authentication authentication) {
        Long id = ((User) authentication.getPrincipal()).getId();
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
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

    public record PreferencesResponse(boolean billsDue) {}
}
