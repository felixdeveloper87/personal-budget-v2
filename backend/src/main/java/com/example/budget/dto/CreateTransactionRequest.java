package com.example.budget.dto;

import com.example.budget.model.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for creating a new transaction.
 * 
 * Used to create a new income or expense transaction.
 * All fields are required and validated.
 */
public class CreateTransactionRequest {

    private LocalDateTime dateTime;

    private LocalDate transactionDate;

    @NotNull(message = "Type is required")
    private TransactionType type;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    private Long paymentMethodId;

    public CreateTransactionRequest() {
    }

    public CreateTransactionRequest(
            LocalDateTime dateTime,
            LocalDate transactionDate,
            TransactionType type,
            String category,
            String description,
            BigDecimal amount,
            Long paymentMethodId
    ) {
        this.dateTime = dateTime;
        this.transactionDate = transactionDate;
        this.type = type;
        this.category = category;
        this.description = description;
        this.amount = amount;
        this.paymentMethodId = paymentMethodId;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Long getPaymentMethodId() {
        return paymentMethodId;
    }

    public void setPaymentMethodId(Long paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }
}
