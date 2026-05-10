package com.example.budget.dto;

import com.example.budget.model.RecurringFrequency;
import com.example.budget.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RecurringTransactionDTO {
    private Long id;
    private TransactionType type;
    private String category;
    private String description;
    private BigDecimal amount;
    private RecurringFrequency frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextRunDate;
    private Integer dayOfMonth;
    private boolean active;

    public RecurringTransactionDTO() {
    }

    public RecurringTransactionDTO(
            Long id,
            TransactionType type,
            String category,
            String description,
            BigDecimal amount,
            RecurringFrequency frequency,
            LocalDate startDate,
            LocalDate endDate,
            LocalDate nextRunDate,
            Integer dayOfMonth,
            boolean active
    ) {
        this.id = id;
        this.type = type;
        this.category = category;
        this.description = description;
        this.amount = amount;
        this.frequency = frequency;
        this.startDate = startDate;
        this.endDate = endDate;
        this.nextRunDate = nextRunDate;
        this.dayOfMonth = dayOfMonth;
        this.active = active;
    }

    public Long getId() {
        return id;
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

    public RecurringFrequency getFrequency() {
        return frequency;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public LocalDate getNextRunDate() {
        return nextRunDate;
    }

    public Integer getDayOfMonth() {
        return dayOfMonth;
    }

    public boolean isActive() {
        return active;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setFrequency(RecurringFrequency frequency) {
        this.frequency = frequency;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public void setNextRunDate(LocalDate nextRunDate) {
        this.nextRunDate = nextRunDate;
    }

    public void setDayOfMonth(Integer dayOfMonth) {
        this.dayOfMonth = dayOfMonth;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
