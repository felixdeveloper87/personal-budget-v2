package com.example.budget.dto;

/**
 * Data Transfer Object for authentication responses.
 * 
 * Returned after successful user registration or login operations.
 * Contains user information and JWT token for authenticated API requests.
 */
public class AuthResponse {
    private Long userId;
    private String name;
    private String email;
    private String token;

    public AuthResponse() {
    }

    public AuthResponse(Long userId, String name, String email, String token) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.token = token;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getToken() {
        return token;
    }
}
