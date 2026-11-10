package com.example.budget.household;

import com.example.budget.model.User;
import com.example.budget.household.HouseholdDebtCalculator.DebtPosition;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.example.budget.household.HouseholdValues.ZERO;
import static com.example.budget.household.HouseholdValues.amount;

/**
 * Builds the read-only Household page: balances, debts, recent expenses and payments,
 * monthly totals, cleaning rotation and notification inbox.
 */
@Service
public class HouseholdDashboardService {
    private static final int RECENT_EXPENSES = 60;
    private static final int RECENT_SETTLEMENTS = 40;

    private final HouseholdMemberRepository memberRepository;
    private final HouseholdInvitationRepository invitationRepository;
    private final HouseholdAttachmentRepository attachmentRepository;
    private final HouseholdLedgerLoader ledgerLoader;
    private final HouseholdCleaningService cleaningService;
    private final HouseholdNotificationService notificationService;

    public HouseholdDashboardService(
            HouseholdMemberRepository memberRepository,
            HouseholdInvitationRepository invitationRepository,
            HouseholdAttachmentRepository attachmentRepository,
            HouseholdLedgerLoader ledgerLoader,
            HouseholdCleaningService cleaningService,
            HouseholdNotificationService notificationService) {
        this.memberRepository = memberRepository;
        this.invitationRepository = invitationRepository;
        this.attachmentRepository = attachmentRepository;
        this.ledgerLoader = ledgerLoader;
        this.cleaningService = cleaningService;
        this.notificationService = notificationService;
    }

    /** Pending invitations for the user, plus the dashboard when they belong to a household. */
    @Transactional
    public HouseholdPageDTO page(User user) {
        List<HouseholdPageDTO.Invitation> invitations =
                invitationRepository.findByTargetUserAndStatusOrderByCreatedAtDesc(
                                user, HouseholdInvitationStatus.PENDING)
                        .stream()
                        .map(this::toInvitationDTO)
                        .toList();

        Optional<HouseholdMember> current =
                memberRepository.findFirstByUserAndActiveTrueOrderByJoinedAtAsc(user);
        if (current.isEmpty()) {
            return new HouseholdPageDTO(null, invitations);
        }
        return new HouseholdPageDTO(buildDashboard(current.get()), invitations);
    }

    private HouseholdPageDTO.Dashboard buildDashboard(HouseholdMember current) {
        Household household = current.getHousehold();
        List<HouseholdMember> members =
                memberRepository.findByHouseholdAndActiveTrueOrderByIdAsc(household);
        HouseholdLedgerLoader.Ledger ledger = ledgerLoader.load(household);
        YearMonth currentMonth = YearMonth.now();
        List<HouseholdExpense> activeExpenses = ledger.expenses().stream()
                .filter(expense -> HouseholdDebtCalculator.isExpenseActiveThroughMonth(
                        expense, currentMonth))
                .toList();
        List<HouseholdExpenseShare> activeShares = ledger.shares().stream()
                .filter(share -> HouseholdDebtCalculator.isExpenseActiveThroughMonth(
                        share.getExpense(), currentMonth))
                .toList();
        List<DebtPosition> debts = HouseholdDebtCalculator.calculateDebts(
                activeShares, ledger.settlements());

        Map<Long, HouseholdMember> memberById = members.stream()
                .collect(Collectors.toMap(HouseholdMember::getId, Function.identity()));
        boolean owner = current.getRole() == HouseholdRole.OWNER;

        Map<Long, BigDecimal> balances = balancesByMember(members, debts);
        List<HouseholdPageDTO.MonthSummary> monthSummaries =
                buildMonthSummaries(ledger.expenses(), currentMonth);
        BigDecimal monthSpend = monthSummaries.stream()
                .filter(summary -> summary.month().equals(currentMonth.toString()))
                .map(HouseholdPageDTO.MonthSummary::spend)
                .findFirst()
                .orElse(ZERO);
        // Same order as before the split: DTOs and cleaning rotation first, inbox last.
        List<HouseholdPageDTO.Member> memberDTOs = memberDTOs(
                members, ledger.expenses(), activeExpenses, activeShares, balances, currentMonth);
        List<HouseholdPageDTO.MemberInvitation> memberInvitationDTOs =
                memberInvitationDTOs(household);
        List<HouseholdPageDTO.Debt> debtDTOs = debtDTOs(debts, memberById);
        List<HouseholdPageDTO.Expense> expenseDTOs = expenseDTOs(ledger, current, owner);
        List<HouseholdPageDTO.Settlement> settlementDTOs = settlementDTOs(ledger, current, owner);
        HouseholdPageDTO.CleaningRotation cleaningRotation =
                cleaningService.dashboard(household, current);
        HouseholdNotificationService.Inbox notificationInbox =
                notificationService.inbox(current);

        return new HouseholdPageDTO.Dashboard(
                household.getId(),
                household.getName(),
                household.getCurrency(),
                current.getId(),
                current.getRole().name(),
                amount(balances.getOrDefault(current.getId(), ZERO)),
                amount(monthSpend),
                monthSummaries,
                cleaningRotation,
                memberDTOs,
                memberInvitationDTOs,
                debtDTOs,
                expenseDTOs,
                settlementDTOs,
                notificationInbox.unreadCount(),
                notificationInbox.notifications());
    }

