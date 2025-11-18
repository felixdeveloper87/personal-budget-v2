package com.example.budget.exception;

/**
 * Exception thrown when a user attempts to access or modify a resource they don't own.
 * 
 * Used to enforce resource ownership. For example, when a user tries to update or delete
 * a transaction or installment plan that belongs to another user. Automatically mapped
 * to HTTP 403 FORBIDDEN by GlobalExceptionHandler.
 */
public class AccessDeniedException extends RuntimeException {
    
    public AccessDeniedException(String message) {
        super(message);
    }
}

