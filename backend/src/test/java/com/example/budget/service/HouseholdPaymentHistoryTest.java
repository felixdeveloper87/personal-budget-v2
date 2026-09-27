package com.example.budget.service;

import com.example.budget.exception.AccessDeniedException;
import com.example.budget.model.Household;
import com.example.budget.model.HouseholdMember;
import com.example.budget.model.User;
import com.example.budget.model.HouseholdSettlement;
import com.example.budget.model.HouseholdSettlementStatus;
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
class HouseholdPaymentHistoryTest {
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
    void rejectsMissingActiveMembership() {
        when(memberRepository.findFirstByUserAndActiveTrueOrderByJoinedAtAsc(user))
                .thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.paymentHistory(10L, 0, user))
                .isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(settlementRepository);
    }

    @Test
    void rejectsAnotherHousehold() {
        stubMember();
        assertThatThrownBy(() -> service.paymentHistory(99L, 0, user))
                .isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(settlementRepository);
    }

    @Test
    void rejectsNegativePage() {
        stubMember();
        assertThatThrownBy(() -> service.paymentHistory(10L, -1, user))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(settlementRepository);
    }

    @Test
    void returnsOlderPaymentsWithCorrectDirectionAmountDateAndEveryStatus() {
        stubMember();
        HouseholdSettlement payment = mock(HouseholdSettlement.class);
        HouseholdMember payer = mock(HouseholdMember.class);
        HouseholdMember recipient = mock(HouseholdMember.class);
        when(payment.getId()).thenReturn(75L);
        when(payment.getFromMember()).thenReturn(payer);
        when(payment.getToMember()).thenReturn(recipient);
        when(payer.getId()).thenReturn(20L);
        when(payer.getDisplayName()).thenReturn("Ana");
        when(recipient.getId()).thenReturn(30L);
        when(recipient.getDisplayName()).thenReturn("Bruno");
        when(payment.getAmount()).thenReturn(new BigDecimal("12.34"));
        when(payment.getSettlementDate()).thenReturn(LocalDate.of(2025, 12, 31));
        var pageable = PageRequest.of(2, 50);
        when(settlementRepository.findByHouseholdOrderBySettlementDateDescIdDesc(household, pageable))
                .thenReturn(new SliceImpl<>(List.of(payment), pageable, true));

        for (HouseholdSettlementStatus status : HouseholdSettlementStatus.values()) {
            when(payment.getStatus()).thenReturn(status);
            var result = service.paymentHistory(10L, 2, user);
            assertThat(result.page()).isEqualTo(2);
            assertThat(result.hasMore()).isTrue();
            assertThat(result.payments()).hasSize(1);
            var item = result.payments().get(0);
            assertThat(item.id()).isEqualTo(75L);
            assertThat(item.fromMemberId()).isEqualTo(20L);
            assertThat(item.fromMemberName()).isEqualTo("Ana");
            assertThat(item.toMemberId()).isEqualTo(30L);
            assertThat(item.toMemberName()).isEqualTo("Bruno");
            assertThat(item.amount()).isEqualByComparingTo("12.34");
            assertThat(item.settlementDate()).isEqualTo(LocalDate.of(2025, 12, 31));
            assertThat(item.status()).isEqualTo(status.name());
        }
        verifyNoInteractions(expenseRepository, shareRepository, attachmentRepository);
        verify(settlementRepository, never()).save(any());
    }

    @Test
    void emptyFinalPageHasNoMorePayments() {
        stubMember();
        var pageable = PageRequest.of(3, 50);
        when(settlementRepository.findByHouseholdOrderBySettlementDateDescIdDesc(household, pageable))
                .thenReturn(new SliceImpl<>(List.of(), pageable, false));
        var result = service.paymentHistory(10L, 3, user);
        assertThat(result.payments()).isEmpty();
        assertThat(result.hasMore()).isFalse();
    }

    private void stubMember() {
        when(memberRepository.findFirstByUserAndActiveTrueOrderByJoinedAtAsc(user))
                .thenReturn(Optional.of(member));
        when(member.getHousehold()).thenReturn(household);
        when(household.getId()).thenReturn(10L);
    }
}
