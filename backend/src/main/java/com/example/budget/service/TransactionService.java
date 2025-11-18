package com.example.budget.service;

import com.example.budget.dto.MonthlySummary;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.repository.TransactionRepository;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
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

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    /**
     * Retrieves all transactions for a specific user.
     * 
     * @param user User to find transactions for
     * @return List of transactions belonging to the user
     */
    public List<Transaction> findAllByUser(User user) {
        return repository.findByUser(user);
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
        return repository.save(t);
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

        transaction.setDateTime(updatedTx.getDateTime());
        transaction.setType(updatedTx.getType());
        transaction.setCategory(updatedTx.getCategory());
        transaction.setDescription(updatedTx.getDescription());
        transaction.setAmount(updatedTx.getAmount());

        return repository.save(transaction);
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
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);

        BigDecimal income = repository.sumByDateTimeBetweenAndTypeAndUser(start, end, TransactionType.INCOME, user);
        BigDecimal expense = repository.sumByDateTimeBetweenAndTypeAndUser(start, end, TransactionType.EXPENSE, user);
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
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("dateTime"), start));
        }

        if (end != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("dateTime"), end));
        }

        return repository.findAll(spec);
    }
}
