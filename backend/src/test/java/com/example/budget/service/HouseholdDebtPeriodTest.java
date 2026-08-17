package com.example.budget.service;

import com.example.budget.model.HouseholdExpense;
import com.example.budget.model.HouseholdExpenseShare;
import com.example.budget.model.HouseholdMember;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class HouseholdDebtPeriodTest {
    private final HouseholdMember payer = member(1L);
    private final HouseholdMember participant = member(2L);

    @Test
    void calculateDebtsThroughMonth_excludesExpensesFromLaterMonths() {
        YearMonth currentMonth = YearMonth.of(2026, 8);

        List<HouseholdService.DebtPosition> debts =
                HouseholdService.calculateDebtsThroughMonth(
                        List.of(
                                share(currentMonth.minusMonths(1), "10.00"),
                                share(currentMonth, "20.00"),
                                share(currentMonth.plusMonths(1), "30.00")),
                        List.of(),
                        currentMonth);

        assertThat(debts).containsExactly(
                new HouseholdService.DebtPosition(2L, 1L, new BigDecimal("30.00")));
    }

    @Test
    void calculateDebtsThroughMonth_activatesTheExpenseWhenItsMonthArrives() {
        YearMonth expenseMonth = YearMonth.of(2026, 9);

        List<HouseholdService.DebtPosition> debts =
                HouseholdService.calculateDebtsThroughMonth(
                        List.of(share(expenseMonth, "30.00")),
                        List.of(),
                        expenseMonth);

        assertThat(debts).containsExactly(
                new HouseholdService.DebtPosition(2L, 1L, new BigDecimal("30.00")));
    }

    private HouseholdExpenseShare share(YearMonth month, String amount) {
        HouseholdExpense expense = new HouseholdExpense();
        expense.setPayer(payer);
        expense.setExpenseDate(month.atDay(15));

        HouseholdExpenseShare share = new HouseholdExpenseShare();
        share.setExpense(expense);
        share.setMember(participant);
        share.setAmount(new BigDecimal(amount));
        return share;
    }

    private HouseholdMember member(Long id) {
        HouseholdMember member = new HouseholdMember();
        ReflectionTestUtils.setField(member, "id", id);
        return member;
    }
}
