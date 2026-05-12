package com.example.budget.dto;

import com.example.budget.model.PaymentMethodType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PaymentMethodRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 120, message = "Name must be at most 120 characters")
    private String name;

    @NotNull(message = "Type is required")
    private PaymentMethodType type;

    @Size(max = 120, message = "Issuer must be at most 120 characters")
    private String issuer;

    private boolean active = true;

    @Min(value = 1, message = "Statement closing day must be between 1 and 31")
    @Max(value = 31, message = "Statement closing day must be between 1 and 31")
    private Integer statementClosingDay;

    @Min(value = 1, message = "Payment day must be between 1 and 31")
    @Max(value = 31, message = "Payment day must be between 1 and 31")
    private Integer paymentDay;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public PaymentMethodType getType() {
        return type;
    }

    public void setType(PaymentMethodType type) {
        this.type = type;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Integer getStatementClosingDay() {
        return statementClosingDay;
    }

    public void setStatementClosingDay(Integer statementClosingDay) {
        this.statementClosingDay = statementClosingDay;
    }

    public Integer getPaymentDay() {
        return paymentDay;
    }

    public void setPaymentDay(Integer paymentDay) {
        this.paymentDay = paymentDay;
    }
}
