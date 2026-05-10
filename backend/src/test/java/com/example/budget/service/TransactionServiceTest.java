package com.example.budget.service;

import com.example.budget.cache.CacheInvalidationService;
import com.example.budget.cache.CachedTransactionList;
import com.example.budget.config.RedisCacheConfig;
import com.example.budget.dto.MonthlySummary;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TransactionServiceTest {

    @Mock
    private TransactionRepository repository;
    @Mock
    private CacheManager cacheManager;
    @Mock
    private CacheInvalidationService cacheInvalidation;
    @Mock
    private Cache monthlySummaryCache;
    @Mock
    private Cache transactionsListCache;

    private TransactionService transactionService;

    private User owner;

    @BeforeEach
    void setUp() {
        when(cacheManager.getCache(RedisCacheConfig.MONTHLY_SUMMARY_CACHE)).thenReturn(monthlySummaryCache);
        when(cacheManager.getCache(RedisCacheConfig.TRANSACTIONS_LIST_CACHE)).thenReturn(transactionsListCache);
        when(monthlySummaryCache.get(anyString(), eq(MonthlySummary.class))).thenReturn(null);
        when(transactionsListCache.get(anyString(), eq(CachedTransactionList.class))).thenReturn(null);

        transactionService = new TransactionService(repository, cacheManager, cacheInvalidation);

        owner = new User();
        owner.setId(10L);
    }

    @Test
    void findAllByUser_loadsFromRepositoryWhenCacheMiss() {
        Transaction tx = new Transaction();
        tx.setId(1L);
        when(repository.findByUser(owner)).thenReturn(List.of(tx));

        List<Transaction> result = transactionService.findAllByUser(owner);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        verify(repository).findByUser(owner);
    }

    @Test
    void save_setsUserInvalidatesCachesAndReturnsSaved() {
        Transaction input = new Transaction();
        Transaction saved = new Transaction();
        saved.setId(5L);
        saved.setDateTime(LocalDateTime.of(2026, 4, 15, 12, 0));
        when(repository.save(any(Transaction.class))).thenReturn(saved);

        Transaction result = transactionService.save(input, owner);

        assertThat(result).isSameAs(saved);
        assertThat(input.getUser()).isSameAs(owner);
        verify(cacheInvalidation).evictMonthlySummary(owner, saved.getDateTime());
        verify(cacheInvalidation).evictTransactionsList(10L);
    }

    @Test
    void update_throwsWhenNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.update(1L, new Transaction(), owner))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void update_throwsWhenWrongOwner() {
        User other = new User();
        other.setId(99L);
        Transaction existing = new Transaction();
        existing.setUser(other);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> transactionService.update(1L, new Transaction(), owner))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void update_persistsAndEvictsCaches() {
        Transaction existing = new Transaction();
        existing.setUser(owner);
        existing.setDateTime(LocalDateTime.of(2026, 3, 1, 10, 0));
        when(repository.findById(2L)).thenReturn(Optional.of(existing));

        Transaction patch = new Transaction();
        LocalDateTime newDt = LocalDateTime.of(2026, 5, 1, 15, 30);
        patch.setDateTime(newDt);
        patch.setType(TransactionType.INCOME);
        patch.setCategory("Salary");
        patch.setDescription("Pay");
        patch.setAmount(new BigDecimal("2500.00"));

        Transaction saved = new Transaction();
        saved.setUser(owner);
        saved.setDateTime(newDt);
        when(repository.save(existing)).thenReturn(saved);

        Transaction result = transactionService.update(2L, patch, owner);

        assertThat(result.getDateTime()).isEqualTo(newDt);
        verify(cacheInvalidation).evictMonthlySummary(owner, LocalDateTime.of(2026, 3, 1, 10, 0));
        verify(cacheInvalidation).evictMonthlySummary(owner, newDt);
        verify(cacheInvalidation).evictTransactionsList(10L);
    }

    @Test
    void delete_throwsWhenWrongOwner() {
        User other = new User();
        other.setId(2L);
        Transaction existing = new Transaction();
        existing.setUser(other);
        when(repository.findById(3L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> transactionService.delete(3L, owner))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void delete_evictsCachesAndDeletes() {
        Transaction existing = new Transaction();
        existing.setUser(owner);
        existing.setDateTime(LocalDateTime.of(2026, 2, 10, 8, 0));
        when(repository.findById(4L)).thenReturn(Optional.of(existing));

        transactionService.delete(4L, owner);

        verify(cacheInvalidation).evictMonthlySummary(owner, existing.getDateTime());
        verify(cacheInvalidation).evictTransactionsList(10L);
        verify(repository).deleteById(4L);
    }

    @Test
    void monthlySummary_returnsCachedWhenPresent() {
        MonthlySummary cached = new MonthlySummary();
        cached.year = 2026;
        cached.month = 4;
        when(monthlySummaryCache.get(eq("10:2026:4"), eq(MonthlySummary.class))).thenReturn(cached);

        MonthlySummary result = transactionService.monthlySummary(2026, 4, owner);

        assertThat(result).isSameAs(cached);
        verify(repository, never()).sumByDateTimeBetweenAndTypeAndUser(
                any(), any(), any(), any());
    }

    @Test
    void monthlySummary_computesWhenCacheMiss() {
        LocalDateTime start = LocalDateTime.of(2026, 6, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(2026, 6, 30, 23, 59, 59);

        when(repository.sumByDateTimeBetweenAndTypeAndUser(
                eq(start), eq(end), eq(TransactionType.INCOME), eq(owner)))
                .thenReturn(new BigDecimal("300"));
        when(repository.sumByDateTimeBetweenAndTypeAndUser(
                eq(start), eq(end), eq(TransactionType.EXPENSE), eq(owner)))
                .thenReturn(new BigDecimal("120"));
        when(repository.sumByCategoryBetweenAndUser(eq(start), eq(end), eq(owner)))
                .thenReturn(List.of());

        MonthlySummary result = transactionService.monthlySummary(2026, 6, owner);

        assertThat(result.year).isEqualTo(2026);
        assertThat(result.month).isEqualTo(6);
        assertThat(result.totalIncome).isEqualByComparingTo("300");
        assertThat(result.totalExpense).isEqualByComparingTo("120");
        assertThat(result.balance).isEqualByComparingTo("180");
        assertThat(result.byCategory).isEmpty();
    }
}
