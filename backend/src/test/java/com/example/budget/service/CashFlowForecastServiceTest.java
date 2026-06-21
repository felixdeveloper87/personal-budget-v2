package com.example.budget.service;

import com.example.budget.dto.AccountSummaryDTO;
import com.example.budget.model.AccountType;
import com.example.budget.model.FinancialAccount;
import com.example.budget.model.RecurringTransaction;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CashFlowForecastServiceTest {
    @Mock private FinancialAccountService accountService;
    @Mock private TransactionRepository transactionRepository;
    @Mock private RecurringTransactionRepository recurringRepository;
    @Mock private CreditCardBillingService creditCardBillingService;
    @Mock private UserRepository userRepository;

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
        account.setActive(true);

        when(recurringRepository.findByUserOrderByIdDesc(user)).thenReturn(List.of());
        when(accountService.summary(user))
                .thenReturn(new AccountSummaryDTO(new BigDecimal("1000.00"), 0, List.of()));
    }

    @Test
    void forecastAppliesEveryFutureTransactionInItsPaymentMonth() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth previousMonth = currentMonth.minusMonths(1);
        YearMonth firstHistoryMonth = currentMonth.minusMonths(3);
        YearMonth lastForecastMonth = currentMonth.plusMonths(11);

        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, firstHistoryMonth.atDay(1), previousMonth.atEndOfMonth()))
                .thenReturn(List.of(
                        transaction(TransactionType.INCOME, "1000.00", previousMonth.atDay(10)),
                        transaction(TransactionType.EXPENSE, "200.00", previousMonth.atDay(15))));
        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, currentMonth.atDay(1), lastForecastMonth.atEndOfMonth()))
                .thenReturn(List.of(
                        transaction(TransactionType.INCOME, "500.00", currentMonth.atDay(1)),
                        transaction(TransactionType.INCOME, "1000.00", currentMonth.plusMonths(1).atDay(10)),
                        transaction(TransactionType.EXPENSE, "200.00", currentMonth.plusMonths(1).atDay(15))));

        var result = service.forecast(user);

        assertThat(result.months()).hasSize(12);
        assertThat(result.months().get(0).month()).isEqualTo(currentMonth.toString());
        assertThat(result.months().get(0).netCashFlow()).isEqualByComparingTo("0.00");
        assertThat(result.months().get(0).projectedClosingBalance()).isEqualByComparingTo("1000.00");
        assertThat(result.months().get(0).incomeReceivedSoFar()).isEqualByComparingTo("500.00");

        var nextMonth = result.months().get(1);
        assertThat(nextMonth.month()).isEqualTo(currentMonth.plusMonths(1).toString());
        assertThat(nextMonth.fixedIncome()).isEqualByComparingTo("1000.00");
        assertThat(nextMonth.fixedExpense()).isEqualByComparingTo("200.00");
        assertThat(nextMonth.estimatedIncome()).isEqualByComparingTo("0.00");
        assertThat(nextMonth.projectedClosingBalance()).isEqualByComparingTo("1800.00");
    }

    @Test
    void forecastIncludesActiveRecurringExpenseEvenWhenItsNextRunDateIsStale() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth previousMonth = currentMonth.minusMonths(1);
        YearMonth firstHistoryMonth = currentMonth.minusMonths(3);
        YearMonth lastForecastMonth = currentMonth.plusMonths(11);
        RecurringTransaction rent = new RecurringTransaction();
        rent.setType(TransactionType.EXPENSE);
        rent.setAmount(new BigDecimal("950.00"));
        rent.setStartDate(currentMonth.plusMonths(1).atDay(1));
        rent.setDayOfMonth(1);
        rent.setNextRunDate(lastForecastMonth.plusMonths(3).atDay(1));
        rent.setActive(true);
        rent.setUser(user);
        rent.setAccount(account);

        when(recurringRepository.findByUserOrderByIdDesc(user)).thenReturn(List.of(rent));
        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, firstHistoryMonth.atDay(1), previousMonth.atEndOfMonth()))
                .thenReturn(List.of());
        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, currentMonth.atDay(1), lastForecastMonth.atEndOfMonth()))
                .thenReturn(List.of());
        when(creditCardBillingService.resolvePaymentDate(any(LocalDate.class), nullable(com.example.budget.model.PaymentMethod.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.forecast(user);

        assertThat(result.months().get(0).fixedExpense()).isEqualByComparingTo("0.00");
        assertThat(result.months().get(1).fixedExpense()).isEqualByComparingTo("950.00");
        assertThat(result.months().get(2).fixedExpense()).isEqualByComparingTo("950.00");
        assertThat(result.months().get(1).projectedClosingBalance()).isEqualByComparingTo("50.00");
    }

    @Test
    void currentMonthUsesActualIncomeThenProjectsOnlyTheRemainingIncomePlan() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth previousMonth = currentMonth.minusMonths(1);
        YearMonth firstHistoryMonth = currentMonth.minusMonths(3);
        YearMonth lastForecastMonth = currentMonth.plusMonths(11);
        user.setPlannedMonthlyIncome(new BigDecimal("1000.00"));

        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, firstHistoryMonth.atDay(1), previousMonth.atEndOfMonth()))
                .thenReturn(List.of());
        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, currentMonth.atDay(1), lastForecastMonth.atEndOfMonth()))
                .thenReturn(List.of(transaction(
                        TransactionType.INCOME, "400.00", currentMonth.atDay(1))));

        var result = service.forecast(user);
        var thisMonth = result.months().get(0);

        assertThat(thisMonth.incomeReceivedSoFar()).isEqualByComparingTo("400.00");
        assertThat(thisMonth.estimatedIncome()).isEqualByComparingTo("600.00");
        assertThat(thisMonth.netCashFlow()).isEqualByComparingTo("600.00");
        assertThat(thisMonth.projectedClosingBalance()).isEqualByComparingTo("1600.00");
    }

    @Test
    void forecastShowsTheFirstPositiveMonthAfterANegativeStartingBalance() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth previousMonth = currentMonth.minusMonths(1);
        YearMonth firstHistoryMonth = currentMonth.minusMonths(3);
        YearMonth lastForecastMonth = currentMonth.plusMonths(11);
        when(accountService.summary(user))
                .thenReturn(new AccountSummaryDTO(new BigDecimal("-500.00"), 0, List.of()));
        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, firstHistoryMonth.atDay(1), previousMonth.atEndOfMonth()))
                .thenReturn(List.of(transaction(TransactionType.INCOME, "1000.00", previousMonth.atDay(10))));
        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, currentMonth.atDay(1), lastForecastMonth.atEndOfMonth()))
                .thenReturn(List.of(transaction(
                        TransactionType.INCOME, "1000.00", currentMonth.plusMonths(1).atDay(10))));

        var result = service.forecast(user);

        assertThat(result.months().get(0).negative()).isTrue();
        assertThat(result.months().get(1).projectedClosingBalance()).isEqualByComparingTo("500.00");
        assertThat(result.months().get(1).negative()).isFalse();
    }

    private Transaction transaction(TransactionType type, String amount, LocalDate paymentDate) {
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAccount(account);
        transaction.setDescription("Test transaction");
        transaction.setCategory("General");
        transaction.setType(type);
        transaction.setAmount(new BigDecimal(amount));
        transaction.setPaymentDate(paymentDate);
        transaction.setTransactionDate(paymentDate);
        transaction.setStatus(TransactionStatus.CLEARED);
        return transaction;
    }
}
