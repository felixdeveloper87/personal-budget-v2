package com.example.budget.service;

import com.example.budget.model.Household;
import com.example.budget.model.HouseholdExpense;
import com.example.budget.model.HouseholdExpenseShare;
import com.example.budget.model.HouseholdMember;
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

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HouseholdPaymentEmailServiceTest {
    @Mock private HouseholdRepository householdRepository;
    @Mock private HouseholdMemberRepository memberRepository;
    @Mock private HouseholdExpenseRepository expenseRepository;
    @Mock private HouseholdExpenseShareRepository shareRepository;
    @Mock private HouseholdSettlementRepository settlementRepository;
    @Mock private ResendEmailClient resendEmailClient;
    @Mock private HouseholdPaymentEmailTemplate emailTemplate;

    private HouseholdPaymentEmailService service;

    @BeforeEach
    void setUp() {
        service = new HouseholdPaymentEmailService(
                householdRepository,
                memberRepository,
                expenseRepository,
                shareRepository,
                settlementRepository,
                resendEmailClient,
                emailTemplate,
                "Europe/London");
    }

    @Test
    void reminderUsesTheBalanceAfterCompletedPayments() {
        Household household = household("Flat 1");
        HouseholdMember payer = member(1L, household, "Leandro", "leandro@example.com");
        HouseholdMember debtor = member(2L, household, "Maria", "maria@example.com");
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
        when(emailTemplate.paymentReminder(eq("Maria"), eq("Flat 1"), anyList(), eq("GBP")))
                .thenReturn(new HouseholdPaymentEmailTemplate.EmailContent("text", "<html>reminder</html>"));

        service.sendPaymentReminders(LocalDate.of(2026, 9, 15));

        verify(emailTemplate).paymentReminder(
                eq("Maria"), eq("Flat 1"),
                eq(List.of(new HouseholdPaymentEmailTemplate.Debt("Leandro", new BigDecimal("15.00")))),
                eq("GBP"));
        verify(resendEmailClient).sendHtmlBatch(
                eq(List.of("maria@example.com")),
                eq("Household payment reminder"),
                eq("text"),
                eq("<html>reminder</html>"));
    }

    private Household household(String name) {
        Household household = new Household();
        household.setName(name);
        household.setCurrency("GBP");
        return household;
    }

    private HouseholdMember member(Long id, Household household, String name, String communicationEmail) {
        User user = new User("login@example.com", "secret", name);
        user.setCommunicationEmail(communicationEmail);
        HouseholdMember member = new HouseholdMember();
        ReflectionTestUtils.setField(member, "id", id);
        member.setHousehold(household);
        member.setUser(user);
        return member;
    }
}
