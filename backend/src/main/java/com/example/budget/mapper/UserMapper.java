package com.example.budget.mapper;

import com.example.budget.dto.AuthResponse;
import com.example.budget.dto.RegisterRequest;
import com.example.budget.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between User entities and related DTOs.
 * 
 * Handles conversions for user registration and authentication operations,
 * including password encoding during entity creation.
 */
@Component
public class UserMapper {

    private final PasswordEncoder passwordEncoder;

    public UserMapper(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Converts a RegisterRequest DTO to a User entity.
     * 
     * Encodes the password using BCrypt before setting it on the entity.
     * 
     * @param request Registration request containing user details
     * @return User entity ready to be persisted
     */
    public User toEntity(RegisterRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        return user;
    }

    /**
     * Converts a User entity to an AuthResponse DTO.
     * 
     * Used after successful registration or login to return user information
     * along with the JWT token.
     * 
     * @param user User entity to convert
     * @param token JWT token for authenticated requests
     * @return AuthResponse containing user info and token, or null if user is null
     */
    public AuthResponse toAuthResponse(User user, String token) {
        if (user == null) return null;

        return new AuthResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            token
        );
    }
}

