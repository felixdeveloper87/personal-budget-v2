package com.example.budget.auth.service;

import com.example.budget.auth.exception.TooManyLoginAttemptsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

/**
 * Limits failed login attempts, counted in Redis.
 *
 * <ul>
 *   <li>Per email: stops password guessing against one account.</li>
 *   <li>Per client IP: stops one client trying many accounts.</li>
 * </ul>
 *
 * Each counter starts at the first failure and expires after the window; while it is at the
 * limit, logins for that email/IP are rejected with HTTP 429. A successful login clears the
 * email counter. If Redis is unavailable the limit is skipped (fail open) and a warning is
 * logged, so a cache outage never locks every user out.
 */
@Service
public class LoginAttemptService {
    private static final Logger log = LoggerFactory.getLogger(LoginAttemptService.class);
    static final String EMAIL_KEY = "login-failures:email:";
    static final String IP_KEY = "login-failures:ip:";

    private final StringRedisTemplate redis;
    private final int maxFailuresPerEmail;
    private final int maxFailuresPerIp;
    private final Duration window;

    public LoginAttemptService(
            StringRedisTemplate redis,
            @Value("${app.auth.login.max-failures-per-email:5}") int maxFailuresPerEmail,
            @Value("${app.auth.login.max-failures-per-ip:20}") int maxFailuresPerIp,
            @Value("${app.auth.login.window-minutes:15}") long windowMinutes) {
        this.redis = redis;
        this.maxFailuresPerEmail = maxFailuresPerEmail;
        this.maxFailuresPerIp = maxFailuresPerIp;
        this.window = Duration.ofMinutes(windowMinutes);
    }

    /** Throws {@link TooManyLoginAttemptsException} when the email or the IP is over the limit. */
    public void checkAllowed(String email, String ip) {
        try {
            long retryAfter = Math.max(
                    blockedFor(EMAIL_KEY + normalize(email), maxFailuresPerEmail),
                    blockedFor(IP_KEY + ip, maxFailuresPerIp));
            if (retryAfter > 0) {
                throw new TooManyLoginAttemptsException(retryAfter);
            }
        } catch (DataAccessException ex) {
            log.warn("Login rate limit skipped: Redis unavailable ({})", ex.getMessage());
        }
    }

    public void recordFailure(String email, String ip) {
        try {
            increment(EMAIL_KEY + normalize(email));
            increment(IP_KEY + ip);
        } catch (DataAccessException ex) {
            log.warn("Could not record failed login: Redis unavailable ({})", ex.getMessage());
        }
    }

    public void recordSuccess(String email) {
        try {
            redis.delete(EMAIL_KEY + normalize(email));
        } catch (DataAccessException ex) {
            log.warn("Could not clear failed logins: Redis unavailable ({})", ex.getMessage());
        }
    }

    /** Seconds until the key drops below the limit, or 0 when it is not blocked. */
    private long blockedFor(String key, int limit) {
        String value = redis.opsForValue().get(key);
        if (value == null || Long.parseLong(value) < limit) {
            return 0;
        }
        Long ttl = redis.getExpire(key, TimeUnit.SECONDS);
        return ttl != null && ttl > 0 ? ttl : window.toSeconds();
    }

    private void increment(String key) {
        Long count = redis.opsForValue().increment(key);
        if (count != null && count == 1) {
            redis.expire(key, window);
        }
    }

    private static String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
