package com.example.budget.dto;

import java.math.BigDecimal;

public record CategoryBudgetDTO(
        Long id,
        String category,
        int year,
        int month,
        BigDecimal limitAmount,
        BigDecimal spentAmount,
        BigDecimal remainingAmount,
        BigDecimal percentageUsed,
        boolean exceeded
) {}
