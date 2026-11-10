package com.example.budget.auth.controller;

import com.example.budget.auth.dto.AuthResponse;
import com.example.budget.auth.dto.LoginRequest;
import com.example.budget.auth.dto.RegisterRequest;
import com.example.budget.auth.dto.ResetPasswordRequest;
import com.example.budget.auth.exception.InvalidCredentialsException;
import com.example.budget.auth.service.AuthService;
import com.example.budget.auth.service.LoginAttemptService;
import com.example.budget.auth.service.PasswordResetService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 * 
 * Handles user registration and login operations. All endpoints are public
 * (no authentication required) as defined in SecurityConfig.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final LoginAttemptService loginAttempts;

    public AuthController(
            AuthService authService,
            PasswordResetService passwordResetService,
            LoginAttemptService loginAttempts) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
        this.loginAttempts = loginAttempts;
    }

    /**
     * Registers a new user account.
     * 
     * Creates a new user with the provided credentials and returns an authentication
     * response containing user information and JWT token.
     * 
     * @param request Registration request containing name, email, and password
     * @return ResponseEntity with AuthResponse containing user info and JWT token (HTTP 201 CREATED)
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    /**
     * Authenticates a user and returns a JWT token.
     * 
     * Validates user credentials and returns an authentication response with
     * user information and JWT token for subsequent authenticated requests.
     * 
     * @param request Login request containing email and password
     * @return ResponseEntity with AuthResponse containing user info and JWT token (HTTP 200 OK)
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        // Real client IP: Spring resolves X-Forwarded-For from nginx
        // (server.forward-headers-strategy=native, trusted only from internal proxies).
        String ip = httpRequest.getRemoteAddr();
        loginAttempts.checkAllowed(request.getEmail(), ip);
        try {
            AuthResponse response = authService.login(request);
            loginAttempts.recordSuccess(request.getEmail());
            return ResponseEntity.ok(response);
        } catch (InvalidCredentialsException ex) {
            loginAttempts.recordFailure(request.getEmail(), ip);
            throw ex;
        }
    }

    /**
     * Replaces the password for the account identified by email.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getEmail(), request.getPassword());
        return ResponseEntity.noContent().build();
    }

}
