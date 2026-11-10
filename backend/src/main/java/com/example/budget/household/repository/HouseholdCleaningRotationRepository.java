package com.example.budget.household.repository;

import com.example.budget.household.model.HouseholdCleaningRotation;
import com.example.budget.household.model.Household;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface HouseholdCleaningRotationRepository
        extends JpaRepository<HouseholdCleaningRotation, Long> {
    Optional<HouseholdCleaningRotation> findByHousehold(Household household);

    List<HouseholdCleaningRotation> findByActiveTrue();
}
