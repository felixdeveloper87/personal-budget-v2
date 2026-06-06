package com.example.budget.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * Request body for bulk CSV import. Carries the parsed rows produced by the client.
 */
public class ImportTransactionsRequest {

    @NotEmpty(message = "No rows to import")
    private List<ImportTransactionRow> rows;

    /** Optional. When null, rows are imported without an account and can be associated later. */
    private Long accountId;

    public ImportTransactionsRequest() {
    }

    public List<ImportTransactionRow> getRows() {
        return rows;
    }

    public void setRows(List<ImportTransactionRow> rows) {
        this.rows = rows;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }
}
