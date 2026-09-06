package com.example.budget.service;

import com.example.budget.model.Household;
import com.example.budget.model.HouseholdCleaningAssignment;
import com.example.budget.model.HouseholdCleaningRotation;
import com.example.budget.model.HouseholdCleaningRotationMember;
import com.example.budget.model.HouseholdMember;
import com.example.budget.model.User;
import com.example.budget.repository.HouseholdCleaningAssignmentRepository;
import com.example.budget.repository.HouseholdCleaningDutyCompletionRepository;
import com.example.budget.repository.HouseholdCleaningEmailDeliveryRepository;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HouseholdCleaningEmailServiceTest {
    @Mock private HouseholdCleaningRotationRepository rotationRepository;
    @Mock private HouseholdCleaningRotationMemberRepository rotationMemberRepository;
    @Mock private HouseholdCleaningAssignmentRepository assignmentRepository;
    @Mock private HouseholdCleaningDutyCompletionRepository dutyCompletionRepository;
    @Mock private HouseholdCleaningEmailDeliveryRepository deliveryRepository;
    @Mock private ResendEmailClient resendEmailClient;
    @Mock private HouseholdCleaningEmailTemplate emailTemplate;
    @Mock private HouseholdCleaningRotation rotation;
    @Mock private HouseholdCleaningAssignment assignment;
    @Mock private HouseholdCleaningRotationMember rotationMember;
    @Mock private HouseholdMember member;
    @Mock private Household household;
    @Mock private User user;

    private HouseholdCleaningEmailService service;
    private final LocalDate monday = LocalDate.of(2026, 9, 7);

    @BeforeEach
    void setUp() {
        service = new HouseholdCleaningEmailService(
                rotationRepository,
                rotationMemberRepository,
                assignmentRepository,
                dutyCompletionRepository,
                deliveryRepository,
                resendEmailClient,
                emailTemplate,
                "Europe/London");
        when(rotationRepository.findByActiveTrue()).thenReturn(List.of(rotation));
        when(rotation.isActive()).thenReturn(true);
        when(rotation.getStartDate()).thenReturn(monday);
        when(rotation.getHousehold()).thenReturn(household);
        when(household.getName()).thenReturn("Flat 1");
        when(household.getId()).thenReturn(1L);
        when(rotationMember.getMember()).thenReturn(member);
        when(member.isActive()).thenReturn(true);
        when(member.getUser()).thenReturn(user);
        when(member.getDisplayName()).thenReturn("Leandro");
        when(member.getId()).thenReturn(2L);
        when(user.getCommunicationEmail()).thenReturn("leandro@example.com");
        when(emailTemplate.assigned(any(), any(), any()))
                .thenReturn(new HouseholdCleaningEmailTemplate.EmailContent("text", "<html>assigned</html>"));
        when(emailTemplate.incomplete(any(), any(), any(), any()))
                .thenReturn(new HouseholdCleaningEmailTemplate.EmailContent("text", "<html>reminder</html>"));
        when(rotationMemberRepository.findByRotationOrderByPositionAsc(rotation))
                .thenReturn(List.of(rotationMember));
        when(assignmentRepository.findByRotationAndWeekStartInOrderByWeekStartAsc(
                rotation, List.of(monday)))
                .thenReturn(List.of(assignment));
        when(assignment.getAssignedMember()).thenReturn(member);
        when(assignment.getRotation()).thenReturn(rotation);
        when(assignment.getWeekStart()).thenReturn(monday);
    }

    @Test
    void mondaySendsOnlyToTheAssignedMembersCommunicationEmail() {
        when(deliveryRepository.existsByAssignmentAndDeliveryType(any(), any())).thenReturn(false);

        service.sendMondayAssignmentEmails(monday);

        verify(resendEmailClient).sendHtmlBatch(
                eq(List.of("leandro@example.com")),
                eq("Cleaning week: you are responsible"),
                eq("text"),
                eq("<html>assigned</html>"));
        verify(deliveryRepository).save(any());
    }

    @Test
    void sundayDoesNotEmailWhenTheChecklistIsAlreadyComplete() {
        LocalDate sunday = monday.plusDays(6);
        when(assignment.getCompletedAt()).thenReturn(LocalDateTime.now());

        service.sendSundayIncompleteReminders(sunday);

        verify(resendEmailClient, never()).sendHtmlBatch(any(), any(), any(), any());
        verify(deliveryRepository, never()).save(any());
    }

    @Test
    void sundayEmailsTheAssignedMemberWhenTasksRemain() {
        LocalDate sunday = monday.plusDays(6);
        when(assignment.getCompletedAt()).thenReturn(null);
        when(deliveryRepository.existsByAssignmentAndDeliveryType(any(), any())).thenReturn(false);
        when(dutyCompletionRepository.findByAssignmentOrderByDutyKeyAsc(assignment)).thenReturn(List.of());

        service.sendSundayIncompleteReminders(sunday);

        verify(resendEmailClient).sendHtmlBatch(
                eq(List.of("leandro@example.com")),
                eq("Cleaning checklist still pending"),
                eq("text"),
                eq("<html>reminder</html>"));
        verify(deliveryRepository).save(any());
    }
}
