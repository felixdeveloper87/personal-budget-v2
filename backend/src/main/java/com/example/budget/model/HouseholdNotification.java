package com.example.budget.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "household_notifications")
public class HouseholdNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_member_id", nullable = false)
    private HouseholdMember recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_member_id")
    private HouseholdMember actor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 48)
    private HouseholdNotificationType type;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(length = 255)
    private String subject;

    @Column(precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "recipient_amount", precision = 14, scale = 2)
    private BigDecimal recipientAmount;

    @Column(name = "dedupe_key", length = 160)
    private String dedupeKey;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public Household getHousehold() { return household; }
    public void setHousehold(Household household) { this.household = household; }
    public HouseholdMember getRecipient() { return recipient; }
    public void setRecipient(HouseholdMember recipient) { this.recipient = recipient; }
    public HouseholdMember getActor() { return actor; }
    public void setActor(HouseholdMember actor) { this.actor = actor; }
    public HouseholdNotificationType getType() { return type; }
    public void setType(HouseholdNotificationType type) { this.type = type; }
    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public BigDecimal getRecipientAmount() { return recipientAmount; }
    public void setRecipientAmount(BigDecimal recipientAmount) {
        this.recipientAmount = recipientAmount;
    }
    public String getDedupeKey() { return dedupeKey; }
    public void setDedupeKey(String dedupeKey) { this.dedupeKey = dedupeKey; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
}
