package com.example.budget.household.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Input validation and money formatting shared by the household services. */
final class HouseholdValues {
    static final BigDecimal ZERO = new BigDecimal("0.00");

    private HouseholdValues() {
    }

    /** Trims the value and rejects it when blank or longer than {@code maxLength}. */
    static String requiredText(String value, String label, int maxLength) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new IllegalArgumentException(
                    label + " must be " + maxLength + " characters or fewer");
        }
        return normalized;
    }

    /** Requires a positive amount with at most two decimal places. */
    static BigDecimal money(BigDecimal value, String label) {
        if (value == null || value.signum() <= 0) {
            throw new IllegalArgumentException(label + " must be greater than zero");
        }
        try {
            BigDecimal normalized = value.setScale(2, RoundingMode.UNNECESSARY);
            if (normalized.precision() > 14) {
                throw new IllegalArgumentException(label + " is too large");
            }
            return normalized;
        } catch (ArithmeticException ex) {
            throw new IllegalArgumentException(label + " can have at most two decimal places");
        }
    }

    /** Formats an amount for responses: null becomes 0.00, always two decimals. */
    static BigDecimal amount(BigDecimal value) {
        return (value == null ? ZERO : value).setScale(2, RoundingMode.HALF_UP);
    }
}
