package com.example.budget.validator;

import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.Transaction;
import com.example.budget.model.User;
import org.springframework.stereotype.Component;

/**
 * Validator for transaction business rules.
 * 
 * Centralizes all validation logic for transactions to facilitate maintenance and testing.
 * Ensures data integrity and proper access control.
 */
@Component
public class TransactionValidator {
    
    /**
     * Validates that a transaction exists.
     * 
     * @param transaction Transaction to validate
     * @param transactionId Transaction ID for error message
     * @throws EntityNotFoundException if transaction is null
     */
    public void validateTransactionExists(Transaction transaction, Long transactionId) {
        if (transaction == null) {
            throw new EntityNotFoundException("Transaction", transactionId);
        }
    }
    
    /**
     * Validates that a user has permission to access or modify a transaction.
     * 
     * Performs defensive checks to ensure transaction and user are in valid states
     * before checking ownership.
     * 
     * @param transaction Transaction to validate
     * @param user User attempting to access the transaction
     * @throws IllegalArgumentException if transaction or user is null
     * @throws IllegalStateException if transaction has no associated user or user has no ID
     * @throws AccessDeniedException if user is not the owner of the transaction
     */
    public void validateUserOwnership(Transaction transaction, User user) {
        if (transaction == null || user == null) {
            throw new IllegalArgumentException("Transaction and User cannot be null");
        }
        
        if (transaction.getUser() == null) {
            throw new IllegalStateException("Transaction does not have an associated user");
        }
        
        if (user.getId() == null) {
            throw new IllegalStateException("User ID cannot be null");
        }
        
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: Transaction does not belong to user");
        }
    }
    
    /**
     * Validates both transaction existence and user ownership.
     * 
     * Convenience method that combines both validations for common use cases.
     * 
     * @param transaction Transaction to validate
     * @param transactionId Transaction ID for error message
     * @param user User attempting to access the transaction
     */
    public void validateTransactionAccess(Transaction transaction, Long transactionId, User user) {
        validateTransactionExists(transaction, transactionId);
        validateUserOwnership(transaction, user);
    }
}

