package com.example.budget.service;

import com.example.budget.cache.CacheInvalidationService;
import com.example.budget.cache.CachedInstallmentPlanList;
import com.example.budget.config.RedisCacheConfig;
import com.example.budget.dto.CreateInstallmentPlanRequest;
import com.example.budget.dto.InstallmentPlanDTO;
import com.example.budget.dto.UpdateInstallmentPlanRequest;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.mapper.InstallmentPlanMapper;
import com.example.budget.model.InstallmentPlan;
import com.example.budget.model.PaymentMethod;
import com.example.budget.model.PaymentMethodType;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionStatus;
import com.example.budget.model.User;
import com.example.budget.repository.InstallmentPlanRepository;
import com.example.budget.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
    @Mock
    private FinancialAccountService financialAccountService;
    @Mock
    private PaymentMethodService paymentMethodService;

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
                financialAccountService,
                paymentMethodService,
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

        ArgumentCaptor<List<Transaction>> transactionsCaptor = captureSavedTransactions();
        List<Transaction> transactions = transactionsCaptor.getValue();
        assertThat(transactions).hasSize(3);
        assertThat(transactions.get(0).getInstallmentNumber()).isEqualTo(1);
        assertThat(transactions.get(0).getAmount()).isEqualByComparingTo("100.00");
        assertThat(transactions.get(0).getTransactionDate()).isEqualTo(LocalDate.of(2026, 1, 10));
        assertThat(transactions.get(0).getPaymentDate()).isEqualTo(LocalDate.of(2026, 1, 10));
        assertThat(transactions.get(2).getTransactionDate()).isEqualTo(LocalDate.of(2026, 1, 10));
        assertThat(transactions.get(2).getPaymentDate()).isEqualTo(LocalDate.of(2026, 3, 10));

        assertThat(result.getId()).isEqualTo(88L);
        assertThat(result.getTotalInstallments()).isEqualTo(3);

        verify(cacheInvalidation).evictInstallmentPlansList(20L);
        verify(cacheInvalidation).evictTransactionsList(20L);
        verify(cacheInvalidation, times(3)).evictMonthlySummary(eq(owner), any(LocalDate.class));
    }

    @Test
    void createInstallmentPlan_withCreditCardDoesNotShiftInstallmentPaymentDateToNextStatement() {
        PaymentMethod card = creditCard(15, 31);
        when(paymentMethodService.getOwnedPaymentMethod(2L, owner)).thenReturn(card);

        CreateInstallmentPlanRequest request = new CreateInstallmentPlanRequest(
                6,
                new BigDecimal("100.00"),
                "Travel",
                "British Airways",
                LocalDate.of(2026, 4, 30),
                null);
        request.setPaymentMethodId(2L);

        when(installmentPlanRepository.save(any(InstallmentPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        installmentPlanService.createInstallmentPlan(request, owner);

        ArgumentCaptor<List<Transaction>> transactionsCaptor = captureSavedTransactions();
        Transaction lastInstallment = transactionsCaptor.getValue().get(5);

        assertThat(lastInstallment.getInstallmentNumber()).isEqualTo(6);
        assertThat(lastInstallment.getTransactionDate()).isEqualTo(LocalDate.of(2026, 4, 30));
        assertThat(lastInstallment.getPaymentDate()).isEqualTo(LocalDate.of(2026, 9, 30));
        assertThat(lastInstallment.getPaymentDate()).isNotEqualTo(LocalDate.of(2026, 10, 31));
        assertThat(lastInstallment.getPaymentMethod()).isSameAs(card);
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
    void update_recalculatesInstallmentValuesDatesAndEvictsCaches() {
        Transaction t1 = new Transaction();
        t1.setInstallmentNumber(1);
        t1.setDateTime(LocalDateTime.of(2026, 1, 5, 12, 0));
        t1.setTransactionDate(LocalDate.of(2026, 1, 5));
        t1.setPaymentDate(LocalDate.of(2026, 1, 5));
        t1.setAmount(new BigDecimal("100.00"));

        Transaction t2 = new Transaction();
        t2.setInstallmentNumber(2);
        t2.setDateTime(LocalDateTime.of(2026, 2, 5, 12, 0));
        t2.setTransactionDate(LocalDate.of(2026, 2, 5));
        t2.setPaymentDate(LocalDate.of(2026, 2, 5));
        t2.setAmount(new BigDecimal("100.00"));

        InstallmentPlan plan = new InstallmentPlan(2, new BigDecimal("200.00"), new BigDecimal("100.00"), owner);
        ReflectionTestUtils.setField(plan, "id", 22L);
        plan.setTransactions(new ArrayList<>(List.of(t1, t2)));

        when(installmentPlanRepository.findById(22L)).thenReturn(Optional.of(plan));
        when(installmentPlanRepository.save(plan)).thenReturn(plan);

        UpdateInstallmentPlanRequest request = new UpdateInstallmentPlanRequest(
                new BigDecimal("125.50"),
                LocalDate.of(2026, 3, 10),
                null);

        InstallmentPlanDTO dto = installmentPlanService.update(22L, request, owner);

        assertThat(dto.getInstallmentValue()).isEqualByComparingTo("125.50");
        assertThat(dto.getTotalAmount()).isEqualByComparingTo("251.00");
        assertThat(t1.getAmount()).isEqualByComparingTo("125.50");
        assertThat(t1.getPaymentDate()).isEqualTo(LocalDate.of(2026, 3, 10));
        assertThat(t2.getPaymentDate()).isEqualTo(LocalDate.of(2026, 4, 10));

        verify(cacheInvalidation).evictInstallmentPlansList(20L);
        verify(cacheInvalidation).evictTransactionsList(20L);
        verify(cacheInvalidation).evictMonthlySummary(owner, LocalDate.of(2026, 1, 5));
        verify(cacheInvalidation).evictMonthlySummary(owner, LocalDate.of(2026, 2, 5));
        verify(cacheInvalidation).evictMonthlySummary(owner, LocalDate.of(2026, 3, 10));
        verify(cacheInvalidation).evictMonthlySummary(owner, LocalDate.of(2026, 4, 10));
    }

    @Test
    void update_setsFutureInstallmentsToPlannedUsingInstallmentDate() {
        Transaction transaction = new Transaction();
        transaction.setInstallmentNumber(1);
        transaction.setPaymentDate(LocalDate.now().minusDays(10));
        transaction.setStatus(TransactionStatus.CLEARED);

        InstallmentPlan plan = new InstallmentPlan(1, BigDecimal.TEN, BigDecimal.TEN, owner);
        ReflectionTestUtils.setField(plan, "id", 25L);
        plan.setTransactions(new ArrayList<>(List.of(transaction)));

        when(installmentPlanRepository.findById(25L)).thenReturn(Optional.of(plan));
        when(installmentPlanRepository.save(plan)).thenReturn(plan);

        LocalDate futureDate = LocalDate.now().plusDays(10);
        UpdateInstallmentPlanRequest request = new UpdateInstallmentPlanRequest(
                BigDecimal.TEN,
                futureDate,
                null);

        installmentPlanService.update(25L, request, owner);

        assertThat(transaction.getTransactionDate()).isEqualTo(futureDate);
        assertThat(transaction.getPaymentDate()).isEqualTo(futureDate);
        assertThat(transaction.getStatus()).isEqualTo(TransactionStatus.PLANNED);
    }

    @Test
    void update_preservesReconciledInstallmentWhenScheduleIsRecalculated() {
        Transaction transaction = new Transaction();
        transaction.setInstallmentNumber(1);
        transaction.setPaymentDate(LocalDate.of(2026, 1, 5));
        transaction.setStatus(TransactionStatus.RECONCILED);

        InstallmentPlan plan = new InstallmentPlan(1, BigDecimal.TEN, BigDecimal.TEN, owner);
        ReflectionTestUtils.setField(plan, "id", 26L);
        plan.setTransactions(new ArrayList<>(List.of(transaction)));

        when(installmentPlanRepository.findById(26L)).thenReturn(Optional.of(plan));
        when(installmentPlanRepository.save(plan)).thenReturn(plan);

        LocalDate pastDate = LocalDate.now().minusDays(10);
        UpdateInstallmentPlanRequest request = new UpdateInstallmentPlanRequest(
                BigDecimal.TEN,
                pastDate,
                null);

        installmentPlanService.update(26L, request, owner);

        assertThat(transaction.getTransactionDate()).isEqualTo(pastDate);
        assertThat(transaction.getPaymentDate()).isEqualTo(pastDate);
        assertThat(transaction.getStatus()).isEqualTo(TransactionStatus.RECONCILED);
    }

    @Test
    void update_withTotalAmountRecalculatesInstallmentValueAndLastInstallmentRounding() {
        Transaction t1 = new Transaction();
        t1.setInstallmentNumber(1);
        t1.setPaymentDate(LocalDate.of(2026, 1, 1));

        Transaction t2 = new Transaction();
        t2.setInstallmentNumber(2);
        t2.setPaymentDate(LocalDate.of(2026, 2, 1));

        Transaction t3 = new Transaction();
        t3.setInstallmentNumber(3);
        t3.setPaymentDate(LocalDate.of(2026, 3, 1));

        InstallmentPlan plan = new InstallmentPlan(3, new BigDecimal("90.00"), new BigDecimal("30.00"), owner);
        ReflectionTestUtils.setField(plan, "id", 24L);
        plan.setTransactions(new ArrayList<>(List.of(t1, t2, t3)));

        when(installmentPlanRepository.findById(24L)).thenReturn(Optional.of(plan));
        when(installmentPlanRepository.save(plan)).thenReturn(plan);

        UpdateInstallmentPlanRequest request = new UpdateInstallmentPlanRequest(
                null,
                new BigDecimal("100.00"),
                LocalDate.of(2026, 5, 1),
                null);

        InstallmentPlanDTO dto = installmentPlanService.update(24L, request, owner);

        assertThat(dto.getTotalAmount()).isEqualByComparingTo("100.00");
        assertThat(dto.getInstallmentValue()).isEqualByComparingTo("33.33");
        assertThat(t1.getAmount()).isEqualByComparingTo("33.33");
        assertThat(t2.getAmount()).isEqualByComparingTo("33.33");
        assertThat(t3.getAmount()).isEqualByComparingTo("33.34");
        assertThat(t1.getPaymentDate()).isEqualTo(LocalDate.of(2026, 5, 1));
        assertThat(t2.getPaymentDate()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(t3.getPaymentDate()).isEqualTo(LocalDate.of(2026, 7, 1));
    }

    @Test
    void update_throwsWhenNotOwner() {
        User other = new User();
        other.setId(99L);
        InstallmentPlan plan = new InstallmentPlan(1, BigDecimal.TEN, BigDecimal.TEN, other);
        ReflectionTestUtils.setField(plan, "id", 23L);
        when(installmentPlanRepository.findById(23L)).thenReturn(Optional.of(plan));

        UpdateInstallmentPlanRequest request = new UpdateInstallmentPlanRequest(
                BigDecimal.ONE,
                LocalDate.of(2026, 1, 1),
                null);

        assertThatThrownBy(() -> installmentPlanService.update(23L, request, owner))
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

    @SuppressWarnings("unchecked")
    private ArgumentCaptor<List<Transaction>> captureSavedTransactions() {
        ArgumentCaptor<List<Transaction>> transactionsCaptor = ArgumentCaptor.forClass(List.class);
        verify(transactionRepository).saveAll(transactionsCaptor.capture());
        return transactionsCaptor;
    }

    private static PaymentMethod creditCard(int closingDay, int paymentDay) {
        PaymentMethod card = new PaymentMethod();
        card.setType(PaymentMethodType.CREDIT_CARD);
        card.setStatementClosingDay(closingDay);
        card.setPaymentDay(paymentDay);
        return card;
    }
}
