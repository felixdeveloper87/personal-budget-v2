package com.example.budget.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Generic Data Transfer Object for transaction summaries over any time period.
 * 
 * Can be used for daily, weekly, monthly, or annual summaries.
 * Contains aggregated financial data including totals and category breakdowns.
 */
public class PeriodSummary {
    
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private List<CategoryAggregate> byCategory;

    public PeriodSummary() {
    }
    
    public PeriodSummary(BigDecimal totalIncome, BigDecimal totalExpense, 
                        BigDecimal balance, List<CategoryAggregate> byCategory) {
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.balance = balance;
        this.byCategory = byCategory;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(BigDecimal totalExpense) {
        this.totalExpense = totalExpense;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public List<CategoryAggregate> getByCategory() {
        return byCategory;
    }

    public void setByCategory(List<CategoryAggregate> byCategory) {
        this.byCategory = byCategory;
    }

    /**
     * Inner class representing aggregated transaction data for a specific category.
     * 
     * Contains total income and total expenses for a category within the period.
     */
    public static class CategoryAggregate {
        
        private String category;
        private BigDecimal income;
        private BigDecimal expense;

        public CategoryAggregate() {
        }
        
        public CategoryAggregate(String category, BigDecimal income, BigDecimal expense) {
            this.category = category;
            this.income = income;
            this.expense = expense;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public BigDecimal getIncome() {
            return income;
        }

        public void setIncome(BigDecimal income) {
            this.income = income;
        }

        public BigDecimal getExpense() {
            return expense;
        }

        public void setExpense(BigDecimal expense) {
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
        return "PeriodSummary{" +
                "totalIncome=" + totalIncome +
                ", totalExpense=" + totalExpense +
                ", balance=" + balance +
                ", byCategory=" + byCategory +
                '}';
    }
}

