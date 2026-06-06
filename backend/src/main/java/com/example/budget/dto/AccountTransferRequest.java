package com.example.budget.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AccountTransferRequest {
    @NotNull
    private Long fromAccountId;
    @NotNull
    private Long toAccountId;
    @NotNull
    @Positive
    private BigDecimal amount;
    @NotNull
    private LocalDate transferDate;
    private String description;

    public Long getFromAccountId() { return fromAccountId; }
    public void setFromAccountId(Long fromAccountId) { this.fromAccountId = fromAccountId; }
    public Long getToAccountId() { return toAccountId; }
    public void setToAccountId(Long toAccountId) { this.toAccountId = toAccountId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getTransferDate() { return transferDate; }
    public void setTransferDate(LocalDate transferDate) { this.transferDate = transferDate; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
