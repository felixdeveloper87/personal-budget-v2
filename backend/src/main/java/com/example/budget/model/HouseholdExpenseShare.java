package com.example.budget.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(
        name = "household_expense_shares",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_household_expense_shares_expense_member",
                columnNames = {"expense_id", "member_id"}))
public class HouseholdExpenseShare {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "expense_id", nullable = false)
    private HouseholdExpense expense;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private HouseholdMember member;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    public Long getId() { return id; }
    public HouseholdExpense getExpense() { return expense; }
    public void setExpense(HouseholdExpense expense) { this.expense = expense; }
    public HouseholdMember getMember() { return member; }
    public void setMember(HouseholdMember member) { this.member = member; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}

