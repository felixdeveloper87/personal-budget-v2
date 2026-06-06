package com.example.budget.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SavingsGoalContributionRequest {
    @NotNull
    private BigDecimal amount;
    private LocalDate contributionDate;
    private String note;

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getContributionDate() { return contributionDate; }
    public void setContributionDate(LocalDate contributionDate) { this.contributionDate = contributionDate; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
