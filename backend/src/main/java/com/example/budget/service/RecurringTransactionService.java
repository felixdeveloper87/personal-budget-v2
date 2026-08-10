package com.example.budget.service;

import com.example.budget.cache.CacheInvalidationService;
import com.example.budget.cache.CachedRecurringList;
import com.example.budget.cache.RedisCacheSafety;
import com.example.budget.config.RedisCacheConfig;
import com.example.budget.dto.AssignAccountRequest;
import com.example.budget.dto.CreateRecurringTransactionRequest;
import com.example.budget.dto.RecurringTransactionDTO;
import com.example.budget.dto.RecurringUpdateScope;
import com.example.budget.dto.UpdateRecurringTransactionAmountRequest;
import com.example.budget.dto.UpdateRecurringTransactionRequest;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.mapper.RecurringTransactionMapper;
import com.example.budget.model.FinancialAccount;
import com.example.budget.model.RecurringTransaction;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionStatus;
import com.example.budget.model.User;
import com.example.budget.repository.RecurringTransactionRepository;
import com.example.budget.repository.TransactionRepository;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
public class RecurringTransactionService {
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final TransactionRepository transactionRepository;
    private final RecurringTransactionMapper recurringTransactionMapper;
    private final FinancialAccountService financialAccountService;
    private final PaymentMethodService paymentMethodService;
    private final CreditCardBillingService creditCardBillingService;
    private final CacheInvalidationService cacheInvalidation;
    private final Cache recurringListCache;

    public RecurringTransactionService(
            RecurringTransactionRepository recurringTransactionRepository,
            TransactionRepository transactionRepository,
            RecurringTransactionMapper recurringTransactionMapper,
            FinancialAccountService financialAccountService,
            PaymentMethodService paymentMethodService,
            CreditCardBillingService creditCardBillingService,
            CacheInvalidationService cacheInvalidation,
            CacheManager cacheManager
    ) {
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.transactionRepository = transactionRepository;
        this.recurringTransactionMapper = recurringTransactionMapper;
        this.financialAccountService = financialAccountService;
        this.paymentMethodService = paymentMethodService;
        this.creditCardBillingService = creditCardBillingService;
        this.cacheInvalidation = cacheInvalidation;
        Cache recurring = cacheManager.getCache(RedisCacheConfig.RECURRING_LIST_CACHE);
        if (recurring == null) {
            throw new IllegalStateException("Cache '" + RedisCacheConfig.RECURRING_LIST_CACHE + "' is not configured");
        }
        this.recurringListCache = recurring;
    }

    @Transactional
    public RecurringTransactionDTO create(CreateRecurringTransactionRequest request, User user) {
        validateDateRange(request.getStartDate(), request.getEndDate());

        RecurringTransaction recurringTransaction = recurringTransactionMapper.toEntity(request, user);
        recurringTransaction.setAccount(financialAccountService.getOwnedAccount(request.getAccountId(), user));
        recurringTransaction.setPaymentMethod(paymentMethodService.getOwnedPaymentMethod(request.getPaymentMethodId(), user));
        recurringTransaction = recurringTransactionRepository.save(recurringTransaction);
        generateTransactionsForMonth(recurringTransaction, YearMonth.now());
        cacheInvalidation.evictRecurringList(user.getId());
        cacheInvalidation.evictTransactionsList(user.getId());
        return recurringTransactionMapper.toDTO(recurringTransaction);
    }

    @Transactional(readOnly = true)
    public List<RecurringTransactionDTO> findAllByUser(User user) {
        String key = String.valueOf(user.getId());
        CachedRecurringList cached = RedisCacheSafety.get(recurringListCache, key, CachedRecurringList.class);
        if (cached != null && cached.getItems() != null && !cached.getItems().isEmpty()) {
            if (cached.getItems().get(0) instanceof RecurringTransactionDTO) {
                return new ArrayList<>(cached.getItems());
            }
            recurringListCache.evict(key);
        }
        List<RecurringTransactionDTO> fromDb = recurringTransactionRepository.findByUserOrderByIdDesc(user).stream()
                .map(recurringTransactionMapper::toDTO)
                .toList();
        RedisCacheSafety.put(recurringListCache, key, CachedRecurringList.copyOf(fromDb));
        return new ArrayList<>(fromDb);
    }

    public RecurringTransactionDTO findById(Long id, User user) {
        RecurringTransaction recurringTransaction = getOwnedRecurringTransaction(id, user);
        return recurringTransactionMapper.toDTO(recurringTransaction);
    }

