package com.example.budget.controller;

import com.example.budget.dto.MonthlySummary;
import com.example.budget.dto.TransactionSearchDTO;
import com.example.budget.model.Transaction;
import com.example.budget.model.User;
import com.example.budget.service.TransactionService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    @GetMapping("/transactions")
    public List<Transaction> all(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        System.out.println("DEBUG: Logged user ID = " + user.getId() + ", email = " + user.getEmail());
        return service.findAllByUser(user);
    }

    @PostMapping("/transactions")
    public Transaction create(@RequestBody Transaction tx, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return service.save(tx, user);
    }

    @DeleteMapping("/transactions/{id}")
    public void delete(@PathVariable("id") Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        service.delete(id, user);
    }

    @GetMapping("/summary/month")
    public MonthlySummary monthSummary(
            @RequestParam("year") int year,
            @RequestParam("month") int month,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        System.out.println("Received year: " + year + ", month: " + month + ", user: " + user.getId());
        try {
            MonthlySummary result = service.monthlySummary(year, month, user);
            System.out.println("Monthly summary result: " + result);
            return result;
        } catch (Exception e) {
            System.err.println("Error in monthSummary: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

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
                        tx.getDateTime().toLocalDate()))
                .toList();
    }
}
