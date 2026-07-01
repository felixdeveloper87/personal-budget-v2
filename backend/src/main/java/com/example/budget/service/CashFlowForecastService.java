package com.example.budget.service;

import com.example.budget.dto.CashFlowForecastDTO;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.RecurringTransaction;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.repository.RecurringTransactionRepository;
import com.example.budget.repository.TransactionRepository;
import com.example.budget.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Builds a month-by-month balance ledger for the planning page.
 *
 * <p>The forecast starts at the live total across active accounts, then applies
 * every balance-affecting transaction due from today onwards. One-off future
 * transactions, installments and recurring commitments therefore appear in the
 * actual month in which they will change the account balance.</p>
 *
 * <p>Recurring rules fill only dates without a generated transaction row, which
 * prevents double counting. Historical averages remain in the response as
 * context, but never change the projected balance. The optional income plan is
 * the only assumption: it tops up a future month only when confirmed income is
 * below the declared target.</p>
 */
@Service
public class CashFlowForecastService {
    private static final int HISTORY_MONTHS = 3;
    private static final int FORECAST_MONTHS = 12;

    private final FinancialAccountService accountService;
    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringRepository;
    private final CreditCardBillingService creditCardBillingService;
    private final UserRepository userRepository;

    public CashFlowForecastService(
            FinancialAccountService accountService,
            TransactionRepository transactionRepository,
            RecurringTransactionRepository recurringRepository,
            CreditCardBillingService creditCardBillingService,
            UserRepository userRepository) {
        this.accountService = accountService;
        this.transactionRepository = transactionRepository;
        this.recurringRepository = recurringRepository;
        this.creditCardBillingService = creditCardBillingService;
        this.userRepository = userRepository;
    }

