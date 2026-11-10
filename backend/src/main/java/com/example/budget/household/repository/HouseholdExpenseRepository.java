package com.example.budget.household.repository;

import com.example.budget.household.model.HouseholdExpense;
import com.example.budget.household.model.Household;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import java.util.List;
import java.util.Optional;

public interface HouseholdExpenseRepository extends JpaRepository<HouseholdExpense, Long> {
    List<HouseholdExpense> findByHouseholdAndVoidedAtIsNullOrderByExpenseDateDescIdDesc(Household household);
    @EntityGraph(attributePaths = {"payer", "payer.user"})
    Slice<HouseholdExpense> findByHouseholdAndVoidedAtIsNullOrderByExpenseDateDescIdDesc(
            Household household, Pageable pageable);
    Optional<HouseholdExpense> findByIdAndHouseholdAndVoidedAtIsNull(Long id, Household household);
}

