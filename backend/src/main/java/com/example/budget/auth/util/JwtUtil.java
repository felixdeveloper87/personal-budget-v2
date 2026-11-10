package com.example.budget.auth.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

/**
 * Utility class for JWT token operations.
 * 
 * Handles token generation, validation, and extraction of claims (email, userId).
 * Uses HS512 algorithm for signing tokens.
 */
@Component
public class JwtUtil {

    /** Minimum secret length (in UTF-8 bytes) accepted at startup. */
    static final int MIN_SECRET_BYTES = 32;

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:86400000}") // 24 hours in milliseconds
    private long expiration;

    /**
     * Fails fast on startup when JWT_SECRET is missing or too short.
     * <p>Docker Compose substitutes an unset {@code ${JWT_SECRET}} with an empty string, which
     * would otherwise produce a predictable signing key (SHA-512 of "") and let anyone forge tokens.
     */
    @PostConstruct
    void validateSecret() {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET is not set. Define it in the environment (.env).");
        }
        if (secret.getBytes(StandardCharsets.UTF_8).length < MIN_SECRET_BYTES) {
            throw new IllegalStateException("JWT_SECRET must be at least " + MIN_SECRET_BYTES
                    + " bytes long. Generate one with: openssl rand -base64 64");
        }
    }

    /**
     * Gets the signing key for JWT tokens.
     * <p>JJWT rejects HS512 keys shorter than 512 bits. Secrets between 32 and 63 UTF-8 bytes
     * (shorter ones are rejected at startup) are hashed with SHA-512 to reach the required size.
     * Secrets that are already 64+ UTF-8 bytes are used as-is.
     *
     * @return SecretKey for HMAC-SHA512 signing
     */
    private SecretKey getSigningKey() {
        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        if (raw.length < 64) {
            try {
                raw = MessageDigest.getInstance("SHA-512").digest(raw);
            } catch (NoSuchAlgorithmException e) {
                throw new IllegalStateException("SHA-512 not available", e);
            }
        }
        return Keys.hmacShaKeyFor(raw);
    }

    /**
     * Generates a JWT token for a user.
     * 
     * @param email User's email address (used as subject)
     * @param userId User's ID (stored as claim)
     * @param authVersion Current credential version; password resets increment it
     * @return JWT token string
     */
    public String generateToken(String email, Long userId, int authVersion) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .claim("authVersion", authVersion)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Extracts the email address from a JWT token.
     * 
     * @param token JWT token string
     * @return Email address from token subject
     * @throws JwtException if token is invalid or cannot be parsed
     */
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    /**
     * Extracts the user ID from a JWT token.
     * 
     * @param token JWT token string
     * @return User ID from token claims
     * @throws JwtException if token is invalid or cannot be parsed
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("userId", Long.class);
    }

    /** Returns zero for tokens created before credential-version support was added. */
    public int getAuthVersionFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        Object authVersion = claims.get("authVersion");
        return authVersion instanceof Number number ? number.intValue() : 0;
    }

    /**
     * Extracts the expiration date from a JWT token.
     * 
     * @param token JWT token string
     * @return Expiration date from token claims
     * @throws JwtException if token is invalid or cannot be parsed
     */
    public Date getExpirationDateFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getExpiration();
    }

    /**
     * Checks if a JWT token is expired.
     * 
     * @param token JWT token string
     * @return true if token is expired or invalid, false otherwise
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            return expiration.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * Validates a JWT token.
     * 
     * Checks both token signature and expiration. Returns false if token is
     * invalid, expired, or cannot be parsed.
     * 
     * @param token JWT token string
     * @return true if token is valid and not expired, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extracts the JWT token from an Authorization header.
     * 
     * Expects header format: "Bearer <token>"
     * 
     * @param authHeader Authorization header value
     * @return JWT token string, or null if header is invalid or missing
     */
    public String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
