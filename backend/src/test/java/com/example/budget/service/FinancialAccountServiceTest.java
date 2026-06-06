package com.example.budget.service;

import com.example.budget.cache.CacheInvalidationService;
import com.example.budget.dto.LegacyTransactionAssignmentRequest;
import com.example.budget.model.*;
import com.example.budget.repository.AccountTransferRepository;
import com.example.budget.repository.FinancialAccountRepository;
import com.example.budget.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinancialAccountServiceTest {
    @Mock
    private FinancialAccountRepository accountRepository;
    @Mock
    private AccountTransferRepository transferRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private CacheInvalidationService cacheInvalidation;

    private FinancialAccountService service;
    private User user;
    private FinancialAccount account;

    @BeforeEach
    void setUp() {
        service = new FinancialAccountService(
                accountRepository, transferRepository, transactionRepository, cacheInvalidation);
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
    void assignLegacyTransactions_changesOnlyMatchingUnassignedRows() {
        Transaction matching = transaction(TransactionType.EXPENSE, "10.00", TransactionStatus.CLEARED, 11);
        matching.setAccount(null);
        PaymentMethod monzo = new PaymentMethod();
        ReflectionTestUtils.setField(monzo, "id", 5L);
        matching.setPaymentMethod(monzo);

        Transaction other = transaction(TransactionType.EXPENSE, "20.00", TransactionStatus.CLEARED, 11);
        other.setAccount(null);
        PaymentMethod natwest = new PaymentMethod();
        ReflectionTestUtils.setField(natwest, "id", 6L);
        other.setPaymentMethod(natwest);

        when(accountRepository.findById(10L)).thenReturn(java.util.Optional.of(account));
        when(transactionRepository.findByUserAndAccountIsNull(user)).thenReturn(List.of(matching, other));

        LegacyTransactionAssignmentRequest request = new LegacyTransactionAssignmentRequest();
        request.setPaymentMethodId(5L);

        var result = service.assignLegacyTransactions(10L, request, user);

        assertThat(result.assignedCount()).isEqualTo(1);
        assertThat(matching.getAccount()).isSameAs(account);
        assertThat(other.getAccount()).isNull();
        ArgumentCaptor<List<Transaction>> captor = ArgumentCaptor.forClass(List.class);
        verify(transactionRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).containsExactly(matching);
        verify(cacheInvalidation).evictTransactionsList(1L);
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
