package com.example.budget.service;

import com.example.budget.cache.CacheInvalidationService;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionStatus;
import com.example.budget.repository.TransactionRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ScheduledTransactionSettlementService {

    private final TransactionRepository transactionRepository;
    private final CacheInvalidationService cacheInvalidation;

    public ScheduledTransactionSettlementService(
            TransactionRepository transactionRepository,
            CacheInvalidationService cacheInvalidation) {
        this.transactionRepository = transactionRepository;
        this.cacheInvalidation = cacheInvalidation;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void settleOverdueTransactionsOnStartup() {
        settleDueGeneratedTransactions(LocalDate.now());
    }

    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void settleDueGeneratedTransactionsDaily() {
        settleDueGeneratedTransactions(LocalDate.now());
    }

    void settleDueGeneratedTransactions(LocalDate settlementDate) {
        List<Transaction> due = transactionRepository.findDueGeneratedTransactions(
                TransactionStatus.PLANNED,
                settlementDate);
        if (due.isEmpty()) {
            return;
        }

        due.forEach(transaction -> transaction.setStatus(TransactionStatus.CLEARED));
        transactionRepository.saveAll(due);

        due.forEach(transaction -> {
            cacheInvalidation.evictTransactionsList(transaction.getUser().getId());
            cacheInvalidation.evictMonthlySummary(transaction.getUser(), transaction.getPaymentDate());
        });
    }
}
