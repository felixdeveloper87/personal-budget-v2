package com.example.budget.dto;

import com.example.budget.model.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionSearchDTO {
    private Long id;
    private String description;
    private TransactionType type;
    private String category;
    private BigDecimal amount;
    private LocalDate date;
    private Long installmentPlanId; // ID do plano de parcelamento (se houver)
    private boolean isInstallment; // Indica se faz parte de um parcelamento

    // construtor rápido
    public TransactionSearchDTO(Long id, String description, TransactionType type,
            String category, BigDecimal amount, LocalDate date) {
        this.id = id;
        this.description = description;
        this.type = type;
        this.category = category;
        this.amount = amount;
        this.date = date;
        this.installmentPlanId = null;
        this.isInstallment = false;
    }

    // construtor completo com informações de parcelamento
    public TransactionSearchDTO(Long id, String description, TransactionType type,
            String category, BigDecimal amount, LocalDate date, Long installmentPlanId) {
        this.id = id;
        this.description = description;
        this.type = type;
        this.category = category;
        this.amount = amount;
        this.date = date;
        this.installmentPlanId = installmentPlanId;
        this.isInstallment = (installmentPlanId != null);
    }

    // getters & setters
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

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Long getInstallmentPlanId() {
        return installmentPlanId;
    }

    public void setInstallmentPlanId(Long installmentPlanId) {
        this.installmentPlanId = installmentPlanId;
        this.isInstallment = (installmentPlanId != null);
    }

    public boolean isInstallment() {
        return isInstallment;
    }

    public void setInstallment(boolean installment) {
        isInstallment = installment;
    }
}
