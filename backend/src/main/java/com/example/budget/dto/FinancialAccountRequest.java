package com.example.budget.dto;

import com.example.budget.model.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class FinancialAccountRequest {
    @NotBlank(message = "Account name is required")
    @Size(max = 120)
    private String name;

    @NotNull(message = "Account type is required")
    private AccountType type;

    @Size(max = 120)
    private String institution;

    @Size(min = 3, max = 3)
    private String currency = "GBP";

    @NotNull(message = "Current balance is required")
    private BigDecimal openingBalance;

    @PositiveOrZero(message = "Overdraft limit cannot be negative")
    private BigDecimal overdraftLimit = BigDecimal.ZERO;

    private boolean active = true;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public AccountType getType() { return type; }
    public void setType(AccountType type) { this.type = type; }
    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public BigDecimal getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(BigDecimal openingBalance) { this.openingBalance = openingBalance; }
    public BigDecimal getOverdraftLimit() { return overdraftLimit; }
    public void setOverdraftLimit(BigDecimal overdraftLimit) { this.overdraftLimit = overdraftLimit; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
