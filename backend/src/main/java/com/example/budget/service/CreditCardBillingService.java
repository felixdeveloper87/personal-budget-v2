package com.example.budget.service;

import com.example.budget.model.PaymentMethod;
import com.example.budget.model.PaymentMethodType;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;

@Service
public class CreditCardBillingService {

    public LocalDate resolvePaymentDate(LocalDate transactionDate, PaymentMethod paymentMethod) {
        if (transactionDate == null) {
            throw new IllegalArgumentException("Transaction date is required");
        }
        if (paymentMethod == null || !PaymentMethodType.CREDIT_CARD.equals(paymentMethod.getType())) {
            return transactionDate;
        }

        Integer closingDay = paymentMethod.getStatementClosingDay();
        Integer paymentDay = paymentMethod.getPaymentDay();
        if (!isValidDay(closingDay) || !isValidDay(paymentDay)) {
            throw new IllegalArgumentException("Credit card closing and payment days must be between 1 and 31");
        }

        YearMonth transactionMonth = YearMonth.from(transactionDate);
        LocalDate closingDate = atClampedDay(transactionMonth, closingDay);
        YearMonth statementMonth = transactionDate.isAfter(closingDate)
                ? transactionMonth.plusMonths(1)
                : transactionMonth;

        YearMonth paymentMonth = paymentDay >= closingDay
                ? statementMonth
                : statementMonth.plusMonths(1);

        return atClampedDay(paymentMonth, paymentDay);
    }

    private boolean isValidDay(Integer day) {
        return day != null && day >= 1 && day <= 31;
    }

    private LocalDate atClampedDay(YearMonth month, int day) {
        return month.atDay(Math.min(day, month.lengthOfMonth()));
    }
}
