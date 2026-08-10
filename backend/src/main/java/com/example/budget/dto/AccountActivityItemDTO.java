package com.example.budget.dto;

import com.example.budget.model.TransactionStatus;
import com.example.budget.model.PaymentMethodType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AccountActivityItemDTO(
        Long id,
        LocalDate date,
        String kind,
        String description,
        String category,
        BigDecimal amount,
        TransactionStatus status,
        String paymentMethodName,
        PaymentMethodType paymentMethodType
) {}
