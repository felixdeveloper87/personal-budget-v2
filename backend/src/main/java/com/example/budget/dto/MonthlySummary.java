package com.example.budget.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Data Transfer Object for monthly transaction summary.
 * 
 * Contains aggregated financial data for a specific month, including
 * total income, total expenses, balance, and breakdown by category.
 */
public class MonthlySummary {
    public int year;
    public int month;
    public BigDecimal totalIncome;
    public BigDecimal totalExpense;
    public BigDecimal balance;
    public List<CategoryAggregate> byCategory;

    /**
     * Represents aggregated transaction data for a specific category.
     * Contains total income and total expenses for that category in the month.
     */
    public static class CategoryAggregate {
        public String category;
        public BigDecimal income;
        public BigDecimal expense;

        public CategoryAggregate(String category, BigDecimal income, BigDecimal expense) {
            this.category = category;
            this.income = income;
            this.expense = expense;
        }

        @Override
        public String toString() {
            return "CategoryAggregate{" +
                    "category='" + category + '\'' +
                    ", income=" + income +
                    ", expense=" + expense +
                    '}';
        }
    }

    @Override
    public String toString() {
        return "MonthlySummary{" +
                "year=" + year +
                ", month=" + month +
                ", totalIncome=" + totalIncome +
                ", totalExpense=" + totalExpense +
                ", balance=" + balance +
                ", byCategory=" + byCategory +
                '}';
    }
}
