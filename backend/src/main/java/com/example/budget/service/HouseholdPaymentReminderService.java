package com.example.budget.service;

import com.example.budget.model.Household;
import com.example.budget.model.HouseholdExpense;
import com.example.budget.model.HouseholdExpenseShare;
import com.example.budget.model.HouseholdMember;
import com.example.budget.model.HouseholdNotificationType;
import com.example.budget.model.HouseholdSettlement;
import com.example.budget.repository.HouseholdExpenseRepository;
import com.example.budget.repository.HouseholdExpenseShareRepository;
import com.example.budget.repository.HouseholdMemberRepository;
import com.example.budget.repository.HouseholdRepository;
import com.example.budget.repository.HouseholdSettlementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Twice-monthly reminder to members who still owe money. It lands in the
 * Household inbox and, through it, as a push notification.
 */
@Service
public class HouseholdPaymentReminderService {
    private static final Logger log = LoggerFactory.getLogger(HouseholdPaymentReminderService.class);

    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository memberRepository;
    private final HouseholdExpenseRepository expenseRepository;
    private final HouseholdExpenseShareRepository shareRepository;
    private final HouseholdSettlementRepository settlementRepository;
    private final HouseholdNotificationService notificationService;
    private final ZoneId zone;

    public HouseholdPaymentReminderService(
            HouseholdRepository householdRepository,
            HouseholdMemberRepository memberRepository,
            HouseholdExpenseRepository expenseRepository,
            HouseholdExpenseShareRepository shareRepository,
            HouseholdSettlementRepository settlementRepository,
            HouseholdNotificationService notificationService,
            @Value("${app.household.payment.reminder-zone:Europe/London}") String zone) {
        this.householdRepository = householdRepository;
        this.memberRepository = memberRepository;
        this.expenseRepository = expenseRepository;
        this.shareRepository = shareRepository;
        this.settlementRepository = settlementRepository;
        this.notificationService = notificationService;
        this.zone = ZoneId.of(zone);
    }

    @Scheduled(
            cron = "${app.household.payment.reminder-cron:0 0 9 15,30 * *}",
            zone = "${app.household.payment.reminder-zone:Europe/London}")
    @Transactional
    public void sendPaymentReminders() {
        sendPaymentReminders(LocalDate.now(zone));
    }

    void sendPaymentReminders(LocalDate today) {
        if (today.getDayOfMonth() != 15 && today.getDayOfMonth() != 30) {
            return;
        }
        householdRepository.findAll().forEach(household -> {
            try {
                remindHousehold(household, today);
            } catch (RuntimeException exception) {
                log.error("Could not send Household payment reminders for household {}", household.getId(), exception);
            }
        });
    }

    private void remindHousehold(Household household, LocalDate today) {
        List<HouseholdMember> members = memberRepository.findByHouseholdAndActiveTrueOrderByIdAsc(household);
        if (members.isEmpty()) {
            return;
        }
        List<HouseholdExpense> expenses =
                expenseRepository.findByHouseholdAndVoidedAtIsNullOrderByExpenseDateDescIdDesc(household);
        List<HouseholdExpenseShare> shares =
                expenses.isEmpty() ? List.of() : shareRepository.findByExpenseIn(expenses);
        List<HouseholdSettlement> settlements =
                settlementRepository.findByHouseholdOrderBySettlementDateDescIdDesc(household);
        Map<Long, HouseholdMember> memberById = new LinkedHashMap<>();
        members.forEach(member -> memberById.put(member.getId(), member));

        Map<Long, BigDecimal> owedByDebtor = new LinkedHashMap<>();
        Map<Long, Long> creditorCountByDebtor = new LinkedHashMap<>();
        Map<Long, String> onlyCreditorByDebtor = new LinkedHashMap<>();
        for (HouseholdService.DebtPosition debt :
                HouseholdService.calculateDebtsThroughMonth(shares, settlements, YearMonth.from(today))) {
            HouseholdMember debtor = memberById.get(debt.fromId());
            HouseholdMember creditor = memberById.get(debt.toId());
            if (debt.amount().signum() <= 0 || debtor == null || creditor == null) {
                continue;
            }
            owedByDebtor.merge(debtor.getId(), debt.amount(), BigDecimal::add);
            creditorCountByDebtor.merge(debtor.getId(), 1L, Long::sum);
            onlyCreditorByDebtor.put(debtor.getId(), creditor.getDisplayName());
        }

        owedByDebtor.forEach((debtorId, total) -> notificationService.notifyMemberOnce(
                memberById.get(debtorId),
                null,
                HouseholdNotificationType.SETTLEMENT_REMINDER,
                null,
                // Name the creditor only when there is exactly one.
                creditorCountByDebtor.get(debtorId) == 1 ? onlyCreditorByDebtor.get(debtorId) : null,
                total,
                "settlement-reminder:" + today));
    }
}
