package com.example.budget.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * Request body for bulk CSV import. Carries the parsed rows produced by the client.
 */
public class ImportTransactionsRequest {

    @NotEmpty(message = "No rows to import")
    private List<ImportTransactionRow> rows;

    public ImportTransactionsRequest() {
    }

    public List<ImportTransactionRow> getRows() {
        return rows;
    }

    public void setRows(List<ImportTransactionRow> rows) {
        this.rows = rows;
    }
}
