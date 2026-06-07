package com.example.budget.service;

import com.example.budget.dto.CashFlowForecastDTO;
import com.example.budget.dto.FinancialAccountDTO;
import com.example.budget.model.*;
import com.example.budget.repository.AccountTransferRepository;
import com.example.budget.repository.RecurringTransactionRepository;
import com.example.budget.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class CashFlowForecastService {
    private static final List<Integer> FORECAST_HORIZONS = List.of(30, 60, 90);

    private final FinancialAccountService accountService;
    private final TransactionRepository transactionRepository;
    private final AccountTransferRepository transferRepository;
    private final RecurringTransactionRepository recurringRepository;
    private final CreditCardBillingService creditCardBillingService;

    public CashFlowForecastService(
            FinancialAccountService accountService,
            TransactionRepository transactionRepository,
            AccountTransferRepository transferRepository,
            RecurringTransactionRepository recurringRepository,
            CreditCardBillingService creditCardBillingService) {
        this.accountService = accountService;
        this.transactionRepository = transactionRepository;
        this.transferRepository = transferRepository;
        this.recurringRepository = recurringRepository;
        this.creditCardBillingService = creditCardBillingService;
    }

    @Transactional(readOnly = true)
    public CashFlowForecastDTO forecast(User user) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.plusDays(1);
        LocalDate end = today.plusDays(90);
        YearMonth projectionBasisMonth = YearMonth.from(today).minusMonths(1);
        BigDecimal current = accountService.summary(user).accounts().stream()
                .filter(FinancialAccountDTO::active)
                .map(FinancialAccountDTO::currentBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Transaction> previousMonthTransactions = transactionRepository
                .findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                        user,
                        projectionBasisMonth.atDay(1),
                        projectionBasisMonth.atEndOfMonth());
        List<Transaction> projectionBasis = previousMonthTransactions.stream()
                .filter(this::isSettledStandaloneTransaction)
                .toList();
        BigDecimal projectedMonthlyIncome = sumByType(projectionBasis, TransactionType.INCOME);
        BigDecimal projectedMonthlyExpense = sumByType(projectionBasis, TransactionType.EXPENSE);

        List<CashFlowForecastDTO.Event> events = new ArrayList<>();
        addPersistedInstallments(events, user, start, end);
        addTransfers(events, user, start, end);
        addRecurring(events, user, start, end);
        addMonthlyEstimateEvents(
                events,
                today,
                projectedMonthlyIncome,
                projectedMonthlyExpense);
        events.sort(Comparator.comparing(CashFlowForecastDTO.Event::date)
                .thenComparing(CashFlowForecastDTO.Event::description));

        List<CashFlowForecastDTO.Horizon> horizons = FORECAST_HORIZONS.stream()
                .map(days -> {
                    LocalDate date = today.plusDays(days);
                    BigDecimal expected = current.add(events.stream()
                            .filter(event -> !event.date().isAfter(date))
                            .map(CashFlowForecastDTO.Event::amount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add));
                    return new CashFlowForecastDTO.Horizon(
                            days, date, expected, expected.signum() < 0);
                })
                .toList();
        return new CashFlowForecastDTO(
                current,
                projectionBasisMonth.toString(),
                !projectionBasis.isEmpty(),
                projectedMonthlyIncome,
                projectedMonthlyExpense,
                horizons,
                events);
    }

    private void addPersistedInstallments(
            List<CashFlowForecastDTO.Event> events, User user, LocalDate start, LocalDate end) {
        for (Transaction transaction : transactionRepository
                .findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(user, start, end)) {
            if (transaction.getAccount() == null || transaction.getInstallmentPlan() == null) continue;
            BigDecimal signed = transaction.getType() == TransactionType.INCOME
                    ? transaction.getAmount()
                    : transaction.getAmount().negate();
            events.add(new CashFlowForecastDTO.Event(
                    transaction.getPaymentDate(),
                    "INSTALLMENT",
                    transaction.getDescription(),
                    signed,
                    transaction.getAccount().getId(),
                    transaction.getAccount().getName(),
                    transaction.getCategory()));
        }
    }

    private void addMonthlyEstimateEvents(
            List<CashFlowForecastDTO.Event> events,
            LocalDate today,
            BigDecimal projectedMonthlyIncome,
            BigDecimal projectedMonthlyExpense) {
        for (Integer days : FORECAST_HORIZONS) {
            LocalDate projectedDate = today.plusDays(days);
            if (projectedMonthlyIncome.signum() > 0) {
                events.add(new CashFlowForecastDTO.Event(
                        projectedDate,
                        "ESTIMATE",
                        "Estimated monthly income",
                        projectedMonthlyIncome,
                        null,
                        null,
                        "Income estimate"));
            }
            if (projectedMonthlyExpense.signum() > 0) {
                events.add(new CashFlowForecastDTO.Event(
                        projectedDate,
                        "ESTIMATE",
                        "Estimated variable spending",
                        projectedMonthlyExpense.negate(),
                        null,
                        null,
                        "Expense estimate"));
            }
        }
    }

    private void addTransfers(
            List<CashFlowForecastDTO.Event> events, User user, LocalDate start, LocalDate end) {
        for (AccountTransfer transfer : transferRepository
                .findByUserAndTransferDateBetweenOrderByTransferDateAscIdAsc(user, start, end)) {
            events.add(new CashFlowForecastDTO.Event(
                    transfer.getTransferDate(), "TRANSFER",
                    "Transfer to " + transfer.getToAccount().getName(),
                    transfer.getAmount().negate(),
                    transfer.getFromAccount().getId(),
                    transfer.getFromAccount().getName(),
                    "Transfer"));
            events.add(new CashFlowForecastDTO.Event(
                    transfer.getTransferDate(), "TRANSFER",
                    "Transfer from " + transfer.getFromAccount().getName(),
                    transfer.getAmount(),
                    transfer.getToAccount().getId(),
                    transfer.getToAccount().getName(),
                    "Transfer"));
        }
    }

    private void addRecurring(
            List<CashFlowForecastDTO.Event> events, User user, LocalDate start, LocalDate end) {
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
                    BigDecimal signed = recurring.getType() == TransactionType.INCOME
                            ? recurring.getAmount()
                            : recurring.getAmount().negate();
                    events.add(new CashFlowForecastDTO.Event(
                            paymentDate, "RECURRING", recurring.getDescription(), signed,
                            recurring.getAccount().getId(), recurring.getAccount().getName(),
                            recurring.getCategory()));
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

    private BigDecimal sumByType(List<Transaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(transaction -> transaction.getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private LocalDate nextMonthlyDate(LocalDate currentDate, int targetDay) {
        YearMonth next = YearMonth.from(currentDate).plusMonths(1);
        return next.atDay(Math.min(targetDay, next.lengthOfMonth()));
    }
}
