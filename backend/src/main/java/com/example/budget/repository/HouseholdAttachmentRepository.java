package com.example.budget.repository;

import com.example.budget.model.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface HouseholdAttachmentRepository extends JpaRepository<HouseholdAttachment, Long> {
    Optional<HouseholdAttachment> findByIdAndHousehold(Long id, Household household);

    List<HouseholdAttachment> findByExpenseInOrderByCreatedAtAsc(List<HouseholdExpense> expenses);

    List<HouseholdAttachment> findBySettlementInOrderByCreatedAtAsc(
            List<HouseholdSettlement> settlements);

    long countByExpenseAndStatusAndExpiresAtAfter(
            HouseholdExpense expense,
            HouseholdAttachmentStatus status,
            LocalDateTime now);

    long countBySettlementAndStatusAndExpiresAtAfter(
            HouseholdSettlement settlement,
            HouseholdAttachmentStatus status,
            LocalDateTime now);

    List<HouseholdAttachment> findTop100ByStatusAndExpiresAtLessThanEqualOrderByExpiresAtAsc(
            HouseholdAttachmentStatus status,
            LocalDateTime now);
}
