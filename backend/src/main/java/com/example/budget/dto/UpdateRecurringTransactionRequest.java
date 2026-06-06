package com.example.budget.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public class UpdateRecurringTransactionRequest {

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Day of month is required")
    @Min(value = 1, message = "Day of month must be between 1 and 31")
    @Max(value = 31, message = "Day of month must be between 1 and 31")
    private Integer dayOfMonth;

    private Long accountId;

    private Long paymentMethodId;

    public UpdateRecurringTransactionRequest() {
    }

    public UpdateRecurringTransactionRequest(
            BigDecimal amount,
            LocalDate startDate,
            Integer dayOfMonth
    ) {
        this.amount = amount;
        this.startDate = startDate;
        this.dayOfMonth = dayOfMonth;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public Integer getDayOfMonth() {
        return dayOfMonth;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public Long getPaymentMethodId() {
        return paymentMethodId;
    }

    public void setPaymentMethodId(Long paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }
}
