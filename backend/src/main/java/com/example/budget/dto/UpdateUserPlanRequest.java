package com.example.budget.dto;

import com.example.budget.model.UserPlan;
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
