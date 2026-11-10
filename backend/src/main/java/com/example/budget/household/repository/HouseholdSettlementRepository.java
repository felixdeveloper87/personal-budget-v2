package com.example.budget.household.repository;

import com.example.budget.household.model.HouseholdSettlement;
import com.example.budget.household.model.Household;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import java.util.List;
import java.util.Optional;

public interface HouseholdSettlementRepository extends JpaRepository<HouseholdSettlement, Long> {
    List<HouseholdSettlement> findByHouseholdOrderBySettlementDateDescIdDesc(Household household);
    @EntityGraph(attributePaths = {"fromMember", "fromMember.user", "toMember", "toMember.user"})
    Slice<HouseholdSettlement> findByHouseholdOrderBySettlementDateDescIdDesc(Household household, Pageable pageable);
    Optional<HouseholdSettlement> findByIdAndHousehold(Long id, Household household);
}

