package com.example.budget.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/** Audit record that prevents sending the same scheduled cleaning email twice. */
@Entity
@Table(
        name = "household_cleaning_email_deliveries",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_household_cleaning_email_delivery",
                columnNames = {"assignment_id", "delivery_type"}))
public class HouseholdCleaningEmailDelivery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assignment_id", nullable = false)
    private HouseholdCleaningAssignment assignment;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_type", nullable = false, length = 32)
    private HouseholdCleaningEmailDeliveryType deliveryType;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @PrePersist
    protected void onCreate() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }

    public void setAssignment(HouseholdCleaningAssignment assignment) {
        this.assignment = assignment;
    }

    public void setDeliveryType(HouseholdCleaningEmailDeliveryType deliveryType) {
        this.deliveryType = deliveryType;
    }
}
