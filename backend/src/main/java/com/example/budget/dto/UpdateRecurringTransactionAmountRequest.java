package com.example.budget.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class UpdateRecurringTransactionAmountRequest {

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    public UpdateRecurringTransactionAmountRequest() {
    }

    public BigDecimal getAmount() {
        return amount;
    }
}
