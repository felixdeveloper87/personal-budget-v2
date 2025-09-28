package com.example.budget.service;

import com.example.budget.dto.MonthlySummary;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {
    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    public List<Transaction> findAllByUser(User user) {
        return repository.findByUser(user);
    }

    public Transaction save(Transaction t, User user) {
        t.setUser(user);
        return repository.save(t);
    }

    public void delete(Long id, User user) {
        Transaction transaction = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        repository.deleteById(id);
    }

    public MonthlySummary monthlySummary(int year, int month, User user) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        BigDecimal income = repository.sumByDateBetweenAndTypeAndUser(start, end, TransactionType.INCOME, user);
        BigDecimal expense = repository.sumByDateBetweenAndTypeAndUser(start, end, TransactionType.EXPENSE, user);
        BigDecimal balance = income.subtract(expense);

        List<MonthlySummary.CategoryAggregate> byCategory = repository.sumByCategoryBetweenAndUser(start, end, user).stream()
                .map(row -> new MonthlySummary.CategoryAggregate(
                        (String) row[0],
                        (BigDecimal) row[1],
                        (BigDecimal) row[2]
                )).collect(Collectors.toList());

        MonthlySummary s = new MonthlySummary();
        s.year = year;
        s.month = month;
        s.totalIncome = income;
        s.totalExpense = expense;
        s.balance = balance;
        s.byCategory = byCategory;
        return s;
    }
}

