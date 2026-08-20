package com.example.budget.service;

import com.example.budget.model.*;
import com.example.budget.repository.HouseholdMemberRepository;
import com.example.budget.repository.HouseholdNotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HouseholdNotificationServiceTest {
    @Mock
    private HouseholdNotificationRepository notificationRepository;
    @Mock
    private HouseholdMemberRepository memberRepository;
    @Mock
    private Household household;
    @Mock
    private HouseholdMember actor;
    @Mock
    private HouseholdMember recipient;
    @Mock
    private HouseholdExpense expense;
    @Mock
    private HouseholdExpenseShare share;

    private HouseholdNotificationService service;

    @BeforeEach
    void setUp() {
        service = new HouseholdNotificationService(
                notificationRepository,
                memberRepository);
    }

    @Test
    void householdNotificationExcludesTheActorAndSnapshotsTheEvent() {
        when(actor.getId()).thenReturn(10L);
        when(recipient.getId()).thenReturn(11L);
        when(recipient.isActive()).thenReturn(true);
        when(recipient.getHousehold()).thenReturn(household);
        when(memberRepository.findByHouseholdAndActiveTrueOrderByIdAsc(household))
                .thenReturn(List.of(actor, recipient));

        service.notifyHousehold(
                household,
                actor,
                HouseholdNotificationType.EXPENSE_CREATED,
                30L,
                "Electricity",
                new BigDecimal("100.00"));

        ArgumentCaptor<HouseholdNotification> captor =
                ArgumentCaptor.forClass(HouseholdNotification.class);
        verify(notificationRepository).save(captor.capture());
        HouseholdNotification saved = captor.getValue();
        assertThat(saved.getRecipient()).isSameAs(recipient);
        assertThat(saved.getActor()).isSameAs(actor);
        assertThat(saved.getType()).isEqualTo(HouseholdNotificationType.EXPENSE_CREATED);
        assertThat(saved.getReferenceId()).isEqualTo(30L);
        assertThat(saved.getSubject()).isEqualTo("Electricity");
        assertThat(saved.getAmount()).isEqualByComparingTo("100.00");
    }

    @Test
    void directNotificationNeverNotifiesTheActorAboutTheirOwnAction() {
        when(actor.isActive()).thenReturn(true);
        when(actor.getId()).thenReturn(10L);

        service.notifyMember(
                actor,
                actor,
                HouseholdNotificationType.SETTLEMENT_CONFIRMED,
                30L,
                null,
                new BigDecimal("20.00"));

        verifyNoInteractions(notificationRepository);
    }

    @Test
    void expenseNotificationIncludesTheRecipientsShare() {
        when(actor.getId()).thenReturn(10L);
        when(recipient.getId()).thenReturn(11L);
        when(recipient.isActive()).thenReturn(true);
        when(recipient.getHousehold()).thenReturn(household);
        when(expense.getHousehold()).thenReturn(household);
        when(expense.getId()).thenReturn(30L);
        when(expense.getDescription()).thenReturn("Electricity");
        when(expense.getAmount()).thenReturn(new BigDecimal("100.00"));
        when(share.getMember()).thenReturn(recipient);
        when(share.getAmount()).thenReturn(new BigDecimal("20.00"));
        when(memberRepository.findByHouseholdAndActiveTrueOrderByIdAsc(household))
                .thenReturn(List.of(actor, recipient));

        service.notifyExpense(
                expense,
                actor,
                HouseholdNotificationType.EXPENSE_CREATED,
                List.of(share));

        ArgumentCaptor<HouseholdNotification> captor =
                ArgumentCaptor.forClass(HouseholdNotification.class);
        verify(notificationRepository).save(captor.capture());
        assertThat(captor.getValue().getAmount()).isEqualByComparingTo("100.00");
        assertThat(captor.getValue().getRecipientAmount())
                .isEqualByComparingTo("20.00");
    }

    @Test
    void deduplicatedNotificationUsesTheAtomicDatabaseInsert() {
        when(household.getId()).thenReturn(1L);
        when(recipient.getId()).thenReturn(11L);
        when(recipient.isActive()).thenReturn(true);
        when(recipient.getHousehold()).thenReturn(household);

        service.notifyMemberOnce(
                recipient,
                null,
                HouseholdNotificationType.CLEANING_WEEK_ASSIGNED,
                42L,
                "2026-08-17",
                null,
                "cleaning-week-assigned:42");

        verify(notificationRepository).insertIfAbsent(
                1L,
                11L,
                null,
                "CLEANING_WEEK_ASSIGNED",
                42L,
                "2026-08-17",
                null,
                null,
                "cleaning-week-assigned:42");
        verify(notificationRepository, never()).save(any());
    }
}
