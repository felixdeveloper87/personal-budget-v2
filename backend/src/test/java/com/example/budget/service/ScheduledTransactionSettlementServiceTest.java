package com.example.budget.service;

import com.example.budget.cache.CacheInvalidationService;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionStatus;
import com.example.budget.model.User;
import com.example.budget.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduledTransactionSettlementServiceTest {

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private CacheInvalidationService cacheInvalidation;

    @Test
    void settlesDueGeneratedTransactionsAndInvalidatesUserCaches() {
        LocalDate dueDate = LocalDate.of(2026, 6, 10);
        User user = new User();
        user.setId(15L);

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setPaymentDate(dueDate);
        transaction.setStatus(TransactionStatus.PLANNED);

        when(transactionRepository.findDueGeneratedTransactions(
                TransactionStatus.PLANNED,
                dueDate)).thenReturn(List.of(transaction));

        ScheduledTransactionSettlementService service =
                new ScheduledTransactionSettlementService(transactionRepository, cacheInvalidation);
        service.settleDueGeneratedTransactions(dueDate);

        assertThat(transaction.getStatus()).isEqualTo(TransactionStatus.CLEARED);
        verify(transactionRepository).saveAll(List.of(transaction));
        verify(cacheInvalidation).evictTransactionsList(15L);
        verify(cacheInvalidation).evictMonthlySummary(user, dueDate);
    }
}
