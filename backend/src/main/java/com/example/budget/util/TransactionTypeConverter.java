package com.example.budget.util;

import com.example.budget.model.TransactionType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Utility class para conversão de strings para TransactionType enum.
 * Centraliza a lógica de parsing e validação.
 */
@Component
public class TransactionTypeConverter {
    
    /**
     * Converte uma string para TransactionType enum.
     * Retorna null se a string for null, vazia ou não corresponder a nenhum tipo válido.
     * 
     * @param typeString String representando o tipo ("income" ou "expense", case-insensitive)
     * @return TransactionType correspondente ou null se inválido
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

