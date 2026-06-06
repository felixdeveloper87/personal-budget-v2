package com.example.budget.mapper;

import com.example.budget.dto.CreateRecurringTransactionRequest;
import com.example.budget.dto.RecurringTransactionDTO;
import com.example.budget.model.RecurringFrequency;
import com.example.budget.model.RecurringTransaction;
import com.example.budget.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class RecurringTransactionMapper {

    public RecurringTransaction toEntity(CreateRecurringTransactionRequest request, User user) {
        int dayOfMonth = request.getDayOfMonth() != null
                ? request.getDayOfMonth()
                : request.getStartDate().getDayOfMonth();

        RecurringTransaction recurringTransaction = new RecurringTransaction();
        recurringTransaction.setType(request.getType());
        recurringTransaction.setCategory(request.getCategory());
        recurringTransaction.setDescription(request.getDescription());
        recurringTransaction.setAmount(request.getAmount());
        recurringTransaction.setFrequency(RecurringFrequency.MONTHLY);
        recurringTransaction.setStartDate(request.getStartDate());
        recurringTransaction.setEndDate(request.getEndDate());
        recurringTransaction.setDayOfMonth(dayOfMonth);
        recurringTransaction.setNextRunDate(firstRunDate(request.getStartDate(), dayOfMonth));
        recurringTransaction.setActive(true);
        recurringTransaction.setUser(user);
        return recurringTransaction;
    }

    public RecurringTransactionDTO toDTO(RecurringTransaction recurringTransaction) {
        if (recurringTransaction == null) return null;

        return new RecurringTransactionDTO(
                recurringTransaction.getId(),
                recurringTransaction.getType(),
                recurringTransaction.getCategory(),
                recurringTransaction.getDescription(),
                recurringTransaction.getAmount(),
                recurringTransaction.getFrequency(),
                recurringTransaction.getStartDate(),
                recurringTransaction.getEndDate(),
                recurringTransaction.getNextRunDate(),
                recurringTransaction.getDayOfMonth(),
                recurringTransaction.isActive(),
                recurringTransaction.getAccount() != null ? recurringTransaction.getAccount().getId() : null,
                recurringTransaction.getAccount() != null ? recurringTransaction.getAccount().getName() : null,
                recurringTransaction.getPaymentMethod() != null ? recurringTransaction.getPaymentMethod().getId() : null,
                recurringTransaction.getPaymentMethod() != null ? recurringTransaction.getPaymentMethod().getName() : null
        );
    }

    private LocalDate firstRunDate(LocalDate startDate, int dayOfMonth) {
        LocalDate firstRunMonth = dateInMonth(startDate, dayOfMonth);
        if (!firstRunMonth.isBefore(startDate)) {
            return firstRunMonth;
        }
        return dateInMonth(startDate.plusMonths(1), dayOfMonth);
    }

    private LocalDate dateInMonth(LocalDate date, int dayOfMonth) {
        int day = Math.min(dayOfMonth, date.lengthOfMonth());
        return date.withDayOfMonth(day);
    }
}
