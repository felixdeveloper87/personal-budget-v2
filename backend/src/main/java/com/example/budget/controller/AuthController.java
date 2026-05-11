package com.example.budget.controller;

import com.example.budget.dto.AuthResponse;
import com.example.budget.dto.GoogleLoginRequest;
import com.example.budget.dto.LoginRequest;
import com.example.budget.dto.RegisterRequest;
import com.example.budget.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;

/**
 * REST controller for authentication endpoints.
 * 
 * Handles user registration and login operations. All endpoints are public
 * (no authentication required) as defined in SecurityConfig.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Sign in or register with Google (ID token from Google Identity Services in the browser).
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        try {
            AuthResponse body = authService.loginWithGoogle(request.getIdToken());
            if (Boolean.TRUE.equals(body.getPendingApproval())) {
                return ResponseEntity.status(HttpStatus.CREATED).body(body);
            }
            return ResponseEntity.ok(body);
        } catch (GeneralSecurityException | IOException e) {
            throw new IllegalArgumentException("Could not verify Google sign-in.");
        }
    }

}
