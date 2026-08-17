package com.example.budget.service;

import com.example.budget.model.User;
import com.example.budget.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    private PasswordResetService passwordResetService;

    @BeforeEach
    void setUp() {
        passwordResetService = new PasswordResetService(userRepository, passwordEncoder);
    }

    @Test
    void resetPassword_rejectsUnknownEmail() {
        when(userRepository.findByEmailIgnoreCase("missing@example.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> passwordResetService.resetPassword(
                " missing@example.com ", "new-secret"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No account");

        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_updatesPasswordAndInvalidatesExistingSessions() {
        User user = new User();
        user.setId(4L);
        user.setEmail("person@example.com");
        user.setPassword("old-password-hash");
        user.setAuthVersion(2);
        when(userRepository.findByEmailIgnoreCase("person@example.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.encode("new-secret")).thenReturn("encoded-new-secret");

        passwordResetService.resetPassword("person@example.com", "new-secret");

        assertThat(user.getPassword()).isEqualTo("encoded-new-secret");
        assertThat(user.getAuthVersion()).isEqualTo(3);
        verify(userRepository).save(user);
    }
}
