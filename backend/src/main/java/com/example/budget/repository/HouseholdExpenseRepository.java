package com.example.budget.repository;

import com.example.budget.model.Household;
import com.example.budget.model.HouseholdExpense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HouseholdExpenseRepository extends JpaRepository<HouseholdExpense, Long> {
    List<HouseholdExpense> findByHouseholdAndVoidedAtIsNullOrderByExpenseDateDescIdDesc(Household household);
    Optional<HouseholdExpense> findByIdAndHouseholdAndVoidedAtIsNull(Long id, Household household);
}

