package com.example.budget.service;

import com.example.budget.dto.HouseholdPageDTO;
import com.example.budget.model.HouseholdExpense;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class HouseholdMonthSummaryTest {
    @Test
    void buildMonthSummaries_groupsAndSortsTheFullLedgerByMonth() {
        YearMonth currentMonth = YearMonth.of(2026, 8);

        List<HouseholdPageDTO.MonthSummary> summaries = HouseholdService.buildMonthSummaries(
                List.of(
                        expense("2026-08-04", "12.25"),
                        expense("2026-07-19", "8.00"),
                        expense("2026-08-21", "2.75"),
                        expense("2025-12-31", "4.50")),
                currentMonth);

        assertThat(summaries).extracting(HouseholdPageDTO.MonthSummary::month)
                .containsExactly("2026-08", "2026-07", "2025-12");
        assertThat(summaries.get(0).spend()).isEqualByComparingTo("15.00");
        assertThat(summaries.get(0).expenseCount()).isEqualTo(2);
        assertThat(summaries.get(1).spend()).isEqualByComparingTo("8.00");
        assertThat(summaries.get(1).expenseCount()).isEqualTo(1);
    }

    @Test
    void buildMonthSummaries_alwaysIncludesAnEmptyCurrentMonth() {
        List<HouseholdPageDTO.MonthSummary> summaries = HouseholdService.buildMonthSummaries(
                List.of(expense("2026-06-10", "9.99")),
                YearMonth.of(2026, 8));

        assertThat(summaries).extracting(HouseholdPageDTO.MonthSummary::month)
                .containsExactly("2026-08", "2026-06");
        assertThat(summaries.get(0).spend()).isEqualByComparingTo("0.00");
        assertThat(summaries.get(0).expenseCount()).isZero();
    }

    private HouseholdExpense expense(String date, String amount) {
        HouseholdExpense expense = new HouseholdExpense();
        expense.setExpenseDate(LocalDate.parse(date));
        expense.setAmount(new BigDecimal(amount));
        return expense;
    }
}
