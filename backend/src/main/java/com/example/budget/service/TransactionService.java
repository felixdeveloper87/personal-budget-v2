package com.example.budget.service;

import com.example.budget.cache.CacheInvalidationService;
import com.example.budget.cache.CachedTransactionList;
import com.example.budget.cache.RedisCacheSafety;
import com.example.budget.config.RedisCacheConfig;
import com.example.budget.dto.MonthlySummary;
import com.example.budget.dto.CreateTransactionRequest;
import com.example.budget.dto.ImportResultDTO;
import com.example.budget.dto.ImportTransactionRow;
import com.example.budget.dto.UpdateTransactionRequest;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.mapper.TransactionMapper;
import com.example.budget.model.PaymentMethod;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.repository.TransactionRepository;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Service for transaction operations.
 * 
 * Handles CRUD operations for transactions, monthly summaries, and search functionality.
 * All operations are scoped to the authenticated user to ensure data isolation.
 */
@Service
public class TransactionService {
    private final TransactionRepository repository;
    private final PaymentMethodService paymentMethodService;
    private final FinancialAccountService financialAccountService;
    private final CreditCardBillingService creditCardBillingService;
    private final TransactionMapper transactionMapper;
    private final Cache monthlySummaryCache;
    private final Cache transactionsListCache;
    private final CacheInvalidationService cacheInvalidation;

    public TransactionService(
            TransactionRepository repository,
            PaymentMethodService paymentMethodService,
            FinancialAccountService financialAccountService,
            CreditCardBillingService creditCardBillingService,
            TransactionMapper transactionMapper,
            CacheManager cacheManager,
            CacheInvalidationService cacheInvalidation) {
        this.repository = repository;
        this.paymentMethodService = paymentMethodService;
        this.financialAccountService = financialAccountService;
        this.creditCardBillingService = creditCardBillingService;
        this.transactionMapper = transactionMapper;
        this.cacheInvalidation = cacheInvalidation;
        Cache summary = cacheManager.getCache(RedisCacheConfig.MONTHLY_SUMMARY_CACHE);
        if (summary == null) {
            throw new IllegalStateException("Cache '" + RedisCacheConfig.MONTHLY_SUMMARY_CACHE + "' is not configured");
        }
        this.monthlySummaryCache = summary;
        Cache txList = cacheManager.getCache(RedisCacheConfig.TRANSACTIONS_LIST_CACHE);
        if (txList == null) {
            throw new IllegalStateException("Cache '" + RedisCacheConfig.TRANSACTIONS_LIST_CACHE + "' is not configured");
        }
        this.transactionsListCache = txList;
    }

    /**
     * Retrieves all transactions for a specific user.
     * 
     * @param user User to find transactions for
     * @return List of transactions belonging to the user
     */
    @Transactional(readOnly = true)
    public List<Transaction> findAllByUser(User user) {
        String key = String.valueOf(user.getId());
        CachedTransactionList cached = RedisCacheSafety.get(transactionsListCache, key, CachedTransactionList.class);
        if (cached != null && cached.getItems() != null && !cached.getItems().isEmpty()) {
            List<Transaction> items = cached.getItems();
            if (items.get(0) instanceof Transaction) {
                return new ArrayList<>(items);
            }
            transactionsListCache.evict(key);
        }
        List<Transaction> fromDb = repository.findByUser(user);
        RedisCacheSafety.put(transactionsListCache, key, CachedTransactionList.copyOf(fromDb));
        return new ArrayList<>(fromDb);
    }

    /**
     * Creates a new transaction for a user.
     * 
     * @param t Transaction to create
     * @param user User who owns the transaction
     * @return Saved transaction with generated ID
     */
    public Transaction save(Transaction t, User user) {
        t.setUser(user);
        prepareDates(t, t.getPaymentMethod());
        Transaction saved = repository.save(t);
        cacheInvalidation.evictMonthlySummary(user, saved.getPaymentDate());
        cacheInvalidation.evictTransactionsList(user.getId());
        return saved;
    }

