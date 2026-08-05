package com.example.budget.service;

import com.example.budget.dto.HouseholdPageDTO;
import com.example.budget.dto.HouseholdRequests;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.*;
import com.example.budget.repository.HouseholdCleaningAssignmentRepository;
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

    private final HouseholdCleaningRotationRepository rotationRepository;
    private final HouseholdCleaningRotationMemberRepository rotationMemberRepository;
    private final HouseholdCleaningAssignmentRepository assignmentRepository;
    private final HouseholdMemberRepository memberRepository;

    public HouseholdCleaningService(
            HouseholdCleaningRotationRepository rotationRepository,
            HouseholdCleaningRotationMemberRepository rotationMemberRepository,
            HouseholdCleaningAssignmentRepository assignmentRepository,
            HouseholdMemberRepository memberRepository) {
        this.rotationRepository = rotationRepository;
        this.rotationMemberRepository = rotationMemberRepository;
        this.assignmentRepository = assignmentRepository;
        this.memberRepository = memberRepository;
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

        removeIncompleteAssignmentsFrom(rotation, currentWeek(LocalDate.now()));
    }

    @Transactional
    public void completeCurrentWeek(
            Long householdId,
            Long assignmentId,
            User user) {
        HouseholdMember current = requireMember(householdId, user);
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
        LocalDate currentWeek = currentWeek(LocalDate.now());
        if (!assignment.getWeekStart().equals(currentWeek)) {
            throw new IllegalArgumentException(
                    "Only the current cleaning week can be completed");
        }
        if (!assignment.getAssignedMember().getId().equals(current.getId())) {
            throw new AccessDeniedException(
                    "Only this week's assigned member can complete the cleaning");
        }
        if (assignment.getCompletedAt() != null) {
            return;
        }

        assignment.setCompletedBy(user);
        assignment.setCompletedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);
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
        HouseholdPageDTO.CleaningAssignment currentWeekDTO =
                firstVisibleWeek.equals(thisWeek)
                        ? toDTO(assignments.get(thisWeek), current, thisWeek, today, true)
                        : null;
        List<HouseholdPageDTO.CleaningAssignment> upcoming = visibleWeeks.stream()
                .filter(week -> week.isAfter(thisWeek))
                .limit(UPCOMING_WEEK_COUNT)
                .map(week -> toDTO(
                        assignments.get(week),
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
        removeIncompleteAssignmentsFrom(rotation, currentWeek(LocalDate.now()));
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
        boolean canComplete = rotationActive
                && assignment.getCompletedAt() == null
                && assignment.getWeekStart().equals(currentWeek)
                && assignment.getAssignedMember().getId().equals(current.getId());
        return new HouseholdPageDTO.CleaningAssignment(
                assignment.getId(),
                assignment.getWeekStart(),
                assignment.getWeekStart().plusDays(6),
                assignment.getAssignedMember().getId(),
                assignment.getAssignedMember().getUser().getName(),
                status,
                canComplete,
                assignment.getCompletedAt());
    }

    private void removeIncompleteAssignmentsFrom(
            HouseholdCleaningRotation rotation,
            LocalDate weekStart) {
        List<HouseholdCleaningAssignment> replaceable =
                assignmentRepository
                        .findByRotationAndWeekStartGreaterThanEqualOrderByWeekStartAsc(
                                rotation,
                                weekStart)
                        .stream()
                        .filter(assignment -> assignment.getCompletedAt() == null)
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
}
