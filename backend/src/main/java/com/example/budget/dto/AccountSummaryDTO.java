package com.example.budget.dto;

import java.math.BigDecimal;
import java.util.List;

public record AccountSummaryDTO(
        BigDecimal totalBalance,
        long unassignedTransactionCount,
        List<FinancialAccountDTO> accounts
) {}
