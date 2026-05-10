package com.example.budget.service;

import com.example.budget.cache.CacheInvalidationService;
import com.example.budget.cache.CachedRecurringList;
import com.example.budget.config.RedisCacheConfig;
import com.example.budget.dto.CreateRecurringTransactionRequest;
import com.example.budget.dto.RecurringTransactionDTO;
import com.example.budget.dto.UpdateRecurringTransactionAmountRequest;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.mapper.RecurringTransactionMapper;
import com.example.budget.model.RecurringTransaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.repository.RecurringTransactionRepository;
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
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
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
class RecurringTransactionServiceTest {

    @Mock
    private RecurringTransactionRepository recurringTransactionRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private CacheInvalidationService cacheInvalidation;
    @Mock
    private CacheManager cacheManager;
    @Mock
    private Cache recurringListCache;

    private final RecurringTransactionMapper recurringTransactionMapper = new RecurringTransactionMapper();

    private RecurringTransactionService recurringTransactionService;

    private User owner;

    @BeforeEach
    void setUp() {
        when(cacheManager.getCache(RedisCacheConfig.RECURRING_LIST_CACHE)).thenReturn(recurringListCache);
        when(recurringListCache.get(anyString(), eq(CachedRecurringList.class))).thenReturn(null);

        recurringTransactionService = new RecurringTransactionService(
                recurringTransactionRepository,
                transactionRepository,
                recurringTransactionMapper,
                cacheInvalidation,
                cacheManager);

        owner = new User();
        owner.setId(30L);
    }

    @Test
    void create_throwsWhenEndBeforeStart() {
        CreateRecurringTransactionRequest request = new CreateRecurringTransactionRequest();
        request.setType(TransactionType.EXPENSE);
        request.setCategory("Rent");
        request.setDescription("Monthly");
        request.setAmount(new BigDecimal("800"));
        request.setStartDate(LocalDate.of(2026, 6, 15));
        request.setEndDate(LocalDate.of(2026, 6, 1));

        assertThatThrownBy(() -> recurringTransactionService.create(request, owner))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("End date");

        verify(recurringTransactionRepository, never()).save(any());
    }

    @Test
    void findById_throwsWhenMissing() {
        when(recurringTransactionRepository.findById(50L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> recurringTransactionService.findById(50L, owner))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void findById_throwsWhenNotOwner() {
        User other = new User();
        other.setId(2L);
        RecurringTransaction recurring = sampleRecurring(other);
        ReflectionTestUtils.setField(recurring, "id", 60L);
        when(recurringTransactionRepository.findById(60L)).thenReturn(Optional.of(recurring));

        assertThatThrownBy(() -> recurringTransactionService.findById(60L, owner))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void updateAmount_persistsAndEvictsListCache() {
        RecurringTransaction recurring = sampleRecurring(owner);
        ReflectionTestUtils.setField(recurring, "id", 71L);
        when(recurringTransactionRepository.findById(71L)).thenReturn(Optional.of(recurring));
        when(recurringTransactionRepository.save(recurring)).thenReturn(recurring);

        UpdateRecurringTransactionAmountRequest req = new UpdateRecurringTransactionAmountRequest();
        ReflectionTestUtils.setField(req, "amount", new BigDecimal("999.00"));

        RecurringTransactionDTO dto = recurringTransactionService.updateAmount(71L, req, owner);

        assertThat(dto.getAmount()).isEqualByComparingTo("999.00");
        verify(cacheInvalidation).evictRecurringList(30L);
    }

    @Test
    void cancel_deletesFutureGeneratedAndDeactivates() {
        RecurringTransaction recurring = sampleRecurring(owner);
        ReflectionTestUtils.setField(recurring, "id", 80L);
        recurring.setActive(true);
        when(recurringTransactionRepository.findById(80L)).thenReturn(Optional.of(recurring));
        when(recurringTransactionRepository.save(recurring)).thenReturn(recurring);

        RecurringTransactionDTO dto = recurringTransactionService.cancel(80L, owner);

        assertThat(dto.isActive()).isFalse();
        verify(transactionRepository).deleteGeneratedByRecurringFromDateInclusive(eq(80L), any());
        verify(cacheInvalidation).evictMonthlySummariesWideWindow(30L);
        verify(cacheInvalidation).evictRecurringList(30L);
        verify(cacheInvalidation).evictTransactionsList(30L);
    }

    @Test
    void findAllByUser_returnsMappedRowsWhenCacheMiss() {
        RecurringTransaction recurring = sampleRecurring(owner);
        ReflectionTestUtils.setField(recurring, "id", 3L);
        when(recurringTransactionRepository.findByUserOrderByIdDesc(owner)).thenReturn(List.of(recurring));

        List<RecurringTransactionDTO> result = recurringTransactionService.findAllByUser(owner);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(3L);
        assertThat(result.get(0).getCategory()).isEqualTo("Rent");
    }

    private static RecurringTransaction sampleRecurring(User user) {
        RecurringTransaction r = new RecurringTransaction();
        r.setType(TransactionType.EXPENSE);
        r.setCategory("Rent");
        r.setDescription("Apt");
        r.setAmount(new BigDecimal("500"));
        r.setStartDate(LocalDate.of(2026, 1, 5));
        r.setDayOfMonth(5);
        r.setNextRunDate(LocalDate.of(2026, 2, 5));
        r.setActive(true);
        r.setUser(user);
        return r;
    }
}
