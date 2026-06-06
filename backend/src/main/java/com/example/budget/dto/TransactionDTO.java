package com.example.budget.dto;

import com.example.budget.model.TransactionType;
import com.example.budget.model.TransactionStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TransactionDTO {
    private Long id;
    private LocalDateTime dateTime;
    private LocalDate transactionDate;
    private LocalDate paymentDate;
    private TransactionType type;
    private String category;
    private String description;
    private BigDecimal amount;
    private Long paymentMethodId;
    private String paymentMethodName;
    private Long accountId;
    private String accountName;
    private TransactionStatus status;
    private Long installmentPlanId;
    private Long recurringTransactionId;
    private Integer installmentNumber;

    public TransactionDTO(
            Long id,
            LocalDateTime dateTime,
            LocalDate transactionDate,
            LocalDate paymentDate,
            TransactionType type,
            String category,
            String description,
            BigDecimal amount,
            Long paymentMethodId,
            String paymentMethodName,
            Long accountId,
            String accountName,
            TransactionStatus status,
            Long installmentPlanId,
            Long recurringTransactionId,
            Integer installmentNumber
    ) {
        this.id = id;
        this.dateTime = dateTime;
        this.transactionDate = transactionDate;
        this.paymentDate = paymentDate;
        this.type = type;
        this.category = category;
        this.description = description;
        this.amount = amount;
        this.paymentMethodId = paymentMethodId;
        this.paymentMethodName = paymentMethodName;
        this.accountId = accountId;
        this.accountName = accountName;
        this.status = status;
        this.installmentPlanId = installmentPlanId;
        this.recurringTransactionId = recurringTransactionId;
        this.installmentNumber = installmentNumber;
    }

    public Long getId() { return id; }
    public LocalDateTime getDateTime() { return dateTime; }
    public LocalDate getTransactionDate() { return transactionDate; }
    public LocalDate getPaymentDate() { return paymentDate; }
    public TransactionType getType() { return type; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public BigDecimal getAmount() { return amount; }
    public Long getPaymentMethodId() { return paymentMethodId; }
    public String getPaymentMethodName() { return paymentMethodName; }
    public Long getAccountId() { return accountId; }
    public String getAccountName() { return accountName; }
    public TransactionStatus getStatus() { return status; }
    public Long getInstallmentPlanId() { return installmentPlanId; }
    public Long getRecurringTransactionId() { return recurringTransactionId; }
    public Integer getInstallmentNumber() { return installmentNumber; }
}
