package com.example.budget.util;

import com.example.budget.model.TransactionType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Utility class for converting strings to TransactionType enum.
 * 
 * Centralizes parsing and validation logic for transaction type conversion.
 * Handles case-insensitive matching and returns null for invalid inputs.
 */
@Component
public class TransactionTypeConverter {
    
    /**
     * Converts a string to TransactionType enum.
     * 
     * Performs case-insensitive matching. Returns null if the string is null,
     * empty, or does not match any valid transaction type.
     * 
     * @param typeString String representing the type ("income" or "expense", case-insensitive)
     * @return TransactionType corresponding to the string, or null if invalid
     */
    public TransactionType fromString(String typeString) {
        if (!StringUtils.hasText(typeString)) {
            return null;
        }
        
        String normalized = typeString.trim().toLowerCase();
        
        return switch (normalized) {
            case "income" -> TransactionType.INCOME;
            case "expense" -> TransactionType.EXPENSE;
            default -> null;
        };
    }
}

