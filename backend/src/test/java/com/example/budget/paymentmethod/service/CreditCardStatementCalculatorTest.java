package com.example.budget.paymentmethod.service;

import com.example.budget.installment.model.InstallmentPlan;
import com.example.budget.paymentmethod.dto.CardOverviewDTO;
import com.example.budget.paymentmethod.model.PaymentMethod;
import com.example.budget.paymentmethod.model.PaymentMethodType;
import com.example.budget.paymentmethod.service.CreditCardStatementCalculator.Statement;
import com.example.budget.paymentmethod.service.CreditCardStatementCalculator.Status;
import com.example.budget.transaction.model.Transaction;
import com.example.budget.transaction.model.TransactionType;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CreditCardStatementCalculatorTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 5, 10);

    @Test
    void purchaseAfterClosingDayRollsIntoNextStatement() {
        PaymentMethod card = card(1L, 3, 28);

        List<Statement> statements = CreditCardStatementCalculator.build(card, List.of(
                charge(card, LocalDate.of(2026, 5, 3), "10.00"),
                charge(card, LocalDate.of(2026, 5, 4), "20.00")), TODAY);

        assertThat(statements).extracting(Statement::key).containsExactly("2026-06", "2026-05");
        Statement june = statements.get(0);
        assertThat(june.total()).isEqualByComparingTo("20.00");
        assertThat(june.periodStart()).isEqualTo(LocalDate.of(2026, 5, 4));
        assertThat(june.closingDate()).isEqualTo(LocalDate.of(2026, 6, 3));
        assertThat(june.paymentDate()).isEqualTo(LocalDate.of(2026, 6, 28));
    }

    @Test
    void paymentFallsInFollowingMonthWhenDueDayIsBeforeClosingDay() {
        PaymentMethod card = card(1L, 28, 3);

        Statement statement = CreditCardStatementCalculator.build(card, List.of(
                charge(card, LocalDate.of(2026, 5, 20), "15.00")), TODAY).get(0);

        assertThat(statement.closingDate()).isEqualTo(LocalDate.of(2026, 5, 28));
        assertThat(statement.paymentDate()).isEqualTo(LocalDate.of(2026, 6, 3));
    }

    @Test
    void onlyEarliestUnclosedStatementIsOpenAndLaterOnesAreUpcoming() {
        PaymentMethod card = card(1L, 3, 28);

        List<Statement> statements = CreditCardStatementCalculator.build(card, List.of(
                charge(card, LocalDate.of(2026, 4, 20), "1.00"),   // closes 3 May → closed
                charge(card, LocalDate.of(2026, 5, 20), "2.00"),   // closes 3 Jun → open
                charge(card, LocalDate.of(2026, 6, 20), "3.00")),  // closes 3 Jul → upcoming
                TODAY);

        assertThat(statements).extracting(Statement::status)
                .containsExactly(Status.UPCOMING, Status.OPEN, Status.CLOSED);
    }

    @Test
    void installmentsUsePaymentDateAndNeverRollOver() {
        PaymentMethod card = card(1L, 3, 28);
        Transaction installment = charge(card, LocalDate.of(2026, 5, 20), "50.00");
        installment.setPaymentDate(LocalDate.of(2026, 7, 28));
        installment.setInstallmentPlan(new InstallmentPlan());

        Statement statement = CreditCardStatementCalculator.build(card, List.of(installment), TODAY).get(0);

        assertThat(statement.key()).isEqualTo("2026-07");
    }

    @Test
    void ignoresIncomeAndOtherCards() {
        PaymentMethod card = card(1L, 3, 28);
        PaymentMethod other = card(2L, 3, 28);
        Transaction refund = charge(card, LocalDate.of(2026, 5, 1), "9.00");
        refund.setType(TransactionType.INCOME);

        List<Statement> statements = CreditCardStatementCalculator.build(card, List.of(
                refund,
                charge(other, LocalDate.of(2026, 5, 1), "9.00")), TODAY);

        assertThat(statements).isEmpty();
    }

    @Test
    void overviewCountsEveryUnpaidStatementAsOutstanding() {
        PaymentMethod card = card(1L, 3, 28);
        List<Statement> statements = CreditCardStatementCalculator.build(card, List.of(
                charge(card, LocalDate.of(2026, 3, 20), "100.00"),  // paid 28 Apr → past
                charge(card, LocalDate.of(2026, 4, 20), "30.00"),   // closed, due 28 May
                charge(card, LocalDate.of(2026, 5, 20), "20.00")),  // open, due 28 Jun
                TODAY);

        CardOverviewDTO overview = CreditCardStatementService.toOverview(card, statements, TODAY);

        assertThat(overview.currentTotal()).isEqualByComparingTo("20.00");
        assertThat(overview.outstanding()).isEqualByComparingTo("50.00");
        assertThat(overview.nextPaymentDate()).isEqualTo(LocalDate.of(2026, 5, 28));
        assertThat(overview.nextPaymentAmount()).isEqualByComparingTo("30.00");
        assertThat(overview.statementCount()).isEqualTo(3);
    }

    private static PaymentMethod card(Long id, int closingDay, int paymentDay) {
        PaymentMethod card = new PaymentMethod();
        ReflectionTestUtils.setField(card, "id", id);
        card.setType(PaymentMethodType.CREDIT_CARD);
        card.setStatementClosingDay(closingDay);
        card.setPaymentDay(paymentDay);
        return card;
    }

    private static Transaction charge(PaymentMethod card, LocalDate purchaseDate, String amount) {
        Transaction tx = new Transaction();
        tx.setType(TransactionType.EXPENSE);
        tx.setPaymentMethod(card);
        tx.setTransactionDate(purchaseDate);
        tx.setPaymentDate(purchaseDate);
        tx.setAmount(new BigDecimal(amount));
        return tx;
    }
}
