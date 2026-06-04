package com.example.budget.service;

import com.example.budget.dto.ReportResponse;
import com.example.budget.model.Transaction;
import org.springframework.stereotype.Component;

/**
 * Converts {@link Transaction} entities into report transaction DTOs.
 */
@Component
public class ReportTransactionMapper {

    public ReportResponse.ReportTransactionItem toReportItem(Transaction tx) {
        return new ReportResponse.ReportTransactionItem(
                tx.getId(),
                tx.getPaymentDate(),
                tx.getType(),
                tx.getCategory(),
                tx.getDescription(),
                tx.getAmount(),
                tx.getPaymentMethod() != null ? tx.getPaymentMethod().getName() : null,
                tx.getInstallmentPlan() != null,
                tx.getRecurringTransaction() != null);
    }
}
