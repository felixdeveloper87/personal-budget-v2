package com.example.budget.service;

import com.example.budget.dto.ReportResponse;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Builds the human-readable executive insights for a report, independently of the PDF.
 */
@Component
public class ReportInsightService {
    private final ReportMoneyFormatter moneyFormatter;

    public ReportInsightService(ReportMoneyFormatter moneyFormatter) {
        this.moneyFormatter = moneyFormatter;
    }

    public List<String> buildInsights(ReportResponse report) {
        List<String> insights = new ArrayList<>();
        if (report.getTransactionCount() == 0) {
            insights.add("No transactions were recorded in this period.");
            return insights;
        }

        if (report.getBalance().signum() >= 0) {
            insights.add("Income covered expenses in this period, leaving a positive balance of "
                    + money(report.getBalance()) + ".");
        } else {
            insights.add("Expenses exceeded income by " + money(report.getBalance().abs()) + ".");
        }

        report.getExpenseCategories().stream().findFirst()
                .ifPresent(category -> insights.add(category.getCategory() + " was the largest expense category at "
                        + money(category.getAmount()) + " (" + category.getPercentage() + "%)."));

        report.getPaymentMethods().stream().findFirst().ifPresent(
                method -> insights.add(method.getName() + " carried the highest payment-method spend at "
                        + money(method.getAmount()) + " (" + method.getPercentage() + "%)."));

        if (report.getInstallmentExpenseTotal().signum() > 0 || report.getRecurringExpenseTotal().signum() > 0) {
            insights.add("Installments accounted for " + money(report.getInstallmentExpenseTotal())
                    + " and recurring expenses accounted for " + money(report.getRecurringExpenseTotal()) + ".");
        }
        return insights;
    }

    private String money(java.math.BigDecimal value) {
        return moneyFormatter.format(value);
    }
}
