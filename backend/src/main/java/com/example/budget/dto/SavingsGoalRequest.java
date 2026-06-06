package com.example.budget.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SavingsGoalRequest {
    @NotBlank
    private String name;
    @NotNull
    @Positive
    private BigDecimal targetAmount;
    private BigDecimal currentAmount = BigDecimal.ZERO;
    private LocalDate targetDate;
    private String color = "#2563eb";

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getTargetAmount() { return targetAmount; }
    public void setTargetAmount(BigDecimal targetAmount) { this.targetAmount = targetAmount; }
    public BigDecimal getCurrentAmount() { return currentAmount; }
    public void setCurrentAmount(BigDecimal currentAmount) { this.currentAmount = currentAmount; }
    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
