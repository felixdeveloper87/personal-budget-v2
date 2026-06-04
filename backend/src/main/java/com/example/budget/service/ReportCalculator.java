package com.example.budget.service;

import com.example.budget.dto.ReportResponse;
import com.example.budget.model.PeriodRange;
import com.example.budget.model.ReportPeriod;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Assembles the {@link ReportResponse} from the transactions of a period: totals, averages,
 * category and payment-method breakdowns, time buckets, top movements and insights.
 */
@Component
public class ReportCalculator {
    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

    private final ReportTransactionMapper transactionMapper;
    private final ReportInsightService insightService;

    public ReportCalculator(ReportTransactionMapper transactionMapper, ReportInsightService insightService) {
        this.transactionMapper = transactionMapper;
        this.insightService = insightService;
    }

    public ReportResponse buildReport(
            ReportPeriod period,
            LocalDate date,
            PeriodRange range,
            List<Transaction> transactions) {
        BigDecimal totalIncome = sum(transactions, TransactionType.INCOME);
        BigDecimal totalExpense = sum(transactions, TransactionType.EXPENSE);
        int incomeCount = count(transactions, TransactionType.INCOME);
        int expenseCount = count(transactions, TransactionType.EXPENSE);

        ReportResponse response = new ReportResponse();
        response.setPeriod(period.requestValue());
        response.setPeriodLabel(period.label(date, range));
        response.setReferenceDate(date);
        response.setStartDate(range.start());
        response.setEndDate(range.end());
        response.setGeneratedAt(LocalDateTime.now());
        response.setTotalIncome(totalIncome);
        response.setTotalExpense(totalExpense);
        response.setBalance(totalIncome.subtract(totalExpense));
        response.setAverageExpense(expenseCount == 0
                ? BigDecimal.ZERO
                : totalExpense.divide(BigDecimal.valueOf(expenseCount), 2, RoundingMode.HALF_UP));
        response.setTransactionCount(transactions.size());
        response.setIncomeCount(incomeCount);
        response.setExpenseCount(expenseCount);
        response.setInstallmentExpenseTotal(sumSpecial(transactions, true));
        response.setRecurringExpenseTotal(sumSpecial(transactions, false));
        response.setIncomeCategories(categoryBreakdown(transactions, TransactionType.INCOME, totalIncome));
        response.setExpenseCategories(categoryBreakdown(transactions, TransactionType.EXPENSE, totalExpense));
        response.setPaymentMethods(paymentMethodBreakdown(transactions, totalExpense));
        response.setBuckets(timeBuckets(period, range, transactions));
        response.setTopIncome(topTransactions(transactions, TransactionType.INCOME));
        response.setTopExpenses(topTransactions(transactions, TransactionType.EXPENSE));
        response.setInsights(insightService.buildInsights(response));
        return response;
    }

    private BigDecimal sum(List<Transaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(tx -> tx.getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private int count(List<Transaction> transactions, TransactionType type) {
        return (int) transactions.stream().filter(tx -> tx.getType() == type).count();
    }

    private BigDecimal sumSpecial(List<Transaction> transactions, boolean installment) {
        return transactions.stream()
                .filter(tx -> tx.getType() == TransactionType.EXPENSE)
                .filter(tx -> installment ? tx.getInstallmentPlan() != null : tx.getRecurringTransaction() != null)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<ReportResponse.CategoryBreakdown> categoryBreakdown(
            List<Transaction> transactions,
            TransactionType type,
            BigDecimal total) {
        Map<String, List<Transaction>> grouped = transactions.stream()
                .filter(tx -> tx.getType() == type)
                .collect(Collectors.groupingBy(
                        tx -> blankToDefault(tx.getCategory(), "Uncategorised"),
                        LinkedHashMap::new,
                        Collectors.toList()));

        return grouped.entrySet().stream()
                .map(entry -> {
                    BigDecimal amount = entry.getValue().stream()
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new ReportResponse.CategoryBreakdown(
                            entry.getKey(),
                            amount,
                            percentage(amount, total),
                            entry.getValue().size());
                })
                .sorted(Comparator.comparing(ReportResponse.CategoryBreakdown::getAmount).reversed())
                .toList();
    }

    private List<ReportResponse.PaymentMethodBreakdown> paymentMethodBreakdown(
            List<Transaction> transactions,
            BigDecimal totalExpense) {
        Map<String, List<Transaction>> grouped = transactions.stream()
                .filter(tx -> tx.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        tx -> tx.getPaymentMethod() != null
                                ? blankToDefault(tx.getPaymentMethod().getName(), "Unnamed method")
                                : "No payment method",
                        LinkedHashMap::new,
                        Collectors.toList()));

        return grouped.entrySet().stream()
                .map(entry -> {
                    BigDecimal amount = entry.getValue().stream()
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new ReportResponse.PaymentMethodBreakdown(
                            entry.getKey(),
                            amount,
                            percentage(amount, totalExpense),
                            entry.getValue().size());
                })
                .sorted(Comparator.comparing(ReportResponse.PaymentMethodBreakdown::getAmount).reversed())
                .toList();
    }

    private List<ReportResponse.TimeBucket> timeBuckets(
            ReportPeriod period,
            PeriodRange range,
            List<Transaction> transactions) {
        List<PeriodRange> bucketRanges = period.bucketRanges(range);
        return bucketRanges.stream()
                .map(bucket -> {
                    List<Transaction> bucketTransactions = transactions.stream()
                            .filter(tx -> !tx.getPaymentDate().isBefore(bucket.start())
                                    && !tx.getPaymentDate().isAfter(bucket.end()))
                            .toList();
                    return new ReportResponse.TimeBucket(
                            bucket.label(),
                            bucket.start(),
                            bucket.end(),
                            sum(bucketTransactions, TransactionType.INCOME),
                            sum(bucketTransactions, TransactionType.EXPENSE),
                            bucketTransactions.size());
                })
                .toList();
    }

    private List<ReportResponse.ReportTransactionItem> topTransactions(
            List<Transaction> transactions,
            TransactionType type) {
        return transactions.stream()
                .filter(tx -> tx.getType() == type)
                .sorted(Comparator.comparing(Transaction::getAmount).reversed())
                .limit(8)
                .map(transactionMapper::toReportItem)
                .toList();
    }

    private BigDecimal percentage(BigDecimal amount, BigDecimal total) {
        if (total == null || total.signum() == 0) {
            return BigDecimal.ZERO;
        }
        return amount.multiply(ONE_HUNDRED).divide(total, 1, RoundingMode.HALF_UP);
    }

    private String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
