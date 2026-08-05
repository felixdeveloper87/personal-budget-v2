package com.example.budget.repository;

import com.example.budget.model.Household;
import com.example.budget.model.HouseholdMember;
import com.example.budget.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HouseholdMemberRepository extends JpaRepository<HouseholdMember, Long> {
    Optional<HouseholdMember> findFirstByUserAndActiveTrueOrderByJoinedAtAsc(User user);
    Optional<HouseholdMember> findByHouseholdAndUserAndActiveTrue(Household household, User user);
    Optional<HouseholdMember> findByHouseholdIdAndIdAndActiveTrue(Long householdId, Long id);
    Optional<HouseholdMember> findByHouseholdAndUser(Household household, User user);
    List<HouseholdMember> findByHouseholdAndActiveTrueOrderByIdAsc(Household household);
    boolean existsByUserAndActiveTrue(User user);
}

