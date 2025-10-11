package com.example.budget.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class InstallmentPlanDTO {
    private Long id;
    private int totalInstallments;
    private BigDecimal totalAmount;
    private BigDecimal installmentValue;
    private List<InstallmentTransactionDTO> transactions;

    public InstallmentPlanDTO() {
    }

    public InstallmentPlanDTO(Long id, int totalInstallments, BigDecimal totalAmount, 
                              BigDecimal installmentValue, List<InstallmentTransactionDTO> transactions) {
        this.id = id;
        this.totalInstallments = totalInstallments;
        this.totalAmount = totalAmount;
        this.installmentValue = installmentValue;
        this.transactions = transactions;
    }

    // Getters e Setters
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

    public List<InstallmentTransactionDTO> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<InstallmentTransactionDTO> transactions) {
        this.transactions = transactions;
    }

    // Inner class para representar cada transação da parcela
    public static class InstallmentTransactionDTO {
        private Long id;
        private String description;
        private BigDecimal amount;
        private String category;
        private LocalDate date;
        private int installmentNumber; // Ex: 1/3, 2/3, 3/3

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

        // Getters e Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }

        public int getInstallmentNumber() {
            return installmentNumber;
        }

        public void setInstallmentNumber(int installmentNumber) {
            this.installmentNumber = installmentNumber;
        }
    }
}

