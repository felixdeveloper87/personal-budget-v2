package com.example.budget.model;

public enum HouseholdNotificationType {
    EXPENSE_CREATED,
    EXPENSE_UPDATED,
    EXPENSE_VOIDED,
    SETTLEMENT_CREATED,
    SETTLEMENT_CONFIRMED,
    SETTLEMENT_REJECTED,
    SETTLEMENT_CANCELLED,
    /** Scheduled nudge (15th and 30th) to members who still owe money. */
    SETTLEMENT_REMINDER,
    MEMBER_JOINED,
    MEMBER_REMOVED,
    CLEANING_WEEK_ASSIGNED,
    CLEANING_DUTY_COMPLETED,
    CLEANING_WEEK_COMPLETED,
    /** Sunday nudge when this week's cleaning checklist is still unfinished. */
    CLEANING_WEEK_REMINDER
}
