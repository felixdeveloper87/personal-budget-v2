package com.example.budget.model;

import jakarta.persistence.*;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;

/** One stretch of business work: timed with start / pause / end, or entered by hand. */
@Entity
@Table(name = "work_sessions")
public class WorkSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    /** Set while paused; the pause is folded into breakSeconds on resume or end. */
    @Column(name = "paused_at")
    private Instant pausedAt;

    @Column(name = "break_seconds", nullable = false)
    private int breakSeconds;

    @Column(length = 255)
    private String note;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public boolean isOpen() {
        return endedAt == null;
    }

    public boolean isPaused() {
        return endedAt == null && pausedAt != null;
    }

    /** Time actually worked up to {@code now} (or to the end), excluding every break. */
    public long workedSeconds(Instant now) {
        Instant until = endedAt != null ? endedAt : (pausedAt != null ? pausedAt : now);
        long seconds = Duration.between(startedAt, until).getSeconds() - breakSeconds;
        return Math.max(0, seconds);
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public LocalDate getWorkDate() { return workDate; }
    public void setWorkDate(LocalDate workDate) { this.workDate = workDate; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getEndedAt() { return endedAt; }
    public void setEndedAt(Instant endedAt) { this.endedAt = endedAt; }
    public Instant getPausedAt() { return pausedAt; }
    public void setPausedAt(Instant pausedAt) { this.pausedAt = pausedAt; }
    public int getBreakSeconds() { return breakSeconds; }
    public void setBreakSeconds(int breakSeconds) { this.breakSeconds = breakSeconds; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Instant getCreatedAt() { return createdAt; }
}
