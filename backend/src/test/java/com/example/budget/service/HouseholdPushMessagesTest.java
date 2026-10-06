package com.example.budget.service;

import com.example.budget.model.HouseholdNotificationType;
import com.example.budget.service.PushNotificationService.PushMessage;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class HouseholdPushMessagesTest {

    @Test
    void expenseMessageIncludesTheRecipientsShareAndGroupsByExpense() {
        PushMessage message = HouseholdPushMessages.forNotification(
                HouseholdNotificationType.EXPENSE_CREATED, "Flat 1", "GBP", "Maria", 30L,
                "Electricity", new BigDecimal("100.00"), new BigDecimal("20.00"));

        assertThat(message.title()).isEqualTo("Flat 1");
        assertThat(message.body()).isEqualTo("Maria added Electricity for £100.00. Your share is £20.00.");
        assertThat(message.tag()).isEqualTo("household-expense-30");
    }

    @Test
    void cleaningAssignmentFromTheInboxAndFromTheMondayJobShareATag() {
        PushMessage fromInbox = HouseholdPushMessages.forNotification(
                HouseholdNotificationType.CLEANING_WEEK_ASSIGNED, "Flat 1", "GBP", null, 40L,
                "2026-10-05", null, null);
        PushMessage fromJob = HouseholdPushMessages.cleaningAssigned("Flat 1", 40L, LocalDate.of(2026, 10, 5));

        assertThat(fromInbox.body()).isEqualTo("It's your cleaning week, starting Monday 5 October.");
        assertThat(fromJob.body()).isEqualTo(fromInbox.body());
        assertThat(fromJob.tag()).isEqualTo(fromInbox.tag());
    }

    @Test
    void paymentReminderSummarisesSeveralDebts() {
        PushMessage message = HouseholdPushMessages.paymentReminder("Flat 1", "GBP", List.of(
                new HouseholdPaymentEmailTemplate.Debt("Maria", new BigDecimal("12.50")),
                new HouseholdPaymentEmailTemplate.Debt("Joao", new BigDecimal("7.50"))));

        assertThat(message.body()).isEqualTo("You owe £20.00 across 2 members. Settle up when you can.");
    }
}