    public Transaction create(CreateTransactionRequest request, User user) {
        PaymentMethod paymentMethod = paymentMethodService.getOwnedPaymentMethod(request.getPaymentMethodId(), user);
        var account = financialAccountService.getOwnedAccount(request.getAccountId(), user);
        Transaction transaction = transactionMapper.toEntity(request, user);
        transaction.setPaymentMethod(paymentMethod);
        transaction.setAccount(account);
        prepareDates(transaction, paymentMethod);
        Transaction saved = repository.save(transaction);
        cacheInvalidation.evictMonthlySummary(user, saved.getPaymentDate());
        cacheInvalidation.evictTransactionsList(user.getId());
        return saved;
    }

    /**
     * Bulk-imports transactions from parsed CSV rows.
     *
     * Each row is validated independently: a row missing a date, type or amount is skipped
     * and reported in the result rather than aborting the whole import. Valid rows are saved
     * together in a single transaction. The payment method is matched by name (case-insensitive)
     * against the user's existing methods; an unmatched name simply leaves the transaction
     * without a payment method.
     *
     * @param rows parsed rows from the client
     * @param user owner of the imported transactions
     * @return summary of how many rows were imported, skipped, and why
     */
    @Transactional
    public ImportResultDTO importTransactions(List<ImportTransactionRow> rows, User user) {
        return importTransactions(rows, null, user);
    }

    @Transactional
    public ImportResultDTO importTransactions(List<ImportTransactionRow> rows, Long accountId, User user) {
        var account = financialAccountService.getOwnedAccount(accountId, user);
        Map<String, PaymentMethod> methodsByName = new HashMap<>();
        for (PaymentMethod m : paymentMethodService.findEntitiesByUser(user)) {
            if (StringUtils.hasText(m.getName())) {
                methodsByName.putIfAbsent(m.getName().trim().toLowerCase(), m);
            }
        }

        List<Transaction> toSave = new ArrayList<>();
        List<ImportResultDTO.RowError> errors = new ArrayList<>();

        int index = 0;
        for (ImportTransactionRow row : rows) {
            index++;
            Integer line = row.getLine() != null ? row.getLine() : index;
            try {
                if (row.getDate() == null) {
                    throw new IllegalArgumentException("Date is required (YYYY-MM-DD).");
                }
                if (row.getType() == null) {
                    throw new IllegalArgumentException("Type is required (INCOME or EXPENSE).");
                }
                if (row.getAmount() == null) {
                    throw new IllegalArgumentException("Amount is required.");
                }

                PaymentMethod paymentMethod = null;
                if (StringUtils.hasText(row.getPaymentMethodName())) {
                    paymentMethod = methodsByName.get(row.getPaymentMethodName().trim().toLowerCase());
                }

                Transaction t = new Transaction();
                t.setUser(user);
                t.setTransactionDate(row.getDate());
                t.setDateTime(row.getDate().atTime(12, 0));
                t.setType(row.getType());
                t.setCategory(StringUtils.hasText(row.getCategory()) ? row.getCategory().trim() : "Others");
                t.setDescription(row.getDescription() != null ? row.getDescription().trim() : "");
                t.setAmount(row.getAmount().abs());
                t.setPaymentMethod(paymentMethod);
                t.setAccount(account);
                t.setStatus(com.example.budget.model.TransactionStatus.CLEARED);
                prepareDates(t, paymentMethod);

                toSave.add(t);
            } catch (Exception e) {
                errors.add(new ImportResultDTO.RowError(line, e.getMessage()));
            }
        }

        if (!toSave.isEmpty()) {
            repository.saveAll(toSave);
            cacheInvalidation.evictTransactionsList(user.getId());
            toSave.stream()
                    .map(Transaction::getPaymentDate)
                    .filter(Objects::nonNull)
                    .distinct()
                    .forEach(date -> cacheInvalidation.evictMonthlySummary(user, date));
        }

        return new ImportResultDTO(toSave.size(), errors.size(), errors);
    }

