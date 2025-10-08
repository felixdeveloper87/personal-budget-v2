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

public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

        // 🔹 Ajustado para LocalDateTime e dateTime
        List<Transaction> findByDateTimeBetween(LocalDateTime start, LocalDateTime end);

        List<Transaction> findByUser(User user);

        @Query("SELECT COALESCE(SUM(t.amount), 0) " +
                        "FROM Transaction t " +
                        "WHERE t.dateTime BETWEEN :start AND :end " +
                        "AND t.type = :type")
        BigDecimal sumByDateTimeBetweenAndType(@Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end,
                        @Param("type") TransactionType type);

        @Query("SELECT COALESCE(SUM(t.amount), 0) " +
                        "FROM Transaction t " +
                        "WHERE t.dateTime BETWEEN :start AND :end " +
                        "AND t.type = :type AND t.user = :user")
        BigDecimal sumByDateTimeBetweenAndTypeAndUser(@Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end,
                        @Param("type") TransactionType type,
                        @Param("user") User user);

        @Query("SELECT t.category, " +
                        "COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0), " +
                        "COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) " +
                        "FROM Transaction t " +
                        "WHERE t.dateTime BETWEEN :start AND :end " +
                        "GROUP BY t.category")
        List<Object[]> sumByCategoryBetween(@Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

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
