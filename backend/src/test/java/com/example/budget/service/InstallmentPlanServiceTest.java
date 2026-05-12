package com.example.budget.service;

import com.example.budget.cache.CacheInvalidationService;
import com.example.budget.cache.CachedInstallmentPlanList;
import com.example.budget.config.RedisCacheConfig;
import com.example.budget.dto.CreateInstallmentPlanRequest;
import com.example.budget.dto.InstallmentPlanDTO;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.mapper.InstallmentPlanMapper;
import com.example.budget.model.InstallmentPlan;
import com.example.budget.model.Transaction;
import com.example.budget.model.User;
import com.example.budget.repository.InstallmentPlanRepository;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class InstallmentPlanServiceTest {

    @Mock
    private InstallmentPlanRepository installmentPlanRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private CacheInvalidationService cacheInvalidation;
    @Mock
    private CacheManager cacheManager;
    @Mock
    private Cache installmentPlansListCache;

    private final InstallmentPlanMapper installmentPlanMapper = new InstallmentPlanMapper();

    private InstallmentPlanService installmentPlanService;

    private User owner;

    @BeforeEach
    void setUp() {
        when(cacheManager.getCache(RedisCacheConfig.INSTALLMENT_PLANS_LIST_CACHE)).thenReturn(installmentPlansListCache);
        when(installmentPlansListCache.get(anyString(), eq(CachedInstallmentPlanList.class))).thenReturn(null);

        installmentPlanService = new InstallmentPlanService(
                installmentPlanRepository,
                transactionRepository,
                installmentPlanMapper,
                cacheInvalidation,
                cacheManager);

        owner = new User();
        owner.setId(20L);
    }

    @Test
    void createInstallmentPlan_savesPlanTransactionsAndEvictsCaches() {
        CreateInstallmentPlanRequest request = new CreateInstallmentPlanRequest(
                3,
                new BigDecimal("100.00"),
                "Shopping",
                "Laptop",
                LocalDate.of(2026, 1, 10),
                null);

        when(installmentPlanRepository.save(any(InstallmentPlan.class))).thenAnswer(inv -> {
            InstallmentPlan p = inv.getArgument(0);
            ReflectionTestUtils.setField(p, "id", 88L);
            return p;
        });

        InstallmentPlanDTO result = installmentPlanService.createInstallmentPlan(request, owner);

        verify(transactionRepository).saveAll(argThat((List<Transaction> txs) ->
                txs.size() == 3
                        && txs.get(0).getInstallmentNumber() == 1
                        && txs.get(0).getAmount().compareTo(new BigDecimal("100.00")) == 0));

        assertThat(result.getId()).isEqualTo(88L);
        assertThat(result.getTotalInstallments()).isEqualTo(3);

        verify(cacheInvalidation).evictInstallmentPlansList(20L);
        verify(cacheInvalidation).evictTransactionsList(20L);
        verify(cacheInvalidation, times(3)).evictMonthlySummary(eq(owner), any(LocalDate.class));
    }

    @Test
    void findAllByUser_returnsFromRepositoryWhenCacheMiss() {
        InstallmentPlan plan = new InstallmentPlan(2, new BigDecimal("200"), new BigDecimal("100"), owner);
        ReflectionTestUtils.setField(plan, "id", 1L);
        plan.setTransactions(new ArrayList<>());

        when(installmentPlanRepository.findByUserOrderByIdDesc(owner)).thenReturn(List.of(plan));

        List<InstallmentPlanDTO> list = installmentPlanService.findAllByUser(owner);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getId()).isEqualTo(1L);
    }

    @Test
    void findById_throwsWhenMissing() {
        when(installmentPlanRepository.findById(7L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> installmentPlanService.findById(7L, owner))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void findById_throwsWhenNotOwner() {
        User other = new User();
        other.setId(99L);
        InstallmentPlan plan = new InstallmentPlan(1, BigDecimal.TEN, BigDecimal.TEN, other);
        ReflectionTestUtils.setField(plan, "id", 9L);
        when(installmentPlanRepository.findById(9L)).thenReturn(Optional.of(plan));

        assertThatThrownBy(() -> installmentPlanService.findById(9L, owner))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void delete_removesPlanAndEvictsPerTransaction() {
        Transaction t1 = new Transaction();
        t1.setDateTime(LocalDateTime.of(2026, 4, 1, 12, 0));
        t1.setPaymentDate(LocalDate.of(2026, 4, 1));
        InstallmentPlan plan = new InstallmentPlan(1, BigDecimal.TEN, BigDecimal.TEN, owner);
        ReflectionTestUtils.setField(plan, "id", 12L);
        plan.setTransactions(new ArrayList<>(List.of(t1)));

        when(installmentPlanRepository.findById(12L)).thenReturn(Optional.of(plan));

        installmentPlanService.delete(12L, owner);

        verify(installmentPlanRepository).delete(plan);
        verify(cacheInvalidation).evictInstallmentPlansList(20L);
        verify(cacheInvalidation).evictTransactionsList(20L);
        verify(cacheInvalidation).evictMonthlySummary(owner, t1.getPaymentDate());
    }
}
