package com.example.budget.household;

import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static com.example.budget.household.HouseholdValues.requiredText;

/**
 * The household itself and its members: create, rename, rename/remove members, inbox.
 *
 * <p>Related services: {@link HouseholdInvitationService}, {@link HouseholdExpenseService},
 * {@link HouseholdSettlementService} and {@link HouseholdDashboardService} (page data).
 */
@Service
public class HouseholdService {
    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository memberRepository;
    private final HouseholdAccess access;
    private final HouseholdLedgerLoader ledgerLoader;
    private final HouseholdCleaningService cleaningService;
    private final HouseholdNotificationService notificationService;

    public HouseholdService(
            HouseholdRepository householdRepository,
            HouseholdMemberRepository memberRepository,
            HouseholdAccess access,
            HouseholdLedgerLoader ledgerLoader,
            HouseholdCleaningService cleaningService,
            HouseholdNotificationService notificationService) {
        this.householdRepository = householdRepository;
        this.memberRepository = memberRepository;
        this.access = access;
        this.ledgerLoader = ledgerLoader;
        this.cleaningService = cleaningService;
        this.notificationService = notificationService;
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
        HouseholdMember member = access.requireMember(householdId, user);
        access.requireOwner(member);
        member.getHousehold().setName(requiredText(request.name(), "Household name", 120));
        householdRepository.save(member.getHousehold());
    }

    @Transactional
    public void deactivateMember(Long householdId, Long memberId, User user) {
        HouseholdMember owner = access.requireMember(householdId, user);
        access.requireOwner(owner);
        HouseholdMember target = memberRepository
                .findByHouseholdIdAndIdAndActiveTrue(householdId, memberId)
                .orElseThrow(() -> new EntityNotFoundException("HouseholdMember", memberId));

        if (target.getRole() == HouseholdRole.OWNER) {
            throw new IllegalArgumentException("The household owner cannot be removed");
        }

        HouseholdLedgerLoader.Ledger ledger = ledgerLoader.load(owner.getHousehold());
        boolean hasDebt = HouseholdDebtCalculator
                .calculateDebts(ledger.shares(), ledger.settlements())
                .stream()
                .anyMatch(debt -> debt.fromId().equals(memberId) || debt.toId().equals(memberId));
        if (hasDebt) {
            throw new IllegalArgumentException(
                    "Settle this member's balance before removing them");
        }

        cleaningService.removeParticipant(target);
        target.setActive(false);
        target.setDeactivatedAt(LocalDateTime.now());
        memberRepository.save(target);
        notificationService.notifyHousehold(
                owner.getHousehold(),
                owner,
                HouseholdNotificationType.MEMBER_REMOVED,
                target.getId(),
                target.getDisplayName(),
                null);
    }

    @Transactional
    public void updateMemberName(
            Long householdId,
            Long memberId,
            HouseholdRequests.UpdateMemberName request,
            User user) {
        HouseholdMember owner = access.requireMember(householdId, user);
        access.requireOwner(owner);
        HouseholdMember target = memberRepository
                .findByHouseholdIdAndIdAndActiveTrue(householdId, memberId)
                .orElseThrow(() -> new EntityNotFoundException("HouseholdMember", memberId));
        target.setDisplayName(requiredText(request.name(), "Member name", 120));
        memberRepository.save(target);
    }

    @Transactional
    public void markNotificationsRead(Long householdId, User user) {
        notificationService.markAllRead(access.requireMember(householdId, user));
    }
}
