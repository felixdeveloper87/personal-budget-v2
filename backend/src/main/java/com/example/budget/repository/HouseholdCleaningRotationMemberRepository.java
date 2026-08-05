package com.example.budget.repository;

import com.example.budget.model.HouseholdCleaningRotation;
import com.example.budget.model.HouseholdCleaningRotationMember;
import com.example.budget.model.HouseholdMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HouseholdCleaningRotationMemberRepository
        extends JpaRepository<HouseholdCleaningRotationMember, Long> {
    List<HouseholdCleaningRotationMember> findByRotationOrderByPositionAsc(
            HouseholdCleaningRotation rotation);
    Optional<HouseholdCleaningRotationMember> findByRotationAndMember(
            HouseholdCleaningRotation rotation,
            HouseholdMember member);
    long countByRotation(HouseholdCleaningRotation rotation);
    void deleteByRotation(HouseholdCleaningRotation rotation);
}
