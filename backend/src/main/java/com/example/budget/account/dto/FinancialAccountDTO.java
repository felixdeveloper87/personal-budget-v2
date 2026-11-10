package com.example.budget.account.dto;

import com.example.budget.account.model.AccountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FinancialAccountDTO(
        Long id,
        String name,
        AccountType type,
        String institution,
        String currency,
        BigDecimal openingBalance,
        LocalDateTime balanceAnchorAt,
        BigDecimal currentBalance,
        BigDecimal overdraftLimit,
        BigDecimal overdraftUsed,
        BigDecimal overdraftAvailable,
        BigDecimal overdraftPercentageUsed,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
