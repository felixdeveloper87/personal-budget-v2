package com.example.budget.repository;

import com.example.budget.model.Household;
import com.example.budget.model.HouseholdSettlement;
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

