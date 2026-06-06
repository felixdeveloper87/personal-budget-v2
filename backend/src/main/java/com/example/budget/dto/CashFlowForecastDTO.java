package com.example.budget.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CashFlowForecastDTO(
        BigDecimal currentTotalBalance,
        List<Horizon> horizons,
        List<Event> events
) {
    public record Horizon(
            int days,
            LocalDate date,
            BigDecimal expectedBalance,
            boolean negative
    ) {}

    public record Event(
            LocalDate date,
            String kind,
            String description,
            BigDecimal amount,
            Long accountId,
            String accountName,
            String category
    ) {}
}
