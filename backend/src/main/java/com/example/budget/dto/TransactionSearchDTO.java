package com.example.budget.dto;

import com.example.budget.model.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Data Transfer Object for transaction search results.
 * 
 * Optimized DTO for search operations, containing only essential transaction
 * information. Includes installment plan information if the transaction is
 * part of an installment plan.
 */
public class TransactionSearchDTO {
    private Long id;
    private String description;
    private TransactionType type;
    private String category;
    private BigDecimal amount;
    private LocalDate date;
    private Long installmentPlanId;
    private Long recurringTransactionId;
    private boolean isInstallment;
    private boolean isRecurring;

    public TransactionSearchDTO(Long id, String description, TransactionType type,
            String category, BigDecimal amount, LocalDate date) {
        this.id = id;
        this.description = description;
        this.type = type;
        this.category = category;
        this.amount = amount;
        this.date = date;
        this.installmentPlanId = null;
        this.recurringTransactionId = null;
        this.isInstallment = false;
        this.isRecurring = false;
    }

    public TransactionSearchDTO(Long id, String description, TransactionType type,
            String category, BigDecimal amount, LocalDate date, Long installmentPlanId) {
        this(id, description, type, category, amount, date, installmentPlanId, null);
    }

    public TransactionSearchDTO(Long id, String description, TransactionType type,
            String category, BigDecimal amount, LocalDate date, Long installmentPlanId, Long recurringTransactionId) {
        this.id = id;
        this.description = description;
        this.type = type;
        this.category = category;
        this.amount = amount;
        this.date = date;
        this.installmentPlanId = installmentPlanId;
        this.recurringTransactionId = recurringTransactionId;
        this.isInstallment = (installmentPlanId != null);
        this.isRecurring = (recurringTransactionId != null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Long getInstallmentPlanId() {
        return installmentPlanId;
    }

    public void setInstallmentPlanId(Long installmentPlanId) {
        this.installmentPlanId = installmentPlanId;
        this.isInstallment = (installmentPlanId != null);
    }

    public Long getRecurringTransactionId() {
        return recurringTransactionId;
    }

    public void setRecurringTransactionId(Long recurringTransactionId) {
        this.recurringTransactionId = recurringTransactionId;
        this.isRecurring = (recurringTransactionId != null);
    }

    public boolean isInstallment() {
        return isInstallment;
    }

    public void setInstallment(boolean installment) {
        isInstallment = installment;
    }

    public boolean isRecurring() {
        return isRecurring;
    }

    public void setRecurring(boolean recurring) {
        isRecurring = recurring;
    }
}
