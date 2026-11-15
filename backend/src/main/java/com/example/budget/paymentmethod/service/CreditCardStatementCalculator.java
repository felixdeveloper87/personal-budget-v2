package com.example.budget.paymentmethod.service;

import com.example.budget.paymentmethod.model.PaymentMethod;
import com.example.budget.transaction.model.Transaction;
import com.example.budget.transaction.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Groups a credit card's charges into billing statements (faturas).
 *
 * <p>Pure calculation, no I/O: the caller supplies the card, its transactions and
 * "today". The rules mirror {@code CreditCardBillingService#resolvePaymentDate}:
 * a purchase after the closing day rolls into the next statement, and the payment
 * falls in the statement month when the due day is on/after the closing day,
 * otherwise in the following month. Installments are bucketed by their payment
 * date and never roll over, because their due date was already resolved when the
 * plan was created.
 */
public final class CreditCardStatementCalculator {

    public enum Status { OPEN, CLOSED, UPCOMING }

    public record Statement(
            String key,
            LocalDate periodStart,
            LocalDate closingDate,
            LocalDate paymentDate,
            Status status,
            BigDecimal total,
            List<Transaction> transactions
    ) {}

    private CreditCardStatementCalculator() {
    }

    /** Statements for {@code card}, newest first. Non-expense rows and other cards are ignored. */
    public static List<Statement> build(PaymentMethod card, List<Transaction> transactions, LocalDate today) {
        int closingDay = card.getStatementClosingDay() != null ? card.getStatementClosingDay() : 1;
        int paymentDay = card.getPaymentDay() != null ? card.getPaymentDay() : closingDay;

        Map<YearMonth, List<Transaction>> byStatement = new LinkedHashMap<>();
        for (Transaction tx : transactions) {
            if (tx.getType() != TransactionType.EXPENSE
                    || tx.getPaymentMethod() == null
                    || !Objects.equals(tx.getPaymentMethod().getId(), card.getId())) {
                continue;
            }
            LocalDate day = bucketDay(tx);
            if (day == null) continue;

            YearMonth month = YearMonth.from(day);
            if (tx.getInstallmentPlan() == null && day.isAfter(atClampedDay(month, closingDay))) {
                month = month.plusMonths(1);
            }
            byStatement.computeIfAbsent(month, ignored -> new ArrayList<>()).add(tx);
        }

        List<Statement> statements = new ArrayList<>();
        for (Map.Entry<YearMonth, List<Transaction>> entry : byStatement.entrySet()) {
            YearMonth month = entry.getKey();
            LocalDate closingDate = atClampedDay(month, closingDay);
            LocalDate periodStart = atClampedDay(month.minusMonths(1), closingDay).plusDays(1);
            YearMonth paymentMonth = paymentDay < closingDay ? month.plusMonths(1) : month;
            LocalDate paymentDate = atClampedDay(paymentMonth, paymentDay);

            List<Transaction> rows = new ArrayList<>(entry.getValue());
            rows.sort(Comparator.comparing(CreditCardStatementCalculator::bucketDay,
                    Comparator.nullsLast(Comparator.reverseOrder())));
            BigDecimal total = rows.stream()
                    .map(Transaction::getAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            statements.add(new Statement(
                    month.toString(),
                    periodStart,
                    closingDate,
                    paymentDate,
                    closingDate.isBefore(today) ? Status.CLOSED : Status.OPEN,
                    total,
                    rows));
        }

        statements.sort(Comparator.comparing(Statement::closingDate).reversed());

        // Only the earliest not-yet-closed statement is the current one; later ones are future cycles.
        boolean currentFound = false;
        List<Statement> ascending = new ArrayList<>(statements);
        ascending.sort(Comparator.comparing(Statement::closingDate));
        List<String> upcomingKeys = new ArrayList<>();
        for (Statement statement : ascending) {
            if (statement.status() != Status.OPEN) continue;
            if (currentFound) upcomingKeys.add(statement.key());
            currentFound = true;
        }
        if (!upcomingKeys.isEmpty()) {
            statements.replaceAll(statement -> upcomingKeys.contains(statement.key())
                    ? new Statement(statement.key(), statement.periodStart(), statement.closingDate(),
                            statement.paymentDate(), Status.UPCOMING, statement.total(), statement.transactions())
                    : statement);
        }
        return statements;
    }

    private static LocalDate bucketDay(Transaction tx) {
        if (tx.getInstallmentPlan() != null) {
            return tx.getPaymentDate() != null ? tx.getPaymentDate() : tx.getTransactionDate();
        }
        return tx.getTransactionDate() != null ? tx.getTransactionDate() : tx.getPaymentDate();
    }

    private static LocalDate atClampedDay(YearMonth month, int day) {
        return month.atDay(Math.min(day, month.lengthOfMonth()));
    }
}
