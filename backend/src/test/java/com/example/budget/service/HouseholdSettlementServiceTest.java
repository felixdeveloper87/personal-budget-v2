package com.example.budget.service;

import com.example.budget.dto.HouseholdRequests;
import com.example.budget.model.Household;
import com.example.budget.model.HouseholdExpense;
import com.example.budget.model.HouseholdExpenseShare;
import com.example.budget.model.HouseholdMember;
import com.example.budget.model.HouseholdNotificationType;
import com.example.budget.model.HouseholdSettlement;
import com.example.budget.model.HouseholdSettlementStatus;
import com.example.budget.model.User;
import com.example.budget.repository.HouseholdAttachmentRepository;
import com.example.budget.repository.HouseholdExpenseRepository;
import com.example.budget.repository.HouseholdExpenseShareRepository;
import com.example.budget.repository.HouseholdInvitationRepository;
import com.example.budget.repository.HouseholdMemberRepository;
import com.example.budget.repository.HouseholdRepository;
import com.example.budget.repository.HouseholdSettlementRepository;
import com.example.budget.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HouseholdSettlementServiceTest {
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

    private HouseholdService service;

    @BeforeEach
    void setUp() {
        service = new HouseholdService(
                householdRepository,
                memberRepository,
                invitationRepository,
                expenseRepository,
                shareRepository,
                settlementRepository,
                attachmentRepository,
                cleaningService,
                notificationService,
                userRepository);
    }

    @Test
    void payerConfirmationCompletesThePaymentImmediately() {
        User payerUser = new User("payer@example.com", "secret", "Payer");
        User recipientUser = new User("recipient@example.com", "secret", "Recipient");
        Household household = new Household();
        ReflectionTestUtils.setField(household, "id", 10L);
        HouseholdMember payer = member(1L, household, payerUser);
        HouseholdMember recipient = member(2L, household, recipientUser);

        HouseholdExpense expense = new HouseholdExpense();
        expense.setHousehold(household);
        expense.setPayer(recipient);
        expense.setExpenseDate(LocalDate.now());
        HouseholdExpenseShare share = new HouseholdExpenseShare();
        share.setExpense(expense);
        share.setMember(payer);
        share.setAmount(new BigDecimal("20.00"));

        when(memberRepository.findFirstByUserAndActiveTrueOrderByJoinedAtAsc(payerUser))
                .thenReturn(Optional.of(payer));
        when(memberRepository.findByHouseholdIdAndIdAndActiveTrue(10L, 2L))
                .thenReturn(Optional.of(recipient));
        when(expenseRepository.findByHouseholdAndVoidedAtIsNullOrderByExpenseDateDescIdDesc(household))
                .thenReturn(List.of(expense));
        when(shareRepository.findByExpenseIn(List.of(expense))).thenReturn(List.of(share));
        when(settlementRepository.findByHouseholdOrderBySettlementDateDescIdDesc(household))
                .thenReturn(List.of());

        service.createSettlement(
                10L,
                new HouseholdRequests.Settlement(
                        2L, new BigDecimal("20.00"), LocalDate.now()),
                payerUser);

        ArgumentCaptor<HouseholdSettlement> captor =
                ArgumentCaptor.forClass(HouseholdSettlement.class);
        verify(settlementRepository).save(captor.capture());
        HouseholdSettlement saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo(HouseholdSettlementStatus.CONFIRMED);
        assertThat(saved.getCreatedBy()).isSameAs(payerUser);
        assertThat(saved.getConfirmedBy()).isSameAs(payerUser);
        assertThat(saved.getConfirmedAt()).isNotNull();
        verify(notificationService).notifyMember(
                recipient,
                payer,
                HouseholdNotificationType.SETTLEMENT_CREATED,
                null,
                null,
                new BigDecimal("20.00"));
    }

    private HouseholdMember member(Long id, Household household, User user) {
        HouseholdMember member = new HouseholdMember();
        ReflectionTestUtils.setField(member, "id", id);
        member.setHousehold(household);
        member.setUser(user);
        return member;
    }
}
