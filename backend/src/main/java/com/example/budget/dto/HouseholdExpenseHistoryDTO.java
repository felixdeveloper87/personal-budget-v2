package com.example.budget.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record HouseholdExpenseHistoryDTO(List<Item> expenses, int page, boolean hasMore) {
    public record Item(
            Long id,
            String description,
            String category,
            BigDecimal amount,
            LocalDate expenseDate,
            Long payerMemberId,
            String payerName,
            BigDecimal currentUserShare,
            long attachmentCount
    ) {}
}
