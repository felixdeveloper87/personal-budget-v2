package com.example.budget.repository;

import com.example.budget.model.Household;
import com.example.budget.model.HouseholdSettlement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HouseholdSettlementRepository extends JpaRepository<HouseholdSettlement, Long> {
    List<HouseholdSettlement> findByHouseholdOrderBySettlementDateDescIdDesc(Household household);
    Optional<HouseholdSettlement> findByIdAndHousehold(Long id, Household household);
}

