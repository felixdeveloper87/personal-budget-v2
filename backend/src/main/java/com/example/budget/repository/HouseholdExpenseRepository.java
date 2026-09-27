package com.example.budget.repository;

import com.example.budget.model.Household;
import com.example.budget.model.HouseholdExpense;
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

