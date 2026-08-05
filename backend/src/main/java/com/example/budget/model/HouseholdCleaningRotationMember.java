package com.example.budget.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "household_cleaning_rotation_members",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_household_cleaning_rotation_members_member",
                        columnNames = {"rotation_id", "member_id"}),
                @UniqueConstraint(
                        name = "uq_household_cleaning_rotation_members_position",
                        columnNames = {"rotation_id", "rotation_position"})
        })
public class HouseholdCleaningRotationMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rotation_id", nullable = false)
    private HouseholdCleaningRotation rotation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private HouseholdMember member;

    @Column(name = "rotation_position", nullable = false)
    private int position;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public HouseholdCleaningRotation getRotation() { return rotation; }
    public void setRotation(HouseholdCleaningRotation rotation) { this.rotation = rotation; }
    public HouseholdMember getMember() { return member; }
    public void setMember(HouseholdMember member) { this.member = member; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
