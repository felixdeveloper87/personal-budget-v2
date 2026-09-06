package com.example.budget.service;

import com.example.budget.model.HouseholdCleaningAssignment;
import com.example.budget.model.HouseholdCleaningEmailDelivery;
import com.example.budget.model.HouseholdCleaningEmailDeliveryType;
import com.example.budget.model.HouseholdCleaningRotation;
import com.example.budget.model.HouseholdCleaningRotationMember;
import com.example.budget.model.HouseholdMember;
import com.example.budget.repository.HouseholdCleaningAssignmentRepository;
import com.example.budget.repository.HouseholdCleaningDutyCompletionRepository;
import com.example.budget.repository.HouseholdCleaningEmailDeliveryRepository;
import com.example.budget.repository.HouseholdCleaningRotationMemberRepository;
import com.example.budget.repository.HouseholdCleaningRotationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;

/** Sends the weekly cleaning reminder only to the member assigned to that week. */
@Service
public class HouseholdCleaningEmailService {
    private static final Logger log = LoggerFactory.getLogger(HouseholdCleaningEmailService.class);
    private static final int CLEANING_DUTY_COUNT = 10;

    private final HouseholdCleaningRotationRepository rotationRepository;
    private final HouseholdCleaningRotationMemberRepository rotationMemberRepository;
    private final HouseholdCleaningAssignmentRepository assignmentRepository;
    private final HouseholdCleaningDutyCompletionRepository dutyCompletionRepository;
    private final HouseholdCleaningEmailDeliveryRepository deliveryRepository;
    private final ResendEmailClient resendEmailClient;
    private final HouseholdCleaningEmailTemplate emailTemplate;
    private final ZoneId emailZone;

    public HouseholdCleaningEmailService(
            HouseholdCleaningRotationRepository rotationRepository,
            HouseholdCleaningRotationMemberRepository rotationMemberRepository,
            HouseholdCleaningAssignmentRepository assignmentRepository,
            HouseholdCleaningDutyCompletionRepository dutyCompletionRepository,
            HouseholdCleaningEmailDeliveryRepository deliveryRepository,
            ResendEmailClient resendEmailClient,
            HouseholdCleaningEmailTemplate emailTemplate,
            @org.springframework.beans.factory.annotation.Value("${app.household.cleaning.email-zone:Europe/London}") String emailZone) {
        this.rotationRepository = rotationRepository;
        this.rotationMemberRepository = rotationMemberRepository;
        this.assignmentRepository = assignmentRepository;
        this.dutyCompletionRepository = dutyCompletionRepository;
        this.deliveryRepository = deliveryRepository;
        this.resendEmailClient = resendEmailClient;
        this.emailTemplate = emailTemplate;
        this.emailZone = ZoneId.of(emailZone);
    }

    @Scheduled(
            cron = "${app.household.cleaning.assignment-email-cron:0 0 9 * * MON}",
            zone = "${app.household.cleaning.email-zone:Europe/London}")
    @Transactional
    public void sendMondayAssignmentEmails() {
        sendMondayAssignmentEmails(LocalDate.now(emailZone));
    }

    void sendMondayAssignmentEmails(LocalDate today) {
        if (today.getDayOfWeek() != DayOfWeek.MONDAY) {
            return;
        }
        rotationRepository.findByActiveTrue().forEach(rotation -> {
            try {
                currentAssignment(rotation, today).ifPresent(assignment -> sendAssignmentEmail(assignment));
            } catch (RuntimeException exception) {
                log.error("Could not send cleaning assignment email for household {}", rotation.getHousehold().getId(), exception);
            }
        });
    }

    @Scheduled(
            cron = "${app.household.cleaning.incomplete-email-cron:0 0 18 * * SUN}",
            zone = "${app.household.cleaning.email-zone:Europe/London}")
    @Transactional
    public void sendSundayIncompleteReminders() {
        sendSundayIncompleteReminders(LocalDate.now(emailZone));
    }

    void sendSundayIncompleteReminders(LocalDate today) {
        if (today.getDayOfWeek() != DayOfWeek.SUNDAY) {
            return;
        }
        rotationRepository.findByActiveTrue().forEach(rotation -> {
            try {
                currentAssignment(rotation, today).ifPresent(this::sendIncompleteReminder);
            } catch (RuntimeException exception) {
                log.error("Could not send cleaning completion reminder for household {}", rotation.getHousehold().getId(), exception);
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

    private void sendAssignmentEmail(HouseholdCleaningAssignment assignment) {
        if (alreadyDelivered(assignment, HouseholdCleaningEmailDeliveryType.WEEK_ASSIGNED)) {
            return;
        }
        HouseholdMember member = assignment.getAssignedMember();
        String recipient = communicationEmail(member);
        if (recipient == null) {
            log.info("Skipping cleaning assignment email for member {}: no communication email", member.getId());
            return;
        }
        HouseholdCleaningEmailTemplate.EmailContent content = emailTemplate.assigned(
                member.getDisplayName(),
                assignment.getRotation().getHousehold().getName(),
                assignment.getWeekStart());
        resendEmailClient.sendHtmlBatch(
                List.of(recipient),
                "Cleaning week: you are responsible",
                content.text(),
                content.html());
        markDelivered(assignment, HouseholdCleaningEmailDeliveryType.WEEK_ASSIGNED);
    }

    private void sendIncompleteReminder(HouseholdCleaningAssignment assignment) {
        if (alreadyDelivered(assignment, HouseholdCleaningEmailDeliveryType.INCOMPLETE_REMINDER)
                || assignment.getCompletedAt() != null) {
            return;
        }
        long completed = dutyCompletionRepository.findByAssignmentOrderByDutyKeyAsc(assignment).size();
        if (completed >= CLEANING_DUTY_COUNT) {
            return;
        }
        HouseholdMember member = assignment.getAssignedMember();
        String recipient = communicationEmail(member);
        if (recipient == null) {
            log.info("Skipping cleaning completion reminder for member {}: no communication email", member.getId());
            return;
        }
        HouseholdCleaningEmailTemplate.EmailContent content = emailTemplate.incomplete(
                member.getDisplayName(),
                assignment.getRotation().getHousehold().getName(),
                completed,
                CLEANING_DUTY_COUNT);
        resendEmailClient.sendHtmlBatch(
                List.of(recipient),
                "Cleaning checklist still pending",
                content.text(),
                content.html());
        markDelivered(assignment, HouseholdCleaningEmailDeliveryType.INCOMPLETE_REMINDER);
    }

    private String communicationEmail(HouseholdMember member) {
        String email = member.getUser().getCommunicationEmail();
        return email == null || email.isBlank() ? null : email;
    }

    private boolean alreadyDelivered(
            HouseholdCleaningAssignment assignment,
            HouseholdCleaningEmailDeliveryType type) {
        return deliveryRepository.existsByAssignmentAndDeliveryType(assignment, type);
    }

    private void markDelivered(
            HouseholdCleaningAssignment assignment,
            HouseholdCleaningEmailDeliveryType type) {
        HouseholdCleaningEmailDelivery delivery = new HouseholdCleaningEmailDelivery();
        delivery.setAssignment(assignment);
        delivery.setDeliveryType(type);
        deliveryRepository.save(delivery);
    }
}
