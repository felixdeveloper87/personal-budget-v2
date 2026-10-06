package com.example.budget.service;

import com.example.budget.model.HouseholdNotificationType;
import com.example.budget.service.PushNotificationService.PushMessage;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Currency;
import java.util.List;
import java.util.Locale;

/**
 * Push copy for Household activity. Mirrors the in-app notification wording
 * and, like the Household e-mails, is written in British English.
 */
final class HouseholdPushMessages {
    private static final String URL = "/household";
    private static final DateTimeFormatter WEEK_DATE = DateTimeFormatter.ofPattern("EEEE d MMMM", Locale.UK);

    private HouseholdPushMessages() {}

    static PushMessage forNotification(
            HouseholdNotificationType type,
            String householdName,
            String currency,
            String actorName,
            Long referenceId,
            String subject,
            BigDecimal amount,
            BigDecimal recipientAmount) {
        String actor = actorName == null || actorName.isBlank() ? "Someone" : actorName;
        String item = subject == null || subject.isBlank() ? "an expense" : subject;
        String total = money(amount, currency);
        String share = recipientAmount == null ? null : money(recipientAmount, currency);
        String title = householdName == null || householdName.isBlank() ? "Household" : householdName;

        String body = switch (type) {
            case EXPENSE_CREATED -> share != null
                    ? actor + " added " + item + " for " + total + ". Your share is " + share + "."
                    : actor + " added " + item + " for " + total + ".";
            case EXPENSE_UPDATED -> share != null
                    ? actor + " updated " + item + " to " + total + ". Your share is now " + share + "."
                    : actor + " updated " + item + " to " + total + ".";
            case EXPENSE_VOIDED -> share != null
                    ? actor + " removed " + item + " (" + total + "). Your share was " + share + "."
                    : actor + " removed " + item + " (" + total + ").";
            case SETTLEMENT_CREATED -> actor + " recorded a " + total + " transfer to you.";
            case SETTLEMENT_CONFIRMED -> actor + " confirmed your " + total + " transfer.";
            case SETTLEMENT_REJECTED -> actor + " rejected your " + total + " transfer.";
            case SETTLEMENT_CANCELLED -> actor + " cancelled a " + total + " transfer to you.";
            case MEMBER_JOINED -> (subject == null ? "A new member" : subject) + " joined the household.";
            case MEMBER_REMOVED -> (subject == null ? "A member" : subject) + " was removed from the household.";
            case CLEANING_WEEK_ASSIGNED -> "It's your cleaning week, starting " + weekDate(subject) + ".";
            case CLEANING_DUTY_COMPLETED -> actor + " completed " + HouseholdCleaningService.dutyLabel(subject) + ".";
            case CLEANING_WEEK_COMPLETED -> actor + " completed all cleaning tasks for the week.";
        };

        String tag = switch (type) {
            case EXPENSE_CREATED, EXPENSE_UPDATED, EXPENSE_VOIDED -> "household-expense-" + referenceId;
            case SETTLEMENT_CREATED, SETTLEMENT_CONFIRMED, SETTLEMENT_REJECTED, SETTLEMENT_CANCELLED ->
                    "household-settlement-" + referenceId;
            case CLEANING_WEEK_ASSIGNED -> cleaningWeekTag(referenceId);
            default -> null;
        };
        return new PushMessage(title, body, URL, tag);
    }

    static PushMessage cleaningAssigned(String householdName, Long assignmentId, LocalDate weekStart) {
        return new PushMessage(
                householdName,
                "It's your cleaning week, starting " + WEEK_DATE.format(weekStart) + ".",
                URL,
                cleaningWeekTag(assignmentId));
    }

    static PushMessage cleaningIncomplete(String householdName, long completed, int total, List<String> remaining) {
        String preview = remaining.isEmpty() ? "" : " Still to do: " + String.join(", ", remaining.stream().limit(3).toList())
                + (remaining.size() > 3 ? " and more." : ".");
        return new PushMessage(
                householdName,
                "Your cleaning checklist is " + completed + "/" + total + " done." + preview,
                URL,
                "cleaning-incomplete");
    }

    static PushMessage paymentReminder(String householdName, String currency, List<HouseholdPaymentEmailTemplate.Debt> debts) {
        String body;
        if (debts.size() == 1) {
            HouseholdPaymentEmailTemplate.Debt debt = debts.get(0);
            body = "You owe " + debt.creditorName() + " " + money(debt.amount(), currency) + ". Settle up when you can.";
        } else {
            BigDecimal total = debts.stream()
                    .map(HouseholdPaymentEmailTemplate.Debt::amount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            body = "You owe " + money(total, currency) + " across " + debts.size() + " members. Settle up when you can.";
        }
        return new PushMessage(householdName, body, URL, "household-payment-reminder");
    }

    private static String cleaningWeekTag(Long assignmentId) {
        return "cleaning-week-" + assignmentId;
    }

    private static String weekDate(String isoDate) {
        try {
            return WEEK_DATE.format(LocalDate.parse(isoDate));
        } catch (DateTimeParseException | NullPointerException exception) {
            return "this week";
        }
    }

    private static String money(BigDecimal amount, String currency) {
        if (amount == null) return "";
        NumberFormat format = NumberFormat.getCurrencyInstance(Locale.UK);
        try {
            format.setCurrency(Currency.getInstance(currency == null ? "GBP" : currency));
        } catch (IllegalArgumentException ignored) {
            // Unknown code: keep the UK default symbol.
        }
        return format.format(amount);
    }
}
