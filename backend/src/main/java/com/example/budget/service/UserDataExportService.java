package com.example.budget.service;

import com.example.budget.model.AccountTransfer;
import com.example.budget.model.CategoryBudget;
import com.example.budget.model.FinancialAccount;
import com.example.budget.model.InstallmentPlan;
import com.example.budget.model.PaymentMethod;
import com.example.budget.model.RecurringTransaction;
import com.example.budget.model.SavingsGoal;
import com.example.budget.model.SavingsGoalContribution;
import com.example.budget.model.Transaction;
import com.example.budget.model.User;
import com.example.budget.repository.AccountTransferRepository;
import com.example.budget.repository.CategoryBudgetRepository;
import com.example.budget.repository.FinancialAccountRepository;
import com.example.budget.repository.InstallmentPlanRepository;
import com.example.budget.repository.PaymentMethodRepository;
import com.example.budget.repository.RecurringTransactionRepository;
import com.example.budget.repository.SavingsGoalContributionRepository;
import com.example.budget.repository.SavingsGoalRepository;
import com.example.budget.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserDataExportService {

    private static final List<String> HEADERS = List.of(
            "Record Type", "ID", "Date", "Type", "Category", "Description", "Amount",
            "Payment Method", "Account", "Payment Date", "Status", "Name", "Institution",
            "Currency", "Opening Balance", "Overdraft Limit", "Balance Anchor At", "Active",
            "Issuer", "Statement Closing Day", "Payment Day", "Total Installments",
            "Installment Value", "Total Amount", "First Date", "Last Date", "Frequency",
            "Start Date", "End Date", "Next Run Date", "Day Of Month", "From Account",
            "To Account", "Transfer Date", "Target Amount", "Current Amount", "Target Date",
            "Color", "Year", "Month", "Limit Amount", "Goal ID", "Goal", "Contribution Date",
            "Note", "Created At", "Updated At", "Plan", "Planned Monthly Income",
            "Installment Plan ID", "Installment Number", "Fixed Payment ID");

    private final TransactionRepository transactionRepository;
    private final FinancialAccountRepository accountRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final InstallmentPlanRepository installmentPlanRepository;
    private final RecurringTransactionRepository recurringRepository;
    private final AccountTransferRepository transferRepository;
    private final SavingsGoalRepository goalRepository;
    private final SavingsGoalContributionRepository contributionRepository;
    private final CategoryBudgetRepository budgetRepository;

    public UserDataExportService(
            TransactionRepository transactionRepository,
            FinancialAccountRepository accountRepository,
            PaymentMethodRepository paymentMethodRepository,
            InstallmentPlanRepository installmentPlanRepository,
            RecurringTransactionRepository recurringRepository,
            AccountTransferRepository transferRepository,
            SavingsGoalRepository goalRepository,
            SavingsGoalContributionRepository contributionRepository,
            CategoryBudgetRepository budgetRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.installmentPlanRepository = installmentPlanRepository;
        this.recurringRepository = recurringRepository;
        this.transferRepository = transferRepository;
        this.goalRepository = goalRepository;
        this.contributionRepository = contributionRepository;
        this.budgetRepository = budgetRepository;
    }

    @Transactional(readOnly = true)
    public String exportAll(User user) {
        List<Map<String, String>> rows = new ArrayList<>();

        rows.add(row("PROFILE",
                "Name", user.getName(),
                "Created At", user.getCreatedAt(),
                "Plan", user.getPlan(),
                "Planned Monthly Income", user.getPlannedMonthlyIncome()));

        accountRepository.findByUserOrderByActiveDescNameAsc(user).forEach(account ->
                rows.add(row("ACCOUNT",
                        "ID", account.getId(),
                        "Name", account.getName(),
                        "Type", account.getType(),
                        "Institution", account.getInstitution(),
                        "Currency", account.getCurrency(),
                        "Opening Balance", account.getOpeningBalance(),
                        "Overdraft Limit", account.getOverdraftLimit(),
                        "Balance Anchor At", account.getBalanceAnchorAt(),
                        "Active", account.isActive(),
                        "Created At", account.getCreatedAt(),
                        "Updated At", account.getUpdatedAt())));

        paymentMethodRepository.findByUserOrderByActiveDescNameAsc(user).forEach(method ->
                rows.add(row("PAYMENT_METHOD",
                        "ID", method.getId(),
                        "Name", method.getName(),
                        "Type", method.getType(),
                        "Issuer", method.getIssuer(),
                        "Active", method.isActive(),
                        "Statement Closing Day", method.getStatementClosingDay(),
                        "Payment Day", method.getPaymentDay(),
                        "Created At", method.getCreatedAt(),
                        "Updated At", method.getUpdatedAt())));

        installmentPlanRepository.findByUser(user).stream()
                .sorted(Comparator.comparing(InstallmentPlan::getId))
                .forEach(plan -> rows.add(installmentRow(plan)));

        recurringRepository.findByUserOrderByIdDesc(user).forEach(recurring ->
                rows.add(row("FIXED_PAYMENT",
                        "ID", recurring.getId(),
                        "Type", recurring.getType(),
                        "Category", recurring.getCategory(),
                        "Description", recurring.getDescription(),
                        "Amount", recurring.getAmount(),
                        "Frequency", recurring.getFrequency(),
                        "Start Date", recurring.getStartDate(),
                        "End Date", recurring.getEndDate(),
                        "Next Run Date", recurring.getNextRunDate(),
                        "Day Of Month", recurring.getDayOfMonth(),
                        "Active", recurring.isActive(),
                        "Account", name(recurring.getAccount()),
                        "Payment Method", name(recurring.getPaymentMethod()))));

        transferRepository.findByUserOrderByTransferDateDescIdDesc(user).forEach(transfer ->
                rows.add(row("TRANSFER",
                        "ID", transfer.getId(),
                        "From Account", transfer.getFromAccount().getName(),
                        "To Account", transfer.getToAccount().getName(),
                        "Amount", transfer.getAmount(),
                        "Transfer Date", transfer.getTransferDate(),
                        "Description", transfer.getDescription(),
                        "Created At", transfer.getCreatedAt())));

        goalRepository.findByUserOrderByArchivedAscTargetDateAscIdDesc(user).forEach(goal ->
                rows.add(row("SAVINGS_GOAL",
                        "ID", goal.getId(),
                        "Name", goal.getName(),
                        "Target Amount", goal.getTargetAmount(),
                        "Current Amount", goal.getCurrentAmount(),
                        "Target Date", goal.getTargetDate(),
                        "Color", goal.getColor(),
                        "Active", !goal.isArchived(),
                        "Created At", goal.getCreatedAt(),
                        "Updated At", goal.getUpdatedAt())));

        contributionRepository.findAllByUser(user).forEach(contribution ->
                rows.add(row("GOAL_CONTRIBUTION",
                        "ID", contribution.getId(),
                        "Goal ID", contribution.getGoal().getId(),
                        "Goal", contribution.getGoal().getName(),
                        "Amount", contribution.getAmount(),
                        "Contribution Date", contribution.getContributionDate(),
                        "Note", contribution.getNote(),
                        "Created At", contribution.getCreatedAt())));

        budgetRepository.findByUserOrderByYearAscMonthAscCategoryAsc(user).forEach(budget ->
                rows.add(row("CATEGORY_BUDGET",
                        "ID", budget.getId(),
                        "Category", budget.getCategory(),
                        "Year", budget.getYear(),
                        "Month", budget.getMonth(),
                        "Limit Amount", budget.getLimitAmount(),
                        "Created At", budget.getCreatedAt(),
                        "Updated At", budget.getUpdatedAt())));

        transactionRepository.findByUser(user).stream()
                .sorted(Comparator.comparing(
                                (Transaction transaction) -> transaction.getTransactionDate() != null
                                        ? transaction.getTransactionDate()
                                        : LocalDate.MIN)
                        .thenComparing(transaction -> transaction.getId() != null
                                ? transaction.getId()
                                : 0L))
                .forEach(transaction -> rows.add(row("TRANSACTION",
                        "ID", transaction.getId(),
                        "Date", transaction.getTransactionDate(),
                        "Type", transaction.getType(),
                        "Category", transaction.getCategory(),
                        "Description", transaction.getDescription(),
                        "Amount", transaction.getAmount(),
                        "Payment Method", name(transaction.getPaymentMethod()),
                        "Account", name(transaction.getAccount()),
                        "Payment Date", transaction.getPaymentDate(),
                        "Status", transaction.getStatus(),
                        "Installment Plan ID", id(transaction.getInstallmentPlan()),
                        "Installment Number", transaction.getInstallmentNumber(),
                        "Fixed Payment ID", id(transaction.getRecurringTransaction()))));

        StringBuilder csv = new StringBuilder("\ufeff");
        appendCsvRow(csv, HEADERS);
        rows.forEach(row -> appendCsvRow(csv, HEADERS.stream()
                .map(header -> row.getOrDefault(header, ""))
                .toList()));
        return csv.toString();
    }

    private Map<String, String> installmentRow(InstallmentPlan plan) {
        List<Transaction> transactions = plan.getTransactions().stream()
                .sorted(Comparator.comparing(
                                (Transaction transaction) -> transaction.getInstallmentNumber() != null
                                        ? transaction.getInstallmentNumber()
                                        : Integer.MAX_VALUE)
                        .thenComparing(transaction -> transaction.getTransactionDate() != null
                                ? transaction.getTransactionDate()
                                : LocalDate.MAX))
                .toList();
        Transaction first = transactions.isEmpty() ? null : transactions.get(0);
        Transaction last = transactions.isEmpty() ? null : transactions.get(transactions.size() - 1);
        return row("INSTALLMENT_PLAN",
                "ID", plan.getId(),
                "Description", first != null ? first.getDescription() : null,
                "Category", first != null ? first.getCategory() : null,
                "Total Installments", plan.getTotalInstallments(),
                "Installment Value", plan.getInstallmentValue(),
                "Total Amount", plan.getTotalAmount(),
                "First Date", first != null ? first.getTransactionDate() : null,
                "Last Date", last != null ? last.getTransactionDate() : null,
                "Account", name(plan.getAccount()),
                "Payment Method", name(plan.getPaymentMethod()));
    }

    private Map<String, String> row(String recordType, Object... values) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("Record Type", recordType);
        for (int index = 0; index < values.length; index += 2) {
            row.put(String.valueOf(values[index]), value(values[index + 1]));
        }
        return row;
    }

    private String name(FinancialAccount account) {
        return account != null ? account.getName() : "";
    }

    private String name(PaymentMethod method) {
        return method != null ? method.getName() : "";
    }

    private Long id(InstallmentPlan plan) {
        return plan != null ? plan.getId() : null;
    }

    private Long id(RecurringTransaction recurring) {
        return recurring != null ? recurring.getId() : null;
    }

    private String value(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private void appendCsvRow(StringBuilder csv, List<String> values) {
        for (int index = 0; index < values.size(); index++) {
            if (index > 0) {
                csv.append(',');
            }
            csv.append(csvCell(values.get(index)));
        }
        csv.append("\r\n");
    }

    private String csvCell(String value) {
        if (value.indexOf(',') >= 0 || value.indexOf('"') >= 0
                || value.indexOf('\n') >= 0 || value.indexOf('\r') >= 0) {
            return '"' + value.replace("\"", "\"\"") + '"';
        }
        return value;
    }
}
