package com.example.budget.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for creating a new installment plan.
 * 
 * Used to create an installment plan that automatically generates
 * multiple transaction entries spaced monthly. The plan will create
 * transactions for each installment starting from the specified date.
 */
public class CreateInstallmentPlanRequest {

    @NotNull(message = "Total installments is required")
    @Positive(message = "Total installments must be greater than zero")
    private Integer totalInstallments;

    @NotNull(message = "Installment value is required")
    @Positive(message = "Installment value must be greater than zero")
    private BigDecimal installmentValue;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    private LocalDate startDate;

    private LocalDateTime startDateTime;

    @NotNull(message = "Account is required")
    private Long accountId;

    private Long paymentMethodId;

    public CreateInstallmentPlanRequest() {
    }

    public CreateInstallmentPlanRequest(
            Integer totalInstallments,
            BigDecimal installmentValue,
            String category,
            String description,
            LocalDate startDate,
            LocalDateTime startDateTime
    ) {
        this.totalInstallments = totalInstallments;
        this.installmentValue = installmentValue;
        this.category = category;
        this.description = description;
        this.startDate = startDate;
        this.startDateTime = startDateTime;
    }

    public Integer getTotalInstallments() {
        return totalInstallments;
    }

    public BigDecimal getInstallmentValue() {
        return installmentValue;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDateTime getStartDateTime() {
        return startDateTime;
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

