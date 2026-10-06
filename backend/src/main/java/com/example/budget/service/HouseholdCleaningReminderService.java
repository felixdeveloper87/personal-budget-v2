package com.example.budget.service;

import com.example.budget.model.HouseholdCleaningAssignment;
import com.example.budget.model.HouseholdCleaningRotation;
import com.example.budget.model.HouseholdCleaningRotationMember;
import com.example.budget.model.HouseholdNotificationType;
import com.example.budget.repository.HouseholdCleaningAssignmentRepository;
import com.example.budget.repository.HouseholdCleaningDutyCompletionRepository;
import com.example.budget.repository.HouseholdCleaningRotationMemberRepository;
import com.example.budget.repository.HouseholdCleaningRotationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;

/**
 * Weekly cleaning nudges for the member on duty: Monday's "it's your week" and
 * Sunday's "checklist unfinished". Both go to the Household inbox and, through
 * it, as push notifications. Dedupe keys make reruns harmless.
 */
@Service
public class HouseholdCleaningReminderService {
    private static final Logger log = LoggerFactory.getLogger(HouseholdCleaningReminderService.class);
    private static final int CLEANING_DUTY_COUNT = 10;

    private final HouseholdCleaningRotationRepository rotationRepository;
    private final HouseholdCleaningRotationMemberRepository rotationMemberRepository;
    private final HouseholdCleaningAssignmentRepository assignmentRepository;
    private final HouseholdCleaningDutyCompletionRepository dutyCompletionRepository;
    private final HouseholdNotificationService notificationService;
    private final ZoneId zone;

    public HouseholdCleaningReminderService(
            HouseholdCleaningRotationRepository rotationRepository,
            HouseholdCleaningRotationMemberRepository rotationMemberRepository,
            HouseholdCleaningAssignmentRepository assignmentRepository,
            HouseholdCleaningDutyCompletionRepository dutyCompletionRepository,
            HouseholdNotificationService notificationService,
            @Value("${app.household.cleaning.reminder-zone:Europe/London}") String zone) {
        this.rotationRepository = rotationRepository;
        this.rotationMemberRepository = rotationMemberRepository;
        this.assignmentRepository = assignmentRepository;
        this.dutyCompletionRepository = dutyCompletionRepository;
        this.notificationService = notificationService;
        this.zone = ZoneId.of(zone);
    }

    @Scheduled(
            cron = "${app.household.cleaning.assignment-cron:0 0 9 * * MON}",
            zone = "${app.household.cleaning.reminder-zone:Europe/London}")
    @Transactional
    public void sendMondayAssignmentReminders() {
        sendMondayAssignmentReminders(LocalDate.now(zone));
    }

    void sendMondayAssignmentReminders(LocalDate today) {
        if (today.getDayOfWeek() != DayOfWeek.MONDAY) {
            return;
        }
        forEachCurrentAssignment(today, assignment -> notificationService.notifyMemberOnce(
                assignment.getAssignedMember(),
                null,
                HouseholdNotificationType.CLEANING_WEEK_ASSIGNED,
                assignment.getId(),
                assignment.getWeekStart().toString(),
                null,
                // Same key the Household page uses, so the member is told once.
                "cleaning-week-assigned:" + assignment.getId()));
    }

    @Scheduled(
            cron = "${app.household.cleaning.incomplete-cron:0 0 18 * * SUN}",
            zone = "${app.household.cleaning.reminder-zone:Europe/London}")
    @Transactional
    public void sendSundayIncompleteReminders() {
        sendSundayIncompleteReminders(LocalDate.now(zone));
    }

    void sendSundayIncompleteReminders(LocalDate today) {
        if (today.getDayOfWeek() != DayOfWeek.SUNDAY) {
            return;
        }
        forEachCurrentAssignment(today, assignment -> {
            if (assignment.getCompletedAt() != null
                    || dutyCompletionRepository.findByAssignmentOrderByDutyKeyAsc(assignment).size()
                            >= CLEANING_DUTY_COUNT) {
                return;
            }
            notificationService.notifyMemberOnce(
                    assignment.getAssignedMember(),
                    null,
                    HouseholdNotificationType.CLEANING_WEEK_REMINDER,
                    assignment.getId(),
                    assignment.getWeekStart().toString(),
                    null,
                    "cleaning-week-reminder:" + assignment.getId());
        });
    }

    private void forEachCurrentAssignment(
            LocalDate today,
            java.util.function.Consumer<HouseholdCleaningAssignment> action) {
        rotationRepository.findByActiveTrue().forEach(rotation -> {
            try {
                currentAssignment(rotation, today).ifPresent(action);
            } catch (RuntimeException exception) {
                log.error("Could not send cleaning reminder for household {}", rotation.getHousehold().getId(), exception);
            }
        });
    }

    private Optional<HouseholdCleaningAssignment> currentAssignment(
            HouseholdCleaningRotation rotation,
            LocalDate date) {
        LocalDate weekStart = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        if (!rotation.isActive() || rotation.getStartDate().isAfter(weekStart)) {
            return Optional.empty();
        }

        List<HouseholdCleaningRotationMember> participants = rotationMemberRepository
                .findByRotationOrderByPositionAsc(rotation)
                .stream()
                .filter(item -> item.getMember().isActive())
                .toList();
        if (participants.isEmpty()) {
            return Optional.empty();
        }

        List<HouseholdCleaningAssignment> existing = assignmentRepository
                .findByRotationAndWeekStartInOrderByWeekStartAsc(rotation, List.of(weekStart));
        if (!existing.isEmpty()) {
            return Optional.of(existing.get(0));
        }

        int index = HouseholdCleaningService.assigneeIndex(
                rotation.getStartDate(), weekStart, participants.size());
        assignmentRepository.insertIfAbsent(
                rotation.getId(), weekStart, participants.get(index).getMember().getId());
        return assignmentRepository
                .findByRotationAndWeekStartInOrderByWeekStartAsc(rotation, List.of(weekStart))
                .stream()
                .findFirst();
    }
}
