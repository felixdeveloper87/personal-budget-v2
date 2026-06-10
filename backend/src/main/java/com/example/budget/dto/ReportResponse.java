package com.example.budget.dto;

import com.example.budget.model.TransactionType;
import com.example.budget.model.TransactionStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ReportResponse {
    private String period;
    private String periodLabel;
    private LocalDate referenceDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime generatedAt;
    private BigDecimal totalIncome = BigDecimal.ZERO;
    private BigDecimal totalExpense = BigDecimal.ZERO;
    private BigDecimal balance = BigDecimal.ZERO;
    private BigDecimal averageExpense = BigDecimal.ZERO;
    private BigDecimal installmentExpenseTotal = BigDecimal.ZERO;
    private BigDecimal recurringExpenseTotal = BigDecimal.ZERO;
    private int transactionCount;
    private int incomeCount;
    private int expenseCount;
    private List<String> insights = new ArrayList<>();
    private List<CategoryBreakdown> incomeCategories = new ArrayList<>();
    private List<CategoryBreakdown> expenseCategories = new ArrayList<>();
    private List<PaymentMethodBreakdown> paymentMethods = new ArrayList<>();
    private List<TimeBucket> buckets = new ArrayList<>();
    private List<ReportTransactionItem> topIncome = new ArrayList<>();
    private List<ReportTransactionItem> topExpenses = new ArrayList<>();

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
    public String getPeriodLabel() { return periodLabel; }
    public void setPeriodLabel(String periodLabel) { this.periodLabel = periodLabel; }
    public LocalDate getReferenceDate() { return referenceDate; }
    public void setReferenceDate(LocalDate referenceDate) { this.referenceDate = referenceDate; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }
    public BigDecimal getTotalExpense() { return totalExpense; }
    public void setTotalExpense(BigDecimal totalExpense) { this.totalExpense = totalExpense; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    public BigDecimal getAverageExpense() { return averageExpense; }
    public void setAverageExpense(BigDecimal averageExpense) { this.averageExpense = averageExpense; }
    public BigDecimal getInstallmentExpenseTotal() { return installmentExpenseTotal; }
    public void setInstallmentExpenseTotal(BigDecimal installmentExpenseTotal) { this.installmentExpenseTotal = installmentExpenseTotal; }
    public BigDecimal getRecurringExpenseTotal() { return recurringExpenseTotal; }
    public void setRecurringExpenseTotal(BigDecimal recurringExpenseTotal) { this.recurringExpenseTotal = recurringExpenseTotal; }
    public int getTransactionCount() { return transactionCount; }
    public void setTransactionCount(int transactionCount) { this.transactionCount = transactionCount; }
    public int getIncomeCount() { return incomeCount; }
    public void setIncomeCount(int incomeCount) { this.incomeCount = incomeCount; }
    public int getExpenseCount() { return expenseCount; }
    public void setExpenseCount(int expenseCount) { this.expenseCount = expenseCount; }
    public List<String> getInsights() { return insights; }
    public void setInsights(List<String> insights) { this.insights = insights; }
    public List<CategoryBreakdown> getIncomeCategories() { return incomeCategories; }
    public void setIncomeCategories(List<CategoryBreakdown> incomeCategories) { this.incomeCategories = incomeCategories; }
    public List<CategoryBreakdown> getExpenseCategories() { return expenseCategories; }
    public void setExpenseCategories(List<CategoryBreakdown> expenseCategories) { this.expenseCategories = expenseCategories; }
    public List<PaymentMethodBreakdown> getPaymentMethods() { return paymentMethods; }
    public void setPaymentMethods(List<PaymentMethodBreakdown> paymentMethods) { this.paymentMethods = paymentMethods; }
    public List<TimeBucket> getBuckets() { return buckets; }
    public void setBuckets(List<TimeBucket> buckets) { this.buckets = buckets; }
    public List<ReportTransactionItem> getTopIncome() { return topIncome; }
    public void setTopIncome(List<ReportTransactionItem> topIncome) { this.topIncome = topIncome; }
    public List<ReportTransactionItem> getTopExpenses() { return topExpenses; }
    public void setTopExpenses(List<ReportTransactionItem> topExpenses) { this.topExpenses = topExpenses; }

    public static class CategoryBreakdown {
        private String category;
        private BigDecimal amount;
        private BigDecimal percentage;
        private int transactionCount;

        public CategoryBreakdown(String category, BigDecimal amount, BigDecimal percentage, int transactionCount) {
            this.category = category;
            this.amount = amount;
            this.percentage = percentage;
            this.transactionCount = transactionCount;
        }

        public String getCategory() { return category; }
        public BigDecimal getAmount() { return amount; }
        public BigDecimal getPercentage() { return percentage; }
        public int getTransactionCount() { return transactionCount; }
    }

    public static class PaymentMethodBreakdown {
        private String name;
        private BigDecimal amount;
        private BigDecimal percentage;
        private int transactionCount;

        public PaymentMethodBreakdown(String name, BigDecimal amount, BigDecimal percentage, int transactionCount) {
            this.name = name;
            this.amount = amount;
            this.percentage = percentage;
            this.transactionCount = transactionCount;
        }

        public String getName() { return name; }
        public BigDecimal getAmount() { return amount; }
        public BigDecimal getPercentage() { return percentage; }
        public int getTransactionCount() { return transactionCount; }
    }

    public static class TimeBucket {
        private String label;
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal income;
        private BigDecimal expense;
        private BigDecimal balance;
        private int transactionCount;

        public TimeBucket(
                String label,
                LocalDate startDate,
                LocalDate endDate,
                BigDecimal income,
                BigDecimal expense,
                int transactionCount) {
            this.label = label;
            this.startDate = startDate;
            this.endDate = endDate;
            this.income = income;
            this.expense = expense;
            this.balance = income.subtract(expense);
            this.transactionCount = transactionCount;
        }

        public String getLabel() { return label; }
        public LocalDate getStartDate() { return startDate; }
        public LocalDate getEndDate() { return endDate; }
        public BigDecimal getIncome() { return income; }
        public BigDecimal getExpense() { return expense; }
        public BigDecimal getBalance() { return balance; }
        public int getTransactionCount() { return transactionCount; }
    }

    public static class ReportTransactionItem {
        private Long id;
        private LocalDate paymentDate;
        private TransactionType type;
        private String category;
        private String description;
        private BigDecimal amount;
        private String paymentMethodName;
        private String accountName;
        private TransactionStatus status;
        private boolean installment;
        private boolean recurring;

        public ReportTransactionItem(
                Long id,
                LocalDate paymentDate,
                TransactionType type,
                String category,
                String description,
                BigDecimal amount,
                String paymentMethodName,
                String accountName,
                TransactionStatus status,
                boolean installment,
                boolean recurring) {
            this.id = id;
            this.paymentDate = paymentDate;
            this.type = type;
            this.category = category;
            this.description = description;
            this.amount = amount;
            this.paymentMethodName = paymentMethodName;
            this.accountName = accountName;
            this.status = status;
            this.installment = installment;
            this.recurring = recurring;
        }

        public Long getId() { return id; }
        public LocalDate getPaymentDate() { return paymentDate; }
        public TransactionType getType() { return type; }
        public String getCategory() { return category; }
        public String getDescription() { return description; }
        public BigDecimal getAmount() { return amount; }
        public String getPaymentMethodName() { return paymentMethodName; }
        public String getAccountName() { return accountName; }
        public TransactionStatus getStatus() { return status; }
        public boolean isInstallment() { return installment; }
        public boolean isRecurring() { return recurring; }
    }
}
