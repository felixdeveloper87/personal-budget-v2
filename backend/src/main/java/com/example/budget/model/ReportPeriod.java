package com.example.budget.model;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Report period (day / week / month / year). Owns the temporal logic of the report:
 * parsing the request value, resolving the inclusive {@link PeriodRange}, building labels
 * and breaking the range into display buckets. Also the single source of truth for the
 * report's date formatting (locale-aware, UK).
 */
public enum ReportPeriod {
    DAY, WEEK, MONTH, YEAR;

    public static final Locale REPORT_LOCALE = Locale.UK;
    public static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy", REPORT_LOCALE);
    public static final DateTimeFormatter MONTH_FORMAT =
            DateTimeFormatter.ofPattern("MMM yyyy", REPORT_LOCALE);

    public static ReportPeriod from(String value) {
        if (value == null || value.isBlank()) {
            return MONTH;
        }
        try {
            return ReportPeriod.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid report period: " + value);
        }
    }

    public static String formatDate(LocalDate date) {
        return DATE_FORMAT.format(date);
    }

    public String requestValue() {
        return name().toLowerCase(Locale.ROOT);
    }

    public PeriodRange range(LocalDate date) {
        return switch (this) {
            case DAY -> new PeriodRange(date, date, DATE_FORMAT.format(date));
            case WEEK -> {
                LocalDate start = date.with(DayOfWeek.MONDAY);
                LocalDate end = start.plusDays(6);
                yield new PeriodRange(start, end, DATE_FORMAT.format(start) + " - " + DATE_FORMAT.format(end));
            }
            case MONTH -> {
                YearMonth month = YearMonth.from(date);
                yield new PeriodRange(month.atDay(1), month.atEndOfMonth(), MONTH_FORMAT.format(date));
            }
            case YEAR -> new PeriodRange(
                    LocalDate.of(date.getYear(), 1, 1),
                    LocalDate.of(date.getYear(), 12, 31),
                    String.valueOf(date.getYear()));
        };
    }

    public String label(LocalDate date, PeriodRange range) {
        return switch (this) {
            case DAY -> "Daily " + DATE_FORMAT.format(date);
            case WEEK -> "Weekly " + DATE_FORMAT.format(range.start()) + " - " + DATE_FORMAT.format(range.end());
            case MONTH -> "Monthly " + MONTH_FORMAT.format(date);
            case YEAR -> "Annual " + date.getYear();
        };
    }

    public List<PeriodRange> bucketRanges(PeriodRange range) {
        List<PeriodRange> buckets = new ArrayList<>();
        if (this == YEAR) {
            LocalDate cursor = range.start();
            while (!cursor.isAfter(range.end())) {
                YearMonth month = YearMonth.from(cursor);
                buckets.add(new PeriodRange(month.atDay(1), month.atEndOfMonth(), MONTH_FORMAT.format(cursor)));
                cursor = cursor.plusMonths(1);
            }
            return buckets;
        }

        LocalDate cursor = range.start();
        while (!cursor.isAfter(range.end())) {
            String label = this == WEEK
                    ? cursor.getDayOfWeek().getDisplayName(TextStyle.SHORT, REPORT_LOCALE)
                    : DateTimeFormatter.ofPattern("dd MMM", REPORT_LOCALE).format(cursor);
            buckets.add(new PeriodRange(cursor, cursor, label));
            cursor = cursor.plusDays(1);
        }
        return buckets;
    }
}
