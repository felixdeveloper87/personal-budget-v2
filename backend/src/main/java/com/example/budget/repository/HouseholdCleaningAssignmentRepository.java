package com.example.budget.repository;

import com.example.budget.model.HouseholdCleaningAssignment;
import com.example.budget.model.HouseholdCleaningRotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface HouseholdCleaningAssignmentRepository
        extends JpaRepository<HouseholdCleaningAssignment, Long> {
    Optional<HouseholdCleaningAssignment> findByIdAndRotation(
            Long id,
            HouseholdCleaningRotation rotation);

    List<HouseholdCleaningAssignment> findByRotationAndWeekStartInOrderByWeekStartAsc(
            HouseholdCleaningRotation rotation,
            Collection<LocalDate> weekStarts);

    List<HouseholdCleaningAssignment> findByRotationAndWeekStartGreaterThanEqualOrderByWeekStartAsc(
            HouseholdCleaningRotation rotation,
            LocalDate weekStart);

    @Modifying
    @Query(
            value = """
                    INSERT INTO household_cleaning_assignments (
                        rotation_id,
                        week_start,
                        assigned_member_id,
                        created_at
                    )
                    VALUES (
                        :rotationId,
                        :weekStart,
                        :memberId,
                        CURRENT_TIMESTAMP
                    )
                    ON CONFLICT (rotation_id, week_start) DO NOTHING
                    """,
            nativeQuery = true)
    void insertIfAbsent(
            @Param("rotationId") Long rotationId,
            @Param("weekStart") LocalDate weekStart,
            @Param("memberId") Long memberId);
}
