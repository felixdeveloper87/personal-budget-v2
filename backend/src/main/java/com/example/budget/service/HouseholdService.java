package com.example.budget.service;

import com.example.budget.dto.HouseholdPageDTO;
import com.example.budget.dto.HouseholdRequests;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.*;
import com.example.budget.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class HouseholdService {
    private static final BigDecimal ZERO = new BigDecimal("0.00");

    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository memberRepository;
    private final HouseholdInvitationRepository invitationRepository;
    private final HouseholdExpenseRepository expenseRepository;
    private final HouseholdExpenseShareRepository shareRepository;
    private final HouseholdSettlementRepository settlementRepository;
    private final HouseholdAttachmentRepository attachmentRepository;
    private final HouseholdCleaningService cleaningService;
    private final UserRepository userRepository;

    public HouseholdService(
            HouseholdRepository householdRepository,
            HouseholdMemberRepository memberRepository,
            HouseholdInvitationRepository invitationRepository,
            HouseholdExpenseRepository expenseRepository,
            HouseholdExpenseShareRepository shareRepository,
            HouseholdSettlementRepository settlementRepository,
            HouseholdAttachmentRepository attachmentRepository,
            HouseholdCleaningService cleaningService,
            UserRepository userRepository) {
        this.householdRepository = householdRepository;
        this.memberRepository = memberRepository;
        this.invitationRepository = invitationRepository;
        this.expenseRepository = expenseRepository;
        this.shareRepository = shareRepository;
        this.settlementRepository = settlementRepository;
        this.attachmentRepository = attachmentRepository;
        this.cleaningService = cleaningService;
        this.userRepository = userRepository;
    }

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

    @Transactional
    public void create(HouseholdRequests.CreateHousehold request, User user) {
        if (memberRepository.existsByUserAndActiveTrue(user)) {
            throw new IllegalArgumentException("You already belong to an active household");
        }

        Household household = new Household();
        household.setName(requiredText(request.name(), "Household name", 120));
        household.setCurrency("GBP");
        household.setCreatedBy(user);
        householdRepository.save(household);

        HouseholdMember owner = new HouseholdMember();
        owner.setHousehold(household);
        owner.setUser(user);
        owner.setRole(HouseholdRole.OWNER);
        owner.setActive(true);
        memberRepository.save(owner);
    }

    @Transactional
    public void update(Long householdId, HouseholdRequests.UpdateHousehold request, User user) {
        HouseholdMember member = requireMember(householdId, user);
        requireOwner(member);
        member.getHousehold().setName(requiredText(request.name(), "Household name", 120));
        householdRepository.save(member.getHousehold());
    }

    @Transactional
    public void invite(Long householdId, HouseholdRequests.InviteMember request, User user) {
        HouseholdMember owner = requireMember(householdId, user);
        requireOwner(owner);

        String email = requiredText(request.email(), "Email", 255).toLowerCase(Locale.ROOT);
        User target = userRepository.findByEmailIgnoreCase(email)
                .filter(User::isApproved)
                .orElseThrow(() -> new IllegalArgumentException(
                        "The member must have an approved Personal Budget account"));

        if (target.getId().equals(user.getId())) {
            throw new IllegalArgumentException("You are already in this household");
        }
        if (memberRepository.existsByUserAndActiveTrue(target)) {
            throw new IllegalArgumentException("This user already belongs to an active household");
        }
        if (invitationRepository.existsByHouseholdAndTargetUserAndStatus(
                owner.getHousehold(), target, HouseholdInvitationStatus.PENDING)) {
            throw new IllegalArgumentException("An invitation is already pending for this user");
        }

        HouseholdInvitation invitation = new HouseholdInvitation();
        invitation.setHousehold(owner.getHousehold());
        invitation.setTargetUser(target);
        invitation.setInvitedBy(user);
        invitation.setStatus(HouseholdInvitationStatus.PENDING);
        invitationRepository.save(invitation);
    }

    @Transactional
    public void acceptInvitation(Long invitationId, User user) {
        HouseholdInvitation invitation = invitationRepository.findByIdAndTargetUser(invitationId, user)
                .orElseThrow(() -> new EntityNotFoundException("HouseholdInvitation", invitationId));
        requirePending(invitation);
        if (memberRepository.existsByUserAndActiveTrue(user)) {
            throw new IllegalArgumentException(
                    "Leave your current household before accepting another invitation");
        }

        HouseholdMember member = memberRepository
                .findByHouseholdAndUser(invitation.getHousehold(), user)
                .orElseGet(HouseholdMember::new);
        member.setHousehold(invitation.getHousehold());
        member.setUser(user);
        member.setRole(HouseholdRole.MEMBER);
        member.setActive(true);
        member.setDeactivatedAt(null);
        memberRepository.save(member);

        invitation.setStatus(HouseholdInvitationStatus.ACCEPTED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }

    @Transactional
    public void declineInvitation(Long invitationId, User user) {
        HouseholdInvitation invitation = invitationRepository.findByIdAndTargetUser(invitationId, user)
                .orElseThrow(() -> new EntityNotFoundException("HouseholdInvitation", invitationId));
        requirePending(invitation);
        invitation.setStatus(HouseholdInvitationStatus.DECLINED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }

    @Transactional
    public void revokeInvitation(Long householdId, Long invitationId, User user) {
        HouseholdMember owner = requireMember(householdId, user);
        requireOwner(owner);
        HouseholdInvitation invitation =
                invitationRepository.findByIdAndHousehold(invitationId, owner.getHousehold())
                        .orElseThrow(() -> new EntityNotFoundException(
                                "HouseholdInvitation", invitationId));
        requirePending(invitation);
        invitation.setStatus(HouseholdInvitationStatus.REVOKED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }

    @Transactional
    public void deactivateMember(Long householdId, Long memberId, User user) {
        HouseholdMember owner = requireMember(householdId, user);
        requireOwner(owner);
        HouseholdMember target = memberRepository
                .findByHouseholdIdAndIdAndActiveTrue(householdId, memberId)
                .orElseThrow(() -> new EntityNotFoundException("HouseholdMember", memberId));

        if (target.getRole() == HouseholdRole.OWNER) {
            throw new IllegalArgumentException("The household owner cannot be removed");
        }

        LedgerState state = loadLedger(owner.getHousehold());
        boolean hasDebt = calculateDebts(state.shares(), state.settlements()).stream()
                .anyMatch(debt -> debt.fromId().equals(memberId) || debt.toId().equals(memberId));
        boolean hasPendingSettlement = state.settlements().stream()
                .anyMatch(settlement ->
                        settlement.getStatus() == HouseholdSettlementStatus.PENDING
                                && (settlement.getFromMember().getId().equals(memberId)
                                || settlement.getToMember().getId().equals(memberId)));
        if (hasDebt || hasPendingSettlement) {
            throw new IllegalArgumentException(
                    "Settle this member's balance and pending payments before removing them");
        }

        cleaningService.removeParticipant(target);
        target.setActive(false);
        target.setDeactivatedAt(LocalDateTime.now());
        memberRepository.save(target);
    }

    @Transactional
    public Long createExpense(
            Long householdId, HouseholdRequests.Expense request, User user) {
        HouseholdMember payer = requireMember(householdId, user);
        HouseholdExpense expense = new HouseholdExpense();
        expense.setHousehold(payer.getHousehold());
        expense.setPayer(payer);
        expense.setCreatedBy(user);
        applyExpense(expense, request, payer);
        expenseRepository.save(expense);
        replaceShares(expense, request.participantMemberIds(), payer);
        return expense.getId();
    }

    @Transactional
    public void updateExpense(
            Long householdId, Long expenseId, HouseholdRequests.Expense request, User user) {
        HouseholdMember current = requireMember(householdId, user);
        HouseholdExpense expense = expenseRepository
                .findByIdAndHouseholdAndVoidedAtIsNull(expenseId, current.getHousehold())
                .orElseThrow(() -> new EntityNotFoundException("HouseholdExpense", expenseId));
        requireExpenseEditor(expense, current);
        applyExpense(expense, request, expense.getPayer());
        expenseRepository.save(expense);
        replaceShares(expense, request.participantMemberIds(), expense.getPayer());
    }

    @Transactional
    public void voidExpense(Long householdId, Long expenseId, User user) {
        HouseholdMember current = requireMember(householdId, user);
        HouseholdExpense expense = expenseRepository
                .findByIdAndHouseholdAndVoidedAtIsNull(expenseId, current.getHousehold())
                .orElseThrow(() -> new EntityNotFoundException("HouseholdExpense", expenseId));
        requireExpenseEditor(expense, current);
        expense.setVoidedAt(LocalDateTime.now());
        expenseRepository.save(expense);
    }

    @Transactional
    public Long createSettlement(
            Long householdId, HouseholdRequests.Settlement request, User user) {
        HouseholdMember from = requireMember(householdId, user);
        HouseholdMember to = memberRepository
                .findByHouseholdIdAndIdAndActiveTrue(householdId, request.toMemberId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "HouseholdMember", request.toMemberId()));
        if (from.getId().equals(to.getId())) {
            throw new IllegalArgumentException("A settlement needs two different members");
        }

        BigDecimal amount = money(request.amount(), "Settlement amount");
        LedgerState state = loadLedger(from.getHousehold());
        BigDecimal due = debtAmount(
                calculateDebts(state.shares(), state.settlements()), from.getId(), to.getId());
        BigDecimal reserved = state.settlements().stream()
                .filter(settlement -> settlement.getStatus() == HouseholdSettlementStatus.PENDING)
                .filter(settlement -> settlement.getFromMember().getId().equals(from.getId()))
                .filter(settlement -> settlement.getToMember().getId().equals(to.getId()))
                .map(HouseholdSettlement::getAmount)
                .reduce(ZERO, BigDecimal::add);
        BigDecimal available = due.subtract(reserved);
        if (available.signum() <= 0 || amount.compareTo(available) > 0) {
            throw new IllegalArgumentException("Settlement exceeds the current amount due");
        }

        HouseholdSettlement settlement = new HouseholdSettlement();
        settlement.setHousehold(from.getHousehold());
        settlement.setFromMember(from);
        settlement.setToMember(to);
        settlement.setAmount(amount);
        settlement.setSettlementDate(
                request.settlementDate() != null ? request.settlementDate() : LocalDate.now());
        settlement.setStatus(HouseholdSettlementStatus.PENDING);
        settlement.setCreatedBy(user);
        settlementRepository.save(settlement);
        return settlement.getId();
    }

    @Transactional
    public void confirmSettlement(Long householdId, Long settlementId, User user) {
        HouseholdMember recipient = requireMember(householdId, user);
        HouseholdSettlement settlement = settlementRepository
                .findByIdAndHousehold(settlementId, recipient.getHousehold())
                .orElseThrow(() -> new EntityNotFoundException(
                        "HouseholdSettlement", settlementId));
        if (!settlement.getToMember().getId().equals(recipient.getId())) {
            throw new AccessDeniedException("Only the recipient can confirm this settlement");
        }
        if (settlement.getStatus() == HouseholdSettlementStatus.CONFIRMED) {
            return;
        }
        if (settlement.getStatus() != HouseholdSettlementStatus.PENDING) {
            throw new IllegalArgumentException("This settlement is no longer pending");
        }

        LedgerState state = loadLedger(recipient.getHousehold());
        BigDecimal due = debtAmount(
                calculateDebts(state.shares(), state.settlements()),
                settlement.getFromMember().getId(),
                settlement.getToMember().getId());
        if (settlement.getAmount().compareTo(due) > 0) {
            throw new IllegalArgumentException(
                    "The balance changed and this settlement now exceeds the amount due");
        }

        settlement.setStatus(HouseholdSettlementStatus.CONFIRMED);
        settlement.setConfirmedBy(user);
        settlement.setConfirmedAt(LocalDateTime.now());
        settlementRepository.save(settlement);
    }

    @Transactional
    public void rejectSettlement(Long householdId, Long settlementId, User user) {
        HouseholdMember recipient = requireMember(householdId, user);
        HouseholdSettlement settlement = settlementRepository
                .findByIdAndHousehold(settlementId, recipient.getHousehold())
                .orElseThrow(() -> new EntityNotFoundException(
                        "HouseholdSettlement", settlementId));
        if (!settlement.getToMember().getId().equals(recipient.getId())) {
            throw new AccessDeniedException("Only the recipient can reject this settlement");
        }
        requirePending(settlement);
        settlement.setStatus(HouseholdSettlementStatus.REJECTED);
        settlement.setCancelledAt(LocalDateTime.now());
        settlementRepository.save(settlement);
    }

    @Transactional
    public void cancelSettlement(Long householdId, Long settlementId, User user) {
        HouseholdMember payer = requireMember(householdId, user);
        HouseholdSettlement settlement = settlementRepository
                .findByIdAndHousehold(settlementId, payer.getHousehold())
                .orElseThrow(() -> new EntityNotFoundException(
                        "HouseholdSettlement", settlementId));
        if (!settlement.getFromMember().getId().equals(payer.getId())) {
            throw new AccessDeniedException("Only the payer can cancel this settlement");
        }
        requirePending(settlement);
        settlement.setStatus(HouseholdSettlementStatus.CANCELLED);
        settlement.setCancelledAt(LocalDateTime.now());
        settlementRepository.save(settlement);
    }

    private HouseholdPageDTO.Dashboard buildDashboard(HouseholdMember current) {
        Household household = current.getHousehold();
        List<HouseholdMember> members =
                memberRepository.findByHouseholdAndActiveTrueOrderByIdAsc(household);
        LedgerState state = loadLedger(household);
        List<DebtPosition> debts = calculateDebts(state.shares(), state.settlements());

        Map<Long, HouseholdMember> memberById = members.stream()
                .collect(Collectors.toMap(HouseholdMember::getId, Function.identity()));
        Map<Long, BigDecimal> paid = zeroMap(members);
        Map<Long, BigDecimal> assigned = zeroMap(members);
        Map<Long, BigDecimal> balances = zeroMap(members);

        for (HouseholdExpense expense : state.expenses()) {
            paid.computeIfPresent(expense.getPayer().getId(), (id, value) ->
                    value.add(expense.getAmount()));
        }
        for (HouseholdExpenseShare share : state.shares()) {
            assigned.computeIfPresent(share.getMember().getId(), (id, value) ->
                    value.add(share.getAmount()));
        }
        for (DebtPosition debt : debts) {
            balances.computeIfPresent(debt.fromId(), (id, value) ->
                    value.subtract(debt.amount()));
            balances.computeIfPresent(debt.toId(), (id, value) ->
                    value.add(debt.amount()));
        }

        List<HouseholdPageDTO.Member> memberDTOs = members.stream()
                .map(member -> new HouseholdPageDTO.Member(
                        member.getId(),
                        member.getUser().getId(),
                        member.getUser().getName(),
                        member.getUser().getEmail(),
                        member.getRole().name(),
                        amount(paid.get(member.getId())),
                        amount(assigned.get(member.getId())),
                        amount(balances.get(member.getId()))))
                .toList();

        List<HouseholdPageDTO.MemberInvitation> memberInvitationDTOs =
                invitationRepository.findByHouseholdAndStatusOrderByCreatedAtDesc(
                                household, HouseholdInvitationStatus.PENDING)
                        .stream()
                        .map(invitation -> new HouseholdPageDTO.MemberInvitation(
                                invitation.getId(),
                                invitation.getTargetUser().getName(),
                                invitation.getTargetUser().getEmail(),
                                invitation.getCreatedAt()))
                        .toList();

        List<HouseholdPageDTO.Debt> debtDTOs = debts.stream()
                .filter(debt -> memberById.containsKey(debt.fromId())
                        && memberById.containsKey(debt.toId()))
                .map(debt -> new HouseholdPageDTO.Debt(
                        debt.fromId(),
                        memberById.get(debt.fromId()).getUser().getName(),
                        debt.toId(),
                        memberById.get(debt.toId()).getUser().getName(),
                        amount(debt.amount())))
                .toList();

        Map<Long, List<HouseholdExpenseShare>> sharesByExpense = state.shares().stream()
                .collect(Collectors.groupingBy(share -> share.getExpense().getId()));
        List<HouseholdExpense> recentExpenses = state.expenses().stream().limit(60).toList();
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
        boolean owner = current.getRole() == HouseholdRole.OWNER;
        List<HouseholdPageDTO.Expense> expenseDTOs = recentExpenses.stream()
                .map(expense -> new HouseholdPageDTO.Expense(
                        expense.getId(),
                        expense.getDescription(),
                        expense.getCategory(),
                        amount(expense.getAmount()),
                        expense.getExpenseDate(),
                        expense.getPayer().getId(),
                        expense.getPayer().getUser().getName(),
                        owner || expense.getPayer().getId().equals(current.getId()),
                        sharesByExpense.getOrDefault(expense.getId(), List.of()).stream()
                                .sorted(Comparator.comparing(share -> share.getMember().getId()))
                                .map(share -> new HouseholdPageDTO.Share(
                                        share.getMember().getId(),
                                        share.getMember().getUser().getName(),
                                        amount(share.getAmount())))
                                .toList(),
                        attachmentsByExpense
                                .getOrDefault(expense.getId(), List.of())
                                .stream()
                                .map(attachment -> toAttachmentDTO(attachment, current))
                                .toList(),
                        expense.getCreatedAt()))
                .toList();

        List<HouseholdSettlement> recentSettlements =
                state.settlements().stream().limit(40).toList();
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
        List<HouseholdPageDTO.Settlement> settlementDTOs = recentSettlements.stream()
                .map(settlement -> {
                    boolean pending =
                            settlement.getStatus() == HouseholdSettlementStatus.PENDING;
                    return new HouseholdPageDTO.Settlement(
                            settlement.getId(),
                            settlement.getFromMember().getId(),
                            settlement.getFromMember().getUser().getName(),
                            settlement.getToMember().getId(),
                            settlement.getToMember().getUser().getName(),
                            amount(settlement.getAmount()),
                            settlement.getSettlementDate(),
                            settlement.getStatus().name(),
                            pending && settlement.getToMember().getId().equals(current.getId()),
                            pending && settlement.getToMember().getId().equals(current.getId()),
                            pending && settlement.getFromMember().getId().equals(current.getId()),
                            owner || settlement.getFromMember().getId().equals(current.getId()),
                            attachmentsBySettlement
                                    .getOrDefault(settlement.getId(), List.of())
                                    .stream()
                                    .map(attachment -> toAttachmentDTO(attachment, current))
                                    .toList(),
                            settlement.getCreatedAt());
                })
                .toList();

        YearMonth currentMonth = YearMonth.now();
        BigDecimal monthSpend = state.expenses().stream()
                .filter(expense -> YearMonth.from(expense.getExpenseDate()).equals(currentMonth))
                .map(HouseholdExpense::getAmount)
                .reduce(ZERO, BigDecimal::add);
        HouseholdPageDTO.CleaningRotation cleaningRotation =
                cleaningService.dashboard(household, current);

        return new HouseholdPageDTO.Dashboard(
                household.getId(),
                household.getName(),
                household.getCurrency(),
                current.getId(),
                current.getRole().name(),
                amount(balances.getOrDefault(current.getId(), ZERO)),
                amount(monthSpend),
                cleaningRotation,
                memberDTOs,
                memberInvitationDTOs,
                debtDTOs,
                expenseDTOs,
                settlementDTOs);
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

    private LedgerState loadLedger(Household household) {
        List<HouseholdExpense> expenses =
                expenseRepository.findByHouseholdAndVoidedAtIsNullOrderByExpenseDateDescIdDesc(
                        household);
        List<HouseholdExpenseShare> shares =
                expenses.isEmpty() ? List.of() : shareRepository.findByExpenseIn(expenses);
        List<HouseholdSettlement> settlements =
                settlementRepository.findByHouseholdOrderBySettlementDateDescIdDesc(household);
        return new LedgerState(expenses, shares, settlements);
    }

    private List<DebtPosition> calculateDebts(
            List<HouseholdExpenseShare> shares,
            List<HouseholdSettlement> settlements) {
        Map<PairKey, BigDecimal> signedByPair = new HashMap<>();

        for (HouseholdExpenseShare share : shares) {
            Long debtor = share.getMember().getId();
            Long creditor = share.getExpense().getPayer().getId();
            if (!debtor.equals(creditor)) {
                mergeDirection(signedByPair, debtor, creditor, share.getAmount());
            }
        }
        for (HouseholdSettlement settlement : settlements) {
            if (settlement.getStatus() == HouseholdSettlementStatus.CONFIRMED) {
                mergeDirection(
                        signedByPair,
                        settlement.getFromMember().getId(),
                        settlement.getToMember().getId(),
                        settlement.getAmount().negate());
            }
        }

        return signedByPair.entrySet().stream()
                .filter(entry -> entry.getValue().compareTo(ZERO) != 0)
                .map(entry -> {
                    PairKey key = entry.getKey();
                    BigDecimal signed = entry.getValue();
                    return signed.signum() > 0
                            ? new DebtPosition(key.lowId(), key.highId(), signed)
                            : new DebtPosition(key.highId(), key.lowId(), signed.abs());
                })
                .sorted(Comparator.comparing(DebtPosition::fromId)
                        .thenComparing(DebtPosition::toId))
                .toList();
    }

    private void mergeDirection(
            Map<PairKey, BigDecimal> signedByPair,
            Long fromId,
            Long toId,
            BigDecimal value) {
        Long low = Math.min(fromId, toId);
        Long high = Math.max(fromId, toId);
        PairKey key = new PairKey(low, high);
        BigDecimal signed = fromId.equals(low) ? value : value.negate();
        signedByPair.merge(key, signed, BigDecimal::add);
    }

    private BigDecimal debtAmount(
            List<DebtPosition> debts, Long fromMemberId, Long toMemberId) {
        return debts.stream()
                .filter(debt -> debt.fromId().equals(fromMemberId)
                        && debt.toId().equals(toMemberId))
                .map(DebtPosition::amount)
                .findFirst()
                .orElse(ZERO);
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

    private void replaceShares(
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

    private void requireOwner(HouseholdMember member) {
        if (member.getRole() != HouseholdRole.OWNER) {
            throw new AccessDeniedException("Household owner access required");
        }
    }

    private void requireExpenseEditor(HouseholdExpense expense, HouseholdMember current) {
        if (current.getRole() != HouseholdRole.OWNER
                && !expense.getPayer().getId().equals(current.getId())) {
            throw new AccessDeniedException("You cannot edit this household expense");
        }
    }

    private void requirePending(HouseholdInvitation invitation) {
        if (invitation.getStatus() != HouseholdInvitationStatus.PENDING) {
            throw new IllegalArgumentException("This invitation is no longer pending");
        }
    }

    private void requirePending(HouseholdSettlement settlement) {
        if (settlement.getStatus() != HouseholdSettlementStatus.PENDING) {
            throw new IllegalArgumentException("This settlement is no longer pending");
        }
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

    private String requiredText(String value, String label, int maxLength) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required");
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new IllegalArgumentException(
                    label + " must be " + maxLength + " characters or fewer");
        }
        return normalized;
    }

    private BigDecimal money(BigDecimal value, String label) {
        if (value == null || value.signum() <= 0) {
            throw new IllegalArgumentException(label + " must be greater than zero");
        }
        try {
            BigDecimal normalized = value.setScale(2, RoundingMode.UNNECESSARY);
            if (normalized.precision() > 14) {
                throw new IllegalArgumentException(label + " is too large");
            }
            return normalized;
        } catch (ArithmeticException ex) {
            throw new IllegalArgumentException(label + " can have at most two decimal places");
        }
    }

    private BigDecimal amount(BigDecimal value) {
        return (value == null ? ZERO : value).setScale(2, RoundingMode.HALF_UP);
    }

    private Map<Long, BigDecimal> zeroMap(List<HouseholdMember> members) {
        return members.stream().collect(Collectors.toMap(
                HouseholdMember::getId,
                member -> ZERO,
                (left, right) -> left,
                LinkedHashMap::new));
    }

    private record PairKey(Long lowId, Long highId) {}
    private record DebtPosition(Long fromId, Long toId, BigDecimal amount) {}
    private record LedgerState(
            List<HouseholdExpense> expenses,
            List<HouseholdExpenseShare> shares,
            List<HouseholdSettlement> settlements) {}
}
