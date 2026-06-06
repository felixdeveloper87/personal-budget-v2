package com.example.budget.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SavingsGoalDTO(
        Long id,
        String name,
        BigDecimal targetAmount,
        BigDecimal currentAmount,
        BigDecimal remainingAmount,
        BigDecimal progressPercentage,
        LocalDate targetDate,
        String color,
        boolean archived
) {}
