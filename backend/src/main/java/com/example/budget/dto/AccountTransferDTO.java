package com.example.budget.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AccountTransferDTO(
        Long id,
        Long fromAccountId,
        String fromAccountName,
        Long toAccountId,
        String toAccountName,
        BigDecimal amount,
        LocalDate transferDate,
        String description,
        LocalDateTime createdAt
) {}
