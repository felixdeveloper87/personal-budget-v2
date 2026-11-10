package com.example.budget.report.model;

import java.time.LocalDate;

/**
 * Immutable inclusive date range with a human-readable label, used to describe a
 * report period or one of its time buckets.
 */
public record PeriodRange(LocalDate start, LocalDate end, String label) {
}
