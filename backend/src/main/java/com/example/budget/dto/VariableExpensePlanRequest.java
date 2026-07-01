package com.example.budget.dto;

import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/**
 * Sets the user's global estimated monthly day-to-day expense (groceries,
 * transport, etc) for the cash-flow forecast. A {@code null} or zero value
 * clears the plan, so the forecast only counts fixed expenses and installments.
 */
public record VariableExpensePlanRequest(
        @PositiveOrZero(message = "Estimated monthly expense cannot be negative")
        BigDecimal plannedMonthlyVariableExpense
) {}
