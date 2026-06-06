package com.example.budget.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Data Transfer Object for installment plan responses.
 * 
 * Represents an installment plan with all its associated transactions.
 * Used when retrieving installment plan information from the API.
 */
public class InstallmentPlanDTO {
    private Long id;
    private int totalInstallments;
    private BigDecimal totalAmount;
    private BigDecimal installmentValue;
    private Long accountId;
    private String accountName;
    private Long paymentMethodId;
    private String paymentMethodName;
    private List<InstallmentTransactionDTO> transactions;

    public InstallmentPlanDTO() {
    }

    public InstallmentPlanDTO(Long id, int totalInstallments, BigDecimal totalAmount, 
                              BigDecimal installmentValue, List<InstallmentTransactionDTO> transactions) {
        this(id, totalInstallments, totalAmount, installmentValue, null, null, null, null, transactions);
    }

    public InstallmentPlanDTO(
            Long id,
            int totalInstallments,
            BigDecimal totalAmount,
            BigDecimal installmentValue,
            Long accountId,
            String accountName,
            Long paymentMethodId,
            String paymentMethodName,
            List<InstallmentTransactionDTO> transactions) {
        this.id = id;
        this.totalInstallments = totalInstallments;
        this.totalAmount = totalAmount;
        this.installmentValue = installmentValue;
        this.accountId = accountId;
        this.accountName = accountName;
        this.paymentMethodId = paymentMethodId;
        this.paymentMethodName = paymentMethodName;
        this.transactions = transactions;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getTotalInstallments() {
        return totalInstallments;
    }

    public void setTotalInstallments(int totalInstallments) {
        this.totalInstallments = totalInstallments;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getInstallmentValue() {
        return installmentValue;
    }

    public void setInstallmentValue(BigDecimal installmentValue) {
        this.installmentValue = installmentValue;
    }

    public Long getAccountId() { return accountId; }
    public String getAccountName() { return accountName; }
    public Long getPaymentMethodId() { return paymentMethodId; }
    public String getPaymentMethodName() { return paymentMethodName; }

    public List<InstallmentTransactionDTO> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<InstallmentTransactionDTO> transactions) {
        this.transactions = transactions;
    }

    /**
     * Data Transfer Object for individual installment transactions.
     * 
     * Represents a single transaction that is part of an installment plan.
     * Each installment has a number indicating its position (e.g., 1/3, 2/3, 3/3).
     */
    public static class InstallmentTransactionDTO {
        private Long id;
        private String description;
        private BigDecimal amount;
        private String category;
        private LocalDate date;
        private int installmentNumber;

        public InstallmentTransactionDTO() {
        }

        public InstallmentTransactionDTO(Long id, String description, BigDecimal amount, 
                                        String category, LocalDate date, int installmentNumber) {
            this.id = id;
            this.description = description;
            this.amount = amount;
            this.category = category;
            this.date = date;
            this.installmentNumber = installmentNumber;
        }

        public Long getId() {
            return id;
        }

        public String getDescription() {
            return description;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public String getCategory() {
            return category;
        }

        public LocalDate getDate() {
            return date;
        }

        public int getInstallmentNumber() {
            return installmentNumber;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }

        public void setInstallmentNumber(int installmentNumber) {
            this.installmentNumber = installmentNumber;
        }
    }
}