    /**
     * Serializes all of a user's transactions to CSV.
     *
     * Columns match the import format so an exported file round-trips back through the importer.
     * Uses {@code transactionDate} (the real purchase date) so re-importing a credit-card
     * transaction does not double-shift its payment date through the billing-cycle logic.
     *
     * @param user owner of the transactions
     * @return CSV text (CRLF line endings, header row included)
     */
    @Transactional(readOnly = true)
    public String exportCsv(User user) {
        List<Transaction> transactions = repository.findByUser(user);

        StringBuilder sb = new StringBuilder();
        sb.append("Date,Type,Category,Description,Amount,Payment Method\r\n");

        for (Transaction t : transactions) {
            LocalDate date = t.getTransactionDate() != null
                    ? t.getTransactionDate()
                    : t.getPaymentDate();

            sb.append(csvCell(date != null ? date.toString() : "")).append(',')
                    .append(t.getType() != null ? t.getType().name() : "").append(',')
                    .append(csvCell(t.getCategory() != null ? t.getCategory() : "")).append(',')
                    .append(csvCell(t.getDescription() != null ? t.getDescription() : "")).append(',')
                    .append(t.getAmount() != null ? t.getAmount().toPlainString() : "0").append(',')
                    .append(csvCell(t.getPaymentMethod() != null ? t.getPaymentMethod().getName() : ""))
                    .append("\r\n");
        }

        return sb.toString();
    }

    /** Quote a CSV cell only when it contains a comma, quote, or newline. */
    private String csvCell(String value) {
        if (value.indexOf(',') >= 0 || value.indexOf('"') >= 0
                || value.indexOf('\n') >= 0 || value.indexOf('\r') >= 0) {
            return '"' + value.replace("\"", "\"\"") + '"';
        }
        return value;
    }

