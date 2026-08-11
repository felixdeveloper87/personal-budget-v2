package com.example.budget.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class HouseholdRequests {
    private HouseholdRequests() {}

    public record CreateHousehold(String name) {}
    public record UpdateHousehold(String name) {}
    public record InviteMember(String email) {}
    public record Expense(
            String description,
            String category,
            BigDecimal amount,
            LocalDate expenseDate,
            List<Long> participantMemberIds) {}
    public record Settlement(Long toMemberId, BigDecimal amount, LocalDate settlementDate) {}
    public record CleaningRotation(
            LocalDate startDate,
            boolean active,
            List<Long> participantMemberIds) {}
    public record CleaningDutyUpdate(boolean completed) {}
}
