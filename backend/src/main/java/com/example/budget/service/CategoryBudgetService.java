package com.example.budget.service;

import com.example.budget.dto.CategoryBudgetDTO;
import com.example.budget.dto.CategoryBudgetRequest;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.CategoryBudget;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.repository.CategoryBudgetRepository;
import com.example.budget.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.List;

@Service
public class CategoryBudgetService {
    private final CategoryBudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    public CategoryBudgetService(
            CategoryBudgetRepository budgetRepository,
            TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryBudgetDTO> list(int year, int month, User user) {
        return budgetRepository.findByUserAndYearAndMonthOrderByCategoryAsc(user, year, month)
                .stream().map(budget -> toDTO(budget, user)).toList();
    }

    @Transactional
    public CategoryBudgetDTO upsert(CategoryBudgetRequest request, User user) {
        CategoryBudget budget = budgetRepository
                .findByUserAndCategoryIgnoreCaseAndYearAndMonth(
                        user, request.getCategory().trim(), request.getYear(), request.getMonth())
                .orElseGet(CategoryBudget::new);
        budget.setUser(user);
        budget.setCategory(request.getCategory().trim());
        budget.setYear(request.getYear());
        budget.setMonth(request.getMonth());
        budget.setLimitAmount(request.getLimitAmount());
        return toDTO(budgetRepository.save(budget), user);
    }

    @Transactional
    public void delete(Long id, User user) {
        CategoryBudget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CategoryBudget", id));
        if (!budget.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: Budget does not belong to user");
        }
        budgetRepository.delete(budget);
    }

    public BigDecimal spent(CategoryBudget budget, User user) {
        YearMonth month = YearMonth.of(budget.getYear(), budget.getMonth());
        return transactionRepository
                .findByUserAndPaymentDateBetweenOrderByPaymentDateAscIdAsc(
                        user, month.atDay(1), month.atEndOfMonth())
                .stream()
                .filter(transaction -> transaction.getType() == TransactionType.EXPENSE)
                .filter(transaction -> budget.getCategory().equalsIgnoreCase(transaction.getCategory()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private CategoryBudgetDTO toDTO(CategoryBudget budget, User user) {
        BigDecimal spent = spent(budget, user);
        BigDecimal remaining = budget.getLimitAmount().subtract(spent);
        BigDecimal percentage = spent.multiply(BigDecimal.valueOf(100))
                .divide(budget.getLimitAmount(), 2, RoundingMode.HALF_UP);
        return new CategoryBudgetDTO(
                budget.getId(), budget.getCategory(), budget.getYear(), budget.getMonth(),
                budget.getLimitAmount(), spent, remaining, percentage,
                spent.compareTo(budget.getLimitAmount()) > 0);
    }
}
