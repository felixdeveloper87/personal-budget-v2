package com.example.budget.transaction.util;

import com.example.budget.transaction.model.TransactionType;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Converts request parameters such as {@code ?type=income} into {@link TransactionType}.
 *
 * <p>Registered automatically by Spring Boot because it is a {@link Converter} bean, so
 * controllers can declare {@code @RequestParam TransactionType type} directly. Matching is
 * case-insensitive ("income", "INCOME", "Income") and a blank value means no filter. Unknown
 * values throw, which Spring turns into a {@code MethodArgumentTypeMismatchException} (HTTP 400).
 */
@Component
public class TransactionTypeConverter implements Converter<String, TransactionType> {

    @Override
    public TransactionType convert(String source) {
        if (source.isBlank()) {
            return null; // "?type=" means no type filter
        }
        String normalized = source.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "income" -> TransactionType.INCOME;
            case "expense" -> TransactionType.EXPENSE;
            default -> throw new IllegalArgumentException(
                    "Invalid transaction type '" + source + "'. Use 'income' or 'expense'");
        };
    }
}
