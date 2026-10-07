package com.example.budget.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Shape of the browser's {@code PushSubscription.toJSON()}. Browsers add fields
 * such as {@code expirationTime}, and the app's ObjectMapper rejects unknown
 * properties, so they are ignored explicitly.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record PushSubscriptionRequest(
        @NotBlank @Size(max = 2048) String endpoint,
        @NotNull @Valid Keys keys) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Keys(
            @NotBlank @Size(max = 255) String p256dh,
            @NotBlank @Size(max = 255) String auth) {}
}
