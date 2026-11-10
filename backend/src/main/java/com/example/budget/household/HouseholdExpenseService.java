package com.example.budget.household;

import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static com.example.budget.household.HouseholdValues.amount;
import static com.example.budget.household.HouseholdValues.money;
import static com.example.budget.household.HouseholdValues.requiredText;

/** Shared expenses: create, edit, void, split into shares, and paged history. */
@Service
public class HouseholdExpenseService {
    private static final int HISTORY_PAGE_SIZE = 50;

    private final HouseholdAccess access;
    private final HouseholdMemberRepository memberRepository;
    private final HouseholdExpenseRepository expenseRepository;
    private final HouseholdExpenseShareRepository shareRepository;
    private final HouseholdAttachmentRepository attachmentRepository;
    private final HouseholdNotificationService notificationService;

    public HouseholdExpenseService(
            HouseholdAccess access,
            HouseholdMemberRepository memberRepository,
            HouseholdExpenseRepository expenseRepository,
            HouseholdExpenseShareRepository shareRepository,
            HouseholdAttachmentRepository attachmentRepository,
            HouseholdNotificationService notificationService) {
        this.access = access;
        this.memberRepository = memberRepository;
        this.expenseRepository = expenseRepository;
        this.shareRepository = shareRepository;
        this.attachmentRepository = attachmentRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public HouseholdExpenseHistoryDTO expenseHistory(Long householdId, int page, User user) {
        HouseholdMember member = access.requireMember(householdId, user);
        if (page < 0) {
            throw new IllegalArgumentException("Page must not be negative");
        }
        var expenses = expenseRepository.findByHouseholdAndVoidedAtIsNullOrderByExpenseDateDescIdDesc(
                member.getHousehold(), PageRequest.of(page, HISTORY_PAGE_SIZE));
        Map<Long, BigDecimal> currentUserShares = expenses.isEmpty()
                ? Map.of()
                : shareRepository.findByExpenseInAndMember(expenses.getContent(), member).stream()
                        .collect(Collectors.toMap(share -> share.getExpense().getId(), HouseholdExpenseShare::getAmount));
        LocalDateTime now = LocalDateTime.now();
        Map<Long, List<HouseholdAttachment>> proofs = expenses.isEmpty()
                ? Map.of()
                : attachmentRepository.findByExpenseInOrderByCreatedAtAsc(expenses.getContent()).stream()
                        .filter(attachment -> attachment.getStatus() == HouseholdAttachmentStatus.AVAILABLE
                                && attachment.getExpiresAt().isAfter(now))
                        .collect(Collectors.groupingBy(attachment -> attachment.getExpense().getId()));
        var items = expenses.getContent().stream()
                .map(expense -> new HouseholdExpenseHistoryDTO.Item(
                        expense.getId(),
                        expense.getDescription(),
                        expense.getCategory(),
                        amount(expense.getAmount()),
                        expense.getExpenseDate(),
                        expense.getPayer().getId(),
                        expense.getPayer().getDisplayName(),
                        currentUserShares.get(expense.getId()),
                        proofs.getOrDefault(expense.getId(), List.of()).size(),
                        proofs.getOrDefault(expense.getId(), List.of()).stream()
                                .map(proof -> new HouseholdExpenseHistoryDTO.Proof(
                                        proof.getId(), proof.getOriginalFilename(), proof.getStatus().name()))
                                .toList()))
                .toList();
        return new HouseholdExpenseHistoryDTO(items, page, expenses.hasNext());
    }

    @Transactional
    public Long createExpense(
            Long householdId, HouseholdRequests.Expense request, User user) {
        HouseholdMember payer = access.requireMember(householdId, user);
        HouseholdExpense expense = new HouseholdExpense();
        expense.setHousehold(payer.getHousehold());
        expense.setPayer(payer);
        expense.setCreatedBy(user);
        applyExpense(expense, request, payer);
        expenseRepository.save(expense);
        List<HouseholdExpenseShare> shares = replaceShares(
                expense,
                request.participantMemberIds(),
                payer);
        notificationService.notifyExpense(
                expense,
                payer,
                HouseholdNotificationType.EXPENSE_CREATED,
                shares);
        return expense.getId();
    }

    @Transactional
    public void updateExpense(
            Long householdId, Long expenseId, HouseholdRequests.Expense request, User user) {
        HouseholdMember current = access.requireMember(householdId, user);
        HouseholdExpense expense = expenseRepository
                .findByIdAndHouseholdAndVoidedAtIsNull(expenseId, current.getHousehold())
                .orElseThrow(() -> new EntityNotFoundException("HouseholdExpense", expenseId));
        access.requireExpenseEditor(expense, current);
        applyExpense(expense, request, expense.getPayer());
        expenseRepository.save(expense);
        List<HouseholdExpenseShare> shares = replaceShares(
                expense,
                request.participantMemberIds(),
                expense.getPayer());
        notificationService.notifyExpense(
                expense,
                current,
                HouseholdNotificationType.EXPENSE_UPDATED,
                shares);
    }

    @Transactional
    public void voidExpense(Long householdId, Long expenseId, User user) {
        HouseholdMember current = access.requireMember(householdId, user);
        HouseholdExpense expense = expenseRepository
                .findByIdAndHouseholdAndVoidedAtIsNull(expenseId, current.getHousehold())
                .orElseThrow(() -> new EntityNotFoundException("HouseholdExpense", expenseId));
        access.requireExpenseEditor(expense, current);
        expense.setVoidedAt(LocalDateTime.now());
        expenseRepository.save(expense);
        notificationService.notifyExpense(
                expense,
                current,
                HouseholdNotificationType.EXPENSE_VOIDED,
                shareRepository.findByExpenseIn(List.of(expense)));
    }

    private void applyExpense(
            HouseholdExpense expense,
            HouseholdRequests.Expense request,
            HouseholdMember payer) {
        expense.setDescription(requiredText(request.description(), "Description", 255));
        expense.setCategory(requiredText(request.category(), "Category", 80));
        expense.setAmount(money(request.amount(), "Expense amount"));
        expense.setExpenseDate(
                request.expenseDate() != null ? request.expenseDate() : LocalDate.now());
        if (!payer.isActive()) {
            throw new IllegalArgumentException("The payer is not an active household member");
        }
    }

    /**
     * Splits the expense equally between the participants (all active members when none are
     * given). Leftover pennies go to the participants with the lowest member ids.
     */
    private List<HouseholdExpenseShare> replaceShares(
            HouseholdExpense expense,
            List<Long> requestedParticipantIds,
            HouseholdMember payer) {
        List<HouseholdMember> activeMembers =
                memberRepository.findByHouseholdAndActiveTrueOrderByIdAsc(expense.getHousehold());
        Set<Long> requested = requestedParticipantIds == null || requestedParticipantIds.isEmpty()
                ? activeMembers.stream().map(HouseholdMember::getId)
                        .collect(Collectors.toCollection(LinkedHashSet::new))
                : new LinkedHashSet<>(requestedParticipantIds);

        List<HouseholdMember> participants = activeMembers.stream()
                .filter(member -> requested.contains(member.getId()))
                .sorted(Comparator.comparing(HouseholdMember::getId))
                .toList();
        if (participants.size() != requested.size()) {
            throw new IllegalArgumentException(
                    "Every participant must be an active member of this household");
        }
        if (participants.size() < 2) {
            throw new IllegalArgumentException("Select at least two household members");
        }
        if (participants.stream().noneMatch(member -> member.getId().equals(payer.getId()))) {
            throw new IllegalArgumentException("The payer must be included in the split");
        }

        long totalPence;
        try {
            totalPence = expense.getAmount().movePointRight(2).longValueExact();
        } catch (ArithmeticException ex) {
            throw new IllegalArgumentException("Expense amount is too large");
        }
        long base = totalPence / participants.size();
        long remainder = totalPence % participants.size();

        shareRepository.deleteByExpense(expense);
        shareRepository.flush();

        List<HouseholdExpenseShare> shares = new ArrayList<>();
        for (int index = 0; index < participants.size(); index++) {
            long pence = base + (index < remainder ? 1 : 0);
            HouseholdExpenseShare share = new HouseholdExpenseShare();
            share.setExpense(expense);
            share.setMember(participants.get(index));
            share.setAmount(BigDecimal.valueOf(pence, 2));
            shares.add(share);
        }
        shareRepository.saveAll(shares);
        return shares;
    }
}
