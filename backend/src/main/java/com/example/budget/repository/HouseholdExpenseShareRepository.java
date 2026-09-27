package com.example.budget.repository;

import com.example.budget.model.HouseholdExpense;
import com.example.budget.model.HouseholdExpenseShare;
import com.example.budget.model.HouseholdMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HouseholdExpenseShareRepository extends JpaRepository<HouseholdExpenseShare, Long> {
    List<HouseholdExpenseShare> findByExpenseIn(List<HouseholdExpense> expenses);
    List<HouseholdExpenseShare> findByExpenseInAndMember(List<HouseholdExpense> expenses, HouseholdMember member);
    void deleteByExpense(HouseholdExpense expense);
}

