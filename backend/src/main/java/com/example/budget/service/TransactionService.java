package com.example.budget.service;

import com.example.budget.dto.MonthlySummary;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.repository.TransactionRepository;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
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
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);

        BigDecimal income = repository.sumByDateTimeBetweenAndTypeAndUser(start, end, TransactionType.INCOME, user);
        BigDecimal expense = repository.sumByDateTimeBetweenAndTypeAndUser(start, end, TransactionType.EXPENSE, user);
        BigDecimal balance = income.subtract(expense);

        List<MonthlySummary.CategoryAggregate> byCategory = repository.sumByCategoryBetweenAndUser(start, end, user)
                .stream()
                .map(row -> new MonthlySummary.CategoryAggregate(
                        (String) row[0],
                        (BigDecimal) row[1],
                        (BigDecimal) row[2]))
                .collect(Collectors.toList());

        MonthlySummary s = new MonthlySummary();
        s.year = year;
        s.month = month;
        s.totalIncome = income;
        s.totalExpense = expense;
        s.balance = balance;
        s.byCategory = byCategory;
        return s;
    }

    public List<Transaction> searchTransactions(
            String text,
            String type,
            String category,
            String startDate,
            String endDate,
            User user) {

        final LocalDateTime start;
        final LocalDateTime end;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        if (StringUtils.hasText(startDate)) {
            start = LocalDate.parse(startDate, formatter).atStartOfDay();
        } else {
            start = null;
        }
        if (StringUtils.hasText(endDate)) {
            end = LocalDate.parse(endDate, formatter).atTime(23, 59, 59);
        } else {
            end = null;
        }

        final TransactionType txType;
        if ("income".equalsIgnoreCase(type)) {
            txType = TransactionType.INCOME;
        } else if ("expense".equalsIgnoreCase(type)) {
            txType = TransactionType.EXPENSE;
        } else {
            txType = null;
        }

        Specification<Transaction> spec = (root, query, cb) -> cb.conjunction();

        // sempre restringe ao usuário logado
        spec = spec.and((root, query, cb) -> cb.equal(root.get("user"), user));

        if (StringUtils.hasText(text)) {
            String likeText = "%" + text.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("description")), likeText));
        }

        if (txType != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), txType));
        }

        if (StringUtils.hasText(category)) {
            String likeCategory = "%" + category.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("category")), likeCategory));
        }

        if (start != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("dateTime"), start));
        }

        if (end != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("dateTime"), end));
        }

        return repository.findAll(spec);
    }
}
