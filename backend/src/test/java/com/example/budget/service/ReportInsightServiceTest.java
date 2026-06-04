package com.example.budget.service;

import com.example.budget.dto.ReportResponse;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ReportInsightServiceTest {
    private final ReportInsightService insightService =
            new ReportInsightService(new ReportMoneyFormatter());

    @Test
    void buildInsights_emptyPeriodReturnsSingleNotice() {
        ReportResponse report = new ReportResponse();
        report.setTransactionCount(0);

        assertThat(insightService.buildInsights(report))
                .containsExactly("No transactions were recorded in this period.");
    }

    @Test
    void buildInsights_positiveBalanceWithBreakdowns() {
        ReportResponse report = new ReportResponse();
        report.setTransactionCount(4);
        report.setBalance(new BigDecimal("1000.00"));
        report.setExpenseCategories(List.of(
                new ReportResponse.CategoryBreakdown("Rent", new BigDecimal("1200.00"), new BigDecimal("60.0"), 1),
                new ReportResponse.CategoryBreakdown("Food", new BigDecimal("800.00"), new BigDecimal("40.0"), 2)));
        report.setPaymentMethods(List.of(
                new ReportResponse.PaymentMethodBreakdown("Bank", new BigDecimal("1200.00"), new BigDecimal("60.0"), 1)));
        report.setInstallmentExpenseTotal(new BigDecimal("300.00"));
        report.setRecurringExpenseTotal(new BigDecimal("1200.00"));

        List<String> insights = insightService.buildInsights(report);

        assertThat(insights).containsExactly(
                "Income covered expenses in this period, leaving a positive balance of £1,000.00.",
                "Rent was the largest expense category at £1,200.00 (60.0%).",
                "Bank carried the highest payment-method spend at £1,200.00 (60.0%).",
                "Installments accounted for £300.00 and recurring expenses accounted for £1,200.00.");
    }

    @Test
    void buildInsights_negativeBalance() {
        ReportResponse report = new ReportResponse();
        report.setTransactionCount(2);
        report.setBalance(new BigDecimal("-250.00"));

        assertThat(insightService.buildInsights(report))
                .first()
                .isEqualTo("Expenses exceeded income by £250.00.");
    }

    @Test
    void buildInsights_skipsCommitmentLineWhenNoInstallmentsOrRecurring() {
        ReportResponse report = new ReportResponse();
        report.setTransactionCount(1);
        report.setBalance(new BigDecimal("50.00"));

        assertThat(insightService.buildInsights(report))
                .noneMatch(insight -> insight.startsWith("Installments accounted for"));
    }
}
