package com.example.budget.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "household_members",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_household_members_household_user",
                columnNames = {"household_id", "user_id"}))
public class HouseholdMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HouseholdRole role = HouseholdRole.MEMBER;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    @Column(name = "deactivated_at")
    private LocalDateTime deactivatedAt;

    @Column(name = "display_name", length = 120)
    private String displayName;

    @PrePersist
    protected void onCreate() {
        if (joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public Household getHousehold() { return household; }
    public void setHousehold(Household household) { this.household = household; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public HouseholdRole getRole() { return role; }
    public void setRole(HouseholdRole role) { this.role = role; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public LocalDateTime getDeactivatedAt() { return deactivatedAt; }
    public void setDeactivatedAt(LocalDateTime deactivatedAt) { this.deactivatedAt = deactivatedAt; }
    public String getDisplayName() {
        return displayName != null && !displayName.isBlank()
                ? displayName
                : user.getName();
    }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
}
