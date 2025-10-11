package com.example.budget.controller;

import com.example.budget.dto.CreateInstallmentPlanRequest;
import com.example.budget.dto.InstallmentPlanDTO;
import com.example.budget.model.User;
import com.example.budget.service.InstallmentPlanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/installment-plans")
@CrossOrigin
public class InstallmentPlanController {

    private final InstallmentPlanService installmentPlanService;

    public InstallmentPlanController(InstallmentPlanService installmentPlanService) {
        this.installmentPlanService = installmentPlanService;
    }

    /**
     * Cria um novo plano de parcelamento
     * POST /api/installment-plans
     */
    @PostMapping
    public ResponseEntity<InstallmentPlanDTO> createInstallmentPlan(
            @RequestBody CreateInstallmentPlanRequest request,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            InstallmentPlanDTO plan = installmentPlanService.createInstallmentPlan(request, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(plan);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Erro ao criar plano de parcelamento: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lista todos os planos de parcelamento do usuário
     * GET /api/installment-plans
     */
    @GetMapping
    public ResponseEntity<List<InstallmentPlanDTO>> getAllInstallmentPlans(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<InstallmentPlanDTO> plans = installmentPlanService.findAllByUser(user);
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            System.err.println("Erro ao listar planos de parcelamento: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca um plano de parcelamento específico
     * GET /api/installment-plans/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<InstallmentPlanDTO> getInstallmentPlan(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            InstallmentPlanDTO plan = installmentPlanService.findById(id, user);
            return ResponseEntity.ok(plan);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Erro ao buscar plano de parcelamento: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Deleta um plano de parcelamento e todas as suas transações
     * DELETE /api/installment-plans/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstallmentPlan(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            installmentPlanService.delete(id, user);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Erro ao deletar plano de parcelamento: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

