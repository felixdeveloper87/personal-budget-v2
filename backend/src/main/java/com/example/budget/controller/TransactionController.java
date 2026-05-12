package com.example.budget.controller;

import com.example.budget.dto.CreateTransactionRequest;
import com.example.budget.dto.MonthlySummary;
import com.example.budget.dto.TransactionDTO;
import com.example.budget.dto.TransactionSearchDTO;
import com.example.budget.dto.UpdateTransactionRequest;
import com.example.budget.mapper.TransactionMapper;
import com.example.budget.model.Transaction;
import com.example.budget.model.User;
import com.example.budget.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for transaction management endpoints.
 * 
 * Handles CRUD operations for transactions and provides summary/search functionality.
 * All endpoints require authentication and are scoped to the authenticated user.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin
public class TransactionController {

    private final TransactionService service;
    private final TransactionMapper mapper;

    public TransactionController(TransactionService service, TransactionMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    /**
     * Retrieves all transactions for the authenticated user.
     * 
     * @param authentication Spring Security authentication object containing the authenticated user
     * @return List of all transactions belonging to the authenticated user
     */
    @GetMapping("/transactions")
    public List<TransactionDTO> all(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return mapper.toDTOList(service.findAllByUser(user));
    }

    /**
     * Creates a new transaction for the authenticated user.
     * 
     * @param tx Transaction object containing transaction details
     * @param authentication Spring Security authentication object containing the authenticated user
     * @return Created transaction with generated ID
     */
    @PostMapping("/transactions")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionDTO create(@Valid @RequestBody CreateTransactionRequest tx, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return mapper.toDTO(service.create(tx, user));
    }

    /**
     * Updates an existing transaction.
     * 
     * Only the owner of the transaction can update it. Throws AccessDeniedException
     * if the user attempts to update a transaction they don't own.
     * 
     * @param id Transaction ID to update
     * @param tx Transaction object with updated fields
     * @param authentication Spring Security authentication object containing the authenticated user
     * @return Updated transaction
     */
    @PutMapping("/transactions/{id}")
    public TransactionDTO update(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateTransactionRequest tx,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        return mapper.toDTO(service.update(id, tx, user));
    }

    /**
     * Deletes a transaction by ID.
     * 
     * Only the owner of the transaction can delete it. Throws AccessDeniedException
     * if the user attempts to delete a transaction they don't own.
     * 
     * @param id Transaction ID to delete
     * @param authentication Spring Security authentication object containing the authenticated user
     */
    @DeleteMapping("/transactions/{id}")
    public void delete(@PathVariable("id") Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        service.delete(id, user);
    }

    /**
     * Retrieves a monthly summary of transactions for the authenticated user.
     * 
     * Returns aggregated data including total income, total expenses, balance,
     * and breakdown by category for the specified month.
     * 
     * @param year Year for the summary (e.g., 2024)
     * @param month Month for the summary (1-12)
     * @param authentication Spring Security authentication object containing the authenticated user
     * @return MonthlySummary containing aggregated transaction data
     */
    @GetMapping("/summary/month")
    public MonthlySummary monthSummary(
            @RequestParam("year") int year,
            @RequestParam("month") int month,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return service.monthlySummary(year, month, user);
    }

    /**
     * Searches transactions with optional filters.
     * 
     * Supports filtering by:
     * - Text search in description
     * - Transaction type (income/expense)
     * - Category
     * - Date range (startDate and endDate in yyyy-MM-dd format)
     * 
     * All filters are optional. If no filters are provided, returns all user transactions.
     * Results are returned as TransactionSearchDTO objects optimized for search results.
     * 
     * @param text Optional text to search in transaction descriptions
     * @param type Optional transaction type filter ("income" or "expense")
     * @param category Optional category filter
     * @param startDate Optional start date filter (yyyy-MM-dd format)
     * @param endDate Optional end date filter (yyyy-MM-dd format)
     * @param authentication Spring Security authentication object containing the authenticated user
     * @return List of TransactionSearchDTO matching the search criteria
     */
    @GetMapping("/transactions/search")
    public List<TransactionSearchDTO> searchTransactions(
            @RequestParam(required = false) String text,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        List<Transaction> results = service.searchTransactions(text, type, category, startDate, endDate, user);

        return results.stream()
                .map(tx -> new TransactionSearchDTO(
                        tx.getId(),
                        tx.getDescription(),
                        tx.getType(),
                        tx.getCategory(),
                        tx.getAmount(),
                        tx.getPaymentDate(),
                        tx.getInstallmentPlan() != null ? tx.getInstallmentPlan().getId() : null,
                        tx.getRecurringTransaction() != null ? tx.getRecurringTransaction().getId() : null))
                .toList();
    }
}
