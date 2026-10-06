package com.example.budget.service;

import com.example.budget.model.HouseholdNotificationType;
import com.example.budget.service.PushNotificationService.PushMessage;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

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
        assertThat(message.url()).isEqualTo("/household");
    }

    @Test
    void cleaningWeekAssignedNamesTheStartDate() {
        PushMessage message = HouseholdPushMessages.forNotification(
                HouseholdNotificationType.CLEANING_WEEK_ASSIGNED, "Flat 1", "GBP", null, 40L,
                "2026-10-05", null, null);

        assertThat(message.body()).isEqualTo("It's your cleaning week, starting Monday 5 October.");
        assertThat(message.tag()).isEqualTo("cleaning-week-40");
    }

    @Test
    void paymentReminderNamesTheCreditorWhenThereIsOnlyOne() {
        PushMessage single = HouseholdPushMessages.forNotification(
                HouseholdNotificationType.SETTLEMENT_REMINDER, "Flat 1", "GBP", null, null,
                "Maria", new BigDecimal("12.50"), null);
        PushMessage several = HouseholdPushMessages.forNotification(
                HouseholdNotificationType.SETTLEMENT_REMINDER, "Flat 1", "GBP", null, null,
                null, new BigDecimal("20.00"), null);

        assertThat(single.body()).isEqualTo("Reminder: you still owe Maria £12.50. Settle up when you can.");
        assertThat(several.body())
                .isEqualTo("Reminder: you still owe £20.00 in household payments. Settle up when you can.");
    }

    @Test
    void cleaningReminderHasItsOwnTag() {
        PushMessage message = HouseholdPushMessages.forNotification(
                HouseholdNotificationType.CLEANING_WEEK_REMINDER, "Flat 1", "GBP", null, 40L,
                "2026-10-05", null, null);

        assertThat(message.body()).isEqualTo("Reminder: your cleaning checklist for this week is not finished yet.");
        assertThat(message.tag()).isEqualTo("cleaning-week-reminder-40");
    }
}
