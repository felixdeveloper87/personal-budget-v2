package com.example.budget.household;


import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Pure calculation of who owes whom inside a household.
 *
 * <p>Works only on the entities passed in (no database access), so every rule can be unit
 * tested in isolation. Each expense share creates a debt from the participant to the payer;
 * confirmed settlements reduce it. Debts between the same two members are netted into a
 * single direction.
 */
public final class HouseholdDebtCalculator {

    /** A net debt: {@code fromId} owes {@code amount} to {@code toId}. Amount is always positive. */
    public record DebtPosition(Long fromId, Long toId, BigDecimal amount) {}

    private record PairKey(Long lowId, Long highId) {}

    private HouseholdDebtCalculator() {
    }

    /** Net debts over every share and confirmed settlement given. */
    public static List<DebtPosition> calculateDebts(
            List<HouseholdExpenseShare> shares,
            List<HouseholdSettlement> settlements) {
        Map<PairKey, BigDecimal> signedByPair = new HashMap<>();

        for (HouseholdExpenseShare share : shares) {
            Long debtor = share.getMember().getId();
            Long creditor = share.getExpense().getPayer().getId();
            if (!debtor.equals(creditor)) {
                mergeDebtDirection(signedByPair, debtor, creditor, share.getAmount());
            }
        }
        for (HouseholdSettlement settlement : settlements) {
            if (settlement.getStatus() == HouseholdSettlementStatus.CONFIRMED) {
                mergeDebtDirection(
                        signedByPair,
                        settlement.getFromMember().getId(),
                        settlement.getToMember().getId(),
                        settlement.getAmount().negate());
            }
        }

        return signedByPair.entrySet().stream()
                .filter(entry -> entry.getValue().compareTo(HouseholdValues.ZERO) != 0)
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

    /**
     * Net debts ignoring expenses dated after {@code activeThroughMonth}
     * (future-dated expenses only become due when their month arrives).
     */
    public static List<DebtPosition> calculateDebtsThroughMonth(
            List<HouseholdExpenseShare> shares,
            List<HouseholdSettlement> settlements,
            YearMonth activeThroughMonth) {
        List<HouseholdExpenseShare> activeShares = shares.stream()
                .filter(share -> isExpenseActiveThroughMonth(
                        share.getExpense(), activeThroughMonth))
                .toList();
        return calculateDebts(activeShares, settlements);
    }

    public static boolean isExpenseActiveThroughMonth(
            HouseholdExpense expense,
            YearMonth activeThroughMonth) {
        return !YearMonth.from(expense.getExpenseDate()).isAfter(activeThroughMonth);
    }

    /** Amount {@code fromMemberId} currently owes {@code toMemberId}, or zero. */
    public static BigDecimal debtAmount(
            List<DebtPosition> debts, Long fromMemberId, Long toMemberId) {
        return debts.stream()
                .filter(debt -> debt.fromId().equals(fromMemberId)
                        && debt.toId().equals(toMemberId))
                .map(DebtPosition::amount)
                .findFirst()
                .orElse(HouseholdValues.ZERO);
    }

    private static void mergeDebtDirection(
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
}
