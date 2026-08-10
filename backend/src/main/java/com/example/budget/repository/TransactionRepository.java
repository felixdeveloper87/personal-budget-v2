package com.example.budget.repository;

import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.TransactionStatus;
import com.example.budget.model.User;
import com.example.budget.model.FinancialAccount;
import com.example.budget.model.PaymentMethodType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
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

    long countByUserAndAccountIsNull(User user);

    List<Transaction> findByUserAndAccountAndPaymentDateBetween(
                    User user, FinancialAccount account, LocalDate start, LocalDate end);

    List<Transaction> findTop20ByUserAndAccountAndPaymentDateLessThanEqualOrderByPaymentDateDescIdDesc(
                    User user, FinancialAccount account, LocalDate date);

    List<Transaction> findTop20ByUserAndAccountAndPaymentDateGreaterThanOrderByPaymentDateAscIdAsc(
                    User user, FinancialAccount account, LocalDate date);

    /**
     * Same past-activity query as the Top20 variant above, but with a caller-supplied
     * {@link Pageable} cap so the account activity feed can page arbitrarily far back
     * instead of being frozen at 20 rows. Used to merge-sort against transfers — see
     * {@link com.example.budget.service.FinancialAccountService#recentActivityPage}.
     */
    @Query("SELECT t FROM Transaction t " +
                    "LEFT JOIN FETCH t.paymentMethod paymentMethod " +
                    "WHERE t.user = :user " +
                    "AND t.account = :account " +
                    "AND t.paymentDate <= :date " +
                    "AND (paymentMethod IS NULL OR paymentMethod.type <> :creditCardType) " +
                    "ORDER BY t.paymentDate DESC, t.id DESC")
    List<Transaction> findNonCreditCardAccountActivity(
                    @Param("user") User user,
                    @Param("account") FinancialAccount account,
                    @Param("date") LocalDate date,
                    @Param("creditCardType") PaymentMethodType creditCardType,
                    Pageable pageable);

    @Query("SELECT MAX(t.id), t.paymentDate, paymentMethod.name, " +
                    "SUM(CASE WHEN t.type = :expenseType THEN t.amount ELSE (0 - t.amount) END) " +
                    "FROM Transaction t " +
                    "JOIN t.paymentMethod paymentMethod " +
                    "WHERE t.user = :user " +
                    "AND t.account = :account " +
                    "AND t.paymentDate <= :date " +
                    "AND paymentMethod.type = :creditCardType " +
                    "GROUP BY t.paymentDate, paymentMethod.id, paymentMethod.name " +
                    "ORDER BY t.paymentDate DESC, MAX(t.id) DESC")
    List<Object[]> findCreditCardStatementActivity(
                    @Param("user") User user,
                    @Param("account") FinancialAccount account,
                    @Param("date") LocalDate date,
                    @Param("creditCardType") PaymentMethodType creditCardType,
                    @Param("expenseType") TransactionType expenseType,
                    Pageable pageable);

    List<Transaction> findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                    User user, LocalDate start, LocalDate end);

    @Query("SELECT t FROM Transaction t " +
                    "JOIN FETCH t.user " +
                    "WHERE t.status = :status " +
                    "AND t.paymentDate <= :date " +
                    "AND t.account IS NOT NULL " +
                    "AND (t.installmentPlan IS NOT NULL OR t.recurringTransaction IS NOT NULL)")
    List<Transaction> findDueGeneratedTransactions(
                    @Param("status") TransactionStatus status,
                    @Param("date") LocalDate date);

    @Query("SELECT t FROM Transaction t " +
                    "LEFT JOIN FETCH t.paymentMethod " +
                    "LEFT JOIN FETCH t.account " +
                    "LEFT JOIN FETCH t.installmentPlan " +
                    "LEFT JOIN FETCH t.recurringTransaction " +
                    "WHERE t.user = :user AND t.paymentDate BETWEEN :start AND :end " +
                    "ORDER BY t.paymentDate ASC, t.id ASC")
    List<Transaction> findReportTransactions(@Param("user") User user,
                    @Param("start") LocalDate start,
                    @Param("end") LocalDate end);

    boolean existsByRecurringTransactionIdAndTransactionDateBetween(
                    Long recurringTransactionId,
                    LocalDate start,
                    LocalDate end);

    List<Transaction> findByRecurringTransactionIdAndTransactionDateBetweenOrderByTransactionDateAscIdAsc(
                    Long recurringTransactionId,
                    LocalDate start,
                    LocalDate end);

    List<Transaction> findByRecurringTransactionIdAndDateTimeGreaterThanEqualOrderByDateTimeAsc(
                    Long recurringTransactionId,
                    LocalDateTime fromInclusive);

    List<Transaction> findByRecurringTransactionId(Long recurringTransactionId);

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
                    "WHERE t.paymentDate BETWEEN :start AND :end " +
                    "AND t.type = :type")
    BigDecimal sumByPaymentDateBetweenAndType(@Param("start") LocalDate start,
                    @Param("end") LocalDate end,
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
                    "WHERE t.paymentDate BETWEEN :start AND :end " +
                    "AND t.type = :type AND t.user = :user")
    BigDecimal sumByPaymentDateBetweenAndTypeAndUser(@Param("start") LocalDate start,
                    @Param("end") LocalDate end,
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
                    "WHERE t.paymentDate BETWEEN :start AND :end " +
                    "GROUP BY t.category")
    List<Object[]> sumByCategoryBetween(@Param("start") LocalDate start,
                    @Param("end") LocalDate end);

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
                    "WHERE t.paymentDate BETWEEN :start AND :end " +
                    "AND t.user = :user " +
                    "GROUP BY t.category")
    List<Object[]> sumByCategoryBetweenAndUser(@Param("start") LocalDate start,
                    @Param("end") LocalDate end,
                    @Param("user") User user);

    /**
     * Removes generated installments for a recurring that are dated after today's calendar date
     * (typically future months). Today's and earlier dated rows remain as historical debits/credits.
     */
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Transaction t WHERE t.recurringTransaction.id = :recurringTransactionId "
                    + "AND t.dateTime >= :fromInclusive")
    void deleteGeneratedByRecurringFromDateInclusive(@Param("recurringTransactionId") Long recurringTransactionId,
                    @Param("fromInclusive") LocalDateTime fromInclusive);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Transaction t WHERE t.user = :user")
    void deleteAllByUser(@Param("user") User user);
}
