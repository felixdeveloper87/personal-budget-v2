package com.example.budget.dto;

import com.example.budget.model.UserPlan;

/**
 * Authentication / registration response payload.
 *
 * <p>Sign-up without approval returns {@link #pendingApproval} {@code true} and no token.
 * Successful login always has a token and {@code pendingApproval} false (or null).
 */
public class AuthResponse {
    private Long userId;
    private String name;
    private String email;
    private String token;
    private UserPlan plan;
    private Boolean admin;
    private Boolean pendingApproval;
    private String approvalMessage;

    public AuthResponse() {
    }

    public AuthResponse(Long userId, String name, String email, String token, UserPlan plan, Boolean admin) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.token = token;
        this.plan = plan;
        this.admin = admin;
        this.pendingApproval = false;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserPlan getPlan() {
        return plan;
    }

    public void setPlan(UserPlan plan) {
        this.plan = plan;
    }

    public Boolean getAdmin() {
        return admin;
    }

    public void setAdmin(Boolean admin) {
        this.admin = admin;
    }

    public Boolean getPendingApproval() {
        return pendingApproval;
    }

    public void setPendingApproval(Boolean pendingApproval) {
        this.pendingApproval = pendingApproval;
    }

    public String getApprovalMessage() {
        return approvalMessage;
    }

    public void setApprovalMessage(String approvalMessage) {
        this.approvalMessage = approvalMessage;
    }
}