    /**
     * Updates an existing transaction.
     *
     * Only the owner of the transaction can update it. Updates all mutable fields
     * while preserving protected fields like user and installment plan.
     * 
     * @param id Transaction ID to update
     * @param updatedTx Transaction with updated fields
     * @param user User attempting the update
     * @return Updated transaction
     * @throws EntityNotFoundException if transaction is not found
     * @throws AccessDeniedException if user is not the owner
     */
    public Transaction update(Long id, Transaction updatedTx, User user) {
        Transaction transaction = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transaction", id));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: Transaction does not belong to user");
        }

        LocalDate previousPaymentDate = transaction.getPaymentDate();

        transaction.setDateTime(updatedTx.getDateTime());
        transaction.setTransactionDate(updatedTx.getTransactionDate());
        transaction.setType(updatedTx.getType());
        transaction.setCategory(updatedTx.getCategory());
        transaction.setDescription(updatedTx.getDescription());
        transaction.setAmount(updatedTx.getAmount());
        transaction.setPaymentMethod(updatedTx.getPaymentMethod());
        prepareDates(transaction, updatedTx.getPaymentMethod());

        Transaction saved = repository.save(transaction);
        cacheInvalidation.evictMonthlySummary(user, previousPaymentDate);
        if (!Objects.equals(previousPaymentDate, saved.getPaymentDate())) {
            cacheInvalidation.evictMonthlySummary(user, saved.getPaymentDate());
        }
        cacheInvalidation.evictTransactionsList(user.getId());
        return saved;
    }

    public Transaction update(Long id, UpdateTransactionRequest request, User user) {
        Transaction transaction = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transaction", id));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: Transaction does not belong to user");
        }

        LocalDate previousPaymentDate = transaction.getPaymentDate();
        PaymentMethod paymentMethod = paymentMethodService.getOwnedPaymentMethod(request.getPaymentMethodId(), user);
        var account = financialAccountService.getOwnedAccount(request.getAccountId(), user);

        transactionMapper.updateTransaction(transaction, request);
        transaction.setPaymentMethod(paymentMethod);
        transaction.setAccount(account);
        prepareDates(transaction, paymentMethod);

        Transaction saved = repository.save(transaction);
        cacheInvalidation.evictMonthlySummary(user, previousPaymentDate);
        if (!Objects.equals(previousPaymentDate, saved.getPaymentDate())) {
            cacheInvalidation.evictMonthlySummary(user, saved.getPaymentDate());
        }
        cacheInvalidation.evictTransactionsList(user.getId());
        return saved;
    }

    /**
     * Deletes a transaction by ID.
     * 
     * Only the owner of the transaction can delete it.
     * 
     * @param id Transaction ID to delete
     * @param user User attempting the deletion
     * @throws EntityNotFoundException if transaction is not found
     * @throws AccessDeniedException if user is not the owner
     */
    public void delete(Long id, User user) {
        Transaction transaction = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transaction", id));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: Transaction does not belong to user");
        }

        cacheInvalidation.evictMonthlySummary(user, transaction.getPaymentDate());
        cacheInvalidation.evictTransactionsList(user.getId());
        repository.deleteById(id);
    }

    /**
     * Generates a monthly summary of transactions for a user.
     * 
     * Calculates total income, total expenses, balance, and breakdown by category
     * for the specified month.
     * 
     * @param year Year for the summary
     * @param month Month for the summary (1-12)
     * @param user User to generate summary for
     * @return MonthlySummary containing aggregated transaction data
     */
    public MonthlySummary monthlySummary(int year, int month, User user) {
        String cacheKey = user.getId() + ":" + year + ":" + month;
        MonthlySummary cached = RedisCacheSafety.get(monthlySummaryCache, cacheKey, MonthlySummary.class);
        if (cached != null) {
            return cached;
        }

        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        BigDecimal income = repository.sumByPaymentDateBetweenAndTypeAndUser(start, end, TransactionType.INCOME, user);
        BigDecimal expense = repository.sumByPaymentDateBetweenAndTypeAndUser(start, end, TransactionType.EXPENSE, user);
        BigDecimal balance = income.subtract(expense);

        List<MonthlySummary.CategoryAggregate> byCategory = repository.sumByCategoryBetweenAndUser(start, end, user)
                .stream()
                .map(row -> new MonthlySummary.CategoryAggregate(
                        (String) row[0],
                        (BigDecimal) row[1],
                        (BigDecimal) row[2]))
                .collect(Collectors.toList());

        MonthlySummary s = new MonthlySummary();
        s.year = year;
        s.month = month;
        s.totalIncome = income;
        s.totalExpense = expense;
        s.balance = balance;
        s.byCategory = byCategory;
        RedisCacheSafety.put(monthlySummaryCache, cacheKey, s);
        return s;
    }

    /**
     * Searches transactions with optional filters.
     * 
     * Supports filtering by text search in description, transaction type, category,
     * and date range. All filters are optional and can be combined. Results are
     * automatically scoped to the authenticated user.
     * 
     * @param text Optional text to search in transaction descriptions (case-insensitive)
     * @param type Optional transaction type filter ("income" or "expense", case-insensitive)
     * @param category Optional category filter (case-insensitive partial match)
     * @param startDate Optional start date filter (yyyy-MM-dd format)
     * @param endDate Optional end date filter (yyyy-MM-dd format)
     * @param user User to search transactions for
     * @return List of transactions matching the search criteria
     */
    public List<Transaction> searchTransactions(
            String text,
            String type,
            String category,
            String startDate,
            String endDate,
            User user) {

        final LocalDateTime start;
        final LocalDateTime end;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        if (StringUtils.hasText(startDate)) {
            start = LocalDate.parse(startDate, formatter).atStartOfDay();
        } else {
            start = null;
        }
        if (StringUtils.hasText(endDate)) {
            end = LocalDate.parse(endDate, formatter).atTime(23, 59, 59);
        } else {
            end = null;
        }

        final TransactionType txType;
        if ("income".equalsIgnoreCase(type)) {
            txType = TransactionType.INCOME;
        } else if ("expense".equalsIgnoreCase(type)) {
            txType = TransactionType.EXPENSE;
        } else {
            txType = null;
        }

        Specification<Transaction> spec = (root, query, cb) -> cb.conjunction();

        spec = spec.and((root, query, cb) -> cb.equal(root.get("user"), user));

        if (StringUtils.hasText(text)) {
            String likeText = "%" + text.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("description")), likeText));
        }

        if (txType != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), txType));
        }

        if (StringUtils.hasText(category)) {
            String likeCategory = "%" + category.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("category")), likeCategory));
        }

        if (start != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("paymentDate"), start.toLocalDate()));
        }

        if (end != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("paymentDate"), end.toLocalDate()));
        }

        return repository.findAll(spec);
    }

    private void prepareDates(Transaction transaction, PaymentMethod paymentMethod) {
        if (transaction.getDateTime() == null && transaction.getTransactionDate() == null) {
            transaction.setDateTime(LocalDateTime.now());
        }
        if (transaction.getDateTime() == null && transaction.getTransactionDate() != null) {
            transaction.setDateTime(transaction.getTransactionDate().atTime(12, 0));
        }
        if (transaction.getDateTime() == null) {
            transaction.setDateTime(LocalDateTime.now());
        }
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(transaction.getDateTime().toLocalDate());
        }
        transaction.setPaymentDate(creditCardBillingService.resolvePaymentDate(
                transaction.getTransactionDate(),
                paymentMethod));
    }
}
