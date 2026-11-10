package com.example.budget.transaction.model;

public enum TransactionStatus {
    PLANNED,
    PENDING,
    CLEARED,
    RECONCILED;

    public boolean affectsCurrentBalance() {
        return this == CLEARED || this == RECONCILED;
    }
}
