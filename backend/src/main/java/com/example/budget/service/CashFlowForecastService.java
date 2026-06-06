package com.example.budget.service;

import com.example.budget.dto.CashFlowForecastDTO;
import com.example.budget.dto.FinancialAccountDTO;
import com.example.budget.model.*;
import com.example.budget.repository.AccountTransferRepository;
import com.example.budget.repository.CategoryBudgetRepository;
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
    private final FinancialAccountService accountService;
    private final TransactionRepository transactionRepository;
    private final AccountTransferRepository transferRepository;
    private final RecurringTransactionRepository recurringRepository;
    private final CategoryBudgetRepository budgetRepository;
    private final CreditCardBillingService creditCardBillingService;

    public CashFlowForecastService(
            FinancialAccountService accountService,
            TransactionRepository transactionRepository,
            AccountTransferRepository transferRepository,
            RecurringTransactionRepository recurringRepository,
            CategoryBudgetRepository budgetRepository,
            CreditCardBillingService creditCardBillingService) {
        this.accountService = accountService;
        this.transactionRepository = transactionRepository;
        this.transferRepository = transferRepository;
        this.recurringRepository = recurringRepository;
        this.budgetRepository = budgetRepository;
        this.creditCardBillingService = creditCardBillingService;
    }

    @Transactional(readOnly = true)
    public CashFlowForecastDTO forecast(User user) {
        LocalDate today = LocalDate.now();
        LocalDate end = today.plusDays(90);
        BigDecimal current = accountService.summary(user).accounts().stream()
                .filter(FinancialAccountDTO::active)
                .map(FinancialAccountDTO::currentBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CashFlowForecastDTO.Event> events = new ArrayList<>();
        addPersistedTransactions(events, user, today.plusDays(1), end);
        addTransfers(events, user, today.plusDays(1), end);
        addRecurring(events, user, today.plusDays(1), end);
        addBudgetRemainders(events, user, today, end);
        events.sort(Comparator.comparing(CashFlowForecastDTO.Event::date)
                .thenComparing(CashFlowForecastDTO.Event::description));

        List<CashFlowForecastDTO.Horizon> horizons = List.of(30, 60, 90).stream()
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
        return new CashFlowForecastDTO(current, horizons, events);
    }

    private void addPersistedTransactions(
            List<CashFlowForecastDTO.Event> events, User user, LocalDate start, LocalDate end) {
        for (Transaction transaction : transactionRepository
                .findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(user, start, end)) {
            if (transaction.getAccount() == null) continue;
            BigDecimal signed = transaction.getType() == TransactionType.INCOME
                    ? transaction.getAmount()
                    : transaction.getAmount().negate();
            String kind = transaction.getInstallmentPlan() != null
                    ? "INSTALLMENT"
                    : transaction.getRecurringTransaction() != null ? "RECURRING" : "TRANSACTION";
            events.add(new CashFlowForecastDTO.Event(
                    transaction.getPaymentDate(),
                    kind,
                    transaction.getDescription(),
                    signed,
                    transaction.getAccount().getId(),
                    transaction.getAccount().getName(),
                    transaction.getCategory()));
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

    private void addBudgetRemainders(
            List<CashFlowForecastDTO.Event> events, User user, LocalDate start, LocalDate end) {
        YearMonth first = YearMonth.from(start);
        YearMonth last = YearMonth.from(end);
        for (YearMonth month = first; !month.isAfter(last); month = month.plusMonths(1)) {
            LocalDate eventDate = month.atEndOfMonth();
            if (eventDate.isBefore(start)) continue;
            if (eventDate.isAfter(end)) eventDate = end;

            for (CategoryBudget budget : budgetRepository
                    .findByUserAndYearAndMonthOrderByCategoryAsc(
                            user, month.getYear(), month.getMonthValue())) {
                BigDecimal spentOrPlanned = transactionRepository
                        .findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                                user, month.atDay(1), month.atEndOfMonth())
                        .stream()
                        .filter(transaction -> transaction.getType() == TransactionType.EXPENSE)
                        .filter(transaction -> budget.getCategory().equalsIgnoreCase(transaction.getCategory()))
                        .map(Transaction::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal remaining = budget.getLimitAmount().subtract(spentOrPlanned);
                if (remaining.signum() > 0) {
                    events.add(new CashFlowForecastDTO.Event(
                            eventDate, "BUDGET",
                            "Remaining " + budget.getCategory() + " budget",
                            remaining.negate(), null, null, budget.getCategory()));
                }
            }
        }
    }

    private LocalDate nextMonthlyDate(LocalDate currentDate, int targetDay) {
        YearMonth next = YearMonth.from(currentDate).plusMonths(1);
        return next.atDay(Math.min(targetDay, next.lengthOfMonth()));
    }
}
