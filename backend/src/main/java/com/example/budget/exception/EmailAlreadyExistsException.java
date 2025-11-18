package com.example.budget.exception;

/**
 * Exception thrown when attempting to register a user with an email that already exists.
 * 
 * Used during user registration to prevent duplicate email addresses. Automatically
 * mapped to HTTP 409 CONFLICT by GlobalExceptionHandler.
 */
public class EmailAlreadyExistsException extends RuntimeException {
    
    /**
     * Creates an exception indicating that the provided email is already registered.
     * 
     * @param email The email address that already exists
     */
    public EmailAlreadyExistsException(String email) {
        super(String.format("Email '%s' is already in use", email));
    }
}

