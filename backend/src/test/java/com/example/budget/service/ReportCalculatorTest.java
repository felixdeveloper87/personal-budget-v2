package com.example.budget.service;

import com.example.budget.dto.ReportResponse;
import com.example.budget.model.PaymentMethod;
import com.example.budget.model.FinancialAccount;
import com.example.budget.model.PeriodRange;
import com.example.budget.model.ReportPeriod;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionStatus;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ReportCalculatorTest {
    private ReportCalculator calculator;
    private User user;

    @BeforeEach
    void setUp() {
        ReportMoneyFormatter moneyFormatter = new ReportMoneyFormatter();
        calculator = new ReportCalculator(
                new ReportTransactionMapper(),
                new ReportInsightService(moneyFormatter));
        user = new User();
        user.setId(1L);
        user.setName("Tester");
    }

    @Test
    void buildReport_computesTotalsBreakdownsAndBuckets() {
        ReportPeriod period = ReportPeriod.MONTH;
        LocalDate date = LocalDate.of(2026, 5, 16);
        PeriodRange range = period.range(date);

        List<Transaction> transactions = List.of(
                tx(1L, TransactionType.INCOME, "Salary", "3000.00", LocalDate.of(2026, 5, 1), null),
                tx(2L, TransactionType.EXPENSE, "Rent", "1200.00", LocalDate.of(2026, 5, 2), "Bank"),
                tx(3L, TransactionType.EXPENSE, "Food", "500.00", LocalDate.of(2026, 5, 3), "Debit"),
                tx(4L, TransactionType.EXPENSE, "Food", "300.00", LocalDate.of(2026, 5, 4), "Debit"));

        ReportResponse report = calculator.buildReport(period, date, range, transactions);

        assertThat(report.getPeriod()).isEqualTo("month");
        assertThat(report.getStartDate()).isEqualTo(LocalDate.of(2026, 5, 1));
        assertThat(report.getEndDate()).isEqualTo(LocalDate.of(2026, 5, 31));
        assertThat(report.getTotalIncome()).isEqualByComparingTo("3000.00");
        assertThat(report.getTotalExpense()).isEqualByComparingTo("2000.00");
        assertThat(report.getBalance()).isEqualByComparingTo("1000.00");
        assertThat(report.getAverageExpense()).isEqualByComparingTo("666.67");
        assertThat(report.getTransactionCount()).isEqualTo(4);
        assertThat(report.getIncomeCount()).isEqualTo(1);
        assertThat(report.getExpenseCount()).isEqualTo(3);
    }

    @Test
    void buildReport_sortsCategoriesAndPaymentMethodsByAmountWithPercentages() {
        ReportPeriod period = ReportPeriod.MONTH;
        LocalDate date = LocalDate.of(2026, 5, 16);
        PeriodRange range = period.range(date);

        List<Transaction> transactions = List.of(
                tx(1L, TransactionType.INCOME, "Salary", "3000.00", LocalDate.of(2026, 5, 1), null),
                tx(2L, TransactionType.EXPENSE, "Rent", "1200.00", LocalDate.of(2026, 5, 2), "Bank"),
                tx(3L, TransactionType.EXPENSE, "Food", "500.00", LocalDate.of(2026, 5, 3), "Debit"),
                tx(4L, TransactionType.EXPENSE, "Food", "300.00", LocalDate.of(2026, 5, 4), "Debit"));

        ReportResponse report = calculator.buildReport(period, date, range, transactions);

        assertThat(report.getExpenseCategories())
                .extracting(ReportResponse.CategoryBreakdown::getCategory)
                .containsExactly("Rent", "Food");
        assertThat(report.getExpenseCategories())
                .extracting(c -> c.getPercentage().toPlainString())
                .containsExactly("60.0", "40.0");
        assertThat(report.getExpenseCategories().get(1).getTransactionCount()).isEqualTo(2);

        assertThat(report.getPaymentMethods())
                .extracting(ReportResponse.PaymentMethodBreakdown::getName)
                .containsExactly("Bank", "Debit");

        assertThat(report.getIncomeCategories())
                .extracting(ReportResponse.CategoryBreakdown::getCategory)
                .containsExactly("Salary");
    }

    @Test
    void buildReport_topMovementsAreSortedAndBucketsCoverEveryDay() {
        ReportPeriod period = ReportPeriod.MONTH;
        LocalDate date = LocalDate.of(2026, 5, 16);
        PeriodRange range = period.range(date);

        Transaction rent = tx(2L, TransactionType.EXPENSE, "Rent", "1200.00", LocalDate.of(2026, 5, 2), "Bank");
        FinancialAccount account = new FinancialAccount();
        account.setName("Monzo Current");
        rent.setAccount(account);
        rent.setStatus(TransactionStatus.PLANNED);

        List<Transaction> transactions = List.of(
                tx(1L, TransactionType.INCOME, "Salary", "3000.00", LocalDate.of(2026, 5, 1), null),
                rent,
                tx(3L, TransactionType.EXPENSE, "Food", "500.00", LocalDate.of(2026, 5, 3), "Debit"),
                tx(4L, TransactionType.EXPENSE, "Food", "300.00", LocalDate.of(2026, 5, 4), "Debit"));

        ReportResponse report = calculator.buildReport(period, date, range, transactions);

        assertThat(report.getTopExpenses())
                .extracting(ReportResponse.ReportTransactionItem::getAmount)
                .containsExactly(new BigDecimal("1200.00"), new BigDecimal("500.00"), new BigDecimal("300.00"));
        assertThat(report.getTopIncome()).hasSize(1);
        assertThat(report.getTopExpenses().get(0).getAccountName()).isEqualTo("Monzo Current");
        assertThat(report.getTopExpenses().get(0).getStatus()).isEqualTo(TransactionStatus.PLANNED);
        assertThat(report.getBuckets()).hasSize(31);
        assertThat(report.getInsights()).isNotEmpty();
    }

    @Test
    void buildReport_handlesEmptyPeriod() {
        ReportPeriod period = ReportPeriod.MONTH;
        LocalDate date = LocalDate.of(2026, 5, 16);
        PeriodRange range = period.range(date);

        ReportResponse report = calculator.buildReport(period, date, range, List.of());

        assertThat(report.getTotalIncome()).isEqualByComparingTo("0");
        assertThat(report.getTotalExpense()).isEqualByComparingTo("0");
        assertThat(report.getAverageExpense()).isEqualByComparingTo("0");
        assertThat(report.getExpenseCategories()).isEmpty();
        assertThat(report.getInsights()).containsExactly("No transactions were recorded in this period.");
    }

    private Transaction tx(
            Long id,
            TransactionType type,
            String category,
            String amount,
            LocalDate paymentDate,
            String paymentMethodName) {
        Transaction transaction = new Transaction();
        transaction.setId(id);
        transaction.setType(type);
        transaction.setCategory(category);
        transaction.setDescription(category + " entry");
        transaction.setAmount(new BigDecimal(amount));
        transaction.setTransactionDate(paymentDate);
        transaction.setPaymentDate(paymentDate);
        transaction.setUser(user);
        if (paymentMethodName != null) {
            PaymentMethod paymentMethod = new PaymentMethod();
            paymentMethod.setName(paymentMethodName);
            transaction.setPaymentMethod(paymentMethod);
        }
        return transaction;
    }
}
