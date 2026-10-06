package com.example.budget.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** Request and response shapes for the Business tab. */
public final class BusinessDTOs {
    private BusinessDTOs() {}

    /** status: RUNNING, PAUSED or ENDED. workedSeconds excludes breaks and is live for an open session. */
    public record WorkSessionDTO(
            Long id,
            LocalDate workDate,
            Instant startedAt,
            Instant endedAt,
            Instant pausedAt,
            int breakSeconds,
            long workedSeconds,
            String status,
            String note) {}

    public record StartRequest(LocalDate workDate) {}

    public record ManualSessionRequest(
            @NotNull LocalDate workDate,
            @NotNull Instant startedAt,
            @NotNull Instant endedAt,
            @Min(0) @Max(1440) Integer breakMinutes,
            @Size(max = 255) String note) {}

    /** hourlyRate is null when there are no hours or no earnings to divide. */
    public record DaySummary(LocalDate date, long workedSeconds, BigDecimal earned, BigDecimal hourlyRate) {}

    public record Totals(long workedSeconds, BigDecimal earned, BigDecimal hourlyRate) {}

    public record Summary(
            LocalDate from,
            LocalDate to,
            Totals totals,
            List<DaySummary> days,
            List<WorkSessionDTO> sessions) {}
}
