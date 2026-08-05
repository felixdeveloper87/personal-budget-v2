package com.example.budget.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record HouseholdPageDTO(
        Dashboard household,
        List<Invitation> pendingInvitations
) {
    public record Dashboard(
            Long id,
            String name,
            String currency,
            Long currentMemberId,
            String currentMemberRole,
            BigDecimal currentUserBalance,
            BigDecimal monthSpend,
            List<Member> members,
            List<MemberInvitation> pendingMemberInvitations,
            List<Debt> debts,
            List<Expense> expenses,
            List<Settlement> settlements
    ) {}

    public record Member(
            Long id,
            Long userId,
            String name,
            String email,
            String role,
            BigDecimal totalPaid,
            BigDecimal totalShare,
            BigDecimal balance
    ) {}

    public record MemberInvitation(
            Long id,
            String targetName,
            String targetEmail,
            LocalDateTime createdAt
    ) {}

    public record Debt(
            Long fromMemberId,
            String fromMemberName,
            Long toMemberId,
            String toMemberName,
            BigDecimal amount
    ) {}

    public record Expense(
            Long id,
            String description,
            String category,
            BigDecimal amount,
            LocalDate expenseDate,
            Long payerMemberId,
            String payerName,
            boolean canEdit,
            List<Share> shares,
            List<Attachment> attachments,
            LocalDateTime createdAt
    ) {}

    public record Share(Long memberId, String memberName, BigDecimal amount) {}

    public record Attachment(
            Long id,
            String originalFilename,
            String contentType,
            long sizeBytes,
            String uploadedByName,
            String status,
            boolean canDelete,
            LocalDateTime createdAt,
            LocalDateTime expiresAt
    ) {}

    public record Settlement(
            Long id,
            Long fromMemberId,
            String fromMemberName,
            Long toMemberId,
            String toMemberName,
            BigDecimal amount,
            LocalDate settlementDate,
            String status,
            boolean canConfirm,
            boolean canReject,
            boolean canCancel,
            boolean canAttach,
            List<Attachment> attachments,
            LocalDateTime createdAt
    ) {}

    public record Invitation(
            Long id,
            Long householdId,
            String householdName,
            String invitedByName,
            LocalDateTime createdAt
    ) {}
}
