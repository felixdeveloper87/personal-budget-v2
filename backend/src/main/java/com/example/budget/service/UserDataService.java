package com.example.budget.service;

import com.example.budget.cache.CacheInvalidationService;
import com.example.budget.model.User;
import com.example.budget.repository.AccountTransferRepository;
import com.example.budget.repository.CategoryBudgetRepository;
import com.example.budget.repository.FinancialAccountRepository;
import com.example.budget.repository.InstallmentPlanRepository;
import com.example.budget.repository.PaymentMethodRepository;
import com.example.budget.repository.RecurringTransactionRepository;
import com.example.budget.repository.SavingsGoalContributionRepository;
import com.example.budget.repository.SavingsGoalRepository;
import com.example.budget.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Removes all financial data owned by a user while keeping the user account itself,
 * giving the user a clean slate. Deletions run in foreign-key-safe order.
 */
@Service
public class UserDataService {

    private final AccountTransferRepository accountTransferRepository;
    private final TransactionRepository transactionRepository;
    private final InstallmentPlanRepository installmentPlanRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final SavingsGoalContributionRepository savingsGoalContributionRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final CategoryBudgetRepository categoryBudgetRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final FinancialAccountRepository financialAccountRepository;
    private final CacheInvalidationService cacheInvalidation;

    public UserDataService(
            AccountTransferRepository accountTransferRepository,
            TransactionRepository transactionRepository,
            InstallmentPlanRepository installmentPlanRepository,
            RecurringTransactionRepository recurringTransactionRepository,
            SavingsGoalContributionRepository savingsGoalContributionRepository,
            SavingsGoalRepository savingsGoalRepository,
            CategoryBudgetRepository categoryBudgetRepository,
            PaymentMethodRepository paymentMethodRepository,
            FinancialAccountRepository financialAccountRepository,
            CacheInvalidationService cacheInvalidation) {
        this.accountTransferRepository = accountTransferRepository;
        this.transactionRepository = transactionRepository;
        this.installmentPlanRepository = installmentPlanRepository;
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.savingsGoalContributionRepository = savingsGoalContributionRepository;
        this.savingsGoalRepository = savingsGoalRepository;
        this.categoryBudgetRepository = categoryBudgetRepository;
        this.paymentMethodRepository = paymentMethodRepository;
        this.financialAccountRepository = financialAccountRepository;
        this.cacheInvalidation = cacheInvalidation;
    }

    @Transactional
    public void deleteAllData(User user) {
        // Order matters: delete rows that reference others before their targets.
        accountTransferRepository.deleteAllByUser(user);
        transactionRepository.deleteAllByUser(user);
        installmentPlanRepository.deleteAllByUser(user);
        recurringTransactionRepository.deleteAllByUser(user);
        savingsGoalContributionRepository.deleteAllByUser(user);
        savingsGoalRepository.deleteAllByUser(user);
        categoryBudgetRepository.deleteAllByUser(user);
        paymentMethodRepository.deleteAllByUser(user);
        financialAccountRepository.deleteAllByUser(user);

        Long userId = user.getId();
        cacheInvalidation.evictTransactionsList(userId);
        cacheInvalidation.evictInstallmentPlansList(userId);
        cacheInvalidation.evictRecurringList(userId);
        cacheInvalidation.evictMonthlySummariesWideWindow(userId);
    }
}
