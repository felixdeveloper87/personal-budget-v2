package com.example.budget.dto;

import java.math.BigDecimal;
import java.util.List;

public class MonthlySummary {
    public int year;
    public int month;
    public BigDecimal totalIncome;
    public BigDecimal totalExpense;
    public BigDecimal balance;
    public List<CategoryAggregate> byCategory;

    public static class CategoryAggregate {
        public String category;
        public BigDecimal income;
        public BigDecimal expense;
        public CategoryAggregate(String category, BigDecimal income, BigDecimal expense) {
            this.category = category;
            this.income = income;
            this.expense = expense;
        }
    }
}

