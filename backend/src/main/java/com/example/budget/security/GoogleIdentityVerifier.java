package com.example.budget.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

/**
 * Verifies Google ID tokens using the configured Web client ID as audience.
 */
@Component
public class GoogleIdentityVerifier {

    private final GoogleIdTokenVerifier verifier;
    private final boolean enabled;

    public GoogleIdentityVerifier(@Value("${app.google.oauth.client-id:}") String clientId) {
        if (clientId == null || clientId.isBlank()) {
            this.verifier = null;
            this.enabled = false;
        } else {
            this.verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId.trim()))
                    .build();
            this.enabled = true;
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    /**
     * @return Google token payload (email, name, subject, …)
     * @throws GeneralSecurityException verification failure
     * @throws IOException transport errors
     */
    public GoogleIdToken.Payload verify(String idTokenString) throws GeneralSecurityException, IOException {
        if (!enabled || verifier == null) {
            return null;
        }
        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken == null) {
            return null;
        }
        return idToken.getPayload();
    }
}
