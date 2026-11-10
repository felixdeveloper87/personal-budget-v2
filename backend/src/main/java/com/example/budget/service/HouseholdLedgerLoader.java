package com.example.budget.service;

import com.example.budget.model.Household;
import com.example.budget.model.HouseholdExpense;
import com.example.budget.model.HouseholdExpenseShare;
import com.example.budget.model.HouseholdSettlement;
import com.example.budget.repository.HouseholdExpenseRepository;
import com.example.budget.repository.HouseholdExpenseShareRepository;
import com.example.budget.repository.HouseholdSettlementRepository;
import org.springframework.stereotype.Component;

import java.util.List;

/** Loads a household's full ledger (active expenses, their shares and all settlements). */
@Component
public class HouseholdLedgerLoader {

    /** Expenses and settlements are ordered newest first. */
    public record Ledger(
            List<HouseholdExpense> expenses,
            List<HouseholdExpenseShare> shares,
            List<HouseholdSettlement> settlements) {}

    private final HouseholdExpenseRepository expenseRepository;
    private final HouseholdExpenseShareRepository shareRepository;
    private final HouseholdSettlementRepository settlementRepository;

    public HouseholdLedgerLoader(
            HouseholdExpenseRepository expenseRepository,
            HouseholdExpenseShareRepository shareRepository,
            HouseholdSettlementRepository settlementRepository) {
        this.expenseRepository = expenseRepository;
        this.shareRepository = shareRepository;
        this.settlementRepository = settlementRepository;
    }

    public Ledger load(Household household) {
        List<HouseholdExpense> expenses =
                expenseRepository.findByHouseholdAndVoidedAtIsNullOrderByExpenseDateDescIdDesc(
                        household);
        List<HouseholdExpenseShare> shares =
                expenses.isEmpty() ? List.of() : shareRepository.findByExpenseIn(expenses);
        List<HouseholdSettlement> settlements =
                settlementRepository.findByHouseholdOrderBySettlementDateDescIdDesc(household);
        return new Ledger(expenses, shares, settlements);
    }
}
