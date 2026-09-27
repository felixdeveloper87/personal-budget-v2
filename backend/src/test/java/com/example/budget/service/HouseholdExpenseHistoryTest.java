package com.example.budget.service;

import com.example.budget.exception.AccessDeniedException;
import com.example.budget.model.Household;
import com.example.budget.model.HouseholdExpense;
import com.example.budget.model.HouseholdMember;
import com.example.budget.model.User;
import com.example.budget.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.SliceImpl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HouseholdExpenseHistoryTest {
    @Mock private HouseholdRepository householdRepository;
    @Mock private HouseholdMemberRepository memberRepository;
    @Mock private HouseholdInvitationRepository invitationRepository;
    @Mock private HouseholdExpenseRepository expenseRepository;
    @Mock private HouseholdExpenseShareRepository shareRepository;
    @Mock private HouseholdSettlementRepository settlementRepository;
    @Mock private HouseholdAttachmentRepository attachmentRepository;
    @Mock private HouseholdCleaningService cleaningService;
    @Mock private HouseholdNotificationService notificationService;
    @Mock private UserRepository userRepository;
    @Mock private User user;
    @Mock private Household household;
    @Mock private HouseholdMember member;
    @InjectMocks private HouseholdService service;

    @Test
    void rejectsMissingActiveMembershipBeforeReadingExpenses() {
        when(memberRepository.findFirstByUserAndActiveTrueOrderByJoinedAtAsc(user))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.expenseHistory(10L, 0, user))
                .isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(expenseRepository);
    }

    @Test
    void rejectsAnotherHouseholdBeforeReadingExpenses() {
        stubMember();

        assertThatThrownBy(() -> service.expenseHistory(99L, 0, user))
                .isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(expenseRepository);
    }

    @Test
    void rejectsNegativePage() {
        stubMember();

        assertThatThrownBy(() -> service.expenseHistory(10L, -1, user))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(expenseRepository);
    }

    @Test
    void returnsOlderPagesWithTotalAmountPayerAndDate() {
        stubMember();
        HouseholdExpense expense = mock(HouseholdExpense.class);
        HouseholdMember payer = mock(HouseholdMember.class);
        when(expense.getId()).thenReturn(70L);
        when(expense.getCategory()).thenReturn("Groceries");
        when(expense.getDescription()).thenReturn("Weekly shopping");
        when(expense.getAmount()).thenReturn(new BigDecimal("123.45"));
        when(expense.getExpenseDate()).thenReturn(LocalDate.of(2025, 12, 31));
        when(expense.getPayer()).thenReturn(payer);
        when(payer.getId()).thenReturn(20L);
        when(payer.getDisplayName()).thenReturn("Ana");
        var pageable = PageRequest.of(2, 50);
        when(expenseRepository.findByHouseholdAndVoidedAtIsNullOrderByExpenseDateDescIdDesc(household, pageable))
                .thenReturn(new SliceImpl<>(List.of(expense), pageable, true));

        var result = service.expenseHistory(10L, 2, user);

        assertThat(result.page()).isEqualTo(2);
        assertThat(result.hasMore()).isTrue();
        assertThat(result.expenses()).hasSize(1);
        var item = result.expenses().get(0);
        assertThat(item.id()).isEqualTo(70L);
        assertThat(item.category()).isEqualTo("Groceries");
        assertThat(item.description()).isEqualTo("Weekly shopping");
        assertThat(item.amount()).isEqualByComparingTo("123.45");
        assertThat(item.expenseDate()).isEqualTo(LocalDate.of(2025, 12, 31));
        assertThat(item.payerMemberId()).isEqualTo(20L);
        assertThat(item.payerName()).isEqualTo("Ana");
        verifyNoInteractions(shareRepository, settlementRepository, attachmentRepository);
    }

    @Test
    void emptyFinalPageHasNoMoreExpenses() {
        stubMember();
        var pageable = PageRequest.of(3, 50);
        when(expenseRepository.findByHouseholdAndVoidedAtIsNullOrderByExpenseDateDescIdDesc(household, pageable))
                .thenReturn(new SliceImpl<>(List.of(), pageable, false));

        var result = service.expenseHistory(10L, 3, user);

        assertThat(result.expenses()).isEmpty();
        assertThat(result.hasMore()).isFalse();
    }

    private void stubMember() {
        when(memberRepository.findFirstByUserAndActiveTrueOrderByJoinedAtAsc(user))
                .thenReturn(Optional.of(member));
        when(member.getHousehold()).thenReturn(household);
        when(household.getId()).thenReturn(10L);
    }
}
