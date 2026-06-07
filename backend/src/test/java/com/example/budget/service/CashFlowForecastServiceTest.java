package com.example.budget.service;

import com.example.budget.dto.AccountSummaryDTO;
import com.example.budget.dto.CashFlowForecastDTO;
import com.example.budget.model.AccountType;
import com.example.budget.model.FinancialAccount;
import com.example.budget.model.InstallmentPlan;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionStatus;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.repository.RecurringTransactionRepository;
import com.example.budget.repository.TransactionRepository;
import com.example.budget.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CashFlowForecastServiceTest {
    @Mock
    private FinancialAccountService accountService;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private RecurringTransactionRepository recurringRepository;
    @Mock
    private CreditCardBillingService creditCardBillingService;
    @Mock
    private UserRepository userRepository;

    private CashFlowForecastService service;
    private User user;
    private FinancialAccount account;

    @BeforeEach
    void setUp() {
        service = new CashFlowForecastService(
                accountService,
                transactionRepository,
                recurringRepository,
                creditCardBillingService,
                userRepository);
        user = new User();
        user.setId(1L);
        account = new FinancialAccount();
        ReflectionTestUtils.setField(account, "id", 10L);
        account.setUser(user);
        account.setName("Monzo Current");
        account.setType(AccountType.CURRENT);
        account.setCurrency("GBP");

        when(recurringRepository.findByUserOrderByIdDesc(user)).thenReturn(List.of());
        // Anchor balance the projection rolls forward from.
        when(accountService.summary(user))
                .thenReturn(new AccountSummaryDTO(new BigDecimal("1000.00"), 0, List.of()));
    }

    @Test
    void forecastUsesRecentMonthlyAverageAndStopsEndedInstallments() {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        YearMonth firstHistoryMonth = currentMonth.minusMonths(3);
        YearMonth previousMonth = currentMonth.minusMonths(1);
        YearMonth firstForecastMonth = currentMonth.plusMonths(1);
        YearMonth lastForecastMonth = currentMonth.plusMonths(12);

        Transaction income = transaction(
                "Salary", TransactionType.INCOME, "3256.00",
                previousMonth.atDay(10));
        Transaction variableExpense = transaction(
                "Variable spending", TransactionType.EXPENSE, "3076.00",
                previousMonth.atDay(15));
        // Installments and recurring rows are excluded from the recent average;
        // they are projected separately on their own schedule.
        Transaction previousInstallment = transaction(
                "Previous installment", TransactionType.EXPENSE, "200.00",
                previousMonth.atDay(20));
        previousInstallment.setInstallmentPlan(new InstallmentPlan());

        Transaction nextMonthInstallment = transaction(
                "Laptop installment", TransactionType.EXPENSE, "200.00",
                firstForecastMonth.atDay(10));
        nextMonthInstallment.setInstallmentPlan(new InstallmentPlan());
        Transaction secondMonthInstallment = transaction(
                "Laptop installment", TransactionType.EXPENSE, "200.00",
                firstForecastMonth.plusMonths(1).atDay(10));
        secondMonthInstallment.setInstallmentPlan(new InstallmentPlan());
        // A loose future transaction (no installment plan) must NOT be counted.
        Transaction futureLoose = transaction(
                "Future loose transaction", TransactionType.EXPENSE, "999.00",
                firstForecastMonth.atDay(12));

        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, firstHistoryMonth.atDay(1), previousMonth.atEndOfMonth()))
                .thenReturn(List.of(income, variableExpense, previousInstallment));
        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, firstForecastMonth.atDay(1), lastForecastMonth.atEndOfMonth()))
                .thenReturn(List.of(
                        nextMonthInstallment,
                        secondMonthInstallment,
                        futureLoose));

        var result = service.forecast(user);

        assertThat(result.hasProjectionBasis()).isTrue();
        assertThat(result.projectionBasisMonths())
                .containsExactly(previousMonth.toString());
        assertThat(result.averageMonthlyIncome()).isEqualByComparingTo("3256.00");
        assertThat(result.averageMonthlyVariableExpense()).isEqualByComparingTo("3076.00");
        assertThat(result.months()).hasSize(12);

        // The forecast starts on the next full month, never the current one.
        var firstMonth = result.months().get(0);
        assertThat(firstMonth.month()).isEqualTo(firstForecastMonth.toString());
        assertThat(firstMonth.installmentExpense()).isEqualByComparingTo("200.00");
        assertThat(firstMonth.netCashFlow()).isEqualByComparingTo("-20.00");
        // committedGross = 200 (installment); estimatedGross = 3256 + 3076 = 6332.
        // confidence = round(200 / 6532 * 100) = 3
        assertThat(firstMonth.confidencePercent()).isEqualTo(3);
        // Balance rolls forward from the £1000 anchor: 1000 - 20 = 980.
        assertThat(result.currentTotalBalance()).isEqualByComparingTo("1000.00");
        assertThat(firstMonth.projectedClosingBalance()).isEqualByComparingTo("980.00");

        var secondMonth = result.months().get(1);
        assertThat(secondMonth.installmentExpense()).isEqualByComparingTo("200.00");
        assertThat(secondMonth.netCashFlow()).isEqualByComparingTo("-20.00");
        assertThat(secondMonth.projectedClosingBalance()).isEqualByComparingTo("960.00");

        var monthAfterInstallments = result.months().get(2);
        assertThat(monthAfterInstallments.installmentExpense())
                .isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(monthAfterInstallments.netCashFlow()).isEqualByComparingTo("180.00");
        // confidence is 0 once nothing is committed for the month.
        assertThat(monthAfterInstallments.confidencePercent()).isEqualTo(0);
        assertThat(monthAfterInstallments.projectedClosingBalance()).isEqualByComparingTo("1140.00");
    }

    @Test
    void forecastStartsNextMonthWithFullMonthlyAverages() {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        YearMonth firstHistoryMonth = currentMonth.minusMonths(3);
        YearMonth previousMonth = currentMonth.minusMonths(1);
        YearMonth firstForecastMonth = currentMonth.plusMonths(1);
        YearMonth lastForecastMonth = currentMonth.plusMonths(12);
        Transaction previousIncome = transaction(
                "Salary", TransactionType.INCOME, "1000.00",
                previousMonth.atDay(10));
        Transaction previousExpense = transaction(
                "Spending", TransactionType.EXPENSE, "200.00",
                previousMonth.atDay(15));

        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, firstHistoryMonth.atDay(1), previousMonth.atEndOfMonth()))
                .thenReturn(List.of(previousIncome, previousExpense));
        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, firstForecastMonth.atDay(1), lastForecastMonth.atEndOfMonth()))
                .thenReturn(List.of());

        var result = service.forecast(user);

        var firstMonth = result.months().get(0);
        assertThat(firstMonth.month()).isEqualTo(firstForecastMonth.toString());
        // The current, partially-elapsed month is not estimated; every forecast
        // month uses the full monthly average.
        assertThat(firstMonth.estimatedIncome()).isEqualByComparingTo("1000.00");
        assertThat(firstMonth.estimatedVariableExpense()).isEqualByComparingTo("200.00");
        assertThat(firstMonth.netCashFlow()).isEqualByComparingTo("800.00");
        assertThat(firstMonth.projectedClosingBalance()).isEqualByComparingTo("1800.00");
        assertThat(result.months().get(1).netCashFlow()).isEqualByComparingTo("800.00");
        assertThat(result.months().get(1).projectedClosingBalance()).isEqualByComparingTo("2600.00");
    }

    @Test
    void forecastUsesPlannedMonthlyIncomeInsteadOfHistoryAverage() {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        YearMonth firstHistoryMonth = currentMonth.minusMonths(3);
        YearMonth previousMonth = currentMonth.minusMonths(1);
        YearMonth firstForecastMonth = currentMonth.plusMonths(1);
        YearMonth lastForecastMonth = currentMonth.plusMonths(12);
        // Declared, predictable income (e.g. a gig-work target) overrides the
        // history average so the forecast follows the plan.
        user.setPlannedMonthlyIncome(new BigDecimal("2500.00"));

        Transaction previousIncome = transaction(
                "Salary", TransactionType.INCOME, "1000.00",
                previousMonth.atDay(10));
        Transaction previousExpense = transaction(
                "Spending", TransactionType.EXPENSE, "200.00",
                previousMonth.atDay(15));

        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, firstHistoryMonth.atDay(1), previousMonth.atEndOfMonth()))
                .thenReturn(List.of(previousIncome, previousExpense));
        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, firstForecastMonth.atDay(1), lastForecastMonth.atEndOfMonth()))
                .thenReturn(List.of());

        var result = service.forecast(user);

        assertThat(result.hasIncomePlan()).isTrue();
        assertThat(result.plannedMonthlyIncome()).isEqualByComparingTo("2500.00");
        // History average is still reported for reference, untouched.
        assertThat(result.averageMonthlyIncome()).isEqualByComparingTo("1000.00");

        var firstMonth = result.months().get(0);
        assertThat(firstMonth.estimatedIncome()).isEqualByComparingTo("2500.00");
        assertThat(firstMonth.estimatedVariableExpense()).isEqualByComparingTo("200.00");
        assertThat(firstMonth.netCashFlow()).isEqualByComparingTo("2300.00");
        assertThat(firstMonth.projectedClosingBalance()).isEqualByComparingTo("3300.00");
    }

    @Test
    void forecastFlagsMonthWhereProjectedBalanceGoesNegative() {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        YearMonth firstHistoryMonth = currentMonth.minusMonths(3);
        YearMonth previousMonth = currentMonth.minusMonths(1);
        YearMonth firstForecastMonth = currentMonth.plusMonths(1);
        YearMonth lastForecastMonth = currentMonth.plusMonths(12);
        // No income, £300/month variable spending against a £1000 anchor: the
        // balance runs out after a few months.
        Transaction previousExpense = transaction(
                "Spending", TransactionType.EXPENSE, "300.00",
                previousMonth.atDay(15));

        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, firstHistoryMonth.atDay(1), previousMonth.atEndOfMonth()))
                .thenReturn(List.of(previousExpense));
        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, firstForecastMonth.atDay(1), lastForecastMonth.atEndOfMonth()))
                .thenReturn(List.of());

        var result = service.forecast(user);

        // 1000 → 700 → 400 → 100 → -200 (index 3 is the first negative month).
        assertThat(result.months().get(2).projectedClosingBalance()).isEqualByComparingTo("100.00");
        assertThat(result.months().get(2).negative()).isFalse();
        assertThat(result.months().get(3).projectedClosingBalance()).isEqualByComparingTo("-200.00");
        assertThat(result.months().get(3).negative()).isTrue();
    }

    @Test
    void forecastReportsMissingRecentBasisButKeepsTwelveMonths() {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        YearMonth firstHistoryMonth = currentMonth.minusMonths(3);
        YearMonth previousMonth = currentMonth.minusMonths(1);
        YearMonth firstForecastMonth = currentMonth.plusMonths(1);
        YearMonth lastForecastMonth = currentMonth.plusMonths(12);
        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, firstHistoryMonth.atDay(1), previousMonth.atEndOfMonth()))
                .thenReturn(List.of());
        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, firstForecastMonth.atDay(1), lastForecastMonth.atEndOfMonth()))
                .thenReturn(List.of());

        var result = service.forecast(user);

        assertThat(result.hasProjectionBasis()).isFalse();
        assertThat(result.averageMonthlyIncome()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.averageMonthlyVariableExpense())
                .isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.months()).hasSize(12);
        assertThat(result.months())
                .allMatch(month -> month.netCashFlow().compareTo(BigDecimal.ZERO) == 0);
        assertThat(result.months())
                .allMatch(month -> month.confidencePercent() == 0);
        // With no flow, the balance just holds at the £1000 anchor.
        assertThat(result.months())
                .allMatch(month -> month.projectedClosingBalance().compareTo(new BigDecimal("1000.00")) == 0);
        assertThat(result.months()).noneMatch(CashFlowForecastDTO.MonthForecast::negative);
    }

    private Transaction transaction(
            String description,
            TransactionType type,
            String amount,
            LocalDate paymentDate) {
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAccount(account);
        transaction.setDescription(description);
        transaction.setCategory("General");
        transaction.setType(type);
        transaction.setAmount(new BigDecimal(amount));
        transaction.setPaymentDate(paymentDate);
        transaction.setTransactionDate(paymentDate);
        transaction.setStatus(TransactionStatus.CLEARED);
        return transaction;
    }
}
