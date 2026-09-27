package com.example.budget.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record HouseholdPaymentHistoryDTO(List<Item> payments, int page, boolean hasMore) {
    public record Item(
            Long id,
            Long fromMemberId,
            String fromMemberName,
            Long toMemberId,
            String toMemberName,
            BigDecimal amount,
            LocalDate settlementDate,
            String status
    ) {}
}
