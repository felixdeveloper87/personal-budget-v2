package com.example.budget.controller;

import com.example.budget.dto.*;
import com.example.budget.model.User;
import com.example.budget.service.FinancialAccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin
public class FinancialAccountController {
    private final FinancialAccountService service;

    public FinancialAccountController(FinancialAccountService service) {
        this.service = service;
    }

    @GetMapping
    public List<FinancialAccountDTO> list(Authentication authentication) {
        return service.list((User) authentication.getPrincipal());
    }

    @GetMapping("/summary")
    public AccountSummaryDTO summary(Authentication authentication) {
        return service.summary((User) authentication.getPrincipal());
    }

    @GetMapping("/{id}")
    public AccountDetailsDTO details(@PathVariable Long id, Authentication authentication) {
        return service.details(id, (User) authentication.getPrincipal());
    }

    @GetMapping("/{id}/activity")
    public AccountActivityPageDTO activity(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            Authentication authentication) {
        return service.recentActivityPage(id, (User) authentication.getPrincipal(), page, size);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FinancialAccountDTO create(
            @Valid @RequestBody FinancialAccountRequest request,
            Authentication authentication) {
        return service.create(request, (User) authentication.getPrincipal());
    }

    @PutMapping("/{id}")
    public FinancialAccountDTO update(
            @PathVariable Long id,
            @Valid @RequestBody FinancialAccountRequest request,
            Authentication authentication) {
        return service.update(id, request, (User) authentication.getPrincipal());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archive(@PathVariable Long id, Authentication authentication) {
        service.archive(id, (User) authentication.getPrincipal());
    }

    @GetMapping("/transfers")
    public List<AccountTransferDTO> transfers(Authentication authentication) {
        return service.listTransfers((User) authentication.getPrincipal());
    }

    @PostMapping("/transfers")
    @ResponseStatus(HttpStatus.CREATED)
    public AccountTransferDTO transfer(
            @Valid @RequestBody AccountTransferRequest request,
            Authentication authentication) {
        return service.transfer(request, (User) authentication.getPrincipal());
    }

}
