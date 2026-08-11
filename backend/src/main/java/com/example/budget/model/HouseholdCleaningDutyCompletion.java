package com.example.budget.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "household_cleaning_duty_completions",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_household_cleaning_duties_assignment_key",
                columnNames = {"assignment_id", "duty_key"}))
public class HouseholdCleaningDutyCompletion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assignment_id", nullable = false)
    private HouseholdCleaningAssignment assignment;

    @Column(name = "duty_key", nullable = false, length = 64)
    private String dutyKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completed_by_user_id")
    private User completedBy;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    public Long getId() { return id; }
    public HouseholdCleaningAssignment getAssignment() { return assignment; }
    public void setAssignment(HouseholdCleaningAssignment assignment) {
        this.assignment = assignment;
    }
    public String getDutyKey() { return dutyKey; }
    public void setDutyKey(String dutyKey) { this.dutyKey = dutyKey; }
    public User getCompletedBy() { return completedBy; }
    public void setCompletedBy(User completedBy) { this.completedBy = completedBy; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
