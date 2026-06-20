package com.example.budget.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CashFlowForecastDTO(
        BigDecimal currentTotalBalance,
        List<String> projectionBasisMonths,
        boolean hasProjectionBasis,
        BigDecimal averageMonthlyIncome,
        BigDecimal averageMonthlyVariableExpense,
        boolean hasIncomePlan,
        BigDecimal plannedMonthlyIncome,
        List<MonthForecast> months
) {
    /**
     * A single future month in the cash-flow forecast.
     *
     * <p>The income/expense/net values are flows over the month (money expected to
     * move); {@code projectedClosingBalance} is the running balance, anchored on the
     * current total account balance and rolled forward month by month so it answers
     * "when does my money run out". The first item is the current live-balance
     * snapshot; the remaining items are projected future months.</p>
     *
     * <p>Each month is split into two confidence layers:</p>
     * <ul>
     *   <li><b>Committed</b> ({@code fixedIncome}, {@code fixedExpense},
     *       {@code installmentExpense}): scheduled, known amounts. High confidence.</li>
     *   <li><b>Estimated</b> ({@code estimatedIncome},
     *       {@code estimatedVariableExpense}): projected from the recent monthly
     *       average. Clearly a forecast, not a fact.</li>
     * </ul>
     */
    public record MonthForecast(
            String month,
            LocalDate monthEnd,
            BigDecimal fixedIncome,
            BigDecimal estimatedIncome,
            BigDecimal fixedExpense,
            BigDecimal installmentExpense,
            BigDecimal estimatedVariableExpense,
            BigDecimal committedNet,
            BigDecimal estimatedNet,
            BigDecimal netCashFlow,
            BigDecimal projectedClosingBalance,
            int confidencePercent,
            boolean negative
    ) {}
}
