package com.example.budget.repository;

import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Transaction entity operations.
 * 
 * Provides data access methods for transaction queries, including user-specific
 * queries, date range filtering, and aggregation operations for summaries.
 * Supports JPA Specifications for dynamic query building.
 */
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    /**
     * Finds all transactions belonging to a specific user.
     * 
     * @param user User to find transactions for
     * @return List of transactions belonging to the user
     */
    List<Transaction> findByUser(User user);

    boolean existsByRecurringTransactionIdAndDateTimeBetween(
                    Long recurringTransactionId,
                    LocalDateTime start,
                    LocalDateTime end);

    /**
     * Calculates the sum of transaction amounts within a date range and type.
     * 
     * @param start Start date and time (inclusive)
     * @param end End date and time (inclusive)
     * @param type Transaction type (INCOME or EXPENSE)
     * @return Sum of amounts, or 0 if no transactions match
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) " +
                    "FROM Transaction t " +
                    "WHERE t.dateTime BETWEEN :start AND :end " +
                    "AND t.type = :type")
    BigDecimal sumByDateTimeBetweenAndType(@Param("start") LocalDateTime start,
                    @Param("end") LocalDateTime end,
                    @Param("type") TransactionType type);

    /**
     * Calculates the sum of transaction amounts within a date range, type, and user.
     * 
     * @param start Start date and time (inclusive)
     * @param end End date and time (inclusive)
     * @param type Transaction type (INCOME or EXPENSE)
     * @param user User to filter by
     * @return Sum of amounts, or 0 if no transactions match
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) " +
                    "FROM Transaction t " +
                    "WHERE t.dateTime BETWEEN :start AND :end " +
                    "AND t.type = :type AND t.user = :user")
    BigDecimal sumByDateTimeBetweenAndTypeAndUser(@Param("start") LocalDateTime start,
                    @Param("end") LocalDateTime end,
                    @Param("type") TransactionType type,
                    @Param("user") User user);

    /**
     * Aggregates transaction amounts by category within a date range.
     * 
     * Returns a list of Object arrays where each array contains:
     * [0] = category name (String)
     * [1] = total income for the category (BigDecimal)
     * [2] = total expense for the category (BigDecimal)
     * 
     * @param start Start date and time (inclusive)
     * @param end End date and time (inclusive)
     * @return List of Object arrays containing category aggregates
     */
    @Query("SELECT t.category, " +
                    "COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0), " +
                    "COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) " +
                    "FROM Transaction t " +
                    "WHERE t.dateTime BETWEEN :start AND :end " +
                    "GROUP BY t.category")
    List<Object[]> sumByCategoryBetween(@Param("start") LocalDateTime start,
                    @Param("end") LocalDateTime end);

    /**
     * Aggregates transaction amounts by category within a date range for a specific user.
     * 
     * Returns a list of Object arrays where each array contains:
     * [0] = category name (String)
     * [1] = total income for the category (BigDecimal)
     * [2] = total expense for the category (BigDecimal)
     * 
     * @param start Start date and time (inclusive)
     * @param end End date and time (inclusive)
     * @param user User to filter by
     * @return List of Object arrays containing category aggregates
     */
    @Query("SELECT t.category, " +
                    "COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0), " +
                    "COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) " +
                    "FROM Transaction t " +
                    "WHERE t.dateTime BETWEEN :start AND :end " +
                    "AND t.user = :user " +
                    "GROUP BY t.category")
    List<Object[]> sumByCategoryBetweenAndUser(@Param("start") LocalDateTime start,
                    @Param("end") LocalDateTime end,
                    @Param("user") User user);
}
