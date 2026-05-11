package com.example.budget.controller;

import com.example.budget.dto.AdminUserResponse;
import com.example.budget.dto.UpdateUserPlanRequest;
import com.example.budget.model.User;
import com.example.budget.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> list(Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        return ResponseEntity.ok(adminUserService.listAll(admin));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<AdminUserResponse> approve(
            @PathVariable Long id,
            Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        return ResponseEntity.ok(adminUserService.approve(id, admin));
    }

    @PatchMapping("/{id}/plan")
    public ResponseEntity<AdminUserResponse> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserPlanRequest request,
            Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        return ResponseEntity.ok(adminUserService.updatePlan(id, request, admin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        adminUserService.deleteUser(id, admin);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
