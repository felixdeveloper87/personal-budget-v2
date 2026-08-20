package com.example.budget.service;

import com.example.budget.dto.HouseholdRequests;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.model.*;
import com.example.budget.repository.HouseholdCleaningAssignmentRepository;
import com.example.budget.repository.HouseholdCleaningDutyCompletionRepository;
import com.example.budget.repository.HouseholdCleaningRotationMemberRepository;
import com.example.budget.repository.HouseholdCleaningRotationRepository;
import com.example.budget.repository.HouseholdMemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HouseholdCleaningServiceTest {
    @Mock
    private HouseholdCleaningRotationRepository rotationRepository;
    @Mock
    private HouseholdCleaningRotationMemberRepository rotationMemberRepository;
    @Mock
    private HouseholdCleaningAssignmentRepository assignmentRepository;
    @Mock
    private HouseholdCleaningDutyCompletionRepository dutyCompletionRepository;
    @Mock
    private HouseholdMemberRepository memberRepository;
    @Mock
    private HouseholdNotificationService notificationService;
    @Mock
    private User user;
    @Mock
    private Household household;
    @Mock
    private HouseholdMember current;
    @Mock
    private HouseholdMember otherMember;
    @Mock
    private HouseholdCleaningRotation rotation;
    @Mock
    private HouseholdCleaningAssignment assignment;

    private HouseholdCleaningService service;

    @BeforeEach
    void setUp() {
        service = new HouseholdCleaningService(
                rotationRepository,
                rotationMemberRepository,
                assignmentRepository,
                dutyCompletionRepository,
                memberRepository,
                notificationService);
    }

    @Test
    void ordinaryMemberCannotConfigureTheRotation() {
        stubCurrentMember(HouseholdRole.MEMBER, 20L);

        assertThatThrownBy(() -> service.configure(
                10L,
                new HouseholdRequests.CleaningRotation(
                        monday(),
                        true,
                        List.of(20L)),
                user))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Household owner access required");

        verifyNoInteractions(rotationRepository);
    }

    @Test
    void ownerConfigurationPreservesTheRequestedMemberOrder() {
        stubCurrentMember(HouseholdRole.OWNER, 20L);
        when(otherMember.getId()).thenReturn(21L);
        when(memberRepository.findByHouseholdAndActiveTrueOrderByIdAsc(household))
                .thenReturn(List.of(current, otherMember));
        when(rotationRepository.findByHousehold(household)).thenReturn(Optional.empty());
        when(rotationRepository.save(any(HouseholdCleaningRotation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(assignmentRepository
                .findByRotationAndWeekStartGreaterThanEqualOrderByWeekStartAsc(
                        any(),
                        any()))
                .thenReturn(List.of());

        service.configure(
                10L,
                new HouseholdRequests.CleaningRotation(
                        monday(),
                        true,
                        List.of(21L, 20L)),
                user);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Iterable<HouseholdCleaningRotationMember>> captor =
                ArgumentCaptor.forClass(Iterable.class);
        verify(rotationMemberRepository).saveAll(captor.capture());
        List<HouseholdCleaningRotationMember> saved = new ArrayList<>();
        captor.getValue().forEach(saved::add);
        assertThat(saved).hasSize(2);
        assertThat(saved.get(0).getMember()).isSameAs(otherMember);
        assertThat(saved.get(0).getPosition()).isZero();
        assertThat(saved.get(1).getMember()).isSameAs(current);
        assertThat(saved.get(1).getPosition()).isEqualTo(1);
    }

    @Test
    void ownerCannotCompleteAWeekAssignedToSomeoneElse() {
        stubCurrentMember(HouseholdRole.OWNER, 20L);
        when(rotationRepository.findByHousehold(household)).thenReturn(Optional.of(rotation));
        when(rotation.isActive()).thenReturn(true);
        when(assignmentRepository.findByIdAndRotation(30L, rotation))
                .thenReturn(Optional.of(assignment));
        when(assignment.getWeekStart()).thenReturn(monday());
        when(assignment.getAssignedMember()).thenReturn(otherMember);
        when(otherMember.getId()).thenReturn(21L);

        assertThatThrownBy(() -> service.completeCurrentWeek(10L, 30L, user))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Only this week's assigned member can update the cleaning duties");

        verify(assignment, never()).setCompletedAt(any());
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    void assignedMemberCanCompleteTheCurrentWeek() {
        stubCurrentMember(HouseholdRole.MEMBER, 20L);
        when(rotationRepository.findByHousehold(household)).thenReturn(Optional.of(rotation));
        when(rotation.isActive()).thenReturn(true);
        when(assignmentRepository.findByIdAndRotation(30L, rotation))
                .thenReturn(Optional.of(assignment));
        when(assignment.getId()).thenReturn(30L);
        when(assignment.getWeekStart()).thenReturn(monday());
        when(assignment.getAssignedMember()).thenReturn(current);

        service.completeCurrentWeek(10L, 30L, user);

        verify(assignment).setCompletedBy(user);
        verify(assignment).setCompletedAt(any(LocalDateTime.class));
        verify(dutyCompletionRepository).saveAll(argThat(completions -> {
            List<String> dutyKeys = new ArrayList<>();
            for (HouseholdCleaningDutyCompletion completion : completions) {
                dutyKeys.add(completion.getDutyKey());
            }
            return dutyKeys.equals(List.of(
                    "shower_room",
                    "toilet_wc",
                    "upstairs_hallway",
                    "stairs",
                    "downstairs_hallway",
                    "living_room",
                    "tea_towels",
                    "cleaning_cloths",
                    "all_bins",
                    "rubbish_out"));
        }));
        verify(assignmentRepository).save(assignment);
        verify(notificationService).notifyHouseholdOnce(
                eq(household),
                eq(current),
                eq(HouseholdNotificationType.CLEANING_WEEK_COMPLETED),
                eq(30L),
                eq(monday().toString()),
                isNull(),
                eq("cleaning-week-completed:30"));
    }

    @Test
    void assignedMemberCanCompleteOneDutyAndLeaveTheWeekInProgress() {
        stubCurrentAssignment();
        when(assignment.getId()).thenReturn(30L);
        when(dutyCompletionRepository.findByAssignmentOrderByDutyKeyAsc(assignment))
                .thenReturn(List.of());

        service.updateDuty(10L, 30L, "shower_room", true, user);

        ArgumentCaptor<HouseholdCleaningDutyCompletion> captor =
                ArgumentCaptor.forClass(HouseholdCleaningDutyCompletion.class);
        verify(dutyCompletionRepository).save(captor.capture());
        assertThat(captor.getValue().getDutyKey()).isEqualTo("shower_room");
        assertThat(captor.getValue().getCompletedBy()).isSameAs(user);
        verify(assignment, never()).setCompletedAt(any());
        verify(assignmentRepository).save(assignment);
        verify(notificationService).notifyHouseholdOnce(
                eq(household),
                eq(current),
                eq(HouseholdNotificationType.CLEANING_DUTY_COMPLETED),
                eq(30L),
                eq("shower_room"),
                isNull(),
                eq("cleaning-duty-completed:30:shower_room"));
    }

    @Test
    void completingTheLastDutyCompletesTheWeekAutomatically() {
        stubCurrentAssignment();
        when(assignment.getId()).thenReturn(30L);
        List<HouseholdCleaningDutyCompletion> existing = List.of(
                completion("shower_room"),
                completion("toilet_wc"),
                completion("upstairs_hallway"),
                completion("stairs"),
                completion("downstairs_hallway"),
                completion("living_room"),
                completion("tea_towels"),
                completion("cleaning_cloths"),
                completion("all_bins"));
        when(dutyCompletionRepository.findByAssignmentOrderByDutyKeyAsc(assignment))
                .thenReturn(existing);
        when(assignment.getCompletedAt()).thenReturn(null);

        service.updateDuty(10L, 30L, "rubbish_out", true, user);

        verify(assignment).setCompletedBy(user);
        verify(assignment).setCompletedAt(any(LocalDateTime.class));
        verify(assignmentRepository).save(assignment);
    }

    @Test
    void uncheckingADutyReopensACompletedWeek() {
        stubCurrentAssignment();
        HouseholdCleaningDutyCompletion shower = completion("shower_room");
        when(dutyCompletionRepository.findByAssignmentOrderByDutyKeyAsc(assignment))
                .thenReturn(List.of(
                        shower,
                        completion("toilet_wc"),
                        completion("upstairs_hallway"),
                        completion("stairs"),
                        completion("downstairs_hallway"),
                        completion("living_room"),
                        completion("tea_towels"),
                        completion("cleaning_cloths"),
                        completion("all_bins"),
                        completion("rubbish_out")));
        when(assignment.getCompletedAt()).thenReturn(LocalDateTime.now());

        service.updateDuty(10L, 30L, "shower_room", false, user);

        verify(dutyCompletionRepository).delete(shower);
        verify(assignment).setCompletedBy(null);
        verify(assignment).setCompletedAt(null);
        verify(assignmentRepository).save(assignment);
    }

    @Test
    void assigneeCyclesInTheConfiguredOrderEveryWeek() {
        LocalDate start = LocalDate.of(2026, 8, 3);

        assertThat(HouseholdCleaningService.assigneeIndex(start, start, 3)).isZero();
        assertThat(HouseholdCleaningService.assigneeIndex(
                start,
                start.plusWeeks(1),
                3)).isEqualTo(1);
        assertThat(HouseholdCleaningService.assigneeIndex(
                start,
                start.plusWeeks(2),
                3)).isEqualTo(2);
        assertThat(HouseholdCleaningService.assigneeIndex(
                start,
                start.plusWeeks(3),
                3)).isZero();
    }

    private void stubCurrentMember(HouseholdRole role, Long memberId) {
        when(memberRepository.findFirstByUserAndActiveTrueOrderByJoinedAtAsc(user))
                .thenReturn(Optional.of(current));
        when(current.getHousehold()).thenReturn(household);
        when(household.getId()).thenReturn(10L);
        lenient().when(current.getRole()).thenReturn(role);
        lenient().when(current.getId()).thenReturn(memberId);
    }

    private void stubCurrentAssignment() {
        stubCurrentMember(HouseholdRole.MEMBER, 20L);
        when(rotationRepository.findByHousehold(household)).thenReturn(Optional.of(rotation));
        when(rotation.isActive()).thenReturn(true);
        when(assignmentRepository.findByIdAndRotation(30L, rotation))
                .thenReturn(Optional.of(assignment));
        when(assignment.getWeekStart()).thenReturn(monday());
        when(assignment.getAssignedMember()).thenReturn(current);
    }

    private HouseholdCleaningDutyCompletion completion(String dutyKey) {
        HouseholdCleaningDutyCompletion completion =
                new HouseholdCleaningDutyCompletion();
        completion.setAssignment(assignment);
        completion.setDutyKey(dutyKey);
        completion.setCompletedBy(user);
        completion.setCompletedAt(LocalDateTime.now());
        return completion;
    }

    private LocalDate monday() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }
}
