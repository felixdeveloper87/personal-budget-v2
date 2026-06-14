package com.example.budget.dto;

import com.example.budget.model.TransactionType;
import com.example.budget.model.TransactionStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * A single row of a CSV import request.
 *
 * Intentionally lenient compared to {@link CreateTransactionRequest}: description may be
 * blank and amount may be zero, since real-world bank exports often omit those. Required
 * fields ({@code date}, {@code type}, {@code amount}) are validated per-row by the service
 * so a bad row is skipped and reported rather than failing the whole import.
 */
public class ImportTransactionRow {

    /** Original 1-based line number in the source file, echoed back in error messages. */
    private Integer line;

    private LocalDate date;

    private TransactionType type;

    private String category;

    private String description;

    private BigDecimal amount;

    /** Free-text payment method name; matched case-insensitively against the user's methods. */
    private String paymentMethodName;

    /** Free-text account name; used when the request does not select one account for every row. */
    private String accountName;

    /** Optional exact cash-flow date from a full data export. */
    private LocalDate paymentDate;

    /** Optional status from a full data export. */
    private TransactionStatus status;

    public ImportTransactionRow() {
    }

    public Integer getLine() {
        return line;
    }

    public void setLine(Integer line) {
        this.line = line;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethodName() {
        return paymentMethodName;
    }

    public void setPaymentMethodName(String paymentMethodName) {
        this.paymentMethodName = paymentMethodName;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }
}
