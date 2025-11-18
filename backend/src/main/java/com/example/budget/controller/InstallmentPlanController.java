package com.example.budget.controller;

import com.example.budget.dto.CreateInstallmentPlanRequest;
import com.example.budget.dto.InstallmentPlanDTO;
import com.example.budget.model.User;
import com.example.budget.service.InstallmentPlanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for installment plan management endpoints.
 * 
 * Handles CRUD operations for installment plans. When a plan is created,
 * it automatically generates the corresponding transaction entries for each installment.
 * All endpoints require authentication and are scoped to the authenticated user.
 */
@RestController
@RequestMapping("/api/installment-plans")
@CrossOrigin
public class InstallmentPlanController {

    private final InstallmentPlanService installmentPlanService;

    public InstallmentPlanController(InstallmentPlanService installmentPlanService) {
        this.installmentPlanService = installmentPlanService;
    }

    /**
     * Creates a new installment plan and generates corresponding transactions.
     * 
     * Creates an installment plan with the specified number of installments and value.
     * Automatically generates transaction entries for each installment, spaced monthly
     * from the start date.
     * 
     * @param request CreateInstallmentPlanRequest containing plan details (installments, value, category, description, dates)
     * @param authentication Spring Security authentication object containing the authenticated user
     * @return InstallmentPlanDTO containing the created plan with all generated transactions (HTTP 201 CREATED)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InstallmentPlanDTO createInstallmentPlan(
            @Valid @RequestBody CreateInstallmentPlanRequest request,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return installmentPlanService.createInstallmentPlan(request, user);
    }

    /**
     * Retrieves all installment plans for the authenticated user.
     * 
     * Returns plans ordered by ID in descending order (newest first).
     * 
     * @param authentication Spring Security authentication object containing the authenticated user
     * @return List of InstallmentPlanDTO for the authenticated user
     */
    @GetMapping
    public List<InstallmentPlanDTO> getAllInstallmentPlans(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return installmentPlanService.findAllByUser(user);
    }

    /**
     * Retrieves a specific installment plan by ID.
     * 
     * Only the owner of the plan can access it. Throws AccessDeniedException
     * if the user attempts to access a plan they don't own.
     * 
     * @param id Installment plan ID
     * @param authentication Spring Security authentication object containing the authenticated user
     * @return InstallmentPlanDTO containing the plan details and all associated transactions
     */
    @GetMapping("/{id}")
    public InstallmentPlanDTO getInstallmentPlan(
            @PathVariable Long id,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return installmentPlanService.findById(id, user);
    }

    /**
     * Deletes an installment plan and all associated transactions.
     * 
     * Only the owner of the plan can delete it. Throws AccessDeniedException
     * if the user attempts to delete a plan they don't own.
     * 
     * Due to cascade configuration, deleting a plan automatically deletes
     * all associated transaction entries.
     * 
     * @param id Installment plan ID to delete
     * @param authentication Spring Security authentication object containing the authenticated user
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteInstallmentPlan(
            @PathVariable Long id,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        installmentPlanService.delete(id, user);
    }
}

