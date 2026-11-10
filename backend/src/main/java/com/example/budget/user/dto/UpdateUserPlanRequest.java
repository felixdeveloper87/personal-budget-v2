package com.example.budget.user.dto;

import com.example.budget.user.model.UserPlan;
import jakarta.validation.constraints.NotNull;

public class UpdateUserPlanRequest {
    @NotNull(message = "plan is required")
    private UserPlan plan;

    public UserPlan getPlan() {
        return plan;
    }

    public void setPlan(UserPlan plan) {
        this.plan = plan;
    }
}
