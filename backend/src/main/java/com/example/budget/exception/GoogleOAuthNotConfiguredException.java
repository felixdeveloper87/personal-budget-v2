package com.example.budget.exception;

/**
 * Raised when {@code app.google.oauth.client-id} is not set but Google login was requested.
 */
public class GoogleOAuthNotConfiguredException extends RuntimeException {

    public GoogleOAuthNotConfiguredException() {
        super("Google sign-in is not configured on this server.");
    }
}
