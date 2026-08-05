package com.example.budget.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "household_cleaning_assignments",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_household_cleaning_assignments_week",
                columnNames = {"rotation_id", "week_start"}))
public class HouseholdCleaningAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rotation_id", nullable = false)
    private HouseholdCleaningRotation rotation;

    @Column(name = "week_start", nullable = false)
    private LocalDate weekStart;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assigned_member_id", nullable = false)
    private HouseholdMember assignedMember;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completed_by_user_id")
    private User completedBy;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public HouseholdCleaningRotation getRotation() { return rotation; }
    public void setRotation(HouseholdCleaningRotation rotation) { this.rotation = rotation; }
    public LocalDate getWeekStart() { return weekStart; }
    public void setWeekStart(LocalDate weekStart) { this.weekStart = weekStart; }
    public HouseholdMember getAssignedMember() { return assignedMember; }
    public void setAssignedMember(HouseholdMember assignedMember) {
        this.assignedMember = assignedMember;
    }
    public User getCompletedBy() { return completedBy; }
    public void setCompletedBy(User completedBy) { this.completedBy = completedBy; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
