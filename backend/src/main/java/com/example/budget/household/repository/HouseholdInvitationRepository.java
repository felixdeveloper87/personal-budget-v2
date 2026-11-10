package com.example.budget.household.repository;

import com.example.budget.household.model.HouseholdInvitation;
import com.example.budget.household.model.HouseholdInvitationStatus;
import com.example.budget.household.model.Household;

import com.example.budget.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HouseholdInvitationRepository extends JpaRepository<HouseholdInvitation, Long> {
    List<HouseholdInvitation> findByTargetUserAndStatusOrderByCreatedAtDesc(
            User targetUser, HouseholdInvitationStatus status);
    List<HouseholdInvitation> findByHouseholdAndStatusOrderByCreatedAtDesc(
            Household household, HouseholdInvitationStatus status);
    Optional<HouseholdInvitation> findByIdAndTargetUser(Long id, User targetUser);
    Optional<HouseholdInvitation> findByIdAndHousehold(Long id, Household household);
    boolean existsByHouseholdAndTargetUserAndStatus(
            Household household, User targetUser, HouseholdInvitationStatus status);
}
