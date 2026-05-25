package com.example.budget.dto;

import java.util.List;

/**
 * Outcome of a bulk import: how many rows were saved, how many were skipped, and why.
 */
public class ImportResultDTO {

    private int imported;
    private int failed;
    private List<RowError> errors;

    public ImportResultDTO() {
    }

    public ImportResultDTO(int imported, int failed, List<RowError> errors) {
        this.imported = imported;
        this.failed = failed;
        this.errors = errors;
    }

    public int getImported() {
        return imported;
    }

    public void setImported(int imported) {
        this.imported = imported;
    }

    public int getFailed() {
        return failed;
    }

    public void setFailed(int failed) {
        this.failed = failed;
    }

    public List<RowError> getErrors() {
        return errors;
    }

    public void setErrors(List<RowError> errors) {
        this.errors = errors;
    }

    /** A single skipped row, with its source line number and the reason. */
    public static class RowError {
        private Integer line;
        private String message;

        public RowError() {
        }

        public RowError(Integer line, String message) {
            this.line = line;
            this.message = message;
        }

        public Integer getLine() {
            return line;
        }

        public void setLine(Integer line) {
            this.line = line;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
