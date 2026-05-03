package com.example.budget.repository;

import com.example.budget.model.RecurringTransaction;
import com.example.budget.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    List<RecurringTransaction> findByUserOrderByIdDesc(User user);

    List<RecurringTransaction> findByActiveTrue();
}
