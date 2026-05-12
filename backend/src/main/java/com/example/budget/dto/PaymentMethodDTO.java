package com.example.budget.dto;

import com.example.budget.model.PaymentMethodType;
import java.time.LocalDateTime;

public class PaymentMethodDTO {
    private Long id;
    private String name;
    private PaymentMethodType type;
    private String issuer;
    private boolean active;
    private Integer statementClosingDay;
    private Integer paymentDay;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PaymentMethodDTO() {
    }

    public PaymentMethodDTO(
            Long id,
            String name,
            PaymentMethodType type,
            String issuer,
            boolean active,
            Integer statementClosingDay,
            Integer paymentDay,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.issuer = issuer;
        this.active = active;
        this.statementClosingDay = statementClosingDay;
        this.paymentDay = paymentDay;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public PaymentMethodType getType() {
        return type;
    }

    public String getIssuer() {
        return issuer;
    }

    public boolean isActive() {
        return active;
    }

    public Integer getStatementClosingDay() {
        return statementClosingDay;
    }

    public Integer getPaymentDay() {
        return paymentDay;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
