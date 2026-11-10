package com.example.budget.auth.exception;

/**
 * Login rejected because the account exists but has not been approved yet.
 */
public class AccountPendingApprovalException extends RuntimeException {

    public AccountPendingApprovalException() {
        super("Your account is pending administrator approval.");
    }
}
