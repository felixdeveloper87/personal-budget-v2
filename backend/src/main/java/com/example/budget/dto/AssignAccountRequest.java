package com.example.budget.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Lightweight request to associate an existing installment plan or recurring rule
 * with a balance account, without recalculating amounts, dates or schedules.
 */
public class AssignAccountRequest {

    @NotNull
    private Long accountId;

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }
}
