package com.example.budget.service;

import com.example.budget.dto.AuthResponse;
import com.example.budget.dto.LoginRequest;
import com.example.budget.dto.RegisterRequest;
import com.example.budget.exception.AccountPendingApprovalException;
import com.example.budget.exception.EmailAlreadyExistsException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.exception.GoogleOAuthNotConfiguredException;
import com.example.budget.exception.InvalidCredentialsException;
import com.example.budget.mapper.UserMapper;
import com.example.budget.model.User;
import com.example.budget.model.UserPlan;
import com.example.budget.repository.UserRepository;
import com.example.budget.security.GoogleIdentityVerifier;
import com.example.budget.util.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for authentication operations.
 * 
 * Handles user registration, login, and user retrieval. Manages password encoding
 * and JWT token generation for authenticated sessions.
 */
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final GoogleIdentityVerifier googleIdentityVerifier;

    public AuthService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil, GoogleIdentityVerifier googleIdentityVerifier) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.googleIdentityVerifier = googleIdentityVerifier;
    }

    /**
     * Registers a new user account.
     * 
     * Creates a new user with pending approval; no JWT is issued until an administrator approves.
     *
     * @param request Registration request containing user details
     * @return AuthResponse with {@link AuthResponse#getPendingApproval()} true and no token
     * @throws EmailAlreadyExistsException if the email is already registered
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        User user = userMapper.toEntity(request);
        user.setApproved(false);
        user.setPlan(UserPlan.STANDARD);
        user.setAdmin(false);
        User savedUser = userRepository.save(user);

        AuthResponse response = new AuthResponse();
        response.setPendingApproval(true);
        response.setEmail(savedUser.getEmail());
        response.setName(savedUser.getName());
        response.setUserId(savedUser.getId());
        response.setApprovalMessage("Your account will be activated after an administrator approves it.");
        return response;
    }

    /**
     * Authenticates a user and generates a JWT token.
     * 
     * Validates email and password, then returns an authentication response with JWT token.
     * 
     * @param request Login request containing email and password
     * @return AuthResponse with user information and JWT token
     * @throws InvalidCredentialsException if email or password is incorrect
     * @throws AccountPendingApprovalException if the account has not been approved yet
     */
    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            throw new InvalidCredentialsException();
        }

        User user = userOpt.get();
        if (!user.isApproved()) {
            throw new AccountPendingApprovalException();
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getAuthVersion());

        return userMapper.toAuthResponse(user, token);
    }

    /**
     * Sign-in or sign-up using a Google ID token (verified audience = Web client ID).
     * New users are created pending approval, same as {@link #register(RegisterRequest)}.
     */
    public AuthResponse loginWithGoogle(String idToken) throws GeneralSecurityException, IOException {
        if (!googleIdentityVerifier.isEnabled()) {
            throw new GoogleOAuthNotConfiguredException();
        }
        GoogleIdToken.Payload payload = googleIdentityVerifier.verify(idToken);
        if (payload == null) {
            throw new IllegalArgumentException("Invalid or expired Google credential.");
        }
        String email = payload.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Google account has no email address.");
        }
        if (Boolean.FALSE.equals(payload.getEmailVerified())) {
            throw new IllegalArgumentException("Google email must be verified.");
        }
        String rawName = (String) payload.get("name");
        String name = (rawName != null && !rawName.isBlank()) ? rawName.trim() : email.substring(0, email.indexOf('@'));

        String normalized = email.toLowerCase();
        Optional<User> existing = userRepository.findByEmailIgnoreCase(normalized);
        if (existing.isPresent()) {
            User user = existing.get();
            if (!user.isApproved()) {
                throw new AccountPendingApprovalException();
            }
            String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getAuthVersion());
            return userMapper.toAuthResponse(user, token);
        }

        User user = new User();
        user.setEmail(normalized);
        user.setName(name);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setApproved(false);
        user.setPlan(UserPlan.STANDARD);
        user.setAdmin(false);
        User saved = userRepository.save(user);

        AuthResponse response = new AuthResponse();
        response.setPendingApproval(true);
        response.setEmail(saved.getEmail());
        response.setName(saved.getName());
        response.setUserId(saved.getId());
        response.setApprovalMessage("Your account will be activated after an administrator approves it.");
        return response;
    }

    /**
     * Retrieves a user by ID.
     * 
     * @param userId User ID to search for
     * @return User entity
     * @throws EntityNotFoundException if user is not found
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User", userId));
    }
}