    /** Positive balance: the member is owed money; negative: the member owes money. */
    private Map<Long, BigDecimal> balancesByMember(
            List<HouseholdMember> members, List<DebtPosition> debts) {
        Map<Long, BigDecimal> balances = zeroMap(members);
        for (DebtPosition debt : debts) {
            balances.computeIfPresent(debt.fromId(), (id, value) ->
                    value.subtract(debt.amount()));
            balances.computeIfPresent(debt.toId(), (id, value) ->
                    value.add(debt.amount()));
        }
        return balances;
    }

    private List<HouseholdPageDTO.Member> memberDTOs(
            List<HouseholdMember> members,
            List<HouseholdExpense> allExpenses,
            List<HouseholdExpense> activeExpenses,
            List<HouseholdExpenseShare> activeShares,
            Map<Long, BigDecimal> balances,
            YearMonth currentMonth) {
        Map<Long, BigDecimal> paid = zeroMap(members);
        for (HouseholdExpense expense : activeExpenses) {
            paid.computeIfPresent(expense.getPayer().getId(), (id, value) ->
                    value.add(expense.getAmount()));
        }

        Map<Long, Integer> purchaseCounts = new HashMap<>();
        Map<Long, LocalDate> lastPurchase = new HashMap<>();
        Map<Long, BigDecimal> monthPaid = zeroMap(members);
        for (HouseholdExpense expense : allExpenses) {
            Long payerId = expense.getPayer().getId();
            purchaseCounts.merge(payerId, 1, Integer::sum);
            lastPurchase.merge(payerId, expense.getExpenseDate(),
                    (a, b) -> a.isAfter(b) ? a : b);
            if (YearMonth.from(expense.getExpenseDate()).equals(currentMonth)) {
                monthPaid.computeIfPresent(payerId, (id, value) -> value.add(expense.getAmount()));
            }
        }

        Map<Long, BigDecimal> assigned = zeroMap(members);
        for (HouseholdExpenseShare share : activeShares) {
            assigned.computeIfPresent(share.getMember().getId(), (id, value) ->
                    value.add(share.getAmount()));
        }

        return members.stream()
                .map(member -> new HouseholdPageDTO.Member(
                        member.getId(),
                        member.getUser().getId(),
                        member.getDisplayName(),
                        member.getUser().getEmail(),
                        member.getRole().name(),
                        amount(paid.get(member.getId())),
                        amount(assigned.get(member.getId())),
                        amount(balances.get(member.getId())),
                        purchaseCounts.getOrDefault(member.getId(), 0),
                        lastPurchase.get(member.getId()),
                        amount(monthPaid.get(member.getId()))))
                .toList();
    }

