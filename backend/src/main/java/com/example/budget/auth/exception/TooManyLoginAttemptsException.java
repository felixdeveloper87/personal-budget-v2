package com.example.budget.auth.exception;

/** Login blocked because of too many recent failed attempts (HTTP 429). */
public class TooManyLoginAttemptsException extends RuntimeException {
    private final long retryAfterSeconds;

    public TooManyLoginAttemptsException(long retryAfterSeconds) {
        super("Too many failed login attempts. Try again in "
                + Math.max(1, (retryAfterSeconds + 59) / 60) + " minute(s).");
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
