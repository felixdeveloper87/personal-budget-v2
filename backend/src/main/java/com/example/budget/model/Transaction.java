package com.example.budget.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Transaction entity representing a financial transaction.
 * 
 * Can be either an income or expense. May be part of an installment plan,
 * in which case it represents a single installment. Automatically sets
 * the date and time to the current moment if not provided during creation.
 */
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_time")
    private LocalDateTime dateTime;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    private String category;

    private String description;

    @Column(precision = 14, scale = 2)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "installment_plan_id")
    @JsonIgnore
    private InstallmentPlan installmentPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recurring_transaction_id")
    @JsonIgnore
    private RecurringTransaction recurringTransaction;

    @Column(name = "installment_number")
    private Integer installmentNumber;

    @PrePersist
    protected void onCreate() {
        if (this.dateTime == null) {
            this.dateTime = LocalDateTime.now();
        }
    }

    public Transaction() {
    }

    public Transaction(TransactionType type, String category, String description, BigDecimal amount, User user) {
        this.type = type;
        this.category = category;
        this.description = description;
        this.amount = amount;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public InstallmentPlan getInstallmentPlan() {
        return installmentPlan;
    }

    public void setInstallmentPlan(InstallmentPlan installmentPlan) {
        this.installmentPlan = installmentPlan;
    }

    public RecurringTransaction getRecurringTransaction() {
        return recurringTransaction;
    }

    public void setRecurringTransaction(RecurringTransaction recurringTransaction) {
        this.recurringTransaction = recurringTransaction;
    }

    public Integer getInstallmentNumber() {
        return installmentNumber;
    }

    public void setInstallmentNumber(Integer installmentNumber) {
        this.installmentNumber = installmentNumber;
    }
}