    /**
     * Deactivates a recurring obligation and deletes any generated postings dated after today's
     * calendar day in the server's default timezone. Today's and older postings remain in history
     * and stay in monthly summaries for their months.
     */
    @Transactional
    public RecurringTransactionDTO cancel(Long id, User user) {
        RecurringTransaction recurringTransaction = getOwnedRecurringTransaction(id, user);

        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        LocalDateTime firstMomentAfterTodayCalendar = today.plusDays(1).atStartOfDay();
        transactionRepository.deleteGeneratedByRecurringFromDateInclusive(
                recurringTransaction.getId(),
                firstMomentAfterTodayCalendar);

        cacheInvalidation.evictMonthlySummariesWideWindow(user.getId());
        cacheInvalidation.evictRecurringList(user.getId());
        cacheInvalidation.evictTransactionsList(user.getId());

        recurringTransaction.setActive(false);
        return recurringTransactionMapper.toDTO(recurringTransactionRepository.save(recurringTransaction));
    }

    @Transactional
    public RecurringTransactionDTO updateAmount(Long id, UpdateRecurringTransactionAmountRequest request, User user) {
        RecurringTransaction recurringTransaction = getOwnedRecurringTransaction(id, user);
        recurringTransaction.setAmount(request.getAmount());
        RecurringTransactionDTO dto = recurringTransactionMapper.toDTO(
                recurringTransactionRepository.save(recurringTransaction));
        cacheInvalidation.evictRecurringList(user.getId());
        return dto;
    }

    @Transactional
    public RecurringTransactionDTO update(Long id, UpdateRecurringTransactionRequest request, User user) {
        RecurringTransaction recurringTransaction = getOwnedRecurringTransaction(id, user);
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        YearMonth currentMonth = YearMonth.from(today);
        LocalDate nextMonthStart = currentMonth.plusMonths(1).atDay(1);

        List<Transaction> currentOccurrences = request.getApplyFrom() == RecurringUpdateScope.CURRENT_MONTH
                ? transactionRepository
                        .findByRecurringTransactionIdAndTransactionDateBetweenOrderByTransactionDateAscIdAsc(
                                recurringTransaction.getId(),
                                currentMonth.atDay(1),
                                currentMonth.atEndOfMonth())
                : List.of();

        if (currentOccurrences.stream().anyMatch(
                transaction -> transaction.getStatus() == TransactionStatus.RECONCILED)) {
            throw new IllegalArgumentException(
                    "This month's fixed payment is reconciled. Apply the change from next month instead.");
        }

        List<Transaction> futureGenerated = transactionRepository
                .findByRecurringTransactionIdAndDateTimeGreaterThanEqualOrderByDateTimeAsc(
                        recurringTransaction.getId(),
                        nextMonthStart.atStartOfDay());

        recurringTransaction.setAmount(request.getAmount());
        recurringTransaction.setStartDate(request.getStartDate());
        recurringTransaction.setEndDate(null);
        recurringTransaction.setDayOfMonth(request.getDayOfMonth());
        recurringTransaction.setNextRunDate(firstDueDateOnOrAfter(recurringTransaction, nextMonthStart));
        recurringTransaction.setActive(true);
        recurringTransaction.setAccount(financialAccountService.getOwnedAccount(request.getAccountId(), user));
        recurringTransaction.setPaymentMethod(paymentMethodService.getOwnedPaymentMethod(request.getPaymentMethodId(), user));

        if (request.getApplyFrom() == RecurringUpdateScope.CURRENT_MONTH) {
            if (currentOccurrences.isEmpty()) {
                LocalDate currentDueDate = resolveDueDateInMonth(recurringTransaction, currentMonth);
                if (currentDueDate != null) {
                    createTransactionIfMissing(recurringTransaction, currentDueDate);
                }
            } else {
                for (Transaction transaction : currentOccurrences) {
                    updateCurrentOccurrence(transaction, recurringTransaction, currentMonth, today, user);
                }
                transactionRepository.saveAll(currentOccurrences);
            }
        }

        LocalDate nextDueDate = firstDueDateOnOrAfter(recurringTransaction, nextMonthStart);
        List<Transaction> updatedTransactions = new ArrayList<>();
        for (Transaction transaction : futureGenerated) {
            cacheInvalidation.evictMonthlySummary(user, transaction.getPaymentDate());

            LocalDateTime nextDateTime = nextDueDate.atTime(12, 0);
            transaction.setDateTime(nextDateTime);
            transaction.setTransactionDate(nextDueDate);
            applyRuleFields(transaction, recurringTransaction);
            LocalDate paymentDate = creditCardBillingService.resolvePaymentDate(
                    nextDueDate,
                    recurringTransaction.getPaymentMethod());
            transaction.setPaymentDate(paymentDate);
            if (paymentDate.isAfter(today)) {
                transaction.setStatus(TransactionStatus.PLANNED);
            } else {
                transaction.setStatus(TransactionStatus.CLEARED);
            }
            updatedTransactions.add(transaction);
            cacheInvalidation.evictMonthlySummary(user, paymentDate);

            nextDueDate = nextMonthlyDate(nextDueDate, request.getDayOfMonth());
        }

        if (!updatedTransactions.isEmpty()) {
            transactionRepository.saveAll(updatedTransactions);
        }

        RecurringTransactionDTO dto = recurringTransactionMapper.toDTO(
                recurringTransactionRepository.save(recurringTransaction));
        cacheInvalidation.evictRecurringList(user.getId());
        cacheInvalidation.evictTransactionsList(user.getId());
        return dto;
    }

