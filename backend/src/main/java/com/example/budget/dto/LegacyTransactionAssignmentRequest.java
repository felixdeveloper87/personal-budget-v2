package com.example.budget.dto;

import java.time.LocalDate;

public class LegacyTransactionAssignmentRequest {
    private Long paymentMethodId;
    private Long installmentPlanId;
    private Long recurringTransactionId;
    private LocalDate startDate;
    private LocalDate endDate;

    public Long getPaymentMethodId() { return paymentMethodId; }
    public void setPaymentMethodId(Long paymentMethodId) { this.paymentMethodId = paymentMethodId; }
    public Long getInstallmentPlanId() { return installmentPlanId; }
    public void setInstallmentPlanId(Long installmentPlanId) { this.installmentPlanId = installmentPlanId; }
    public Long getRecurringTransactionId() { return recurringTransactionId; }
    public void setRecurringTransactionId(Long recurringTransactionId) { this.recurringTransactionId = recurringTransactionId; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
