package com.example.budget.service;

import com.example.budget.cache.CacheInvalidationService;
import com.example.budget.cache.CachedInstallmentPlanList;
import com.example.budget.cache.RedisCacheSafety;
import com.example.budget.config.RedisCacheConfig;
import com.example.budget.dto.CreateInstallmentPlanRequest;
import com.example.budget.dto.InstallmentPlanDTO;
import com.example.budget.dto.UpdateInstallmentPlanRequest;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.mapper.InstallmentPlanMapper;
import com.example.budget.model.InstallmentPlan;
import com.example.budget.model.Transaction;
import com.example.budget.model.User;
import com.example.budget.repository.InstallmentPlanRepository;
import com.example.budget.repository.TransactionRepository;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/**
 * Service for installment plan operations.
 * 
 * Handles CRUD operations for installment plans. When a plan is created, it
 * automatically generates corresponding transaction entries for each installment.
 * All operations are scoped to the authenticated user.
 */
@Service
public class InstallmentPlanService {

    private final InstallmentPlanRepository installmentPlanRepository;
    private final TransactionRepository transactionRepository;
    private final InstallmentPlanMapper installmentPlanMapper;
    private final CacheInvalidationService cacheInvalidation;
    private final Cache installmentPlansListCache;

    public InstallmentPlanService(InstallmentPlanRepository installmentPlanRepository,
                                  TransactionRepository transactionRepository,
                                  InstallmentPlanMapper installmentPlanMapper,
                                  CacheInvalidationService cacheInvalidation,
                                  CacheManager cacheManager) {
        this.installmentPlanRepository = installmentPlanRepository;
        this.transactionRepository = transactionRepository;
        this.installmentPlanMapper = installmentPlanMapper;
        this.cacheInvalidation = cacheInvalidation;
        Cache plansCache = cacheManager.getCache(RedisCacheConfig.INSTALLMENT_PLANS_LIST_CACHE);
        if (plansCache == null) {
            throw new IllegalStateException("Cache '" + RedisCacheConfig.INSTALLMENT_PLANS_LIST_CACHE + "' is not configured");
        }
        this.installmentPlansListCache = plansCache;
    }

    /**
     * Creates a new installment plan and generates corresponding transactions.
     * 
     * Creates an installment plan with the specified number of installments and value.
     * Automatically generates transaction entries for each installment, spaced monthly
     * from the start date. Due to cascade configuration, deleting a plan will also
     * delete all associated transactions.
     * 
     * @param request Request containing plan details
     * @param user User who owns the installment plan
     * @return InstallmentPlanDTO containing the created plan with all generated transactions
     */
    @Transactional
    public InstallmentPlanDTO createInstallmentPlan(CreateInstallmentPlanRequest request, User user) {
        InstallmentPlan plan = installmentPlanMapper.toEntity(request, user);
        plan = installmentPlanRepository.save(plan);

        List<Transaction> transactions = installmentPlanMapper.createTransactionsFromPlan(plan, request);
        transactionRepository.saveAll(transactions);
        plan.setTransactions(transactions);

        cacheInvalidation.evictInstallmentPlansList(user.getId());
        cacheInvalidation.evictTransactionsList(user.getId());
        for (Transaction t : transactions) {
            cacheInvalidation.evictMonthlySummary(user, t.getPaymentDate());
        }
        return installmentPlanMapper.toDTO(plan);
    }

    /**
     * Retrieves all installment plans for a user.
     * 
     * Returns plans ordered by ID in descending order (newest first).
     * 
     * @param user User to find plans for
     * @return List of InstallmentPlanDTO for the user
     */
    @Transactional(readOnly = true)
    public List<InstallmentPlanDTO> findAllByUser(User user) {
        String key = String.valueOf(user.getId());
        CachedInstallmentPlanList cached = RedisCacheSafety.get(installmentPlansListCache, key, CachedInstallmentPlanList.class);
        if (cached != null && cached.getItems() != null && !cached.getItems().isEmpty()) {
            if (cached.getItems().get(0) instanceof InstallmentPlanDTO) {
                return new ArrayList<>(cached.getItems());
            }
            installmentPlansListCache.evict(key);
        }
        List<InstallmentPlanDTO> fromDb = installmentPlanRepository.findByUserOrderByIdDesc(user).stream()
                .map(installmentPlanMapper::toDTO)
                .toList();
        RedisCacheSafety.put(installmentPlansListCache, key, CachedInstallmentPlanList.copyOf(fromDb));
        return new ArrayList<>(fromDb);
    }

    /**
     * Retrieves a specific installment plan by ID.
     * 
     * Only the owner of the plan can access it.
     * 
     * @param id Installment plan ID
     * @param user User attempting to access the plan
     * @return InstallmentPlanDTO containing the plan details and all associated transactions
     * @throws EntityNotFoundException if plan is not found
     * @throws AccessDeniedException if user is not the owner
     */
    public InstallmentPlanDTO findById(Long id, User user) {
        InstallmentPlan plan = installmentPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("InstallmentPlan", id));

