package com.example.budget.repository;

import com.example.budget.model.HouseholdExpense;
import com.example.budget.model.HouseholdExpenseShare;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HouseholdExpenseShareRepository extends JpaRepository<HouseholdExpenseShare, Long> {
    List<HouseholdExpenseShare> findByExpenseIn(List<HouseholdExpense> expenses);
    void deleteByExpense(HouseholdExpense expense);
}