    private void updateCurrentOccurrence(
            Transaction transaction,
            RecurringTransaction recurringTransaction,
            YearMonth currentMonth,
            LocalDate today,
            User user) {
        LocalDate previousPaymentDate = transaction.getPaymentDate();
        TransactionStatus previousStatus = transaction.getStatus();

        applyRuleFields(transaction, recurringTransaction);

        if (previousStatus == TransactionStatus.PLANNED) {
            LocalDate dueDate = resolveDueDateInMonth(recurringTransaction, currentMonth);
            if (dueDate != null) {
                transaction.setDateTime(dueDate.atTime(12, 0));
                transaction.setTransactionDate(dueDate);
                LocalDate paymentDate = creditCardBillingService.resolvePaymentDate(
                        dueDate,
                        recurringTransaction.getPaymentMethod());
                transaction.setPaymentDate(paymentDate);
                transaction.setStatus(paymentDate.isAfter(today)
                        ? TransactionStatus.PLANNED
                        : TransactionStatus.CLEARED);
            }
        }

        cacheInvalidation.evictMonthlySummary(user, previousPaymentDate);
        if (!java.util.Objects.equals(previousPaymentDate, transaction.getPaymentDate())) {
            cacheInvalidation.evictMonthlySummary(user, transaction.getPaymentDate());
        }
    }

    private void applyRuleFields(Transaction transaction, RecurringTransaction recurringTransaction) {
        transaction.setAmount(recurringTransaction.getAmount());
        transaction.setType(recurringTransaction.getType());
        transaction.setCategory(recurringTransaction.getCategory());
        transaction.setDescription(recurringTransaction.getDescription());
        transaction.setAccount(recurringTransaction.getAccount());
        transaction.setPaymentMethod(recurringTransaction.getPaymentMethod());
    }

    /**
     * Associates a recurring rule with a balance account without changing amounts,
     * dates or the schedule. The account is propagated to every transaction the rule
     * has generated (past and future) so the account history and cash flow stay complete.
     */
    @Transactional
    public RecurringTransactionDTO assignAccount(Long id, AssignAccountRequest request, User user) {
        RecurringTransaction recurringTransaction = getOwnedRecurringTransaction(id, user);

        FinancialAccount account = financialAccountService.getOwnedAccount(request.getAccountId(), user);
        if (account == null) {
            throw new EntityNotFoundException("FinancialAccount", request.getAccountId());
        }
        if (!account.isActive()) {
            throw new IllegalArgumentException("Cannot associate with an archived account");
        }

        recurringTransaction.setAccount(account);

        List<Transaction> linked = transactionRepository.findByRecurringTransactionId(recurringTransaction.getId());
        for (Transaction transaction : linked) {
            transaction.setAccount(account);
        }
        if (!linked.isEmpty()) {
            transactionRepository.saveAll(linked);
        }

        RecurringTransactionDTO dto = recurringTransactionMapper.toDTO(
                recurringTransactionRepository.save(recurringTransaction));
        cacheInvalidation.evictRecurringList(user.getId());
        cacheInvalidation.evictTransactionsList(user.getId());
        cacheInvalidation.evictMonthlySummariesWideWindow(user.getId());
        return dto;
    }

    @Scheduled(cron = "0 15 0 1 * *")
    @Transactional
    public void generateDueTransactionsForAllUsers() {
        YearMonth currentMonth = YearMonth.now();
        recurringTransactionRepository.findByActiveTrue()
                .forEach(recurringTransaction -> generateTransactionsForMonth(recurringTransaction, currentMonth));
    }

