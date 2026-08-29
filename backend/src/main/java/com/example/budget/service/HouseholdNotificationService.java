package com.example.budget.service;

import com.example.budget.dto.HouseholdPageDTO;
import com.example.budget.model.*;
import com.example.budget.repository.HouseholdMemberRepository;
import com.example.budget.repository.HouseholdNotificationRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HouseholdNotificationService {
    private final HouseholdNotificationRepository notificationRepository;
    private final HouseholdMemberRepository memberRepository;

    public HouseholdNotificationService(
            HouseholdNotificationRepository notificationRepository,
            HouseholdMemberRepository memberRepository) {
        this.notificationRepository = notificationRepository;
        this.memberRepository = memberRepository;
    }

    public void notifyHousehold(
            Household household,
            HouseholdMember actor,
            HouseholdNotificationType type,
            Long referenceId,
            String subject,
            BigDecimal amount) {
        notifyHousehold(household, actor, type, referenceId, subject, amount, null);
    }

    public void notifyHouseholdOnce(
            Household household,
            HouseholdMember actor,
            HouseholdNotificationType type,
            Long referenceId,
            String subject,
            BigDecimal amount,
            String dedupeKey) {
        notifyHousehold(household, actor, type, referenceId, subject, amount, dedupeKey);
    }

    public void notifyMember(
            HouseholdMember recipient,
            HouseholdMember actor,
            HouseholdNotificationType type,
            Long referenceId,
            String subject,
            BigDecimal amount) {
        save(recipient, actor, type, referenceId, subject, amount, null);
    }

    public void notifyMemberOnce(
            HouseholdMember recipient,
            HouseholdMember actor,
            HouseholdNotificationType type,
            Long referenceId,
            String subject,
            BigDecimal amount,
            String dedupeKey) {
        save(recipient, actor, type, referenceId, subject, amount, dedupeKey);
    }

    public void notifyExpense(
            HouseholdExpense expense,
            HouseholdMember actor,
            HouseholdNotificationType type,
            List<HouseholdExpenseShare> shares) {
        Map<Long, BigDecimal> shareByMember = shares.stream()
                .collect(Collectors.toMap(
                        share -> share.getMember().getId(),
                        HouseholdExpenseShare::getAmount));
        memberRepository
                .findByHouseholdAndActiveTrueOrderByIdAsc(expense.getHousehold())
                .stream()
                .filter(member -> !member.getId().equals(actor.getId()))
                .forEach(member -> save(
                        member,
                        actor,
                        type,
                        expense.getId(),
                        expense.getDescription(),
                        expense.getAmount(),
                        shareByMember.get(member.getId()),
                        null));
    }

    public Inbox inbox(HouseholdMember recipient) {
        List<HouseholdPageDTO.Notification> notifications = notificationRepository
                .findTop50ByRecipientOrderByCreatedAtDescIdDesc(recipient)
                .stream()
                .map(notification -> new HouseholdPageDTO.Notification(
                        notification.getId(),
                        notification.getType().name(),
                        notification.getActor() != null
                                ? notification.getActor().getId()
                                : null,
                        notification.getActor() != null
                                ? notification.getActor().getDisplayName()
                                : null,
                        notification.getReferenceId(),
                        notification.getSubject(),
                        notification.getAmount(),
                        notification.getRecipientAmount(),
                        notification.getCreatedAt(),
                        notification.getReadAt()))
                .toList();
        return new Inbox(
                notificationRepository.countByRecipientAndReadAtIsNull(recipient),
                notifications);
    }

    public void markAllRead(HouseholdMember recipient) {
        notificationRepository.markAllRead(
                recipient.getHousehold(),
                recipient,
                LocalDateTime.now());
    }

    private void notifyHousehold(
            Household household,
            HouseholdMember actor,
            HouseholdNotificationType type,
            Long referenceId,
            String subject,
            BigDecimal amount,
            String dedupeKey) {
        memberRepository.findByHouseholdAndActiveTrueOrderByIdAsc(household)
                .stream()
                .filter(member -> actor == null || !member.getId().equals(actor.getId()))
                .forEach(member -> save(
                        member,
                        actor,
                        type,
                        referenceId,
                        subject,
                        amount,
                        null,
                        dedupeKey));
    }

    private void save(
            HouseholdMember recipient,
            HouseholdMember actor,
            HouseholdNotificationType type,
            Long referenceId,
            String subject,
            BigDecimal amount,
            String dedupeKey) {
        save(recipient, actor, type, referenceId, subject, amount, null, dedupeKey);
    }

    private void save(
            HouseholdMember recipient,
            HouseholdMember actor,
            HouseholdNotificationType type,
            Long referenceId,
            String subject,
            BigDecimal amount,
            BigDecimal recipientAmount,
            String dedupeKey) {
        if (!recipient.isActive()) {
            return;
        }
        if (actor != null && recipient.getId().equals(actor.getId())) {
            return;
        }
        if (dedupeKey != null) {
            notificationRepository.insertIfAbsent(
                    recipient.getHousehold().getId(),
                    recipient.getId(),
                    actor != null ? actor.getId() : null,
                    type.name(),
                    referenceId,
                    subject,
                    amount,
                    recipientAmount,
                    dedupeKey);
            return;
        }

        HouseholdNotification notification = new HouseholdNotification();
        notification.setHousehold(recipient.getHousehold());
        notification.setRecipient(recipient);
        notification.setActor(actor);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setSubject(subject);
        notification.setAmount(amount);
        notification.setRecipientAmount(recipientAmount);
        notification.setDedupeKey(dedupeKey);
        notificationRepository.save(notification);
    }

    public record Inbox(
            long unreadCount,
            List<HouseholdPageDTO.Notification> notifications) {}
}
