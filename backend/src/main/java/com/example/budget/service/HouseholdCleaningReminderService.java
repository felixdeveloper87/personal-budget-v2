package com.example.budget.service;

import com.example.budget.model.HouseholdCleaningAssignment;
import com.example.budget.model.HouseholdCleaningDutyCompletion;
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
import java.util.function.Consumer;

/**
 * Weekly cleaning nudges for the member on duty. Each lands in the Household
 * inbox and, through it, as a push notification. Dedupe keys make reruns harmless.
 *
 * <ul>
 *   <li>Monday 10:00 — it's your cleaning week.</li>
 *   <li>Wednesday 22:00 — put the rubbish out tonight.</li>
 *   <li>Thursday 08:00 — final reminder, only if the rubbish is still not ticked off.</li>
 *   <li>Sunday — the checklist is still unfinished.</li>
 * </ul>
 */
@Service
public class HouseholdCleaningReminderService {
    private static final Logger log = LoggerFactory.getLogger(HouseholdCleaningReminderService.class);
    private static final int CLEANING_DUTY_COUNT = 10;
    static final String RUBBISH_OUT_DUTY = "rubbish_out";

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
            cron = "${app.household.cleaning.assignment-cron:0 0 10 * * MON}",
            zone = "${app.household.cleaning.reminder-zone:Europe/London}")
    @Transactional
    public void sendMondayAssignmentReminders() {
        sendMondayAssignmentReminders(LocalDate.now(zone));
    }

    void sendMondayAssignmentReminders(LocalDate today) {
        if (today.getDayOfWeek() != DayOfWeek.MONDAY) {
            return;
        }
        // Same type and key the Household page uses, so the member is told once.
        forEachCurrentAssignment(today, assignment ->
                remind(assignment, HouseholdNotificationType.CLEANING_WEEK_ASSIGNED, "cleaning-week-assigned:"));
    }

    @Scheduled(
            cron = "${app.household.cleaning.bins-cron:0 0 22 * * WED}",
            zone = "${app.household.cleaning.reminder-zone:Europe/London}")
    @Transactional
    public void sendWednesdayBinsReminders() {
        sendWednesdayBinsReminders(LocalDate.now(zone));
    }

    void sendWednesdayBinsReminders(LocalDate today) {
        if (today.getDayOfWeek() != DayOfWeek.WEDNESDAY) {
            return;
        }
        forEachCurrentAssignment(today, assignment -> {
            if (!rubbishAlreadyOut(assignment)) {
                remind(assignment, HouseholdNotificationType.CLEANING_BINS_REMINDER, "cleaning-bins-reminder:");
            }
        });
    }

    @Scheduled(
            cron = "${app.household.cleaning.bins-final-cron:0 0 8 * * THU}",
            zone = "${app.household.cleaning.reminder-zone:Europe/London}")
    @Transactional
    public void sendThursdayBinsFinalReminders() {
        sendThursdayBinsFinalReminders(LocalDate.now(zone));
    }

    void sendThursdayBinsFinalReminders(LocalDate today) {
        if (today.getDayOfWeek() != DayOfWeek.THURSDAY) {
            return;
        }
        forEachCurrentAssignment(today, assignment -> {
            if (!rubbishAlreadyOut(assignment)) {
                remind(assignment, HouseholdNotificationType.CLEANING_BINS_FINAL_REMINDER, "cleaning-bins-final:");
            }
        });
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
                    || completions(assignment).size() >= CLEANING_DUTY_COUNT) {
                return;
            }
            remind(assignment, HouseholdNotificationType.CLEANING_WEEK_REMINDER, "cleaning-week-reminder:");
        });
    }

    private boolean rubbishAlreadyOut(HouseholdCleaningAssignment assignment) {
        return assignment.getCompletedAt() != null
                || completions(assignment).stream()
                        .anyMatch(completion -> RUBBISH_OUT_DUTY.equals(completion.getDutyKey()));
    }

    private List<HouseholdCleaningDutyCompletion> completions(HouseholdCleaningAssignment assignment) {
        return dutyCompletionRepository.findByAssignmentOrderByDutyKeyAsc(assignment);
    }

    private void remind(
            HouseholdCleaningAssignment assignment,
            HouseholdNotificationType type,
            String dedupePrefix) {
        notificationService.notifyMemberOnce(
                assignment.getAssignedMember(),
                null,
                type,
                assignment.getId(),
                assignment.getWeekStart().toString(),
                null,
                dedupePrefix + assignment.getId());
    }

    private void forEachCurrentAssignment(LocalDate today, Consumer<HouseholdCleaningAssignment> action) {
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
