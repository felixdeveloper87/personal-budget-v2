package com.example.budget.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * User entity representing an application user.
 * 
 * Stores user authentication credentials and profile information.
 * Has a one-to-many relationship with Transaction entities.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    /**
     * Optional address used only for product communications.  It intentionally
     * does not participate in authentication, password resets or JWTs.
     */
    @Column(name = "communication_email")
    private String communicationEmail;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /** {@code false} until an administrator approves the account (new signups). */
    @Column(nullable = false)
    private boolean approved = false;

    /** Application administrator; may access {@code /api/admin/**} endpoints. */
    @Column(nullable = false)
    private boolean admin = false;

    /** Incremented after a credential reset so previously issued JWTs become invalid. */
    @Column(name = "auth_version", nullable = false)
    private int authVersion = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserPlan plan = UserPlan.STANDARD;

    /**
     * Optional global "expected monthly income" used by the cash-flow forecast as
     * a predictable (but not fixed) income tier. {@code null} means no plan is set,
     * so the forecast falls back to estimating income from recent history.
     */
    @Column(name = "planned_monthly_income")
    private BigDecimal plannedMonthlyIncome;

    /**
     * Optional global "estimated day-to-day expense" — a monthly assumption for
     * variable spending (groceries, transport, etc) that the cash-flow forecast
     * adds on top of fixed payments and installments. {@code null} means no plan
     * is set, so the forecast only counts fixed/installment commitments.
     */
    @Column(name = "planned_monthly_variable_expense")
    private BigDecimal plannedMonthlyVariableExpense;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Transaction> transactions;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public User() {
    }

    public User(String email, String password, String name) {
        this.email = email;
        this.password = password;
        this.name = name;
    }
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCommunicationEmail() {
        return communicationEmail;
    }

    public void setCommunicationEmail(String communicationEmail) {
        this.communicationEmail = communicationEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public boolean isAdmin() {
        return admin;
    }

    public void setAdmin(boolean admin) {
        this.admin = admin;
    }

    public int getAuthVersion() {
        return authVersion;
    }

    public void setAuthVersion(int authVersion) {
        this.authVersion = authVersion;
    }

    public UserPlan getPlan() {
        return plan;
    }

    public void setPlan(UserPlan plan) {
        this.plan = plan;
    }

    public BigDecimal getPlannedMonthlyIncome() {
        return plannedMonthlyIncome;
    }

    public void setPlannedMonthlyIncome(BigDecimal plannedMonthlyIncome) {
        this.plannedMonthlyIncome = plannedMonthlyIncome;
    }

    public BigDecimal getPlannedMonthlyVariableExpense() {
        return plannedMonthlyVariableExpense;
    }

    public void setPlannedMonthlyVariableExpense(BigDecimal plannedMonthlyVariableExpense) {
        this.plannedMonthlyVariableExpense = plannedMonthlyVariableExpense;
    }

    public List<Transaction> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<Transaction> transactions) {
        this.transactions = transactions;
    }
}