        validateUserOwnership(plan, user);

        return installmentPlanMapper.toDTO(plan);
    }

    @Transactional
    public InstallmentPlanDTO update(Long id, UpdateInstallmentPlanRequest request, User user) {
        InstallmentPlan plan = installmentPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("InstallmentPlan", id));

        validateUserOwnership(plan, user);

        List<LocalDate> previousPaymentDates = plan.getTransactions().stream()
                .map(Transaction::getPaymentDate)
                .filter(Objects::nonNull)
                .toList();

        BigDecimal installmentValue = resolveInstallmentValue(request, plan.getTotalInstallments());
        BigDecimal totalAmount = request.getTotalAmount() != null
                ? request.getTotalAmount()
                : installmentValue.multiply(BigDecimal.valueOf(plan.getTotalInstallments()));

        plan.setInstallmentValue(installmentValue);
        plan.setTotalAmount(totalAmount);

        LocalDateTime baseDateTime = determineBaseDateTime(request);
        List<Transaction> transactions = plan.getTransactions().stream()
                .sorted(Comparator.comparing(
                        tx -> tx.getInstallmentNumber() != null ? tx.getInstallmentNumber() : Integer.MAX_VALUE))
                .toList();

        for (int index = 0; index < transactions.size(); index++) {
            Transaction transaction = transactions.get(index);
            LocalDateTime installmentDateTime = baseDateTime.plusMonths(index);
            transaction.setAmount(resolveTransactionAmount(index, transactions.size(), installmentValue, totalAmount, request.getTotalAmount() != null));
            transaction.setDateTime(installmentDateTime);
            transaction.setTransactionDate(installmentDateTime.toLocalDate());
            transaction.setPaymentDate(installmentDateTime.toLocalDate());
        }

        InstallmentPlan saved = installmentPlanRepository.save(plan);
        cacheInvalidation.evictInstallmentPlansList(user.getId());
        cacheInvalidation.evictTransactionsList(user.getId());
        previousPaymentDates.forEach(date -> cacheInvalidation.evictMonthlySummary(user, date));
        saved.getTransactions().stream()
                .map(Transaction::getPaymentDate)
                .filter(Objects::nonNull)
                .forEach(date -> cacheInvalidation.evictMonthlySummary(user, date));
        return installmentPlanMapper.toDTO(saved);
    }

    /**
     * Deletes an installment plan and all associated transactions.
     * 
     * Only the owner of the plan can delete it. Due to cascade configuration,
     * deleting a plan automatically deletes all associated transaction entries.
     * 
     * @param id Installment plan ID to delete
     * @param user User attempting to delete the plan
     * @throws EntityNotFoundException if plan is not found
     * @throws AccessDeniedException if user is not the owner
     */
    @Transactional
    public void delete(Long id, User user) {
        InstallmentPlan plan = installmentPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("InstallmentPlan", id));

        validateUserOwnership(plan, user);

        List<Transaction> linked = new ArrayList<>(plan.getTransactions());
        installmentPlanRepository.delete(plan);
        cacheInvalidation.evictInstallmentPlansList(user.getId());
        cacheInvalidation.evictTransactionsList(user.getId());
        for (Transaction t : linked) {
            cacheInvalidation.evictMonthlySummary(user, t.getPaymentDate());
        }
    }

    /**
     * Validates that a user owns an installment plan.
     * 
     * @param plan Installment plan to validate
     * @param user User to check ownership for
     * @throws AccessDeniedException if user is not the owner
     */
    private void validateUserOwnership(InstallmentPlan plan, User user) {
        if (!plan.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: Installment plan does not belong to user");
        }
    }

    private LocalDateTime determineBaseDateTime(UpdateInstallmentPlanRequest request) {
        if (request.getStartDateTime() != null) {
            return request.getStartDateTime();
        }
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        return startDate.atTime(12, 0);
    }

    private BigDecimal resolveInstallmentValue(UpdateInstallmentPlanRequest request, int totalInstallments) {
        if (request.getTotalAmount() != null) {
            return request.getTotalAmount().divide(BigDecimal.valueOf(totalInstallments), 2, RoundingMode.HALF_UP);
        }
        if (request.getInstallmentValue() != null) {
            return request.getInstallmentValue();
        }
        throw new IllegalArgumentException("Either installment value or total amount is required");
    }

    private BigDecimal resolveTransactionAmount(
            int index,
            int transactionCount,
            BigDecimal installmentValue,
            BigDecimal totalAmount,
            boolean totalAmountWasProvided) {
        if (!totalAmountWasProvided || index < transactionCount - 1) {
            return installmentValue;
        }
        return totalAmount.subtract(installmentValue.multiply(BigDecimal.valueOf(transactionCount - 1)));
    }
}
