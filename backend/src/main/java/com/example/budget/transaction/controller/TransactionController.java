package com.example.budget.transaction.controller;

import com.example.budget.transaction.dto.CreateTransactionRequest;
import com.example.budget.transaction.dto.ImportResultDTO;
import com.example.budget.transaction.dto.ImportTransactionsRequest;
import com.example.budget.transaction.dto.TransactionDTO;
import com.example.budget.transaction.dto.UpdateTransactionRequest;
import com.example.budget.transaction.mapper.TransactionMapper;
import com.example.budget.transaction.model.Transaction;
import com.example.budget.transaction.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.transaction.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for transaction management endpoints.
 * 
 * Handles CRUD operations for transactions and provides summary/search functionality.
 * All endpoints require authentication and are scoped to the authenticated user.
 */
@RestController
@RequestMapping("/api/transactions")
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
    @GetMapping
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
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionDTO create(@Valid @RequestBody CreateTransactionRequest tx, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return mapper.toDTO(service.create(tx, user));
    }

    /**
     * Bulk-imports transactions from parsed CSV rows.
     *
     * Invalid rows are skipped and reported in the response rather than failing the request,
     * so a partial import still succeeds. Returns a summary of imported/failed counts.
     *
     * @param request parsed rows to import
     * @param authentication authenticated user
     * @return import summary (imported count, failed count, per-row errors)
     */
    @PostMapping("/import")
    public ImportResultDTO importTransactions(
            @Valid @RequestBody ImportTransactionsRequest request,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return service.importTransactions(request.getRows(), request.getAccountId(), user);
    }

    /**
     * Exports all of the authenticated user's transactions as a CSV attachment.
     *
     * @param authentication authenticated user
     * @return CSV file download
     */
    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<byte[]> exportCsv(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        byte[] csv = service.exportCsv(user).getBytes(StandardCharsets.UTF_8);
        String filename = "transactions-" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(filename)
                        .build()
                        .toString())
                .body(csv);
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
    @PutMapping("/{id}")
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
    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        service.delete(id, user);
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
    @GetMapping("/search")
    public List<TransactionDTO> searchTransactions(
            @RequestParam(required = false) String text,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        List<Transaction> results = service.searchTransactions(text, type, category, startDate, endDate, user);

        return mapper.toDTOList(results);
    }
}
