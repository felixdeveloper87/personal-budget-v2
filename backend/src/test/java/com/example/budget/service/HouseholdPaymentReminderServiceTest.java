package com.example.budget.service;

import com.example.budget.model.Household;
import com.example.budget.model.HouseholdExpense;
import com.example.budget.model.HouseholdExpenseShare;
import com.example.budget.model.HouseholdMember;
import com.example.budget.model.HouseholdNotificationType;
import com.example.budget.model.HouseholdSettlement;
import com.example.budget.model.HouseholdSettlementStatus;
import com.example.budget.model.User;
import com.example.budget.repository.HouseholdExpenseRepository;
import com.example.budget.repository.HouseholdExpenseShareRepository;
import com.example.budget.repository.HouseholdMemberRepository;
import com.example.budget.repository.HouseholdRepository;
import com.example.budget.repository.HouseholdSettlementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HouseholdPaymentReminderServiceTest {
    @Mock private HouseholdRepository householdRepository;
    @Mock private HouseholdMemberRepository memberRepository;
    @Mock private HouseholdExpenseRepository expenseRepository;
    @Mock private HouseholdExpenseShareRepository shareRepository;
    @Mock private HouseholdSettlementRepository settlementRepository;
    @Mock private HouseholdNotificationService notificationService;

    private HouseholdPaymentReminderService service;

    @BeforeEach
    void setUp() {
        service = new HouseholdPaymentReminderService(
                householdRepository,
                memberRepository,
                expenseRepository,
                shareRepository,
                settlementRepository,
                notificationService,
                "Europe/London");
    }

    @Test
    void remindsTheDebtorOfTheBalanceAfterCompletedPayments() {
        Household household = household();
        HouseholdMember payer = member(1L, household, "Leandro");
        HouseholdMember debtor = member(2L, household, "Maria");
        HouseholdExpense expense = new HouseholdExpense();
        expense.setHousehold(household);
        expense.setPayer(payer);
        expense.setExpenseDate(LocalDate.of(2026, 9, 1));
        HouseholdExpenseShare share = new HouseholdExpenseShare();
        share.setExpense(expense);
        share.setMember(debtor);
        share.setAmount(new BigDecimal("20.00"));
        HouseholdSettlement completed = new HouseholdSettlement();
        completed.setFromMember(debtor);
        completed.setToMember(payer);
        completed.setAmount(new BigDecimal("5.00"));
        completed.setStatus(HouseholdSettlementStatus.CONFIRMED);
        when(householdRepository.findAll()).thenReturn(List.of(household));
        when(memberRepository.findByHouseholdAndActiveTrueOrderByIdAsc(household))
                .thenReturn(List.of(payer, debtor));
        when(expenseRepository.findByHouseholdAndVoidedAtIsNullOrderByExpenseDateDescIdDesc(household))
                .thenReturn(List.of(expense));
        when(shareRepository.findByExpenseIn(List.of(expense))).thenReturn(List.of(share));
        when(settlementRepository.findByHouseholdOrderBySettlementDateDescIdDesc(household))
                .thenReturn(List.of(completed));

        service.sendPaymentReminders(LocalDate.of(2026, 9, 15));

        verify(notificationService).notifyMemberOnce(
                eq(debtor),
                isNull(),
                eq(HouseholdNotificationType.SETTLEMENT_REMINDER),
                isNull(),
                eq("Leandro"),
                argThat(amount -> amount.compareTo(new BigDecimal("15.00")) == 0),
                eq("settlement-reminder:2026-09-15"));
        verify(notificationService, never()).notifyMemberOnce(
                eq(payer), any(), any(), any(), any(), any(), any());
    }

    @Test
    void doesNothingOutsideTheReminderDays() {
        service.sendPaymentReminders(LocalDate.of(2026, 9, 16));

        verifyNoInteractions(householdRepository, notificationService);
    }

    private Household household() {
        Household household = new Household();
        household.setName("Flat 1");
        household.setCurrency("GBP");
        return household;
    }

    private HouseholdMember member(Long id, Household household, String name) {
        User user = new User("login@example.com", "secret", name);
        HouseholdMember member = new HouseholdMember();
        ReflectionTestUtils.setField(member, "id", id);
        member.setHousehold(household);
        member.setUser(user);
        member.setDisplayName(name);
        return member;
    }
}
