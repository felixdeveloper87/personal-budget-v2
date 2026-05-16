package com.example.budget.service;

import com.example.budget.dto.ReportResponse;
import com.example.budget.model.PaymentMethod;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {
    @Mock
    private TransactionRepository transactionRepository;

    private ReportService reportService;
    private User user;

    @BeforeEach
    void setUp() {
        reportService = new ReportService(transactionRepository);
        user = new User();
        user.setId(10L);
        user.setName("Leandro");
    }

    @Test
    void generateReport_buildsMonthlyTotalsAndBreakdowns() {
        LocalDate referenceDate = LocalDate.of(2026, 5, 16);
        LocalDate start = LocalDate.of(2026, 5, 1);
        LocalDate end = LocalDate.of(2026, 5, 31);

        when(transactionRepository.findReportTransactions(user, start, end)).thenReturn(List.of(
                transaction(1L, TransactionType.INCOME, "Salary", "Pay", "2500.00", LocalDate.of(2026, 5, 1), null),
                transaction(2L, TransactionType.EXPENSE, "Food", "Groceries", "120.00", LocalDate.of(2026, 5, 5), "Debit"),
                transaction(3L, TransactionType.EXPENSE, "Bills", "Energy", "80.00", LocalDate.of(2026, 5, 9), "Bank")
        ));

        ReportResponse report = reportService.generateReport("month", referenceDate, user);

        assertThat(report.getPeriod()).isEqualTo("month");
        assertThat(report.getStartDate()).isEqualTo(start);
        assertThat(report.getEndDate()).isEqualTo(end);
        assertThat(report.getTotalIncome()).isEqualByComparingTo("2500.00");
        assertThat(report.getTotalExpense()).isEqualByComparingTo("200.00");
        assertThat(report.getBalance()).isEqualByComparingTo("2300.00");
        assertThat(report.getAverageExpense()).isEqualByComparingTo("100.00");
        assertThat(report.getExpenseCategories()).hasSize(2);
        assertThat(report.getPaymentMethods()).extracting(ReportResponse.PaymentMethodBreakdown::getName)
                .containsExactly("Debit", "Bank");
        verify(transactionRepository).findReportTransactions(user, start, end);
    }

    @Test
    void generateReport_usesMondayToSundayForWeek() {
        LocalDate referenceDate = LocalDate.of(2026, 5, 16);
        LocalDate start = LocalDate.of(2026, 5, 11);
        LocalDate end = LocalDate.of(2026, 5, 17);

        when(transactionRepository.findReportTransactions(user, start, end)).thenReturn(List.of());

        ReportResponse report = reportService.generateReport("week", referenceDate, user);

        assertThat(report.getStartDate()).isEqualTo(start);
        assertThat(report.getEndDate()).isEqualTo(end);
        assertThat(report.getBuckets()).hasSize(7);
        verify(transactionRepository).findReportTransactions(user, start, end);
    }

    private Transaction transaction(
            Long id,
            TransactionType type,
            String category,
            String description,
            String amount,
            LocalDate paymentDate,
            String paymentMethodName) {
        Transaction tx = new Transaction();
        tx.setId(id);
        tx.setType(type);
        tx.setCategory(category);
        tx.setDescription(description);
        tx.setAmount(new BigDecimal(amount));
        tx.setTransactionDate(paymentDate);
        tx.setPaymentDate(paymentDate);
        tx.setUser(user);
        if (paymentMethodName != null) {
            PaymentMethod paymentMethod = new PaymentMethod();
            paymentMethod.setName(paymentMethodName);
            tx.setPaymentMethod(paymentMethod);
        }
        return tx;
    }
}
