package com.example.budget.household;

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