    @Transactional
    public CashFlowForecastDTO updateIncomePlan(User principal, BigDecimal plannedMonthlyIncome) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new EntityNotFoundException("User", principal.getId()));
        boolean cleared = plannedMonthlyIncome == null || plannedMonthlyIncome.signum() <= 0;
        user.setPlannedMonthlyIncome(cleared ? null : plannedMonthlyIncome);
        return forecast(userRepository.save(user));
    }

    @Transactional
    public CashFlowForecastDTO updateExpensePlan(User principal, BigDecimal plannedMonthlyVariableExpense) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new EntityNotFoundException("User", principal.getId()));
        boolean cleared = plannedMonthlyVariableExpense == null || plannedMonthlyVariableExpense.signum() <= 0;
        user.setPlannedMonthlyVariableExpense(cleared ? null : plannedMonthlyVariableExpense);
        return forecast(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public CashFlowForecastDTO forecast(User user) {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        YearMonth firstHistoryMonth = currentMonth.minusMonths(HISTORY_MONTHS);
        YearMonth lastHistoryMonth = currentMonth.minusMonths(1);
        YearMonth lastForecastMonth = currentMonth.plusMonths(FORECAST_MONTHS - 1L);
        LocalDate forecastEnd = lastForecastMonth.atEndOfMonth();

        List<Transaction> historyTransactions = transactionRepository
                .findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                        user,
                        firstHistoryMonth.atDay(1),
                        lastHistoryMonth.atEndOfMonth())
                .stream()
                .filter(this::isSettledStandaloneTransaction)
                .toList();
        List<YearMonth> basisMonths = historyMonthsWithActivity(historyTransactions, firstHistoryMonth);
        BigDecimal averageIncome = monthlyAverage(
                historyTransactions, TransactionType.INCOME, basisMonths.size());
        BigDecimal averageVariableExpense = monthlyAverage(
                historyTransactions, TransactionType.EXPENSE, basisMonths.size());

        BigDecimal plannedMonthlyIncome = user.getPlannedMonthlyIncome();
        boolean hasIncomePlan = plannedMonthlyIncome != null && plannedMonthlyIncome.signum() > 0;
        BigDecimal plannedMonthlyVariableExpense = user.getPlannedMonthlyVariableExpense();
        boolean hasExpensePlan = plannedMonthlyVariableExpense != null && plannedMonthlyVariableExpense.signum() > 0;
        BigDecimal currentTotalBalance = accountService.summary(user).totalBalance();

        Map<YearMonth, BigDecimal> scheduledIncome = new HashMap<>();
        Map<YearMonth, BigDecimal> scheduledExpenses = new HashMap<>();
        Map<YearMonth, BigDecimal> installmentExpenses = new HashMap<>();
        Map<YearMonth, BigDecimal> incomeReceived = new HashMap<>();
        Map<YearMonth, BigDecimal> expensesPaid = new HashMap<>();
        // Day-to-day only (excludes installment/recurring charges) — the baseline
        // an expense plan tops up, mirroring how the income plan nets against
        // income already received. Without this split, an installment or fixed
        // payment settling this month would silently eat into the day-to-day
        // estimate's top-up.
        Map<YearMonth, BigDecimal> dayToDayExpensesPaid = new HashMap<>();
        Set<String> persistedRecurringPayments = addPersistedTransactions(
                scheduledIncome,
                scheduledExpenses,
                installmentExpenses,
                incomeReceived,
                expensesPaid,
                dayToDayExpensesPaid,
                user,
                currentMonth.atDay(1),
                today,
                forecastEnd);
        addMissingRecurringTransactions(
                scheduledIncome,
                scheduledExpenses,
                user,
                today,
                forecastEnd,
                persistedRecurringPayments);

        List<CashFlowForecastDTO.MonthForecast> months = new ArrayList<>();
        BigDecimal projectedBalance = currentTotalBalance;
        for (int offset = 0; offset < FORECAST_MONTHS; offset++) {
            YearMonth month = currentMonth.plusMonths(offset);
            BigDecimal monthIncome = scheduledIncome.getOrDefault(month, BigDecimal.ZERO);
            BigDecimal monthExpense = scheduledExpenses.getOrDefault(month, BigDecimal.ZERO);
            BigDecimal monthInstallments = installmentExpenses.getOrDefault(month, BigDecimal.ZERO);
            BigDecimal monthIncomeReceived = incomeReceived.getOrDefault(month, BigDecimal.ZERO);
            BigDecimal monthExpensesPaid = expensesPaid.getOrDefault(month, BigDecimal.ZERO);
            BigDecimal monthDayToDaySpent = dayToDayExpensesPaid.getOrDefault(month, BigDecimal.ZERO);
            // In the current month, income already received is part of the live
            // account balance. The plan therefore contributes only the amount still
            // needed to reach the user's monthly target; it never re-adds income
            // that has already happened.
            BigDecimal plannedIncomeTopUp = hasIncomePlan
                    ? plannedMonthlyIncome
                            .subtract(monthIncomeReceived.add(monthIncome))
                            .max(BigDecimal.ZERO)
                    : BigDecimal.ZERO;
            // Same idea in the other direction: the expense plan only adds the
            // remainder of the day-to-day estimate not yet spent this month. Future
            // months have no day-to-day activity recorded, so they get the full
            // estimate on top of fixed expenses and installments.
            BigDecimal plannedExpenseTopUp = hasExpensePlan
                    ? plannedMonthlyVariableExpense.subtract(monthDayToDaySpent).max(BigDecimal.ZERO)
                    : BigDecimal.ZERO;

            BigDecimal committedNet = monthIncome.subtract(monthExpense).subtract(monthInstallments);
            BigDecimal estimatedNet = plannedIncomeTopUp.subtract(plannedExpenseTopUp);
            BigDecimal netCashFlow = committedNet.add(estimatedNet);
            projectedBalance = projectedBalance.add(netCashFlow);

            BigDecimal committedGross = monthIncome.add(monthExpense).add(monthInstallments);
            int confidencePercent = confidence(committedGross, plannedIncomeTopUp.add(plannedExpenseTopUp));
            months.add(new CashFlowForecastDTO.MonthForecast(
                    month.toString(),
                    month.atEndOfMonth(),
                    monthIncome,
                    plannedIncomeTopUp,
                    monthExpense,
                    monthInstallments,
                    plannedExpenseTopUp,
                    committedNet,
                    estimatedNet,
                    netCashFlow,
                    projectedBalance,
                    confidencePercent,
                    projectedBalance.signum() < 0,
                    monthIncomeReceived,
                    monthExpensesPaid));
        }

        return new CashFlowForecastDTO(
                currentTotalBalance,
                basisMonths.stream().map(YearMonth::toString).toList(),
                !basisMonths.isEmpty(),
                averageIncome,
                averageVariableExpense,
                hasIncomePlan,
                hasIncomePlan ? plannedMonthlyIncome : null,
                hasExpensePlan,
                hasExpensePlan ? plannedMonthlyVariableExpense : null,
                months);
    }

    private Set<String> addPersistedTransactions(
            Map<YearMonth, BigDecimal> income,
            Map<YearMonth, BigDecimal> expenses,
            Map<YearMonth, BigDecimal> installments,
            Map<YearMonth, BigDecimal> incomeReceived,
            Map<YearMonth, BigDecimal> expensesPaid,
            Map<YearMonth, BigDecimal> dayToDayExpensesPaid,
            User user,
            LocalDate currentMonthStart,
            LocalDate today,
            LocalDate end) {
        Set<String> recurringPayments = new HashSet<>();
        for (Transaction transaction : transactionRepository
                .findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(user, currentMonthStart, end)) {
            if (transaction.getRecurringTransaction() != null) {
                recurringPayments.add(recurringPaymentKey(
                        transaction.getRecurringTransaction().getId(), transaction.getPaymentDate()));
            }
            if (isSettledBalanceTransaction(transaction, today)) {
                Map<YearMonth, BigDecimal> actualTarget = transaction.getType() == TransactionType.INCOME
                        ? incomeReceived
                        : expensesPaid;
                addAmount(actualTarget, YearMonth.from(transaction.getPaymentDate()), transaction.getAmount());
                if (transaction.getType() != TransactionType.INCOME
                        && transaction.getInstallmentPlan() == null
                        && transaction.getRecurringTransaction() == null) {
                    addAmount(dayToDayExpensesPaid, YearMonth.from(transaction.getPaymentDate()), transaction.getAmount());
                }
                continue;
            }
            if (!isFutureBalanceTransaction(transaction, today)) {
                continue;
            }
            YearMonth month = YearMonth.from(transaction.getPaymentDate());
            if (transaction.getType() == TransactionType.INCOME) {
                addAmount(income, month, transaction.getAmount());
            } else if (transaction.getInstallmentPlan() != null) {
                addAmount(installments, month, transaction.getAmount());
            } else {
                addAmount(expenses, month, transaction.getAmount());
            }
        }
        return recurringPayments;
    }

    private void addMissingRecurringTransactions(
            Map<YearMonth, BigDecimal> income,
            Map<YearMonth, BigDecimal> expenses,
            User user,
            LocalDate start,
            LocalDate end,
            Set<String> persistedRecurringPayments) {
        for (RecurringTransaction recurring : recurringRepository.findByUserOrderByIdDesc(user)) {
            if (!recurring.isActive()
                    || recurring.getAccount() == null
                    || !recurring.getAccount().isActive()) {
                continue;
            }

            LocalDate date = firstRecurringDateOnOrAfter(recurring, start.minusMonths(1));
            while (date != null && !date.isAfter(end)) {
                LocalDate paymentDate = creditCardBillingService.resolvePaymentDate(
                        date,
                        recurring.getPaymentMethod());
                if (!paymentDate.isBefore(start)
                        && !paymentDate.isAfter(end)
                        && !persistedRecurringPayments.contains(
                                recurringPaymentKey(recurring.getId(), paymentDate))
                        && (recurring.getEndDate() == null || !paymentDate.isAfter(recurring.getEndDate()))) {
                    Map<YearMonth, BigDecimal> target = recurring.getType() == TransactionType.INCOME
                            ? income
                            : expenses;
                    addAmount(target, YearMonth.from(paymentDate), recurring.getAmount());
                }
                date = nextMonthlyDate(date, recurring.getDayOfMonth());
            }
        }
    }

    private LocalDate firstRecurringDateOnOrAfter(RecurringTransaction recurring, LocalDate lowerBound) {
        YearMonth month = YearMonth.from(lowerBound);
        LocalDate candidate = month.atDay(Math.min(recurring.getDayOfMonth(), month.lengthOfMonth()));
        if (candidate.isBefore(lowerBound)) {
            candidate = nextMonthlyDate(candidate, recurring.getDayOfMonth());
        }

        LocalDate startDate = recurring.getStartDate();
        if (candidate.isBefore(startDate)) {
            YearMonth startMonth = YearMonth.from(startDate);
            candidate = startMonth.atDay(Math.min(recurring.getDayOfMonth(), startMonth.lengthOfMonth()));
            if (candidate.isBefore(startDate)) {
                candidate = nextMonthlyDate(candidate, recurring.getDayOfMonth());
            }
        }
        return candidate;
    }

    private boolean isSettledStandaloneTransaction(Transaction transaction) {
        return transaction.getAccount() != null
                && transaction.getInstallmentPlan() == null
                && transaction.getRecurringTransaction() == null
                && transaction.getStatus() != null
                && transaction.getStatus().affectsCurrentBalance();
    }

    private boolean isFutureBalanceTransaction(Transaction transaction, LocalDate today) {
        if (transaction.getAccount() == null || !transaction.getAccount().isActive()) {
            return false;
        }
        if (transaction.getPaymentDate().isAfter(today)) {
            return true;
        }
        return transaction.getPaymentDate().isEqual(today)
                && (transaction.getStatus() == null || !transaction.getStatus().affectsCurrentBalance());
    }

    private boolean isSettledBalanceTransaction(Transaction transaction, LocalDate today) {
        return transaction.getAccount() != null
                && transaction.getAccount().isActive()
                && !transaction.getPaymentDate().isAfter(today)
                && transaction.getStatus() != null
                && transaction.getStatus().affectsCurrentBalance();
    }

    private List<YearMonth> historyMonthsWithActivity(
            List<Transaction> transactions, YearMonth firstHistoryMonth) {
        List<YearMonth> months = new ArrayList<>();
        for (int offset = 0; offset < HISTORY_MONTHS; offset++) {
            YearMonth month = firstHistoryMonth.plusMonths(offset);
            if (transactions.stream().anyMatch(transaction ->
                    YearMonth.from(transaction.getPaymentDate()).equals(month))) {
                months.add(month);
            }
        }
        return months;
    }

    private BigDecimal monthlyAverage(List<Transaction> transactions, TransactionType type, int monthCount) {
        if (monthCount == 0) {
            return BigDecimal.ZERO;
        }
        return sumByType(transactions, type)
                .divide(BigDecimal.valueOf(monthCount), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal sumByType(List<Transaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(transaction -> transaction.getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private int confidence(BigDecimal committedGross, BigDecimal estimatedGross) {
        BigDecimal total = committedGross.add(estimatedGross);
        if (total.signum() == 0) {
            return 0;
        }
        return committedGross.multiply(BigDecimal.valueOf(100))
                .divide(total, 0, RoundingMode.HALF_UP)
                .intValue();
    }

    private void addAmount(Map<YearMonth, BigDecimal> amounts, YearMonth month, BigDecimal amount) {
        amounts.merge(month, amount, BigDecimal::add);
    }

    private String recurringPaymentKey(Long recurringId, LocalDate paymentDate) {
        return recurringId + ":" + paymentDate;
    }

    private LocalDate nextMonthlyDate(LocalDate currentDate, int targetDay) {
        YearMonth next = YearMonth.from(currentDate).plusMonths(1);
        return next.atDay(Math.min(targetDay, next.lengthOfMonth()));
    }
}
