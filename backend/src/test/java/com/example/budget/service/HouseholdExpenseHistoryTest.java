package com.example.budget.service;

import com.example.budget.exception.AccessDeniedException;
import com.example.budget.model.Household;
import com.example.budget.model.HouseholdExpense;
import com.example.budget.model.HouseholdExpenseShare;
import com.example.budget.model.HouseholdAttachment;
import com.example.budget.model.HouseholdAttachmentStatus;
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
import java.time.LocalDateTime;
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
        verifyNoInteractions(expenseRepository, shareRepository);
    }

    @Test
    void rejectsAnotherHouseholdBeforeReadingExpenses() {
        stubMember();

        assertThatThrownBy(() -> service.expenseHistory(99L, 0, user))
                .isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(expenseRepository, shareRepository);
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
        assertThat(item.currentUserShare()).isNull();
        assertThat(item.attachmentCount()).isZero();
        assertThat(item.attachments()).isEmpty();
        verify(shareRepository).findByExpenseInAndMember(List.of(expense), member);
        verify(attachmentRepository).findByExpenseInOrderByCreatedAtAsc(List.of(expense));
        verifyNoInteractions(settlementRepository);
    }

    @Test
    void returnsTheSavedShareIncludingRemainderPennies() {
        stubMember();
        HouseholdExpense expense = mock(HouseholdExpense.class);
        HouseholdMember payer = mock(HouseholdMember.class);
        HouseholdExpenseShare share = mock(HouseholdExpenseShare.class);
        when(expense.getId()).thenReturn(70L);
        when(expense.getAmount()).thenReturn(new BigDecimal("10.00"));
        when(expense.getPayer()).thenReturn(payer);
        when(share.getExpense()).thenReturn(expense);
        when(share.getAmount()).thenReturn(new BigDecimal("3.34"));
        var pageable = PageRequest.of(0, 50);
        when(expenseRepository.findByHouseholdAndVoidedAtIsNullOrderByExpenseDateDescIdDesc(household, pageable))
                .thenReturn(new SliceImpl<>(List.of(expense), pageable, false));
        when(shareRepository.findByExpenseInAndMember(List.of(expense), member))
                .thenReturn(List.of(share));

        var result = service.expenseHistory(10L, 0, user);

        assertThat(result.expenses().get(0).currentUserShare()).isEqualByComparingTo("3.34");
        assertThat(result.expenses().get(0).amount()).isEqualByComparingTo("10.00");
    }

    @Test
    void countsOnlyAvailableUnexpiredProofImages() {
        stubMember();
        HouseholdExpense expense = mock(HouseholdExpense.class);
        HouseholdMember payer = mock(HouseholdMember.class);
        when(expense.getId()).thenReturn(70L);
        when(expense.getAmount()).thenReturn(new BigDecimal("25.00"));
        when(expense.getPayer()).thenReturn(payer);
        var pageable = PageRequest.of(0, 50);
        when(expenseRepository.findByHouseholdAndVoidedAtIsNullOrderByExpenseDateDescIdDesc(household, pageable))
                .thenReturn(new SliceImpl<>(List.of(expense), pageable, false));
        HouseholdAttachment available = mock(HouseholdAttachment.class);
        when(available.getId()).thenReturn(101L);
        when(available.getOriginalFilename()).thenReturn("receipt.jpg");
        when(available.getStatus()).thenReturn(HouseholdAttachmentStatus.AVAILABLE);
        when(available.getExpiresAt()).thenReturn(LocalDateTime.now().plusDays(1));
        when(available.getExpense()).thenReturn(expense);
        HouseholdAttachment overdue = mock(HouseholdAttachment.class);
        when(overdue.getStatus()).thenReturn(HouseholdAttachmentStatus.AVAILABLE);
        when(overdue.getExpiresAt()).thenReturn(LocalDateTime.now().minusDays(1));
        HouseholdAttachment expired = mock(HouseholdAttachment.class);
        when(expired.getStatus()).thenReturn(HouseholdAttachmentStatus.EXPIRED);
        HouseholdAttachment removed = mock(HouseholdAttachment.class);
        when(removed.getStatus()).thenReturn(HouseholdAttachmentStatus.REMOVED);
        when(attachmentRepository.findByExpenseInOrderByCreatedAtAsc(List.of(expense)))
                .thenReturn(List.of(available, overdue, expired, removed));

        var result = service.expenseHistory(10L, 0, user);

        assertThat(result.expenses().get(0).attachmentCount()).isEqualTo(1);
        assertThat(result.expenses().get(0).attachments()).hasSize(1);
        var proof = result.expenses().get(0).attachments().get(0);
        assertThat(proof.id()).isEqualTo(101L);
        assertThat(proof.originalFilename()).isEqualTo("receipt.jpg");
        assertThat(proof.status()).isEqualTo("AVAILABLE");
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
        verifyNoInteractions(shareRepository, attachmentRepository);
    }

    private void stubMember() {
        when(memberRepository.findFirstByUserAndActiveTrueOrderByJoinedAtAsc(user))
                .thenReturn(Optional.of(member));
        when(member.getHousehold()).thenReturn(household);
        when(household.getId()).thenReturn(10L);
    }
}
