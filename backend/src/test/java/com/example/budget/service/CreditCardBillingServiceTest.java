package com.example.budget.service;

import com.example.budget.model.PaymentMethod;
import com.example.budget.model.PaymentMethodType;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class CreditCardBillingServiceTest {

    private final CreditCardBillingService service = new CreditCardBillingService();

    @Test
    void resolvesSameStatementWhenPurchaseIsBeforeOrOnClosingDay() {
        PaymentMethod card = card(3, 28);

        assertThat(service.resolvePaymentDate(LocalDate.of(2026, 5, 2), card))
                .isEqualTo(LocalDate.of(2026, 5, 28));
        assertThat(service.resolvePaymentDate(LocalDate.of(2026, 5, 3), card))
                .isEqualTo(LocalDate.of(2026, 5, 28));
    }

    @Test
    void resolvesNextStatementWhenPurchaseIsAfterClosingDay() {
        PaymentMethod card = card(3, 28);

        assertThat(service.resolvePaymentDate(LocalDate.of(2026, 5, 4), card))
                .isEqualTo(LocalDate.of(2026, 6, 28));
        assertThat(service.resolvePaymentDate(LocalDate.of(2026, 5, 12), card))
                .isEqualTo(LocalDate.of(2026, 6, 28));
    }

    @Test
    void clampsDaysForShortMonthsAndLeapYears() {
        PaymentMethod card = card(31, 31);

        assertThat(service.resolvePaymentDate(LocalDate.of(2026, 2, 28), card))
                .isEqualTo(LocalDate.of(2026, 2, 28));
        assertThat(service.resolvePaymentDate(LocalDate.of(2028, 2, 29), card))
                .isEqualTo(LocalDate.of(2028, 2, 29));
    }

    @Test
    void movesPaymentToFollowingMonthWhenPaymentDayIsBeforeClosingDay() {
        PaymentMethod card = card(28, 3);

        assertThat(service.resolvePaymentDate(LocalDate.of(2026, 5, 20), card))
                .isEqualTo(LocalDate.of(2026, 6, 3));
    }

    private static PaymentMethod card(int closingDay, int paymentDay) {
        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setType(PaymentMethodType.CREDIT_CARD);
        paymentMethod.setStatementClosingDay(closingDay);
        paymentMethod.setPaymentDay(paymentDay);
        return paymentMethod;
    }
}
