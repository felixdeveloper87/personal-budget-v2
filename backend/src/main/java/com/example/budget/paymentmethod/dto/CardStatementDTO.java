package com.example.budget.paymentmethod.dto;

import com.example.budget.transaction.dto.TransactionDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** One credit card statement (fatura). {@code status} is "open", "closed" or "upcoming". */
public record CardStatementDTO(
        String key,
        LocalDate periodStart,
        LocalDate closingDate,
        LocalDate paymentDate,
        String status,
        BigDecimal total,
        int transactionCount,
        List<TransactionDTO> transactions
) {}
