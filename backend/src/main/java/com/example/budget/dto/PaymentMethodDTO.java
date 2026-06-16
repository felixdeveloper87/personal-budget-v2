package com.example.budget.dto;

import com.example.budget.model.PaymentMethodType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentMethodDTO {
    private Long id;
    private String name;
    private PaymentMethodType type;
    private String issuer;
    private boolean active;
    private Integer statementClosingDay;
    private Integer paymentDay;
    private BigDecimal creditLimit;
    private Long settlementAccountId;
    private String settlementAccountName;
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
            BigDecimal creditLimit,
            Long settlementAccountId,
            String settlementAccountName,
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
        this.creditLimit = creditLimit;
        this.settlementAccountId = settlementAccountId;
        this.settlementAccountName = settlementAccountName;
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

    public BigDecimal getCreditLimit() {
        return creditLimit;
    }

    public Long getSettlementAccountId() {
        return settlementAccountId;
    }

    public String getSettlementAccountName() {
        return settlementAccountName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
