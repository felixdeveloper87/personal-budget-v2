package com.example.budget.model;

public enum TransactionStatus {
    PLANNED,
    PENDING,
    CLEARED,
    RECONCILED;

    public boolean affectsCurrentBalance() {
        return this == CLEARED || this == RECONCILED;
    }
}