    /**
     * Resolves which calendar date in {@code month} should receive one generated installment.
     * <p>In the user's first billed month only, if the nominal day-of-month (e.g. 3) sits before the
     * contractual {@code startDate} (e.g. 10 May), use {@code startDate} so that scheduled installment date
     * still exists dated in that month — it then appears in the monthly summary even before that day arrives.
     */
    private LocalDate resolveDueDateInMonth(RecurringTransaction recurringTransaction, YearMonth month) {
        LocalDate startDate = recurringTransaction.getStartDate();
        YearMonth startMonth = YearMonth.from(startDate);
        LocalDate nominal = dateInMonth(month, recurringTransaction.getDayOfMonth());

        if (month.isBefore(startMonth)) {
            return null;
        }

        LocalDate effective = nominal;
        if (month.equals(startMonth) && nominal.isBefore(startDate)) {
            effective = startDate;
        }

        if (effective.isBefore(startDate)) {
            return null;
        }

        return effective;
    }

    private void generateTransactionsForMonth(RecurringTransaction recurringTransaction, YearMonth month) {
        LocalDate dueDate = resolveDueDateInMonth(recurringTransaction, month);

        if (dueDate == null) {
            return;
        }

        LocalDate endDate = recurringTransaction.getEndDate();
        if (endDate != null && dueDate.isAfter(endDate)) {
            recurringTransaction.setActive(false);
            return;
        }

        createTransactionIfMissing(recurringTransaction, dueDate);
        recurringTransaction.setNextRunDate(nextMonthlyDate(dueDate, recurringTransaction.getDayOfMonth()));

        if (endDate != null && recurringTransaction.getNextRunDate().isAfter(endDate)) {
            recurringTransaction.setActive(false);
        }
    }

    private void createTransactionIfMissing(RecurringTransaction recurringTransaction, LocalDate dueDate) {
        YearMonth occurrenceMonth = YearMonth.from(dueDate);

        boolean exists = transactionRepository.existsByRecurringTransactionIdAndTransactionDateBetween(
                recurringTransaction.getId(),
                occurrenceMonth.atDay(1),
                occurrenceMonth.atEndOfMonth()
        );

        if (exists) {
            return;
        }

        Transaction transaction = new Transaction();
        transaction.setDateTime(dueDate.atTime(12, 0));
        transaction.setTransactionDate(dueDate);
        LocalDate paymentDate = creditCardBillingService.resolvePaymentDate(
                dueDate,
                recurringTransaction.getPaymentMethod());
        transaction.setPaymentDate(paymentDate);
        transaction.setType(recurringTransaction.getType());
        transaction.setCategory(recurringTransaction.getCategory());
        transaction.setDescription(recurringTransaction.getDescription());
        transaction.setAmount(recurringTransaction.getAmount());
        transaction.setUser(recurringTransaction.getUser());
        transaction.setRecurringTransaction(recurringTransaction);
        transaction.setAccount(recurringTransaction.getAccount());
        transaction.setPaymentMethod(recurringTransaction.getPaymentMethod());
        transaction.setStatus(paymentDate.isAfter(LocalDate.now())
                ? com.example.budget.model.TransactionStatus.PLANNED
                : com.example.budget.model.TransactionStatus.CLEARED);

        transactionRepository.save(transaction);
        cacheInvalidation.evictMonthlySummary(recurringTransaction.getUser(), transaction.getPaymentDate());
        cacheInvalidation.evictTransactionsList(recurringTransaction.getUser().getId());
        cacheInvalidation.evictRecurringList(recurringTransaction.getUser().getId());
    }

    private LocalDate nextMonthlyDate(LocalDate currentDate, int targetDayOfMonth) {
        LocalDate nextMonth = currentDate.plusMonths(1).withDayOfMonth(1);
        int day = Math.min(targetDayOfMonth, nextMonth.lengthOfMonth());
        return nextMonth.withDayOfMonth(day);
    }

    private LocalDate firstDueDateOnOrAfter(
            RecurringTransaction recurringTransaction,
            LocalDate threshold) {
        YearMonth month = YearMonth.from(threshold);
        YearMonth startMonth = YearMonth.from(recurringTransaction.getStartDate());
        if (month.isBefore(startMonth)) {
            month = startMonth;
        }

        while (true) {
            LocalDate dueDate = resolveDueDateInMonth(recurringTransaction, month);
            if (dueDate != null && !dueDate.isBefore(threshold)) {
                return dueDate;
            }
            month = month.plusMonths(1);
        }
    }

    private LocalDate dateInMonth(YearMonth month, int targetDayOfMonth) {
        int day = Math.min(targetDayOfMonth, month.lengthOfMonth());
        return month.atDay(day);
    }

    private RecurringTransaction getOwnedRecurringTransaction(Long id, User user) {
        RecurringTransaction recurringTransaction = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("RecurringTransaction", id));

        if (!recurringTransaction.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: Recurring transaction does not belong to user");
        }

        return recurringTransaction;
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must be after start date");
        }
    }
}
