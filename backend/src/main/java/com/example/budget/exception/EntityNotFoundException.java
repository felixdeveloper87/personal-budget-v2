package com.example.budget.exception;

/**
 * Exception thrown when a requested entity is not found in the database.
 * 
 * Used to indicate that an operation attempted to access an entity (e.g., Transaction,
 * InstallmentPlan) that does not exist. Automatically mapped to HTTP 404 NOT FOUND
 * by GlobalExceptionHandler.
 */
public class EntityNotFoundException extends RuntimeException {
    
    public EntityNotFoundException(String message) {
        super(message);
    }
    
    /**
     * Creates an exception with a formatted message indicating which entity and ID was not found.
     * 
     * @param entityName The name of the entity type (e.g., "Transaction", "InstallmentPlan")
     * @param id The ID that was not found
     */
    public EntityNotFoundException(String entityName, Long id) {
        super(String.format("%s with id %d not found", entityName, id));
    }
}

