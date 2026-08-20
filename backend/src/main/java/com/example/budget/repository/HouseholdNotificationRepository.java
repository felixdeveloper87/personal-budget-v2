package com.example.budget.repository;

import com.example.budget.model.Household;
import com.example.budget.model.HouseholdMember;
import com.example.budget.model.HouseholdNotification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface HouseholdNotificationRepository
        extends JpaRepository<HouseholdNotification, Long> {
    @EntityGraph(attributePaths = {"actor", "actor.user"})
    List<HouseholdNotification> findTop50ByRecipientOrderByCreatedAtDescIdDesc(
            HouseholdMember recipient);

    long countByRecipientAndReadAtIsNull(HouseholdMember recipient);

    @Modifying
    @Query(
            value = """
                    INSERT INTO household_notifications (
                        household_id,
                        recipient_member_id,
                        actor_member_id,
                        type,
                        reference_id,
                        subject,
                        amount,
                        recipient_amount,
                        dedupe_key,
                        created_at
                    )
                    VALUES (
                        :householdId,
                        :recipientMemberId,
                        :actorMemberId,
                        :type,
                        :referenceId,
                        :subject,
                        :amount,
                        :recipientAmount,
                        :dedupeKey,
                        CURRENT_TIMESTAMP
                    )
                    ON CONFLICT (recipient_member_id, dedupe_key)
                        WHERE dedupe_key IS NOT NULL
                    DO NOTHING
                    """,
            nativeQuery = true)
    int insertIfAbsent(
            @Param("householdId") Long householdId,
            @Param("recipientMemberId") Long recipientMemberId,
            @Param("actorMemberId") Long actorMemberId,
            @Param("type") String type,
            @Param("referenceId") Long referenceId,
            @Param("subject") String subject,
            @Param("amount") BigDecimal amount,
            @Param("recipientAmount") BigDecimal recipientAmount,
            @Param("dedupeKey") String dedupeKey);

    @Modifying
    @Query("""
            UPDATE HouseholdNotification notification
            SET notification.readAt = :readAt
            WHERE notification.household = :household
              AND notification.recipient = :recipient
              AND notification.readAt IS NULL
            """)
    int markAllRead(
            @Param("household") Household household,
            @Param("recipient") HouseholdMember recipient,
            @Param("readAt") LocalDateTime readAt);
}
