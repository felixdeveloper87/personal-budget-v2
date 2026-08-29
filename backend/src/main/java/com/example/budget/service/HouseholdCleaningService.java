package com.example.budget.service;

import com.example.budget.dto.HouseholdPageDTO;
import com.example.budget.dto.HouseholdRequests;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.*;
import com.example.budget.repository.HouseholdCleaningAssignmentRepository;
import com.example.budget.repository.HouseholdCleaningDutyCompletionRepository;
import com.example.budget.repository.HouseholdCleaningRotationMemberRepository;
import com.example.budget.repository.HouseholdCleaningRotationRepository;
import com.example.budget.repository.HouseholdMemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class HouseholdCleaningService {
    private static final int UPCOMING_WEEK_COUNT = 3;
    private static final List<CleaningDutyDefinition> DUTIES = List.of(
            new CleaningDutyDefinition("shower_room", "Clean the shower room", null),
            new CleaningDutyDefinition("toilet_wc", "Clean the toilet / WC", null),
            new CleaningDutyDefinition(
                    "upstairs_hallway",
                    "Vacuum the upstairs hallway",
                    null),
            new CleaningDutyDefinition("stairs", "Vacuum the stairs", null),
            new CleaningDutyDefinition(
                    "downstairs_hallway",
                    "Vacuum the downstairs hallway",
                    null),
            new CleaningDutyDefinition("living_room", "Clean the living room", null),
            new CleaningDutyDefinition("tea_towels", "Wash the tea towels", null),
            new CleaningDutyDefinition("cleaning_cloths", "Wash the cleaning cloths", null),
            new CleaningDutyDefinition("all_bins", "Empty all bins", null),
            new CleaningDutyDefinition(
                    "rubbish_out",
                    "Put the rubbish out",
                    "Every Thursday · by 10:00"));
    private static final Map<String, CleaningDutyDefinition> DUTIES_BY_KEY = DUTIES.stream()
            .collect(Collectors.toUnmodifiableMap(
                    CleaningDutyDefinition::key,
                    Function.identity()));

    private final HouseholdCleaningRotationRepository rotationRepository;
    private final HouseholdCleaningRotationMemberRepository rotationMemberRepository;
    private final HouseholdCleaningAssignmentRepository assignmentRepository;
    private final HouseholdCleaningDutyCompletionRepository dutyCompletionRepository;
    private final HouseholdMemberRepository memberRepository;
    private final HouseholdNotificationService notificationService;

    public HouseholdCleaningService(
            HouseholdCleaningRotationRepository rotationRepository,
            HouseholdCleaningRotationMemberRepository rotationMemberRepository,
            HouseholdCleaningAssignmentRepository assignmentRepository,
            HouseholdCleaningDutyCompletionRepository dutyCompletionRepository,
            HouseholdMemberRepository memberRepository,
            HouseholdNotificationService notificationService) {
        this.rotationRepository = rotationRepository;
        this.rotationMemberRepository = rotationMemberRepository;
        this.assignmentRepository = assignmentRepository;
        this.dutyCompletionRepository = dutyCompletionRepository;
        this.memberRepository = memberRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public void configure(
            Long householdId,
            HouseholdRequests.CleaningRotation request,
            User user) {
        HouseholdMember current = requireMember(householdId, user);
        requireOwner(current);
        if (request == null || request.startDate() == null) {
            throw new IllegalArgumentException("Cleaning rotation start date is required");
        }
        if (request.startDate().getDayOfWeek() != DayOfWeek.MONDAY) {
            throw new IllegalArgumentException("The cleaning rotation must start on a Monday");
        }

        List<Long> requestedIds = request.participantMemberIds();
        if (requestedIds == null || requestedIds.isEmpty()) {
            throw new IllegalArgumentException(
                    "Select at least one member for the cleaning rotation");
        }
        LinkedHashSet<Long> uniqueIds = new LinkedHashSet<>(requestedIds);
        if (uniqueIds.size() != requestedIds.size()) {
            throw new IllegalArgumentException(
                    "A member can appear only once in the cleaning rotation");
        }

        List<HouseholdMember> activeMembers =
                memberRepository.findByHouseholdAndActiveTrueOrderByIdAsc(
                        current.getHousehold());
        Map<Long, HouseholdMember> activeById = activeMembers.stream()
                .collect(Collectors.toMap(HouseholdMember::getId, Function.identity()));
        List<HouseholdMember> participants = uniqueIds.stream()
                .map(activeById::get)
                .toList();
        if (participants.stream().anyMatch(Objects::isNull)) {
            throw new IllegalArgumentException(
                    "Every cleaning participant must be an active member of this household");
        }

        HouseholdCleaningRotation rotation = rotationRepository
                .findByHousehold(current.getHousehold())
                .orElseGet(HouseholdCleaningRotation::new);
        if (rotation.getHousehold() == null) {
            rotation.setHousehold(current.getHousehold());
        }
        rotation.setStartDate(request.startDate());
        rotation.setActive(request.active());
        rotationRepository.save(rotation);

        rotationMemberRepository.deleteByRotation(rotation);
        rotationMemberRepository.flush();
        List<HouseholdCleaningRotationMember> rotationMembers = new ArrayList<>();
        for (int index = 0; index < participants.size(); index++) {
            HouseholdCleaningRotationMember rotationMember =
                    new HouseholdCleaningRotationMember();
            rotationMember.setRotation(rotation);
            rotationMember.setMember(participants.get(index));
            rotationMember.setPosition(index);
            rotationMembers.add(rotationMember);
        }
        rotationMemberRepository.saveAll(rotationMembers);

        removeIncompleteAssignmentsFrom(
                rotation,
                currentWeek(LocalDate.now()),
                true);
    }

    @Transactional
    public void completeCurrentWeek(
            Long householdId,
            Long assignmentId,
            User user) {
        HouseholdMember current = requireMember(householdId, user);
        HouseholdCleaningAssignment assignment = requireCurrentAssignment(
                assignmentId,
                current);
        boolean alreadyCompleted = assignment.getCompletedAt() != null;
        List<HouseholdCleaningDutyCompletion> existing =
                dutyCompletionRepository.findByAssignmentOrderByDutyKeyAsc(assignment);
        Set<String> completedKeys = existing.stream()
                .map(HouseholdCleaningDutyCompletion::getDutyKey)
                .collect(Collectors.toSet());
        LocalDateTime completedAt = LocalDateTime.now();
        List<HouseholdCleaningDutyCompletion> missing = DUTIES.stream()
                .filter(duty -> !completedKeys.contains(duty.key()))
                .map(duty -> completion(assignment, duty.key(), user, completedAt))
                .toList();
        if (!missing.isEmpty()) {
            dutyCompletionRepository.saveAll(missing);
        }
        assignment.setCompletedBy(user);
        assignment.setCompletedAt(completedAt);
        assignmentRepository.save(assignment);
        if (!alreadyCompleted) {
            notificationService.notifyHouseholdOnce(
                    current.getHousehold(),
                    current,
                    HouseholdNotificationType.CLEANING_WEEK_COMPLETED,
                    assignment.getId(),
                    assignment.getWeekStart().toString(),
                    null,
                    "cleaning-week-completed:" + assignment.getId());
        }
    }

    @Transactional
    public void updateDuty(
            Long householdId,
            Long assignmentId,
            String dutyKey,
            boolean completed,
            User user) {
        HouseholdMember current = requireMember(householdId, user);
        CleaningDutyDefinition duty = DUTIES_BY_KEY.get(dutyKey);
        if (duty == null) {
            throw new IllegalArgumentException("Unknown cleaning duty");
        }

        HouseholdCleaningAssignment assignment = requireCurrentAssignment(
                assignmentId,
                current);
        List<HouseholdCleaningDutyCompletion> existing =
                dutyCompletionRepository.findByAssignmentOrderByDutyKeyAsc(assignment);
        Optional<HouseholdCleaningDutyCompletion> currentCompletion = existing.stream()
                .filter(item -> item.getDutyKey().equals(duty.key()))
                .findFirst();
        int completedCount = existing.size();
        boolean newlyCompleted = completed && currentCompletion.isEmpty();

        if (completed && currentCompletion.isEmpty()) {
            dutyCompletionRepository.save(completion(
                    assignment,
                    duty.key(),
                    user,
                    LocalDateTime.now()));
            completedCount++;
        } else if (!completed && currentCompletion.isPresent()) {
            dutyCompletionRepository.delete(currentCompletion.get());
            dutyCompletionRepository.flush();
            completedCount--;
        }

        if (completedCount == DUTIES.size()) {
            if (assignment.getCompletedAt() == null) {
                assignment.setCompletedBy(user);
                assignment.setCompletedAt(LocalDateTime.now());
            }
        } else if (assignment.getCompletedAt() != null) {
            assignment.setCompletedBy(null);
            assignment.setCompletedAt(null);
        }
        assignmentRepository.save(assignment);
        if (newlyCompleted) {
            boolean weekCompleted = completedCount == DUTIES.size();
            notificationService.notifyHouseholdOnce(
                    current.getHousehold(),
                    current,
                    weekCompleted
                            ? HouseholdNotificationType.CLEANING_WEEK_COMPLETED
                            : HouseholdNotificationType.CLEANING_DUTY_COMPLETED,
                    assignment.getId(),
                    weekCompleted ? assignment.getWeekStart().toString() : duty.key(),
                    null,
                    weekCompleted
                            ? "cleaning-week-completed:" + assignment.getId()
                            : "cleaning-duty-completed:"
                                    + assignment.getId()
                                    + ":"
                                    + duty.key());
        }
    }

    @Transactional
    public HouseholdPageDTO.CleaningRotation dashboard(
            Household household,
            HouseholdMember current) {
        boolean canManage = current.getRole() == HouseholdRole.OWNER;
        Optional<HouseholdCleaningRotation> savedRotation =
                rotationRepository.findByHousehold(household);
        if (savedRotation.isEmpty()) {
            return new HouseholdPageDTO.CleaningRotation(
                    false,
                    false,
                    canManage,
                    null,
                    List.of(),
                    null,
                    List.of());
        }

        HouseholdCleaningRotation rotation = savedRotation.get();
        List<HouseholdCleaningRotationMember> participants =
                rotationMemberRepository.findByRotationOrderByPositionAsc(rotation)
                        .stream()
                        .filter(rotationMember -> rotationMember.getMember().isActive())
                        .toList();
        List<Long> participantIds = participants.stream()
                .map(rotationMember -> rotationMember.getMember().getId())
                .toList();
        if (!rotation.isActive() || participants.isEmpty()) {
            return new HouseholdPageDTO.CleaningRotation(
                    true,
                    false,
                    canManage,
                    rotation.getStartDate(),
                    participantIds,
                    null,
                    List.of());
        }

        LocalDate today = LocalDate.now();
        LocalDate thisWeek = currentWeek(today);
        LocalDate firstVisibleWeek = rotation.getStartDate().isAfter(thisWeek)
                ? rotation.getStartDate()
                : thisWeek;
        int visibleWeekCount = UPCOMING_WEEK_COUNT
                + (firstVisibleWeek.equals(thisWeek) ? 1 : 0);
        List<LocalDate> visibleWeeks = new ArrayList<>();
        for (int offset = 0; offset < visibleWeekCount; offset++) {
            visibleWeeks.add(firstVisibleWeek.plusWeeks(offset));
        }

        Map<LocalDate, HouseholdCleaningAssignment> assignments =
                ensureAssignments(rotation, participants, visibleWeeks);
        HouseholdCleaningAssignment currentAssignment =
                firstVisibleWeek.equals(thisWeek) ? assignments.get(thisWeek) : null;
        if (currentAssignment != null && currentAssignment.getCompletedAt() == null) {
            notificationService.notifyMemberOnce(
                    currentAssignment.getAssignedMember(),
                    null,
                    HouseholdNotificationType.CLEANING_WEEK_ASSIGNED,
                    currentAssignment.getId(),
                    currentAssignment.getWeekStart().toString(),
                    null,
                    "cleaning-week-assigned:" + currentAssignment.getId());
        }
        Map<Long, List<HouseholdCleaningDutyCompletion>> completionsByAssignment =
                dutyCompletionRepository.findByAssignmentIn(assignments.values())
                        .stream()
                        .collect(Collectors.groupingBy(
                                completion -> completion.getAssignment().getId()));
        HouseholdPageDTO.CleaningAssignment currentWeekDTO =
                firstVisibleWeek.equals(thisWeek)
                        ? toDTO(
                                currentAssignment,
                                completionsByAssignment,
                                current,
                                thisWeek,
                                today,
                                true)
                        : null;
        List<HouseholdPageDTO.CleaningAssignment> upcoming = visibleWeeks.stream()
                .filter(week -> week.isAfter(thisWeek))
                .limit(UPCOMING_WEEK_COUNT)
                .map(week -> toDTO(
                        assignments.get(week),
                        completionsByAssignment,
                        current,
                        thisWeek,
                        today,
                        true))
                .toList();

        return new HouseholdPageDTO.CleaningRotation(
                true,
                true,
                canManage,
                rotation.getStartDate(),
                participantIds,
                currentWeekDTO,
                upcoming);
    }

    @Transactional
    public void removeParticipant(HouseholdMember member) {
        Optional<HouseholdCleaningRotation> savedRotation =
                rotationRepository.findByHousehold(member.getHousehold());
        if (savedRotation.isEmpty()) {
            return;
        }

        HouseholdCleaningRotation rotation = savedRotation.get();
        Optional<HouseholdCleaningRotationMember> participant =
                rotationMemberRepository.findByRotationAndMember(rotation, member);
        if (participant.isEmpty()) {
            return;
        }

        rotationMemberRepository.delete(participant.get());
        rotationMemberRepository.flush();
        removeIncompleteAssignmentsFrom(
                rotation,
                currentWeek(LocalDate.now()),
                false);
        if (rotationMemberRepository.countByRotation(rotation) == 0) {
            rotation.setActive(false);
            rotationRepository.save(rotation);
        }
    }

    private Map<LocalDate, HouseholdCleaningAssignment> ensureAssignments(
            HouseholdCleaningRotation rotation,
            List<HouseholdCleaningRotationMember> participants,
            List<LocalDate> weeks) {
        List<HouseholdCleaningAssignment> existing =
                assignmentRepository.findByRotationAndWeekStartInOrderByWeekStartAsc(
                        rotation,
                        weeks);
        Set<LocalDate> existingWeeks = existing.stream()
                .map(HouseholdCleaningAssignment::getWeekStart)
                .collect(Collectors.toSet());

        for (LocalDate week : weeks) {
            if (existingWeeks.contains(week)) {
                continue;
            }
            int participantIndex = assigneeIndex(
                    rotation.getStartDate(),
                    week,
                    participants.size());
            HouseholdMember assignee = participants.get(participantIndex).getMember();
            assignmentRepository.insertIfAbsent(
                    rotation.getId(),
                    week,
                    assignee.getId());
        }

        return assignmentRepository
                .findByRotationAndWeekStartInOrderByWeekStartAsc(rotation, weeks)
                .stream()
                .collect(Collectors.toMap(
                        HouseholdCleaningAssignment::getWeekStart,
                        Function.identity()));
    }

    static int assigneeIndex(LocalDate startDate, LocalDate weekStart, int participantCount) {
        if (participantCount <= 0) {
            throw new IllegalArgumentException(
                    "The cleaning rotation needs at least one participant");
        }
        long weeks = ChronoUnit.WEEKS.between(startDate, weekStart);
        if (weeks < 0) {
            throw new IllegalArgumentException(
                    "Cleaning assignments cannot be created before the rotation starts");
        }
        return Math.floorMod(weeks, participantCount);
    }

    private HouseholdPageDTO.CleaningAssignment toDTO(
            HouseholdCleaningAssignment assignment,
            Map<Long, List<HouseholdCleaningDutyCompletion>> completionsByAssignment,
            HouseholdMember current,
            LocalDate currentWeek,
            LocalDate today,
            boolean rotationActive) {
        if (assignment == null) {
            throw new IllegalStateException("A cleaning assignment could not be generated");
        }
        String status;
        if (assignment.getCompletedAt() != null) {
            status = "COMPLETED";
        } else if (assignment.getWeekStart().plusDays(6).isBefore(today)) {
            status = "MISSED";
        } else if (assignment.getWeekStart().equals(currentWeek)) {
            status = "PENDING";
        } else {
            status = "UPCOMING";
        }
        boolean canManageDuties = rotationActive
                && assignment.getWeekStart().equals(currentWeek)
                && assignment.getAssignedMember().getId().equals(current.getId());
        boolean canComplete = canManageDuties && assignment.getCompletedAt() == null;
        List<HouseholdCleaningDutyCompletion> completions =
                completionsByAssignment.getOrDefault(assignment.getId(), List.of());
        Map<String, HouseholdCleaningDutyCompletion> completionByKey = completions.stream()
                .collect(Collectors.toMap(
                        HouseholdCleaningDutyCompletion::getDutyKey,
                        Function.identity()));
        boolean legacyCompleted = assignment.getCompletedAt() != null && completions.isEmpty();
        List<HouseholdPageDTO.CleaningDuty> duties = DUTIES.stream()
                .map(duty -> {
                    HouseholdCleaningDutyCompletion completion =
                            completionByKey.get(duty.key());
                    return new HouseholdPageDTO.CleaningDuty(
                            duty.key(),
                            duty.label(),
                            duty.schedule(),
                            legacyCompleted || completion != null,
                            canManageDuties,
                            completion != null
                                    ? completion.getCompletedAt()
                                    : legacyCompleted ? assignment.getCompletedAt() : null);
                })
                .toList();
        return new HouseholdPageDTO.CleaningAssignment(
                assignment.getId(),
                assignment.getWeekStart(),
                assignment.getWeekStart().plusDays(6),
                assignment.getAssignedMember().getId(),
                assignment.getAssignedMember().getDisplayName(),
                status,
                canComplete,
                assignment.getCompletedAt(),
                duties);
    }

    private HouseholdCleaningAssignment requireCurrentAssignment(
            Long assignmentId,
            HouseholdMember current) {
        HouseholdCleaningRotation rotation = rotationRepository
                .findByHousehold(current.getHousehold())
                .orElseThrow(() -> new EntityNotFoundException(
                        "HouseholdCleaningRotation", assignmentId));
        if (!rotation.isActive()) {
            throw new IllegalArgumentException("The cleaning rotation is paused");
        }
        HouseholdCleaningAssignment assignment = assignmentRepository
                .findByIdAndRotation(assignmentId, rotation)
                .orElseThrow(() -> new EntityNotFoundException(
                        "HouseholdCleaningAssignment", assignmentId));
        if (!assignment.getWeekStart().equals(currentWeek(LocalDate.now()))) {
            throw new IllegalArgumentException(
                    "Only the current cleaning week can be updated");
        }
        if (!assignment.getAssignedMember().getId().equals(current.getId())) {
            throw new AccessDeniedException(
                    "Only this week's assigned member can update the cleaning duties");
        }
        return assignment;
    }

    private HouseholdCleaningDutyCompletion completion(
            HouseholdCleaningAssignment assignment,
            String dutyKey,
            User user,
            LocalDateTime completedAt) {
        HouseholdCleaningDutyCompletion completion =
                new HouseholdCleaningDutyCompletion();
        completion.setAssignment(assignment);
        completion.setDutyKey(dutyKey);
        completion.setCompletedBy(user);
        completion.setCompletedAt(completedAt);
        return completion;
    }

    private void removeIncompleteAssignmentsFrom(
            HouseholdCleaningRotation rotation,
            LocalDate weekStart,
            boolean preserveProgress) {
        List<HouseholdCleaningAssignment> candidates =
                assignmentRepository
                        .findByRotationAndWeekStartGreaterThanEqualOrderByWeekStartAsc(
                                rotation,
                                weekStart)
                        .stream()
                        .filter(assignment -> assignment.getCompletedAt() == null)
                        .toList();
        Set<Long> assignmentsWithProgress = preserveProgress && !candidates.isEmpty()
                ? dutyCompletionRepository.findByAssignmentIn(candidates)
                        .stream()
                        .map(completion -> completion.getAssignment().getId())
                        .collect(Collectors.toSet())
                : Set.of();
        List<HouseholdCleaningAssignment> replaceable = candidates.stream()
                .filter(assignment -> !assignmentsWithProgress.contains(assignment.getId()))
                .toList();
        if (!replaceable.isEmpty()) {
            assignmentRepository.deleteAll(replaceable);
            assignmentRepository.flush();
        }
    }

    private HouseholdMember requireMember(Long householdId, User user) {
        HouseholdMember member = memberRepository
                .findFirstByUserAndActiveTrueOrderByJoinedAtAsc(user)
                .orElseThrow(() -> new AccessDeniedException(
                        "Active household membership required"));
        if (!member.getHousehold().getId().equals(householdId)) {
            throw new AccessDeniedException("Active household membership required");
        }
        return member;
    }

    private void requireOwner(HouseholdMember member) {
        if (member.getRole() != HouseholdRole.OWNER) {
            throw new AccessDeniedException("Household owner access required");
        }
    }

    private LocalDate currentWeek(LocalDate date) {
        return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    private record CleaningDutyDefinition(String key, String label, String schedule) {}
}
