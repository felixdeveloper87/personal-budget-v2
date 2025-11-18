package com.example.budget.exception;

/**
 * Exception thrown when user authentication fails due to invalid credentials.
 * 
 * Used during login when the provided email or password is incorrect. Automatically
 * mapped to HTTP 401 UNAUTHORIZED by GlobalExceptionHandler.
 */
public class InvalidCredentialsException extends RuntimeException {
    
    /**
     * Creates an exception with a default message indicating invalid credentials.
     */
    public InvalidCredentialsException() {
        super("Invalid email or password");
    }
    
    /**
     * Creates an exception with a custom error message.
     * 
     * @param message Custom error message
     */
    public InvalidCredentialsException(String message) {
        super(message);
    }
}

