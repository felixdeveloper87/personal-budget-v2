package com.example.budget.controller;

import com.example.budget.dto.CreateRecurringTransactionRequest;
import com.example.budget.dto.RecurringTransactionDTO;
import com.example.budget.dto.UpdateRecurringTransactionAmountRequest;
import com.example.budget.dto.UpdateRecurringTransactionRequest;
import com.example.budget.model.User;
import com.example.budget.service.RecurringTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring-transactions")
@CrossOrigin
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;

    public RecurringTransactionController(RecurringTransactionService recurringTransactionService) {
        this.recurringTransactionService = recurringTransactionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecurringTransactionDTO create(
            @Valid @RequestBody CreateRecurringTransactionRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        return recurringTransactionService.create(request, user);
    }

    @GetMapping
    public List<RecurringTransactionDTO> findAll(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return recurringTransactionService.findAllByUser(user);
    }

    @GetMapping("/{id}")
    public RecurringTransactionDTO findById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        return recurringTransactionService.findById(id, user);
    }

    @PostMapping("/{id}/generate-due")
    public RecurringTransactionDTO generateDue(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        return recurringTransactionService.generateDueTransactions(id, user);
    }

    @PatchMapping("/{id}/amount")
    public RecurringTransactionDTO updateAmount(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRecurringTransactionAmountRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        return recurringTransactionService.updateAmount(id, request, user);
    }

    @PutMapping("/{id}")
    public RecurringTransactionDTO update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRecurringTransactionRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        return recurringTransactionService.update(id, request, user);
    }

    @DeleteMapping("/{id}")
    public RecurringTransactionDTO cancel(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        return recurringTransactionService.cancel(id, user);
    }
}
