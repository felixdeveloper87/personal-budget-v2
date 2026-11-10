package com.example.budget.report.service;

import com.example.budget.report.dto.ReportResponse;
import com.example.budget.transaction.model.Transaction;
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
                tx.getAccount() != null ? tx.getAccount().getName() : null,
                tx.getStatus(),
                tx.getInstallmentPlan() != null,
                tx.getRecurringTransaction() != null);
    }
}
