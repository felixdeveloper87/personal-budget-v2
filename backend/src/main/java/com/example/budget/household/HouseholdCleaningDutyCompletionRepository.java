package com.example.budget.household;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface HouseholdCleaningDutyCompletionRepository
        extends JpaRepository<HouseholdCleaningDutyCompletion, Long> {
    List<HouseholdCleaningDutyCompletion> findByAssignmentOrderByDutyKeyAsc(
            HouseholdCleaningAssignment assignment);

    List<HouseholdCleaningDutyCompletion> findByAssignmentIn(
            Collection<HouseholdCleaningAssignment> assignments);

}
