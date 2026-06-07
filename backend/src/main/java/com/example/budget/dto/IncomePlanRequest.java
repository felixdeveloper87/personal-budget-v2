package com.example.budget.dto;

import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/**
 * Sets the user's global expected monthly income for the cash-flow forecast.
 * A {@code null} or zero value clears the plan and falls back to history-based estimates.
 */
public record IncomePlanRequest(
        @PositiveOrZero(message = "Expected monthly income cannot be negative")
        BigDecimal plannedMonthlyIncome
) {}
