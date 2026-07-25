package com.example.budget.mapper;

import com.example.budget.dto.CreateInstallmentPlanRequest;
import com.example.budget.dto.InstallmentPlanDTO;
import com.example.budget.model.InstallmentPlan;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.TransactionStatus;
import com.example.budget.model.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Mapper for converting between InstallmentPlan entities and related DTOs.
 * 
 * Handles conversions for installment plan operations, including the creation
 * of transaction entries for each installment in the plan.
 */
@Component
public class InstallmentPlanMapper {

    /**
     * Converts a CreateInstallmentPlanRequest DTO to an InstallmentPlan entity.
     * 
     * Calculates the total amount by multiplying installment value by total installments.
     * 
     * @param request Request containing plan details
     * @param user User who owns the installment plan
     * @return InstallmentPlan entity ready to be persisted
     */
    public InstallmentPlan toEntity(CreateInstallmentPlanRequest request, User user) {
        InstallmentPlan plan = new InstallmentPlan();
        plan.setTotalInstallments(request.getTotalInstallments());
        plan.setInstallmentValue(request.getInstallmentValue());
        plan.setTotalAmount(request.getInstallmentValue().multiply(new BigDecimal(request.getTotalInstallments())));
        plan.setPurchaseDate(resolvePurchaseDate(request));
        plan.setUser(user);
        return plan;
    }

    /**
     * Converts an InstallmentPlan entity to an InstallmentPlanDTO.
     * 
     * Includes all associated transactions as InstallmentTransactionDTO objects.
     * 
     * @param plan InstallmentPlan entity to convert
     * @return InstallmentPlanDTO containing plan details and transactions, or null if plan is null
     */
    public InstallmentPlanDTO toDTO(InstallmentPlan plan) {
        if (plan == null) return null;

        List<InstallmentPlanDTO.InstallmentTransactionDTO> transactionDTOs = plan.getTransactions().stream()
                .sorted(Comparator
                        .comparing((Transaction tx) -> tx.getInstallmentNumber() != null
                                ? tx.getInstallmentNumber()
                                : Integer.MAX_VALUE)
                        .thenComparing(Transaction::getDateTime))
                .map(tx -> new InstallmentPlanDTO.InstallmentTransactionDTO(
                        tx.getId(),
                        tx.getDescription(),
                        tx.getAmount(),
                        tx.getCategory(),
                        tx.getDateTime().toLocalDate(),
                        tx.getInstallmentNumber() != null ? tx.getInstallmentNumber() : 0
                ))
                .toList();

        return new InstallmentPlanDTO(
                plan.getId(),
                plan.getTotalInstallments(),
                plan.getTotalAmount(),
                plan.getInstallmentValue(),
                plan.getPurchaseDate(),
                plan.getAccount() != null ? plan.getAccount().getId() : null,
                plan.getAccount() != null ? plan.getAccount().getName() : null,
                plan.getPaymentMethod() != null ? plan.getPaymentMethod().getId() : null,
                plan.getPaymentMethod() != null ? plan.getPaymentMethod().getName() : null,
                transactionDTOs
        );
    }

    /**
     * Creates transaction entities for each installment in the plan.
     * 
     * Generates transactions spaced monthly from the start date, each marked as an expense
     * with the installment number and description indicating its position (e.g., "Installment 1/3").
     * 
     * @param plan The installment plan to create transactions for
     * @param request Request containing plan details and dates
     * @return List of Transaction entities ready to be persisted
     */
    public List<Transaction> createTransactionsFromPlan(InstallmentPlan plan, CreateInstallmentPlanRequest request) {
        List<Transaction> transactions = new ArrayList<>();
        
        LocalDateTime baseDateTime = determineBaseDateTime(request);

        for (int i = 1; i <= request.getTotalInstallments(); i++) {
            Transaction transaction = new Transaction();
            transaction.setType(TransactionType.EXPENSE);
            transaction.setCategory(request.getCategory());
            transaction.setDescription(String.format("%s (Installment %d/%d)", 
                    request.getDescription(), i, request.getTotalInstallments()));
            transaction.setAmount(request.getInstallmentValue());
            LocalDateTime installmentDateTime = baseDateTime.plusMonths(i - 1);
            transaction.setDateTime(installmentDateTime);
            transaction.setTransactionDate(plan.getPurchaseDate());
            transaction.setPaymentDate(installmentDateTime.toLocalDate());
            transaction.setUser(plan.getUser());
            transaction.setAccount(plan.getAccount());
            transaction.setPaymentMethod(plan.getPaymentMethod());
            transaction.setStatus(installmentDateTime.toLocalDate().isAfter(LocalDate.now())
                    ? TransactionStatus.PLANNED
                    : TransactionStatus.CLEARED);
            transaction.setInstallmentPlan(plan);
            transaction.setInstallmentNumber(i);

            transactions.add(transaction);
        }

        return transactions;
    }

    /**
     * Determines the base date and time for the first installment.
     * 
     * Uses startDateTime if provided, otherwise uses startDate, or defaults to current date
     * at 12:00 PM if neither is provided.
     * 
     * @param request Request containing date information
     * @return LocalDateTime for the first installment
     */
    private LocalDateTime determineBaseDateTime(CreateInstallmentPlanRequest request) {
        if (request.getStartDateTime() != null) {
            return request.getStartDateTime();
        }
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        return startDate.atTime(12, 0);
    }

    private LocalDate resolvePurchaseDate(CreateInstallmentPlanRequest request) {
        if (request.getPurchaseDate() != null) return request.getPurchaseDate();
        if (request.getStartDateTime() != null) return request.getStartDateTime().toLocalDate();
        if (request.getStartDate() != null) return request.getStartDate();
        return LocalDate.now();
    }
}

