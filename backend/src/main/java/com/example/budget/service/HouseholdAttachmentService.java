package com.example.budget.service;

import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.*;
import com.example.budget.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class HouseholdAttachmentService {
    private static final Logger log =
            LoggerFactory.getLogger(HouseholdAttachmentService.class);

    private final HouseholdMemberRepository memberRepository;
    private final HouseholdExpenseRepository expenseRepository;
    private final HouseholdSettlementRepository settlementRepository;
    private final HouseholdAttachmentRepository attachmentRepository;
    private final HouseholdAttachmentStorage storage;
    private final int maxFilesPerRecord;
    private final int retentionDays;

    public HouseholdAttachmentService(
            HouseholdMemberRepository memberRepository,
            HouseholdExpenseRepository expenseRepository,
            HouseholdSettlementRepository settlementRepository,
            HouseholdAttachmentRepository attachmentRepository,
            HouseholdAttachmentStorage storage,
            @Value("${app.household.attachments.max-files-per-record:5}")
            int maxFilesPerRecord,
            @Value("${app.household.attachments.retention-days:90}") int retentionDays) {
        this.memberRepository = memberRepository;
        this.expenseRepository = expenseRepository;
        this.settlementRepository = settlementRepository;
        this.attachmentRepository = attachmentRepository;
        this.storage = storage;
        this.maxFilesPerRecord = maxFilesPerRecord;
        this.retentionDays = retentionDays;
    }

    @Transactional
    public void uploadToExpense(
            Long householdId,
            Long expenseId,
            List<MultipartFile> files,
            User user) {
        HouseholdMember current = requireMember(householdId, user);
        HouseholdExpense expense = expenseRepository
                .findByIdAndHouseholdAndVoidedAtIsNull(expenseId, current.getHousehold())
                .orElseThrow(() -> new EntityNotFoundException("HouseholdExpense", expenseId));
        if (current.getRole() != HouseholdRole.OWNER
                && !expense.getPayer().getId().equals(current.getId())) {
            throw new AccessDeniedException(
                    "Only the payer or Household owner can add expense images");
        }
        long currentCount = attachmentRepository.countByExpenseAndStatusAndExpiresAtAfter(
                expense, HouseholdAttachmentStatus.AVAILABLE, LocalDateTime.now());
        upload(files, currentCount, expense.getHousehold(), expense, null, user);
    }

    @Transactional
    public void uploadToSettlement(
            Long householdId,
            Long settlementId,
            List<MultipartFile> files,
            User user) {
        HouseholdMember current = requireMember(householdId, user);
        HouseholdSettlement settlement = settlementRepository
                .findByIdAndHousehold(settlementId, current.getHousehold())
                .orElseThrow(() -> new EntityNotFoundException(
                        "HouseholdSettlement", settlementId));
        if (current.getRole() != HouseholdRole.OWNER
                && !settlement.getFromMember().getId().equals(current.getId())) {
            throw new AccessDeniedException(
                    "Only the payer or Household owner can add payment images");
        }
        long currentCount = attachmentRepository.countBySettlementAndStatusAndExpiresAtAfter(
                settlement, HouseholdAttachmentStatus.AVAILABLE, LocalDateTime.now());
        upload(files, currentCount, settlement.getHousehold(), null, settlement, user);
    }

    @Transactional(readOnly = true)
    public AttachmentContent content(Long householdId, Long attachmentId, User user) {
        HouseholdMember current = requireMember(householdId, user);
        HouseholdAttachment attachment = attachmentRepository
                .findByIdAndHousehold(attachmentId, current.getHousehold())
                .orElseThrow(() -> new EntityNotFoundException(
                        "HouseholdAttachment", attachmentId));
        if (attachment.getStatus() != HouseholdAttachmentStatus.AVAILABLE
                || !attachment.getExpiresAt().isAfter(LocalDateTime.now())) {
            throw new EntityNotFoundException("HouseholdAttachment", attachmentId);
        }
        return new AttachmentContent(
                storage.load(attachment.getStorageKey()),
                attachment.getContentType(),
                attachment.getOriginalFilename(),
                attachment.getSizeBytes());
    }

    @Transactional
    public void remove(Long householdId, Long attachmentId, User user) {
        HouseholdMember current = requireMember(householdId, user);
        HouseholdAttachment attachment = attachmentRepository
                .findByIdAndHousehold(attachmentId, current.getHousehold())
                .orElseThrow(() -> new EntityNotFoundException(
                        "HouseholdAttachment", attachmentId));
        boolean uploader = attachment.getUploadedBy() != null
                && attachment.getUploadedBy().getId().equals(user.getId());
        if (current.getRole() != HouseholdRole.OWNER && !uploader) {
            throw new AccessDeniedException(
                    "Only the uploader or Household owner can remove this image");
        }
        if (attachment.getStatus() != HouseholdAttachmentStatus.AVAILABLE) {
            return;
        }
        storage.delete(attachment.getStorageKey());
        attachment.setStatus(HouseholdAttachmentStatus.REMOVED);
        attachment.setDeletedAt(LocalDateTime.now());
        attachmentRepository.save(attachment);
    }

    @Scheduled(cron = "${app.household.attachments.cleanup-cron:0 17 3 * * *}")
    @Transactional
    public void expireOldAttachments() {
        while (true) {
            List<HouseholdAttachment> expired =
                    attachmentRepository
                            .findTop100ByStatusAndExpiresAtLessThanEqualOrderByExpiresAtAsc(
                                    HouseholdAttachmentStatus.AVAILABLE,
                                    LocalDateTime.now());
            if (expired.isEmpty()) {
                return;
            }
            int changed = 0;
            for (HouseholdAttachment attachment : expired) {
                try {
                    storage.delete(attachment.getStorageKey());
                    attachment.setStatus(HouseholdAttachmentStatus.EXPIRED);
                    attachment.setDeletedAt(LocalDateTime.now());
                    attachmentRepository.save(attachment);
                    changed++;
                } catch (RuntimeException ex) {
                    log.warn(
                            "Could not expire Household attachment {}",
                            attachment.getId(),
                            ex);
                }
            }
            attachmentRepository.flush();
            if (changed == 0 || expired.size() < 100) {
                return;
            }
        }
    }

    private void upload(
            List<MultipartFile> files,
            long currentCount,
            Household household,
            HouseholdExpense expense,
            HouseholdSettlement settlement,
            User user) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Choose at least one image");
        }
        if (files.size() + currentCount > maxFilesPerRecord) {
            throw new IllegalArgumentException(
                    "Each record can have up to " + maxFilesPerRecord + " images");
        }

        List<HouseholdAttachmentStorage.StoredFile> stored = new ArrayList<>();
        try {
            List<HouseholdAttachment> attachments = new ArrayList<>();
            for (MultipartFile file : files) {
                HouseholdAttachmentStorage.StoredFile saved =
                        storage.store(household.getId(), file);
                stored.add(saved);

                HouseholdAttachment attachment = new HouseholdAttachment();
                attachment.setHousehold(household);
                attachment.setExpense(expense);
                attachment.setSettlement(settlement);
                attachment.setUploadedBy(user);
                attachment.setStorageKey(saved.storageKey());
                attachment.setOriginalFilename(saved.originalFilename());
                attachment.setContentType(saved.contentType());
                attachment.setSizeBytes(saved.sizeBytes());
                attachment.setStatus(HouseholdAttachmentStatus.AVAILABLE);
                attachment.setCreatedAt(LocalDateTime.now());
                attachment.setExpiresAt(LocalDateTime.now().plusDays(retentionDays));
                attachments.add(attachment);
            }
            attachmentRepository.saveAllAndFlush(attachments);
        } catch (RuntimeException ex) {
            stored.forEach(saved -> {
                try {
                    storage.delete(saved.storageKey());
                } catch (RuntimeException cleanupError) {
                    log.warn("Could not remove an incomplete Household upload", cleanupError);
                }
            });
            throw ex;
        }
    }

    private HouseholdMember requireMember(Long householdId, User user) {
        HouseholdMember member = memberRepository
                .findFirstByUserAndActiveTrueOrderByJoinedAtAsc(user)
                .orElseThrow(() -> new AccessDeniedException(
                        "Active household membership required"));
        if (!member.getHousehold().getId().equals(householdId)) {
            throw new AccessDeniedException("Active household membership required");
        }
        return member;
    }

    public record AttachmentContent(
            Path path,
            String contentType,
            String originalFilename,
            long sizeBytes) {}
}
