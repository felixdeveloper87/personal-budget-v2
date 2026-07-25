package com.example.budget.dto;

import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class UpdateInstallmentPlanRequest {

    @Positive(message = "Installment value must be greater than zero")
    private BigDecimal installmentValue;

    @Positive(message = "Total amount must be greater than zero")
    private BigDecimal totalAmount;

    private LocalDate startDate;

    private LocalDateTime startDateTime;

    private LocalDate purchaseDate;

    private Long accountId;

    private Long paymentMethodId;

    public UpdateInstallmentPlanRequest() {
    }

    public UpdateInstallmentPlanRequest(
            BigDecimal installmentValue,
            LocalDate startDate,
            LocalDateTime startDateTime
    ) {
        this.installmentValue = installmentValue;
        this.startDate = startDate;
        this.startDateTime = startDateTime;
    }

    public UpdateInstallmentPlanRequest(
            BigDecimal installmentValue,
            BigDecimal totalAmount,
            LocalDate startDate,
            LocalDateTime startDateTime
    ) {
        this.installmentValue = installmentValue;
        this.totalAmount = totalAmount;
        this.startDate = startDate;
        this.startDateTime = startDateTime;
    }

    public BigDecimal getInstallmentValue() {
        return installmentValue;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
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
