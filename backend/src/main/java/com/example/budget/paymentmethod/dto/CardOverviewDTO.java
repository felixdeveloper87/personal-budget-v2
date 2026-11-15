package com.example.budget.paymentmethod.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Per-card numbers for the cards list, computed on the server so the client does
 * not have to download every transaction.
 *
 * @param currentTotal total of the statement whose billing cycle is still open
 * @param outstanding  every statement not yet due; it keeps consuming the limit until paid
 */
public record CardOverviewDTO(
        Long cardId,
        BigDecimal currentTotal,
        BigDecimal outstanding,
        LocalDate nextPaymentDate,
        BigDecimal nextPaymentAmount,
        int statementCount
) {}
