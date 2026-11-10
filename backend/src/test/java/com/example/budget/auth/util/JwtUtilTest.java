package com.example.budget.auth.util;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtUtilTest {

    private JwtUtil withSecret(String secret) {
        JwtUtil util = new JwtUtil();
        ReflectionTestUtils.setField(util, "secret", secret);
        return util;
    }

    @Test
    void rejectsMissingSecret() {
        assertThatThrownBy(() -> withSecret(null).validateSecret())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not set");
    }

    @Test
    void rejectsBlankSecret() {
        assertThatThrownBy(() -> withSecret("  ").validateSecret())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not set");
    }

    @Test
    void rejectsShortSecret() {
        assertThatThrownBy(() -> withSecret("change-me").validateSecret())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least");
    }

    @Test
    void acceptsLongEnoughSecret() {
        assertThatCode(() -> withSecret("a".repeat(JwtUtil.MIN_SECRET_BYTES)).validateSecret())
                .doesNotThrowAnyException();
    }
}
