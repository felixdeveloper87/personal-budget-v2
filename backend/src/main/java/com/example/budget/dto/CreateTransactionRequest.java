package com.example.budget.dto;

import com.example.budget.model.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for creating a new transaction.
 * 
 * Used to create a new income or expense transaction.
 * All fields are required and validated.
 */
public class CreateTransactionRequest {

    @NotNull(message = "Date and time is required")
    private LocalDateTime dateTime;

    @NotNull(message = "Type is required")
    private TransactionType type;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    public CreateTransactionRequest() {
    }

    public CreateTransactionRequest(
            LocalDateTime dateTime,
            TransactionType type,
            String category,
            String description,
            BigDecimal amount
    ) {
        this.dateTime = dateTime;
        this.type = type;
        this.category = category;
        this.description = description;
        this.amount = amount;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
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
}
