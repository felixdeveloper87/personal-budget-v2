package com.example.budget.exception;

/**
 * Login rejected because the account exists but has not been approved yet.
 */
public class AccountPendingApprovalException extends RuntimeException {

    public AccountPendingApprovalException() {
        super("Your account is pending administrator approval.");
    }
}
