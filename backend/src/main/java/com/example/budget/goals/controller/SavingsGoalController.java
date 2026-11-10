package com.example.budget.goals.controller;

import com.example.budget.goals.dto.SavingsGoalContributionRequest;
import com.example.budget.goals.dto.SavingsGoalDTO;
import com.example.budget.goals.dto.SavingsGoalRequest;
import com.example.budget.user.model.User;
import com.example.budget.goals.service.SavingsGoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class SavingsGoalController {
    private final SavingsGoalService service;

    public SavingsGoalController(SavingsGoalService service) {
        this.service = service;
    }

    @GetMapping
    public List<SavingsGoalDTO> list(Authentication authentication) {
        return service.list((User) authentication.getPrincipal());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SavingsGoalDTO create(
            @Valid @RequestBody SavingsGoalRequest request,
            Authentication authentication) {
        return service.create(request, (User) authentication.getPrincipal());
    }

    @PutMapping("/{id}")
    public SavingsGoalDTO update(
            @PathVariable Long id,
            @Valid @RequestBody SavingsGoalRequest request,
            Authentication authentication) {
        return service.update(id, request, (User) authentication.getPrincipal());
    }

    @PostMapping("/{id}/contributions")
    public SavingsGoalDTO contribute(
            @PathVariable Long id,
            @Valid @RequestBody SavingsGoalContributionRequest request,
            Authentication authentication) {
        return service.contribute(id, request, (User) authentication.getPrincipal());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archive(@PathVariable Long id, Authentication authentication) {
        service.archive(id, (User) authentication.getPrincipal());
    }
}
