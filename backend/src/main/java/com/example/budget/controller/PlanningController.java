package com.example.budget.controller;

import com.example.budget.dto.CashFlowForecastDTO;
import com.example.budget.dto.CategoryBudgetDTO;
import com.example.budget.dto.CategoryBudgetRequest;
import com.example.budget.model.User;
import com.example.budget.service.CashFlowForecastService;
import com.example.budget.service.CategoryBudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planning")
@CrossOrigin
public class PlanningController {
    private final CategoryBudgetService budgetService;
    private final CashFlowForecastService forecastService;

    public PlanningController(
            CategoryBudgetService budgetService,
            CashFlowForecastService forecastService) {
        this.budgetService = budgetService;
        this.forecastService = forecastService;
    }

    @GetMapping("/budgets")
    public List<CategoryBudgetDTO> budgets(
            @RequestParam int year,
            @RequestParam int month,
            Authentication authentication) {
        return budgetService.list(year, month, (User) authentication.getPrincipal());
    }

    @PutMapping("/budgets")
    public CategoryBudgetDTO upsertBudget(
            @Valid @RequestBody CategoryBudgetRequest request,
            Authentication authentication) {
        return budgetService.upsert(request, (User) authentication.getPrincipal());
    }

    @DeleteMapping("/budgets/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBudget(@PathVariable Long id, Authentication authentication) {
        budgetService.delete(id, (User) authentication.getPrincipal());
    }

    @GetMapping("/forecast")
    public CashFlowForecastDTO forecast(Authentication authentication) {
        return forecastService.forecast((User) authentication.getPrincipal());
    }
}
