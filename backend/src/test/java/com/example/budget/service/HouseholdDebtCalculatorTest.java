package com.example.budget.service;

import com.example.budget.model.HouseholdExpense;
import com.example.budget.model.HouseholdExpenseShare;
import com.example.budget.model.HouseholdMember;
import com.example.budget.model.HouseholdSettlement;
import com.example.budget.model.HouseholdSettlementStatus;
import com.example.budget.service.HouseholdDebtCalculator.DebtPosition;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class HouseholdDebtCalculatorTest {
    private final HouseholdMember ana = member(1L);
    private final HouseholdMember bruno = member(2L);
    private final HouseholdMember carla = member(3L);

    @Test
    void payersOwnShareCreatesNoDebt() {
        List<DebtPosition> debts = HouseholdDebtCalculator.calculateDebts(
                List.of(share(ana, ana, "15.00"), share(ana, bruno, "15.00")),
                List.of());

        assertThat(debts).containsExactly(new DebtPosition(2L, 1L, new BigDecimal("15.00")));
    }

    @Test
    void debtsInOppositeDirectionsAreNetted() {
        List<DebtPosition> debts = HouseholdDebtCalculator.calculateDebts(
                List.of(share(ana, bruno, "30.00"), share(bruno, ana, "10.00")),
                List.of());

        assertThat(debts).containsExactly(new DebtPosition(2L, 1L, new BigDecimal("20.00")));
    }

    @Test
    void confirmedSettlementReducesTheDebtAndFullPaymentClearsIt() {
        List<HouseholdExpenseShare> shares = List.of(share(ana, bruno, "30.00"));

        assertThat(HouseholdDebtCalculator.calculateDebts(
                shares, List.of(settlement(bruno, ana, "10.00", HouseholdSettlementStatus.CONFIRMED))))
                .containsExactly(new DebtPosition(2L, 1L, new BigDecimal("20.00")));
        assertThat(HouseholdDebtCalculator.calculateDebts(
                shares, List.of(settlement(bruno, ana, "30.00", HouseholdSettlementStatus.CONFIRMED))))
                .isEmpty();
    }

    @Test
    void unconfirmedSettlementIsIgnored() {
        List<HouseholdSettlementStatus> unconfirmed = List.of(HouseholdSettlementStatus.values()).stream()
                .filter(status -> status != HouseholdSettlementStatus.CONFIRMED)
                .toList();

        for (HouseholdSettlementStatus status : unconfirmed) {
            assertThat(HouseholdDebtCalculator.calculateDebts(
                    List.of(share(ana, bruno, "30.00")),
                    List.of(settlement(bruno, ana, "30.00", status))))
                    .containsExactly(new DebtPosition(2L, 1L, new BigDecimal("30.00")));
        }
    }

    @Test
    void debtsAreKeptPerPairAndSortedByMember() {
        List<DebtPosition> debts = HouseholdDebtCalculator.calculateDebts(
                List.of(share(ana, carla, "5.00"), share(ana, bruno, "7.00")),
                List.of());

        assertThat(debts).containsExactly(
                new DebtPosition(2L, 1L, new BigDecimal("7.00")),
                new DebtPosition(3L, 1L, new BigDecimal("5.00")));
        assertThat(HouseholdDebtCalculator.debtAmount(debts, 3L, 1L)).isEqualByComparingTo("5.00");
        assertThat(HouseholdDebtCalculator.debtAmount(debts, 1L, 3L)).isEqualByComparingTo("0.00");
    }

    private HouseholdExpenseShare share(HouseholdMember payer, HouseholdMember participant, String amount) {
        HouseholdExpense expense = new HouseholdExpense();
        expense.setPayer(payer);
        expense.setExpenseDate(LocalDate.of(2026, 1, 15));

        HouseholdExpenseShare share = new HouseholdExpenseShare();
        share.setExpense(expense);
        share.setMember(participant);
        share.setAmount(new BigDecimal(amount));
        return share;
    }

    private HouseholdSettlement settlement(
            HouseholdMember from, HouseholdMember to, String amount, HouseholdSettlementStatus status) {
        HouseholdSettlement settlement = new HouseholdSettlement();
        settlement.setFromMember(from);
        settlement.setToMember(to);
        settlement.setAmount(new BigDecimal(amount));
        settlement.setStatus(status);
        return settlement;
    }

    private HouseholdMember member(Long id) {
        HouseholdMember member = new HouseholdMember();
        ReflectionTestUtils.setField(member, "id", id);
        return member;
    }
}
