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
        boolean hasExpensePlan,
        BigDecimal plannedMonthlyVariableExpense,
        List<MonthForecast> months
) {
    /**
     * A single future month in the cash-flow forecast.
     *
     * <p>The income/expense/net values are flows over the month (money expected to
     * move); {@code projectedClosingBalance} is the month-end running balance,
     * anchored on today's live total account balance and rolled forward month by
     * month. The first item includes the remaining scheduled activity in the
     * current month.</p>
     *
     * <p>Each month is split into two confidence layers:</p>
     * <ul>
     *   <li><b>Committed</b> ({@code fixedIncome}, {@code fixedExpense},
     *       {@code installmentExpense}): dated transactions and recurring commitments.</li>
     *   <li><b>Estimated</b> ({@code estimatedIncome}, {@code estimatedVariableExpense}):
     *       the optional income-plan top-up (when confirmed income is below that
     *       month's target) and the optional day-to-day expense-plan top-up (when
     *       confirmed day-to-day spending is below that month's estimate).</li>
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
            boolean negative,
            BigDecimal incomeReceivedSoFar,
            BigDecimal expensesPaidSoFar
    ) {}
}