    private List<HouseholdPageDTO.MemberInvitation> memberInvitationDTOs(Household household) {
        return invitationRepository.findByHouseholdAndStatusOrderByCreatedAtDesc(
                        household, HouseholdInvitationStatus.PENDING)
                .stream()
                .map(invitation -> new HouseholdPageDTO.MemberInvitation(
                        invitation.getId(),
                        invitation.getTargetUser().getName(),
                        invitation.getTargetUser().getEmail(),
                        invitation.getCreatedAt()))
                .toList();
    }

    private List<HouseholdPageDTO.Debt> debtDTOs(
            List<DebtPosition> debts, Map<Long, HouseholdMember> memberById) {
        return debts.stream()
                .filter(debt -> memberById.containsKey(debt.fromId())
                        && memberById.containsKey(debt.toId()))
                .map(debt -> new HouseholdPageDTO.Debt(
                        debt.fromId(),
                        memberById.get(debt.fromId()).getDisplayName(),
                        debt.toId(),
                        memberById.get(debt.toId()).getDisplayName(),
                        amount(debt.amount())))
                .toList();
    }

    private List<HouseholdPageDTO.Expense> expenseDTOs(
            HouseholdLedgerLoader.Ledger ledger, HouseholdMember current, boolean owner) {
        Map<Long, List<HouseholdExpenseShare>> sharesByExpense = ledger.shares().stream()
                .collect(Collectors.groupingBy(share -> share.getExpense().getId()));
        List<HouseholdExpense> recentExpenses =
                ledger.expenses().stream().limit(RECENT_EXPENSES).toList();
        Map<Long, List<HouseholdAttachment>> attachmentsByExpense =
                recentExpenses.isEmpty()
                        ? Map.of()
                        : attachmentRepository
                                .findByExpenseInOrderByCreatedAtAsc(recentExpenses)
                                .stream()
                                .filter(attachment ->
                                        attachment.getStatus()
                                                != HouseholdAttachmentStatus.REMOVED)
                                .collect(Collectors.groupingBy(
                                        attachment -> attachment.getExpense().getId()));
        return recentExpenses.stream()
                .map(expense -> new HouseholdPageDTO.Expense(
                        expense.getId(),
                        expense.getDescription(),
                        expense.getCategory(),
                        amount(expense.getAmount()),
                        expense.getExpenseDate(),
                        expense.getPayer().getId(),
                        expense.getPayer().getDisplayName(),
                        owner || expense.getPayer().getId().equals(current.getId()),
                        sharesByExpense.getOrDefault(expense.getId(), List.of()).stream()
                                .sorted(Comparator.comparing(share -> share.getMember().getId()))
                                .map(share -> new HouseholdPageDTO.Share(
                                        share.getMember().getId(),
                                        share.getMember().getDisplayName(),
                                        amount(share.getAmount())))
                                .toList(),
                        attachmentsByExpense
                                .getOrDefault(expense.getId(), List.of())
                                .stream()
                                .map(attachment -> toAttachmentDTO(attachment, current))
                                .toList(),
                        expense.getCreatedAt()))
                .toList();
    }

