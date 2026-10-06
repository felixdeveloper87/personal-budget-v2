package com.example.budget.service;

import com.example.budget.model.HouseholdCleaningAssignment;
import com.example.budget.model.HouseholdCleaningDutyCompletion;
import com.example.budget.model.HouseholdCleaningRotation;
import com.example.budget.model.HouseholdCleaningRotationMember;
import com.example.budget.model.HouseholdMember;
import com.example.budget.model.HouseholdNotificationType;
import com.example.budget.repository.HouseholdCleaningAssignmentRepository;
import com.example.budget.repository.HouseholdCleaningDutyCompletionRepository;
import com.example.budget.repository.HouseholdCleaningRotationMemberRepository;
import com.example.budget.repository.HouseholdCleaningRotationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HouseholdCleaningReminderServiceTest {
    @Mock private HouseholdCleaningRotationRepository rotationRepository;
    @Mock private HouseholdCleaningRotationMemberRepository rotationMemberRepository;
    @Mock private HouseholdCleaningAssignmentRepository assignmentRepository;
    @Mock private HouseholdCleaningDutyCompletionRepository dutyCompletionRepository;
    @Mock private HouseholdNotificationService notificationService;
    @Mock private HouseholdCleaningRotation rotation;
    @Mock private HouseholdCleaningAssignment assignment;
    @Mock private HouseholdCleaningRotationMember rotationMember;
    @Mock private HouseholdMember member;

    private HouseholdCleaningReminderService service;
    private final LocalDate monday = LocalDate.of(2026, 9, 7);

    @BeforeEach
    void setUp() {
        service = new HouseholdCleaningReminderService(
                rotationRepository,
                rotationMemberRepository,
                assignmentRepository,
                dutyCompletionRepository,
                notificationService,
                "Europe/London");
    }

    private void stubCurrentAssignment() {
        when(rotationRepository.findByActiveTrue()).thenReturn(List.of(rotation));
        when(rotation.isActive()).thenReturn(true);
        when(rotation.getStartDate()).thenReturn(monday);
        when(rotationMember.getMember()).thenReturn(member);
        when(member.isActive()).thenReturn(true);
        when(rotationMemberRepository.findByRotationOrderByPositionAsc(rotation))
                .thenReturn(List.of(rotationMember));
        when(assignmentRepository.findByRotationAndWeekStartInOrderByWeekStartAsc(rotation, List.of(monday)))
                .thenReturn(List.of(assignment));
    }

    @Test
    void mondayNotifiesTheAssignedMemberWithThePagesDedupeKey() {
        stubCurrentAssignment();
        when(assignment.getAssignedMember()).thenReturn(member);
        when(assignment.getId()).thenReturn(42L);
        when(assignment.getWeekStart()).thenReturn(monday);

        service.sendMondayAssignmentReminders(monday);

        verify(notificationService).notifyMemberOnce(
                member,
                null,
                HouseholdNotificationType.CLEANING_WEEK_ASSIGNED,
                42L,
                "2026-09-07",
                null,
                "cleaning-week-assigned:42");
    }

    @Test
    void sundaySkipsAFinishedChecklist() {
        stubCurrentAssignment();
        when(assignment.getCompletedAt()).thenReturn(LocalDateTime.now());

        service.sendSundayIncompleteReminders(monday.plusDays(6));

        verify(notificationService, never()).notifyMemberOnce(any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void sundayRemindsTheAssignedMemberWhenTasksRemain() {
        stubCurrentAssignment();
        HouseholdCleaningDutyCompletion completedDuty = new HouseholdCleaningDutyCompletion();
        completedDuty.setDutyKey("shower_room");
        when(assignment.getCompletedAt()).thenReturn(null);
        when(assignment.getAssignedMember()).thenReturn(member);
        when(assignment.getId()).thenReturn(42L);
        when(assignment.getWeekStart()).thenReturn(monday);
        when(dutyCompletionRepository.findByAssignmentOrderByDutyKeyAsc(assignment))
                .thenReturn(List.of(completedDuty));

        service.sendSundayIncompleteReminders(monday.plusDays(6));

        verify(notificationService).notifyMemberOnce(
                member,
                null,
                HouseholdNotificationType.CLEANING_WEEK_REMINDER,
                42L,
                "2026-09-07",
                null,
                "cleaning-week-reminder:42");
    }

    @Test
    void otherDaysDoNothing() {
        service.sendMondayAssignmentReminders(monday.plusDays(1));
        service.sendWednesdayBinsReminders(monday.plusDays(1));
        service.sendThursdayBinsFinalReminders(monday.plusDays(1));
        service.sendSundayIncompleteReminders(monday.plusDays(1));

        verify(rotationRepository, never()).findByActiveTrue();
        verify(notificationService, never()).notifyMemberOnce(any(), isNull(), any(), any(), any(), any(), any());
    }

    @Test
    void wednesdayRemindsToPutTheRubbishOutWhenItIsNotTickedYet() {
        stubCurrentAssignment();
        HouseholdCleaningDutyCompletion otherDuty = new HouseholdCleaningDutyCompletion();
        otherDuty.setDutyKey("shower_room");
        when(assignment.getCompletedAt()).thenReturn(null);
        when(assignment.getAssignedMember()).thenReturn(member);
        when(assignment.getId()).thenReturn(42L);
        when(assignment.getWeekStart()).thenReturn(monday);
        when(dutyCompletionRepository.findByAssignmentOrderByDutyKeyAsc(assignment))
                .thenReturn(List.of(otherDuty));

        service.sendWednesdayBinsReminders(monday.plusDays(2));

        verify(notificationService).notifyMemberOnce(
                member,
                null,
                HouseholdNotificationType.CLEANING_BINS_REMINDER,
                42L,
                "2026-09-07",
                null,
                "cleaning-bins-reminder:42");
    }

    @Test
    void thursdayFinalReminderIsSkippedOnceTheRubbishIsOut() {
        stubCurrentAssignment();
        HouseholdCleaningDutyCompletion rubbish = new HouseholdCleaningDutyCompletion();
        rubbish.setDutyKey("rubbish_out");
        when(assignment.getCompletedAt()).thenReturn(null);
        when(dutyCompletionRepository.findByAssignmentOrderByDutyKeyAsc(assignment))
                .thenReturn(List.of(rubbish));

        service.sendThursdayBinsFinalReminders(monday.plusDays(3));

        verify(notificationService, never()).notifyMemberOnce(any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void thursdayFinalReminderGoesOutWhenTheRubbishIsStillIn() {
        stubCurrentAssignment();
        when(assignment.getCompletedAt()).thenReturn(null);
        when(assignment.getAssignedMember()).thenReturn(member);
        when(assignment.getId()).thenReturn(42L);
        when(assignment.getWeekStart()).thenReturn(monday);
        when(dutyCompletionRepository.findByAssignmentOrderByDutyKeyAsc(assignment)).thenReturn(List.of());

        service.sendThursdayBinsFinalReminders(monday.plusDays(3));

        verify(notificationService).notifyMemberOnce(
                member,
                null,
                HouseholdNotificationType.CLEANING_BINS_FINAL_REMINDER,
                42L,
                "2026-09-07",
                null,
                "cleaning-bins-final:42");
    }
}
