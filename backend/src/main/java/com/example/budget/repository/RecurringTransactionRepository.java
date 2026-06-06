package com.example.budget.repository;

import com.example.budget.model.RecurringTransaction;
import com.example.budget.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    List<RecurringTransaction> findByUserOrderByIdDesc(User user);

    List<RecurringTransaction> findByActiveTrue();

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM RecurringTransaction r WHERE r.user = :user")
    void deleteAllByUser(@Param("user") User user);
}
