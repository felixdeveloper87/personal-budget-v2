package com.example.budget.mapper;

import com.example.budget.dto.CreateTransactionRequest;
import com.example.budget.dto.TransactionSearchDTO;
import com.example.budget.dto.UpdateTransactionRequest;
import com.example.budget.model.Transaction;
import com.example.budget.model.User;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Mapper for converting between Transaction entities and related DTOs.
 * 
 * Handles conversions for transaction operations including creation, updates,
 * and search result transformations.
 */
@Component
public class TransactionMapper {

    /**
     * Converts a Transaction entity to a TransactionSearchDTO.
     * 
     * Extracts only the fields needed for search results, including installment
     * plan information if the transaction is part of an installment plan.
     * 
     * @param t Transaction entity to convert
     * @return TransactionSearchDTO optimized for search results, or null if transaction is null
     */
    public TransactionSearchDTO toSearchDTO(Transaction t) {
        if (t == null) return null;

        Long installmentPlanId =
                (t.getInstallmentPlan() != null) ? t.getInstallmentPlan().getId() : null;
        Long recurringTransactionId =
                (t.getRecurringTransaction() != null) ? t.getRecurringTransaction().getId() : null;

        return new TransactionSearchDTO(
                t.getId(),
                t.getDescription(),
                t.getType(),
                t.getCategory(),
                t.getAmount(),
                t.getDateTime().toLocalDate(),
                installmentPlanId,
                recurringTransactionId
        );
    }

    /**
     * Converts a list of Transaction entities to a list of TransactionSearchDTO.
     * 
     * @param list List of Transaction entities to convert
     * @return List of TransactionSearchDTO objects
     */
    public List<TransactionSearchDTO> toSearchDTOList(List<Transaction> list) {
        return list.stream().map(this::toSearchDTO).toList();
    }

    /**
     * Converts a CreateTransactionRequest DTO to a Transaction entity.
     * 
     * Creates a new transaction with the provided details and associates it with the user.
     * 
     * @param req Request containing transaction details
     * @param user User who owns the transaction
     * @return Transaction entity ready to be persisted
     */
    public Transaction toEntity(CreateTransactionRequest req, User user) {
        Transaction t = new Transaction();
        t.setDateTime(req.getDateTime());
        t.setType(req.getType());
        t.setCategory(req.getCategory());
        t.setDescription(req.getDescription());
        t.setAmount(req.getAmount());
        t.setUser(user);
        return t;
    }

    /**
     * Updates an existing Transaction entity with values from UpdateTransactionRequest.
     * 
     * Updates only the mutable fields. Protected fields such as user, installment plan,
     * and installment number remain unchanged.
     * 
     * @param t Transaction entity to update
     * @param req Request containing updated transaction details
     */
    public void updateTransaction(Transaction t, UpdateTransactionRequest req) {
        t.setDateTime(req.getDateTime());
        t.setType(req.getType());
        t.setCategory(req.getCategory());
        t.setDescription(req.getDescription());
        t.setAmount(req.getAmount());
    }
}
