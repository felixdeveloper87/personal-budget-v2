package com.example.budget.dto;

import com.example.budget.config.JacksonConfig;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PushSubscriptionRequestTest {

    /** Real browser payload: includes expirationTime, which the app's ObjectMapper would otherwise reject. */
    @Test
    void acceptsTheBrowserSubscriptionJson() throws Exception {
        String json = "{\"endpoint\":\"https://fcm.googleapis.com/fcm/send/abc\",\"expirationTime\":null,"
                + "\"keys\":{\"p256dh\":\"BKey\",\"auth\":\"secret\"}}";

        PushSubscriptionRequest request = new JacksonConfig().objectMapper()
                .readValue(json, PushSubscriptionRequest.class);

        assertThat(request.endpoint()).isEqualTo("https://fcm.googleapis.com/fcm/send/abc");
        assertThat(request.keys().p256dh()).isEqualTo("BKey");
        assertThat(request.keys().auth()).isEqualTo("secret");
    }
}
