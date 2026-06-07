package com.example.budget.service;

import com.example.budget.dto.CashFlowForecastDTO;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.*;
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
import java.util.List;
import java.util.Map;

/**
 * Builds a forward-looking cash-flow forecast for the planning page.
 *
 * <p>The forecast is intentionally a <b>flow</b> projection: it answers
 * "how much money will move in and out each future month", never "what will my
 * balance be". It does not anchor on the current account balance, so it never
 * conflates the live account snapshot (the Accounts page) with the realised
 * period figures (the Dashboard).</p>
 *
 * <p>It starts on the <b>next full month</b> and runs for {@link #FORECAST_MONTHS}
 * months. The current, partially-elapsed month is left out on purpose: it is
 * already covered by the dashboard, and estimating "the rest of this month"
 * produces noisy, low-trust numbers.</p>
 *
 * <p>Each month separates committed amounts (scheduled fixed payments and
 * installments — high confidence) from estimated amounts (recent monthly
 * average — clearly a forecast), and reports how much of the projected movement
 * is committed via {@code confidencePercent}.</p>
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

    /**
     * Sets (or clears, with {@code null}) the user's global expected monthly income
     * and returns the recalculated forecast.
     */
    @Transactional
    public CashFlowForecastDTO updateIncomePlan(User principal, BigDecimal plannedMonthlyIncome) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new EntityNotFoundException("User", principal.getId()));
        boolean cleared = plannedMonthlyIncome == null || plannedMonthlyIncome.signum() <= 0;
        user.setPlannedMonthlyIncome(cleared ? null : plannedMonthlyIncome);
        return forecast(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public CashFlowForecastDTO forecast(User user) {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        YearMonth firstHistoryMonth = currentMonth.minusMonths(HISTORY_MONTHS);
        YearMonth lastHistoryMonth = currentMonth.minusMonths(1);
        YearMonth firstForecastMonth = currentMonth.plusMonths(1);
        YearMonth lastForecastMonth = currentMonth.plusMonths(FORECAST_MONTHS);
        LocalDate forecastStart = firstForecastMonth.atDay(1);
        LocalDate forecastEnd = lastForecastMonth.atEndOfMonth();

        List<Transaction> historyTransactions = transactionRepository
                .findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                        user,
                        firstHistoryMonth.atDay(1),
                        lastHistoryMonth.atEndOfMonth())
                .stream()
                .filter(this::isSettledStandaloneTransaction)
                .toList();

        List<YearMonth> basisMonths = historyMonthsWithActivity(
                historyTransactions, firstHistoryMonth);
        BigDecimal averageIncome = monthlyAverage(
                historyTransactions, TransactionType.INCOME, basisMonths.size());
        BigDecimal averageVariableExpense = monthlyAverage(
                historyTransactions, TransactionType.EXPENSE, basisMonths.size());

        // Predictable-but-not-fixed income: when the user declares an expected
        // monthly income (e.g. a gig-work target), use it instead of the history
        // average so the forecast reflects their plan, not just the past.
        BigDecimal plannedMonthlyIncome = user.getPlannedMonthlyIncome();
        boolean hasIncomePlan = plannedMonthlyIncome != null
                && plannedMonthlyIncome.signum() > 0;
        BigDecimal monthlyVariableIncome = hasIncomePlan ? plannedMonthlyIncome : averageIncome;

        // Anchor: the live total balance across all accounts. The projection rolls
        // this forward month by month so it can answer "when does my money run out".
        BigDecimal currentTotalBalance = accountService.summary(user).totalBalance();

        Map<YearMonth, BigDecimal> installmentExpenses = new HashMap<>();
        addPersistedInstallments(installmentExpenses, user, forecastStart, forecastEnd);

        Map<YearMonth, BigDecimal> fixedIncome = new HashMap<>();
        Map<YearMonth, BigDecimal> fixedExpenses = new HashMap<>();
        addRecurring(fixedIncome, fixedExpenses, user, forecastStart, forecastEnd);

        List<CashFlowForecastDTO.MonthForecast> months = new ArrayList<>();
        BigDecimal cumulativeNet = BigDecimal.ZERO;
        for (int offset = 0; offset < FORECAST_MONTHS; offset++) {
            YearMonth month = firstForecastMonth.plusMonths(offset);
            BigDecimal monthFixedIncome = fixedIncome.getOrDefault(month, BigDecimal.ZERO);
            BigDecimal monthFixedExpense = fixedExpenses.getOrDefault(month, BigDecimal.ZERO);
            BigDecimal monthInstallmentExpense = installmentExpenses.getOrDefault(
                    month, BigDecimal.ZERO);

            BigDecimal committedNet = monthFixedIncome
                    .subtract(monthFixedExpense)
                    .subtract(monthInstallmentExpense);
            BigDecimal estimatedNet = monthlyVariableIncome.subtract(averageVariableExpense);
            BigDecimal netCashFlow = committedNet.add(estimatedNet);
            cumulativeNet = cumulativeNet.add(netCashFlow);
            BigDecimal projectedClosingBalance = currentTotalBalance.add(cumulativeNet);

            BigDecimal committedGross = monthFixedIncome
                    .add(monthFixedExpense)
                    .add(monthInstallmentExpense);
            BigDecimal estimatedGross = monthlyVariableIncome.add(averageVariableExpense);
            int confidencePercent = confidence(committedGross, estimatedGross);

            months.add(new CashFlowForecastDTO.MonthForecast(
                    month.toString(),
                    month.atEndOfMonth(),
                    monthFixedIncome,
                    monthlyVariableIncome,
                    monthFixedExpense,
                    monthInstallmentExpense,
                    averageVariableExpense,
                    committedNet,
                    estimatedNet,
                    netCashFlow,
                    projectedClosingBalance,
                    confidencePercent,
                    projectedClosingBalance.signum() < 0));
        }

        return new CashFlowForecastDTO(
                currentTotalBalance,
                basisMonths.stream().map(YearMonth::toString).toList(),
                !basisMonths.isEmpty(),
                averageIncome,
                averageVariableExpense,
                hasIncomePlan,
                hasIncomePlan ? plannedMonthlyIncome : null,
                months);
    }

    private void addPersistedInstallments(
            Map<YearMonth, BigDecimal> installmentExpenses,
            User user,
            LocalDate start,
            LocalDate end) {
        for (Transaction transaction : transactionRepository
                .findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(user, start, end)) {
            if (transaction.getAccount() == null
                    || transaction.getInstallmentPlan() == null
                    || transaction.getType() != TransactionType.EXPENSE) {
                continue;
            }
            addAmount(
                    installmentExpenses,
                    YearMonth.from(transaction.getPaymentDate()),
                    transaction.getAmount());
        }
    }

    private void addRecurring(
            Map<YearMonth, BigDecimal> fixedIncome,
            Map<YearMonth, BigDecimal> fixedExpenses,
            User user,
            LocalDate start,
            LocalDate end) {
        for (RecurringTransaction recurring : recurringRepository.findByUserOrderByIdDesc(user)) {
            if (!recurring.isActive() || recurring.getAccount() == null) continue;
            LocalDate date = recurring.getNextRunDate();
            while (date != null && !date.isAfter(end)) {
                LocalDate paymentDate = creditCardBillingService.resolvePaymentDate(
                        date,
                        recurring.getPaymentMethod());
                if (!paymentDate.isBefore(start)
                        && !paymentDate.isAfter(end)
                        && (recurring.getEndDate() == null || !date.isAfter(recurring.getEndDate()))) {
                    Map<YearMonth, BigDecimal> target =
                            recurring.getType() == TransactionType.INCOME
                                    ? fixedIncome
                                    : fixedExpenses;
                    addAmount(
                            target,
                            YearMonth.from(paymentDate),
                            recurring.getAmount());
                }
                date = nextMonthlyDate(date, recurring.getDayOfMonth());
            }
        }
    }

    private boolean isSettledStandaloneTransaction(Transaction transaction) {
        return transaction.getAccount() != null
                && transaction.getInstallmentPlan() == null
                && transaction.getRecurringTransaction() == null
                && transaction.getStatus() != null
                && transaction.getStatus().affectsCurrentBalance();
    }

    private List<YearMonth> historyMonthsWithActivity(
            List<Transaction> transactions, YearMonth firstHistoryMonth) {
        List<YearMonth> months = new ArrayList<>();
        for (int offset = 0; offset < HISTORY_MONTHS; offset++) {
            YearMonth month = firstHistoryMonth.plusMonths(offset);
            boolean hasActivity = transactions.stream()
                    .anyMatch(transaction ->
                            YearMonth.from(transaction.getPaymentDate()).equals(month));
            if (hasActivity) {
                months.add(month);
            }
        }
        return months;
    }

    private BigDecimal monthlyAverage(
            List<Transaction> transactions, TransactionType type, int monthCount) {
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

    /**
     * Share of the month's projected gross movement that is committed (scheduled),
     * as a 0-100 percentage. Returns 0 when there is no projected movement at all.
     */
    private int confidence(BigDecimal committedGross, BigDecimal estimatedGross) {
        BigDecimal total = committedGross.add(estimatedGross);
        if (total.signum() == 0) {
            return 0;
        }
        return committedGross
                .multiply(BigDecimal.valueOf(100))
                .divide(total, 0, RoundingMode.HALF_UP)
                .intValue();
    }

    private void addAmount(
            Map<YearMonth, BigDecimal> amounts, YearMonth month, BigDecimal amount) {
        amounts.merge(month, amount, BigDecimal::add);
    }

    private LocalDate nextMonthlyDate(LocalDate currentDate, int targetDay) {
        YearMonth next = YearMonth.from(currentDate).plusMonths(1);
        return next.atDay(Math.min(targetDay, next.lengthOfMonth()));
    }
}
