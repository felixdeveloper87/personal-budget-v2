package com.example.budget.repository;

import com.example.budget.model.Household;
import com.example.budget.model.HouseholdInvitation;
import com.example.budget.model.HouseholdInvitationStatus;
import com.example.budget.model.User;
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
