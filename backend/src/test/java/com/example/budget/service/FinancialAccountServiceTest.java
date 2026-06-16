package com.example.budget.service;

import com.example.budget.dto.FinancialAccountRequest;
import com.example.budget.model.*;
import com.example.budget.repository.AccountTransferRepository;
import com.example.budget.repository.FinancialAccountRepository;
import com.example.budget.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinancialAccountServiceTest {
    @Mock
    private FinancialAccountRepository accountRepository;
    @Mock
    private AccountTransferRepository transferRepository;
    @Mock
    private TransactionRepository transactionRepository;
    private FinancialAccountService service;
    private User user;
    private FinancialAccount account;

    @BeforeEach
    void setUp() {
        service = new FinancialAccountService(
                accountRepository, transferRepository, transactionRepository);
        user = new User();
        user.setId(1L);
        account = new FinancialAccount();
        ReflectionTestUtils.setField(account, "id", 10L);
        account.setUser(user);
        account.setName("Current");
        account.setType(AccountType.CURRENT);
        account.setCurrency("GBP");
        account.setOpeningBalance(new BigDecimal("1000.00"));
        account.setBalanceAnchorAt(LocalDateTime.of(2026, 6, 1, 10, 0));
    }

    @Test
    void currentBalance_usesOnlySettledPostAnchorMovementsAndTransfers() {
        Transaction income = transaction(TransactionType.INCOME, "100.00", TransactionStatus.CLEARED, 11);
        Transaction expense = transaction(TransactionType.EXPENSE, "40.00", TransactionStatus.RECONCILED, 12);
        Transaction planned = transaction(TransactionType.EXPENSE, "500.00", TransactionStatus.PLANNED, 13);
        Transaction beforeAnchor = transaction(TransactionType.EXPENSE, "300.00", TransactionStatus.CLEARED, 9);

        when(transactionRepository.findByUserAndAccountAndPaymentDateBetween(
                any(), any(), any(), any()))
                .thenReturn(List.of(income, expense, planned, beforeAnchor));
        when(transferRepository.findByFromAccountAndTransferDateBetween(any(), any(), any()))
                .thenReturn(List.of(transfer("20.00")));
        when(transferRepository.findByToAccountAndTransferDateBetween(any(), any(), any()))
                .thenReturn(List.of(transfer("50.00")));

        assertThat(service.currentBalance(account, user))
                .isEqualByComparingTo("1090.00");
    }

    @Test
    void summaryCalculatesOverdraftUsageForNegativeCurrentBalance() {
        account.setOpeningBalance(new BigDecimal("-250.00"));
        account.setOverdraftLimit(new BigDecimal("1000.00"));
        when(accountRepository.findByUserOrderByActiveDescNameAsc(user)).thenReturn(List.of(account));
        when(transactionRepository.findByUserAndAccountAndPaymentDateBetween(any(), any(), any(), any()))
                .thenReturn(List.of());
        when(transferRepository.findByFromAccountAndTransferDateBetween(any(), any(), any()))
                .thenReturn(List.of());
        when(transferRepository.findByToAccountAndTransferDateBetween(any(), any(), any()))
                .thenReturn(List.of());

        var result = service.summary(user).accounts().get(0);

        assertThat(result.currentBalance()).isEqualByComparingTo("-250.00");
        assertThat(result.overdraftUsed()).isEqualByComparingTo("250.00");
        assertThat(result.overdraftAvailable()).isEqualByComparingTo("750.00");
        assertThat(result.overdraftPercentageUsed()).isEqualByComparingTo("25.00");
    }

    @Test
    void updateRebalancesOpeningBalanceToMatchRequestedCurrentBalance() {
        Transaction expense = transaction(TransactionType.EXPENSE, "100.00", TransactionStatus.CLEARED, 11);
        LocalDateTime originalAnchor = account.getBalanceAnchorAt();
        when(accountRepository.findById(10L)).thenReturn(java.util.Optional.of(account));
        when(accountRepository.save(account)).thenReturn(account);
        when(transactionRepository.findByUserAndAccountAndPaymentDateBetween(any(), any(), any(), any()))
                .thenReturn(List.of(expense));
        when(transferRepository.findByFromAccountAndTransferDateBetween(any(), any(), any()))
                .thenReturn(List.of());
        when(transferRepository.findByToAccountAndTransferDateBetween(any(), any(), any()))
                .thenReturn(List.of());

        FinancialAccountRequest request = new FinancialAccountRequest();
        request.setName("Renamed current");
        request.setType(AccountType.CURRENT);
        request.setCurrency("GBP");
        request.setOpeningBalance(new BigDecimal("1200.00"));
        request.setOverdraftLimit(BigDecimal.ZERO);
        request.setActive(true);

        var result = service.update(10L, request, user);

        assertThat(account.getOpeningBalance()).isEqualByComparingTo("1300.00");
        assertThat(account.getBalanceAnchorAt()).isEqualTo(originalAnchor);
        assertThat(result.currentBalance()).isEqualByComparingTo("1200.00");
    }

    @Test
    void detailsCombinesRecentAndUpcomingAccountActivity() {
        when(accountRepository.findById(10L)).thenReturn(java.util.Optional.of(account));

        Transaction income = transaction(
                TransactionType.INCOME, "100.00", TransactionStatus.CLEARED, 11);
        ReflectionTestUtils.setField(income, "id", 21L);
        income.setDescription("Daily income");
        income.setCategory("Income");
        income.setPaymentDate(LocalDate.now().minusDays(1));

        Transaction upcomingExpense = transaction(
                TransactionType.EXPENSE, "40.00", TransactionStatus.PLANNED, 12);
        ReflectionTestUtils.setField(upcomingExpense, "id", 22L);
        upcomingExpense.setDescription("Energy");
        upcomingExpense.setCategory("Bills");
        upcomingExpense.setPaymentDate(LocalDate.now().plusDays(2));

        FinancialAccount savings = new FinancialAccount();
        ReflectionTestUtils.setField(savings, "id", 11L);
        savings.setName("Savings");
        savings.setUser(user);

        AccountTransfer transfer = new AccountTransfer();
        ReflectionTestUtils.setField(transfer, "id", 31L);
        transfer.setFromAccount(savings);
        transfer.setToAccount(account);
        transfer.setAmount(new BigDecimal("25.00"));
        transfer.setTransferDate(LocalDate.now());

        when(transactionRepository
                .findTop20ByUserAndAccountAndPaymentDateLessThanEqualOrderByPaymentDateDescIdDesc(
                        user, account, LocalDate.now()))
                .thenReturn(List.of(income));
        when(transactionRepository
                .findTop20ByUserAndAccountAndPaymentDateGreaterThanOrderByPaymentDateAscIdAsc(
                        user, account, LocalDate.now()))
                .thenReturn(List.of(upcomingExpense));
        when(transferRepository
                .findTop20ByToAccountAndTransferDateLessThanEqualOrderByTransferDateDescIdDesc(
                        account, LocalDate.now()))
                .thenReturn(List.of(transfer));

        var result = service.details(10L, user);

        assertThat(result.recentActivity())
                .extracting(item -> item.kind())
                .containsExactly("TRANSFER_IN", "INCOME");
        assertThat(result.upcomingActivity())
                .extracting(item -> item.kind())
                .containsExactly("EXPENSE");
        assertThat(result.upcomingActivity().get(0).status()).isEqualTo(TransactionStatus.PLANNED);
    }

    private Transaction transaction(
            TransactionType type,
            String amount,
            TransactionStatus status,
            int hour) {
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAccount(account);
        transaction.setType(type);
        transaction.setAmount(new BigDecimal(amount));
        transaction.setStatus(status);
        transaction.setDateTime(LocalDateTime.of(2026, 6, 1, hour, 0));
        transaction.setTransactionDate(LocalDate.of(2026, 6, 1));
        transaction.setPaymentDate(LocalDate.of(2026, 6, 1));
        return transaction;
    }

    private AccountTransfer transfer(String amount) {
        AccountTransfer transfer = new AccountTransfer();
        transfer.setAmount(new BigDecimal(amount));
        transfer.setTransferDate(LocalDate.of(2026, 6, 2));
        return transfer;
    }
}
