package com.example.budget.service;

import com.example.budget.dto.HouseholdRequests;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.model.*;
import com.example.budget.repository.HouseholdCleaningAssignmentRepository;
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
    private HouseholdMemberRepository memberRepository;
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
                memberRepository);
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
                .hasMessage("Only this week's assigned member can complete the cleaning");

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
        when(assignment.getWeekStart()).thenReturn(monday());
        when(assignment.getAssignedMember()).thenReturn(current);
        when(assignment.getCompletedAt()).thenReturn(null);

        service.completeCurrentWeek(10L, 30L, user);

        verify(assignment).setCompletedBy(user);
        verify(assignment).setCompletedAt(any(LocalDateTime.class));
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

    private LocalDate monday() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }
}