    private List<HouseholdPageDTO.Settlement> settlementDTOs(
            HouseholdLedgerLoader.Ledger ledger, HouseholdMember current, boolean owner) {
        List<HouseholdSettlement> recentSettlements =
                ledger.settlements().stream().limit(RECENT_SETTLEMENTS).toList();
        Map<Long, List<HouseholdAttachment>> attachmentsBySettlement =
                recentSettlements.isEmpty()
                        ? Map.of()
                        : attachmentRepository
                                .findBySettlementInOrderByCreatedAtAsc(recentSettlements)
                                .stream()
                                .filter(attachment ->
                                        attachment.getStatus()
                                                != HouseholdAttachmentStatus.REMOVED)
                                .collect(Collectors.groupingBy(
                                        attachment -> attachment.getSettlement().getId()));
        return recentSettlements.stream()
                .map(settlement -> new HouseholdPageDTO.Settlement(
                        settlement.getId(),
                        settlement.getFromMember().getId(),
                        settlement.getFromMember().getDisplayName(),
                        settlement.getToMember().getId(),
                        settlement.getToMember().getDisplayName(),
                        amount(settlement.getAmount()),
                        settlement.getSettlementDate(),
                        settlement.getStatus().name(),
                        owner || settlement.getFromMember().getId().equals(current.getId()),
                        attachmentsBySettlement
                                .getOrDefault(settlement.getId(), List.of())
                                .stream()
                                .map(attachment -> toAttachmentDTO(attachment, current))
                                .toList(),
                        settlement.getCreatedAt()))
                .toList();
    }

    /** Total spend and expense count per month, newest first; always includes the current month. */
    static List<HouseholdPageDTO.MonthSummary> buildMonthSummaries(
            List<HouseholdExpense> expenses,
            YearMonth currentMonth) {
        Map<YearMonth, List<HouseholdExpense>> expensesByMonth = expenses.stream()
                .collect(Collectors.groupingBy(
                        expense -> YearMonth.from(expense.getExpenseDate())));
        expensesByMonth.putIfAbsent(currentMonth, List.of());

        return expensesByMonth.entrySet().stream()
                .sorted(Map.Entry.<YearMonth, List<HouseholdExpense>>comparingByKey().reversed())
                .map(entry -> new HouseholdPageDTO.MonthSummary(
                        entry.getKey().toString(),
                        amount(entry.getValue().stream()
                                .map(HouseholdExpense::getAmount)
                                .reduce(ZERO, BigDecimal::add)),
                        entry.getValue().size()))
                .toList();
    }

    private HouseholdPageDTO.Attachment toAttachmentDTO(
            HouseholdAttachment attachment,
            HouseholdMember current) {
        boolean elapsed = !attachment.getExpiresAt().isAfter(LocalDateTime.now());
        HouseholdAttachmentStatus visibleStatus =
                attachment.getStatus() == HouseholdAttachmentStatus.AVAILABLE && elapsed
                        ? HouseholdAttachmentStatus.EXPIRED
                        : attachment.getStatus();
        boolean uploadedByCurrent = attachment.getUploadedBy() != null
                && attachment.getUploadedBy().getId().equals(current.getUser().getId());
        boolean canDelete = visibleStatus == HouseholdAttachmentStatus.AVAILABLE
                && (current.getRole() == HouseholdRole.OWNER || uploadedByCurrent);
        String uploaderName = attachment.getUploadedBy() != null
                ? attachment.getUploadedBy().getName()
                : "Former member";
        return new HouseholdPageDTO.Attachment(
                attachment.getId(),
                attachment.getOriginalFilename(),
                attachment.getContentType(),
                attachment.getSizeBytes(),
                uploaderName,
                visibleStatus.name(),
                canDelete,
                attachment.getCreatedAt(),
                attachment.getExpiresAt());
    }

    private HouseholdPageDTO.Invitation toInvitationDTO(HouseholdInvitation invitation) {
        String inviter = invitation.getInvitedBy() != null
                ? invitation.getInvitedBy().getName()
                : "A household owner";
        return new HouseholdPageDTO.Invitation(
                invitation.getId(),
                invitation.getHousehold().getId(),
                invitation.getHousehold().getName(),
                inviter,
                invitation.getCreatedAt());
    }

    private static Map<Long, BigDecimal> zeroMap(List<HouseholdMember> members) {
        return members.stream().collect(Collectors.toMap(
                HouseholdMember::getId,
                member -> ZERO,
                (left, right) -> left,
                LinkedHashMap::new));
    }
}
