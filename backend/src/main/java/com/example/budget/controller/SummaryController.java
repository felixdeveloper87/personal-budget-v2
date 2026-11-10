package com.example.budget.controller;

import com.example.budget.dto.MonthlySummary;
import com.example.budget.model.User;
import com.example.budget.service.TransactionService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Aggregated totals for the authenticated user.
 *
 * <p>CORS is handled globally in {@code SecurityConfig}, so no {@code @CrossOrigin} here.
 */
@RestController
@RequestMapping("/api/summary")
public class SummaryController {

    private final TransactionService transactionService;

    public SummaryController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * Total income, total expenses, balance and per-category breakdown for one month.
     *
     * @param year  year of the summary (e.g. 2026)
     * @param month month of the summary (1-12)
     */
    @GetMapping("/month")
    public MonthlySummary month(
            @RequestParam("year") int year,
            @RequestParam("month") int month,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return transactionService.monthlySummary(year, month, user);
    }
}
