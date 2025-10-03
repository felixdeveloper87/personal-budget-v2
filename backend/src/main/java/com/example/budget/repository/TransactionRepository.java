package com.example.budget.repository;

import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    List<Transaction> findByDateBetween(LocalDate start, LocalDate end);

    List<Transaction> findByUser(User user);

    @Query("select coalesce(sum(t.amount),0) " +
            "from Transaction t " +
            "where t.date between :start and :end and t.type = :type")
    BigDecimal sumByDateBetweenAndType(@Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("type") TransactionType type);

    @Query("select coalesce(sum(t.amount),0) " +
            "from Transaction t " +
            "where t.date between :start and :end and t.type = :type and t.user = :user")
    BigDecimal sumByDateBetweenAndTypeAndUser(@Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("type") TransactionType type,
            @Param("user") User user);

    @Query("select t.category, " +
            "coalesce(sum(case when t.type = 'INCOME' then t.amount else 0 end),0), " +
            "coalesce(sum(case when t.type = 'EXPENSE' then t.amount else 0 end),0) " +
            "from Transaction t " +
            "where t.date between :start and :end " +
            "group by t.category")
    List<Object[]> sumByCategoryBetween(@Param("start") LocalDate start,
            @Param("end") LocalDate end);

    @Query("select t.category, " +
            "coalesce(sum(case when t.type = 'INCOME' then t.amount else 0 end),0), " +
            "coalesce(sum(case when t.type = 'EXPENSE' then t.amount else 0 end),0) " +
            "from Transaction t " +
            "where t.date between :start and :end and t.user = :user " +
            "group by t.category")
    List<Object[]> sumByCategoryBetweenAndUser(@Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("user") User user);
}
