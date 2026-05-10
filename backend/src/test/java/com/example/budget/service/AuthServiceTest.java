package com.example.budget.service;

import com.example.budget.dto.AuthResponse;
import com.example.budget.dto.LoginRequest;
import com.example.budget.dto.RegisterRequest;
import com.example.budget.exception.EmailAlreadyExistsException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.exception.InvalidCredentialsException;
import com.example.budget.mapper.UserMapper;
import com.example.budget.model.User;
import com.example.budget.repository.UserRepository;
import com.example.budget.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_throwsWhenEmailExists() {
        RegisterRequest request = new RegisterRequest("Alice", "a@b.com", "secret12");
        when(userRepository.existsByEmail("a@b.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessageContaining("a@b.com");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_persistsAndReturnsToken() {
        RegisterRequest request = new RegisterRequest("Alice", "a@b.com", "secret12");
        when(userRepository.existsByEmail("a@b.com")).thenReturn(false);

        User mapped = new User();
        mapped.setEmail("a@b.com");
        when(userMapper.toEntity(request)).thenReturn(mapped);

        User saved = new User();
        saved.setId(7L);
        saved.setName("Alice");
        saved.setEmail("a@b.com");
        when(userRepository.save(mapped)).thenReturn(saved);

        when(jwtUtil.generateToken("a@b.com", 7L)).thenReturn("jwt-token");
        AuthResponse expected = new AuthResponse(7L, "Alice", "a@b.com", "jwt-token");
        when(userMapper.toAuthResponse(saved, "jwt-token")).thenReturn(expected);

        AuthResponse result = authService.register(request);

        assertThat(result).isSameAs(expected);
        verify(userRepository).save(mapped);
        verify(jwtUtil).generateToken("a@b.com", 7L);
    }

    @Test
    void login_throwsWhenUserMissing() {
        LoginRequest request = new LoginRequest("x@y.com", "password");
        when(userRepository.findByEmail("x@y.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void login_throwsWhenPasswordWrong() {
        LoginRequest request = new LoginRequest("x@y.com", "wrong");
        User user = new User();
        user.setId(1L);
        user.setPassword("encoded-hash");
        when(userRepository.findByEmail("x@y.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded-hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(jwtUtil, never()).generateToken(any(), any());
    }

    @Test
    void login_returnsAuthResponseWhenCredentialsValid() {
        LoginRequest request = new LoginRequest("x@y.com", "right");
        User user = new User();
        user.setId(2L);
        user.setName("Bob");
        user.setEmail("x@y.com");
        user.setPassword("encoded-hash");
        when(userRepository.findByEmail("x@y.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("right", "encoded-hash")).thenReturn(true);
        when(jwtUtil.generateToken("x@y.com", 2L)).thenReturn("token2");

        AuthResponse expected = new AuthResponse(2L, "Bob", "x@y.com", "token2");
        when(userMapper.toAuthResponse(user, "token2")).thenReturn(expected);

        assertThat(authService.login(request)).isSameAs(expected);
    }

    @Test
    void getUserById_throwsWhenMissing() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.getUserById(99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("User")
                .hasMessageContaining("99");
    }

    @Test
    void getUserById_returnsUser() {
        User user = new User();
        user.setId(3L);
        when(userRepository.findById(3L)).thenReturn(Optional.of(user));

        assertThat(authService.getUserById(3L)).isSameAs(user);
    }
}
