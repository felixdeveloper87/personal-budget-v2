package com.example.budget.household;

import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

import static com.example.budget.household.HouseholdValues.amount;
import static com.example.budget.household.HouseholdValues.money;

/** Payments between members that pay off debts, plus paged payment history. */
@Service
public class HouseholdSettlementService {
    private static final int HISTORY_PAGE_SIZE = 50;

    private final HouseholdAccess access;
    private final HouseholdMemberRepository memberRepository;
    private final HouseholdSettlementRepository settlementRepository;
    private final HouseholdLedgerLoader ledgerLoader;
    private final HouseholdNotificationService notificationService;

    public HouseholdSettlementService(
            HouseholdAccess access,
            HouseholdMemberRepository memberRepository,
            HouseholdSettlementRepository settlementRepository,
            HouseholdLedgerLoader ledgerLoader,
            HouseholdNotificationService notificationService) {
        this.access = access;
        this.memberRepository = memberRepository;
        this.settlementRepository = settlementRepository;
        this.ledgerLoader = ledgerLoader;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public HouseholdPaymentHistoryDTO paymentHistory(Long householdId, int page, User user) {
        HouseholdMember member = access.requireMember(householdId, user);
        if (page < 0) {
            throw new IllegalArgumentException("Page must not be negative");
        }
        var payments = settlementRepository.findByHouseholdOrderBySettlementDateDescIdDesc(
                member.getHousehold(), PageRequest.of(page, HISTORY_PAGE_SIZE));
        var items = payments.getContent().stream()
                .map(payment -> new HouseholdPaymentHistoryDTO.Item(
                        payment.getId(),
                        payment.getFromMember().getId(),
                        payment.getFromMember().getDisplayName(),
                        payment.getToMember().getId(),
                        payment.getToMember().getDisplayName(),
                        amount(payment.getAmount()),
                        payment.getSettlementDate(),
                        payment.getStatus().name()))
                .toList();
        return new HouseholdPaymentHistoryDTO(items, page, payments.hasNext());
    }

    /**
     * Records a payment from the current user to another member. The amount cannot exceed
     * what is owed up to the current month (future-dated expenses are not yet due).
     */
    @Transactional
    public Long createSettlement(
            Long householdId, HouseholdRequests.Settlement request, User user) {
        HouseholdMember from = access.requireMember(householdId, user);
        HouseholdMember to = memberRepository
                .findByHouseholdIdAndIdAndActiveTrue(householdId, request.toMemberId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "HouseholdMember", request.toMemberId()));
        if (from.getId().equals(to.getId())) {
            throw new IllegalArgumentException("A settlement needs two different members");
        }

        BigDecimal amount = money(request.amount(), "Settlement amount");
        HouseholdLedgerLoader.Ledger ledger = ledgerLoader.load(from.getHousehold());
        BigDecimal due = HouseholdDebtCalculator.debtAmount(
                HouseholdDebtCalculator.calculateDebtsThroughMonth(
                        ledger.shares(), ledger.settlements(), YearMonth.now()),
                from.getId(),
                to.getId());
        if (due.signum() <= 0 || amount.compareTo(due) > 0) {
            throw new IllegalArgumentException("Settlement exceeds the current amount due");
        }

        HouseholdSettlement settlement = new HouseholdSettlement();
        settlement.setHousehold(from.getHousehold());
        settlement.setFromMember(from);
        settlement.setToMember(to);
        settlement.setAmount(amount);
        settlement.setSettlementDate(
                request.settlementDate() != null ? request.settlementDate() : LocalDate.now());
        settlement.setStatus(HouseholdSettlementStatus.CONFIRMED);
        settlement.setCreatedBy(user);
        settlement.setConfirmedBy(user);
        settlement.setConfirmedAt(LocalDateTime.now());
        settlementRepository.save(settlement);
        notificationService.notifyMember(
                to,
                from,
                HouseholdNotificationType.SETTLEMENT_CREATED,
                settlement.getId(),
                null,
                settlement.getAmount());
        return settlement.getId();
    }
}
