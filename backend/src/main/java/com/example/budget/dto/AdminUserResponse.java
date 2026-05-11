package com.example.budget.dto;

import com.example.budget.model.UserPlan;

import java.time.LocalDateTime;

public class AdminUserResponse {
    private Long id;
    private String email;
    private String name;
    private LocalDateTime createdAt;
    private boolean approved;
    private boolean admin;
    private UserPlan plan;

    public AdminUserResponse() {
    }

    public AdminUserResponse(Long id, String email, String name, LocalDateTime createdAt,
                             boolean approved, boolean admin, UserPlan plan) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.createdAt = createdAt;
        this.approved = approved;
        this.admin = admin;
        this.plan = plan;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public boolean isAdmin() {
        return admin;
    }

    public void setAdmin(boolean admin) {
        this.admin = admin;
    }

    public UserPlan getPlan() {
        return plan;
    }

    public void setPlan(UserPlan plan) {
        this.plan = plan;
    }
}
