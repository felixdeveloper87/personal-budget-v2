package com.example.budget.dto;

import com.example.budget.model.TransactionType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateRecurringTransactionRequest {

    @NotNull(message = "Type is required")
    private TransactionType type;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    @Min(value = 1, message = "Day of month must be between 1 and 31")
    @Max(value = 31, message = "Day of month must be between 1 and 31")
    private Integer dayOfMonth;

    public CreateRecurringTransactionRequest() {
    }

    public TransactionType getType() {
        return type;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public Integer getDayOfMonth() {
        return dayOfMonth;
    }
}
