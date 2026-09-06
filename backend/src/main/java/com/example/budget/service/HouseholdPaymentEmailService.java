package com.example.budget.service;

import com.example.budget.model.Household;
import com.example.budget.model.HouseholdExpense;
import com.example.budget.model.HouseholdExpenseShare;
import com.example.budget.model.HouseholdMember;
import com.example.budget.model.HouseholdSettlement;
import com.example.budget.model.HouseholdSettlementStatus;
import com.example.budget.repository.HouseholdExpenseRepository;
import com.example.budget.repository.HouseholdExpenseShareRepository;
import com.example.budget.repository.HouseholdMemberRepository;
import com.example.budget.repository.HouseholdRepository;
import com.example.budget.repository.HouseholdSettlementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Sends settlement confirmation requests and twice-monthly outstanding-payment reminders. */
@Service
public class HouseholdPaymentEmailService {
    private static final Logger log = LoggerFactory.getLogger(HouseholdPaymentEmailService.class);

    private final HouseholdRepository householdRepository;
    private final HouseholdMemberRepository memberRepository;
    private final HouseholdExpenseRepository expenseRepository;
    private final HouseholdExpenseShareRepository shareRepository;
    private final HouseholdSettlementRepository settlementRepository;
    private final ResendEmailClient resendEmailClient;
    private final HouseholdPaymentEmailTemplate emailTemplate;
    private final ZoneId emailZone;

    public HouseholdPaymentEmailService(
            HouseholdRepository householdRepository,
            HouseholdMemberRepository memberRepository,
            HouseholdExpenseRepository expenseRepository,
            HouseholdExpenseShareRepository shareRepository,
            HouseholdSettlementRepository settlementRepository,
            ResendEmailClient resendEmailClient,
            HouseholdPaymentEmailTemplate emailTemplate,
            @org.springframework.beans.factory.annotation.Value("${app.household.payment.email-zone:Europe/London}") String emailZone) {
        this.householdRepository = householdRepository;
        this.memberRepository = memberRepository;
        this.expenseRepository = expenseRepository;
        this.shareRepository = shareRepository;
        this.settlementRepository = settlementRepository;
        this.resendEmailClient = resendEmailClient;
        this.emailTemplate = emailTemplate;
        this.emailZone = ZoneId.of(emailZone);
    }

    /** Called after a payer records a settlement; only the recipient is notified. */
    public void sendPendingConfirmation(HouseholdSettlement settlement) {
        HouseholdMember recipient = settlement.getToMember();
        String email = communicationEmail(recipient);
        if (email == null) {
            return;
        }
        try {
            HouseholdPaymentEmailTemplate.EmailContent content = emailTemplate.pendingConfirmation(
                    recipient.getDisplayName(),
                    settlement.getFromMember().getDisplayName(),
                    settlement.getHousehold().getName(),
                    settlement.getAmount(),
                    settlement.getHousehold().getCurrency());
            resendEmailClient.sendHtmlBatch(
                    List.of(email),
                    "Payment awaiting your confirmation",
                    content.text(),
                    content.html());
        } catch (RuntimeException exception) {
            log.error("Could not send Household settlement confirmation email for settlement {}", settlement.getId(), exception);
        }
    }

    @Scheduled(
            cron = "${app.household.payment.reminder-email-cron:0 0 9 15,30 * *}",
            zone = "${app.household.payment.email-zone:Europe/London}")
    @Transactional(readOnly = true)
    public void sendPaymentReminders() {
        sendPaymentReminders(LocalDate.now(emailZone));
    }

    void sendPaymentReminders(LocalDate today) {
        if (today.getDayOfMonth() != 15 && today.getDayOfMonth() != 30) {
            return;
        }
        householdRepository.findAll().forEach(household -> {
            try {
                sendHouseholdReminders(household, YearMonth.from(today));
            } catch (RuntimeException exception) {
                log.error("Could not send Household payment reminders for household {}", household.getId(), exception);
            }
        });
    }

    private void sendHouseholdReminders(Household household, YearMonth currentMonth) {
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
        Map<Long, List<HouseholdPaymentEmailTemplate.Debt>> debtsByDebtor = new LinkedHashMap<>();

        for (HouseholdService.DebtPosition debt :
                HouseholdService.calculateDebtsThroughMonth(shares, settlements, currentMonth)) {
            BigDecimal unsettledAmount = debt.amount().subtract(pendingAmount(debt, settlements));
            if (unsettledAmount.signum() <= 0) {
                continue;
            }
            HouseholdMember debtor = memberById.get(debt.fromId());
            HouseholdMember creditor = memberById.get(debt.toId());
            if (debtor == null || creditor == null) {
                continue;
            }
            debtsByDebtor.computeIfAbsent(debtor.getId(), ignored -> new ArrayList<>())
                    .add(new HouseholdPaymentEmailTemplate.Debt(
                            creditor.getDisplayName(), unsettledAmount));
        }

        debtsByDebtor.forEach((debtorId, debts) -> {
            HouseholdMember debtor = memberById.get(debtorId);
            String email = communicationEmail(debtor);
            if (email == null) {
                return;
            }
            HouseholdPaymentEmailTemplate.EmailContent content = emailTemplate.paymentReminder(
                    debtor.getDisplayName(), household.getName(), debts, household.getCurrency());
            resendEmailClient.sendHtmlBatch(
                    List.of(email),
                    "Household payment reminder",
                    content.text(),
                    content.html());
        });
    }

    private BigDecimal pendingAmount(
            HouseholdService.DebtPosition debt,
            List<HouseholdSettlement> settlements) {
        return settlements.stream()
                .filter(settlement -> settlement.getStatus() == HouseholdSettlementStatus.PENDING)
                .filter(settlement -> settlement.getFromMember().getId().equals(debt.fromId()))
                .filter(settlement -> settlement.getToMember().getId().equals(debt.toId()))
                .map(HouseholdSettlement::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String communicationEmail(HouseholdMember member) {
        String email = member.getUser().getCommunicationEmail();
        return email == null || email.isBlank() ? null : email;
    }
}
