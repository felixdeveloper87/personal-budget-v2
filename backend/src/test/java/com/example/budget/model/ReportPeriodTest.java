package com.example.budget.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ReportPeriodTest {

    @Test
    void from_defaultsToMonthForNullOrBlank() {
        assertThat(ReportPeriod.from(null)).isEqualTo(ReportPeriod.MONTH);
        assertThat(ReportPeriod.from("")).isEqualTo(ReportPeriod.MONTH);
        assertThat(ReportPeriod.from("   ")).isEqualTo(ReportPeriod.MONTH);
    }

    @Test
    void from_parsesCaseInsensitively() {
        assertThat(ReportPeriod.from("week")).isEqualTo(ReportPeriod.WEEK);
        assertThat(ReportPeriod.from("  YEAR ")).isEqualTo(ReportPeriod.YEAR);
        assertThat(ReportPeriod.from("Day")).isEqualTo(ReportPeriod.DAY);
    }

    @Test
    void from_throwsOnInvalidValue() {
        assertThatThrownBy(() -> ReportPeriod.from("quarter"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid report period: quarter");
    }

    @Test
    void requestValue_isLowerCaseName() {
        assertThat(ReportPeriod.WEEK.requestValue()).isEqualTo("week");
        assertThat(ReportPeriod.MONTH.requestValue()).isEqualTo("month");
    }

    @Test
    void range_dayIsSingleDay() {
        LocalDate date = LocalDate.of(2026, 5, 16);
        PeriodRange range = ReportPeriod.DAY.range(date);
        assertThat(range.start()).isEqualTo(date);
        assertThat(range.end()).isEqualTo(date);
        assertThat(range.label()).isEqualTo("16 May 2026");
    }

    @Test
    void range_weekIsMondayToSunday() {
        // 2026-05-16 is a Saturday
        PeriodRange range = ReportPeriod.WEEK.range(LocalDate.of(2026, 5, 16));
        assertThat(range.start()).isEqualTo(LocalDate.of(2026, 5, 11));
        assertThat(range.end()).isEqualTo(LocalDate.of(2026, 5, 17));
        assertThat(range.label()).isEqualTo("11 May 2026 - 17 May 2026");
    }

    @Test
    void range_monthIsFirstToLastDay() {
        PeriodRange range = ReportPeriod.MONTH.range(LocalDate.of(2026, 5, 16));
        assertThat(range.start()).isEqualTo(LocalDate.of(2026, 5, 1));
        assertThat(range.end()).isEqualTo(LocalDate.of(2026, 5, 31));
        assertThat(range.label()).isEqualTo("May 2026");
    }

    @Test
    void range_yearIsJanToDec() {
        PeriodRange range = ReportPeriod.YEAR.range(LocalDate.of(2026, 5, 16));
        assertThat(range.start()).isEqualTo(LocalDate.of(2026, 1, 1));
        assertThat(range.end()).isEqualTo(LocalDate.of(2026, 12, 31));
        assertThat(range.label()).isEqualTo("2026");
    }

    @Test
    void label_describesEachPeriod() {
        LocalDate date = LocalDate.of(2026, 5, 16);
        assertThat(ReportPeriod.DAY.label(date, ReportPeriod.DAY.range(date))).isEqualTo("Daily 16 May 2026");
        assertThat(ReportPeriod.WEEK.label(date, ReportPeriod.WEEK.range(date)))
                .isEqualTo("Weekly 11 May 2026 - 17 May 2026");
        assertThat(ReportPeriod.MONTH.label(date, ReportPeriod.MONTH.range(date))).isEqualTo("Monthly May 2026");
        assertThat(ReportPeriod.YEAR.label(date, ReportPeriod.YEAR.range(date))).isEqualTo("Annual 2026");
    }

    @Test
    void bucketRanges_weekHasSevenDailyBuckets() {
        PeriodRange range = ReportPeriod.WEEK.range(LocalDate.of(2026, 5, 16));
        assertThat(ReportPeriod.WEEK.bucketRanges(range)).hasSize(7);
    }

    @Test
    void bucketRanges_monthHasOneBucketPerDay() {
        PeriodRange range = ReportPeriod.MONTH.range(LocalDate.of(2026, 5, 16));
        assertThat(ReportPeriod.MONTH.bucketRanges(range)).hasSize(31);
    }

    @Test
    void bucketRanges_yearHasTwelveMonthlyBuckets() {
        PeriodRange range = ReportPeriod.YEAR.range(LocalDate.of(2026, 5, 16));
        assertThat(ReportPeriod.YEAR.bucketRanges(range)).hasSize(12);
    }

    @Test
    void formatDate_usesUkPattern() {
        assertThat(ReportPeriod.formatDate(LocalDate.of(2026, 1, 9))).isEqualTo("09 Jan 2026");
    }
}
