package com.example.budget.service;

import com.example.budget.dto.AccountSummaryDTO;
import com.example.budget.model.AccountType;
import com.example.budget.model.FinancialAccount;
import com.example.budget.model.InstallmentPlan;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionStatus;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.repository.AccountTransferRepository;
import com.example.budget.repository.RecurringTransactionRepository;
import com.example.budget.repository.TransactionRepository;
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
    private AccountTransferRepository transferRepository;
    @Mock
    private RecurringTransactionRepository recurringRepository;
    @Mock
    private CreditCardBillingService creditCardBillingService;

    private CashFlowForecastService service;
    private User user;
    private FinancialAccount account;

    @BeforeEach
    void setUp() {
        service = new CashFlowForecastService(
                accountService,
                transactionRepository,
                transferRepository,
                recurringRepository,
                creditCardBillingService);
        user = new User();
        user.setId(1L);
        account = new FinancialAccount();
        ReflectionTestUtils.setField(account, "id", 10L);
        account.setUser(user);
        account.setName("Monzo Current");
        account.setType(AccountType.CURRENT);
        account.setCurrency("GBP");

        when(accountService.summary(user))
                .thenReturn(new AccountSummaryDTO(BigDecimal.ZERO, 0, List.of()));
        when(transferRepository.findByUserAndTransferDateBetweenOrderByTransferDateAscIdAsc(
                user, LocalDate.now().plusDays(1), LocalDate.now().plusDays(90)))
                .thenReturn(List.of());
        when(recurringRepository.findByUserOrderByIdDesc(user)).thenReturn(List.of());
    }

    @Test
    void forecastUsesPreviousMonthStandaloneTransactionsAndFutureInstallments() {
        LocalDate today = LocalDate.now();
        YearMonth previousMonth = YearMonth.from(today).minusMonths(1);
        Transaction income = transaction(
                "Salary adjustment", TransactionType.INCOME, "1000.00",
                previousMonth.atDay(Math.min(10, previousMonth.lengthOfMonth())));
        Transaction expense = transaction(
                "Groceries", TransactionType.EXPENSE, "200.00",
                previousMonth.atDay(Math.min(15, previousMonth.lengthOfMonth())));
        Transaction oldInstallment = transaction(
                "Old installment", TransactionType.EXPENSE, "50.00",
                previousMonth.atDay(Math.min(20, previousMonth.lengthOfMonth())));
        oldInstallment.setInstallmentPlan(new InstallmentPlan());

        Transaction futureInstallment = transaction(
                "Laptop installment", TransactionType.EXPENSE, "75.00", today.plusDays(20));
        futureInstallment.setInstallmentPlan(new InstallmentPlan());
        Transaction futureLoose = transaction(
                "Future loose transaction", TransactionType.EXPENSE, "999.00", today.plusDays(25));

        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, previousMonth.atDay(1), previousMonth.atEndOfMonth()))
                .thenReturn(List.of(income, expense, oldInstallment));
        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, today.plusDays(1), today.plusDays(90)))
                .thenReturn(List.of(futureInstallment, futureLoose));

        var result = service.forecast(user);

        assertThat(result.hasProjectionBasis()).isTrue();
        assertThat(result.projectionBasisMonth()).isEqualTo(previousMonth.toString());
        assertThat(result.projectedMonthlyIncome()).isEqualByComparingTo("1000.00");
        assertThat(result.projectedMonthlyExpense()).isEqualByComparingTo("200.00");
        assertThat(result.events()).anyMatch(event ->
                event.kind().equals("INSTALLMENT")
                        && event.description().equals("Laptop installment"));
        assertThat(result.events().stream()
                .filter(event -> event.kind().equals("ESTIMATE"))
                .filter(event -> event.description().equals("Estimated monthly income")))
                .hasSize(3);
        assertThat(result.events().stream()
                .filter(event -> event.kind().equals("ESTIMATE"))
                .filter(event -> event.description().equals("Estimated variable spending")))
                .hasSize(3);
        assertThat(result.horizons().get(0).expectedBalance()).isEqualByComparingTo("725.00");
        assertThat(result.horizons().get(1).expectedBalance()).isEqualByComparingTo("1525.00");
        assertThat(result.horizons().get(2).expectedBalance()).isEqualByComparingTo("2325.00");
        assertThat(result.events()).noneMatch(event ->
                event.description().contains("Old installment")
                        || event.description().contains("Future loose transaction"));
    }

    @Test
    void forecastReportsMissingPreviousMonthBasis() {
        LocalDate today = LocalDate.now();
        YearMonth previousMonth = YearMonth.from(today).minusMonths(1);
        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, previousMonth.atDay(1), previousMonth.atEndOfMonth()))
                .thenReturn(List.of());
        when(transactionRepository.findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                user, today.plusDays(1), today.plusDays(90)))
                .thenReturn(List.of());

        var result = service.forecast(user);

        assertThat(result.hasProjectionBasis()).isFalse();
        assertThat(result.projectedMonthlyIncome()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.projectedMonthlyExpense()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.events()).isEmpty();
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
