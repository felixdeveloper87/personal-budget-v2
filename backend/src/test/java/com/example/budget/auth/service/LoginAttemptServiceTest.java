package com.example.budget.auth.service;

import com.example.budget.auth.exception.TooManyLoginAttemptsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LoginAttemptServiceTest {
    private static final String EMAIL_KEY = LoginAttemptService.EMAIL_KEY + "ana@example.com";
    private static final String IP_KEY = LoginAttemptService.IP_KEY + "203.0.113.7";

    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> values = mock(ValueOperations.class);
    private final StringRedisTemplate redis = mock(StringRedisTemplate.class);
    private LoginAttemptService service;

    @BeforeEach
    void setUp() {
        when(redis.opsForValue()).thenReturn(values);
        service = new LoginAttemptService(redis, 5, 20, 15);
    }

    @Test
    void allowsLoginBelowTheLimits() {
        when(values.get(EMAIL_KEY)).thenReturn("4");
        when(values.get(IP_KEY)).thenReturn("19");

        assertThatCode(() -> service.checkAllowed("ana@example.com", "203.0.113.7"))
                .doesNotThrowAnyException();
    }

    @Test
    void blocksAnEmailAtTheLimitAndReportsTheRemainingTime() {
        when(values.get(EMAIL_KEY)).thenReturn("5");
        when(redis.getExpire(EMAIL_KEY, TimeUnit.SECONDS)).thenReturn(600L);

        assertThatThrownBy(() -> service.checkAllowed("  Ana@Example.com ", "203.0.113.7"))
                .isInstanceOf(TooManyLoginAttemptsException.class)
                .hasMessageContaining("10 minute")
                .satisfies(ex -> assertThat(((TooManyLoginAttemptsException) ex).getRetryAfterSeconds())
                        .isEqualTo(600L));
    }

    @Test
    void blocksAnIpAtTheLimitEvenForAnotherEmail() {
        when(values.get(IP_KEY)).thenReturn("20");
        when(redis.getExpire(IP_KEY, TimeUnit.SECONDS)).thenReturn(120L);

        assertThatThrownBy(() -> service.checkAllowed("someone-else@example.com", "203.0.113.7"))
                .isInstanceOf(TooManyLoginAttemptsException.class);
    }

    @Test
    void firstFailureStartsTheWindowAndLaterOnesDoNotExtendIt() {
        when(values.increment(EMAIL_KEY)).thenReturn(1L);
        when(values.increment(IP_KEY)).thenReturn(3L);

        service.recordFailure("ana@example.com", "203.0.113.7");

        verify(redis).expire(EMAIL_KEY, Duration.ofMinutes(15));
        verify(redis, never()).expire(IP_KEY, Duration.ofMinutes(15));
    }

    @Test
    void successfulLoginClearsTheEmailCounter() {
        service.recordSuccess("ANA@example.com");

        verify(redis).delete(EMAIL_KEY);
    }

    @Test
    void redisOutageDoesNotBlockLogin() {
        when(values.get(anyString())).thenThrow(new RedisConnectionFailureException("down"));
        when(values.increment(anyString())).thenThrow(new RedisConnectionFailureException("down"));

        assertThatCode(() -> {
            service.checkAllowed("ana@example.com", "203.0.113.7");
            service.recordFailure("ana@example.com", "203.0.113.7");
        }).doesNotThrowAnyException();
    }
}
