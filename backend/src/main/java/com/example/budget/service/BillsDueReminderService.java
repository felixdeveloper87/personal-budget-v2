package com.example.budget.service;

import com.example.budget.model.PaymentMethod;
import com.example.budget.model.PaymentMethodType;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionStatus;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.repository.TransactionRepository;
import com.example.budget.service.PushNotificationService.PushMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Personal push at 09:00: what leaves your accounts tomorrow.
 *
 * <p>Credit-card spending is grouped per card, because its payment date is the
 * card's bill date and the bill is what actually gets paid. Other expenses are
 * listed one by one, but only while still scheduled (PLANNED or PENDING), so
 * something already paid is never "due".
 */
@Service
public class BillsDueReminderService {
    private static final Logger log = LoggerFactory.getLogger(BillsDueReminderService.class);
    private static final int MAX_LISTED = 3;

    private final TransactionRepository transactionRepository;
    private final PushNotificationService pushNotificationService;
    private final ZoneId zone;

    public BillsDueReminderService(
            TransactionRepository transactionRepository,
            PushNotificationService pushNotificationService,
            @Value("${app.bills.reminder-zone:Europe/London}") String zone) {
        this.transactionRepository = transactionRepository;
        this.pushNotificationService = pushNotificationService;
        this.zone = ZoneId.of(zone);
    }

    @Scheduled(
            cron = "${app.bills.reminder-cron:0 0 9 * * *}",
            zone = "${app.bills.reminder-zone:Europe/London}")
    @Transactional(readOnly = true)
    public void sendDueTomorrowReminders() {
        sendDueTomorrowReminders(LocalDate.now(zone));
    }

    void sendDueTomorrowReminders(LocalDate today) {
        if (!pushNotificationService.isEnabled()) {
            return;
        }
        LocalDate tomorrow = today.plusDays(1);
        Map<User, List<Transaction>> byUser = transactionRepository
                .findByTypeAndPaymentDate(TransactionType.EXPENSE, tomorrow)
                .stream()
                .filter(transaction -> transaction.getUser().isPushBillsDue())
                .collect(Collectors.groupingBy(Transaction::getUser, LinkedHashMap::new, Collectors.toList()));

        byUser.forEach((user, transactions) -> {
            try {
                PushMessage message = message(transactions, tomorrow);
                if (message != null) {
                    pushNotificationService.sendToUser(user.getId(), message);
                }
            } catch (RuntimeException exception) {
                log.warn("Could not build the due-tomorrow reminder for user {}", user.getId(), exception);
            }
        });
    }

    /** Builds the push for one user's expenses due on {@code dueDate}, or null when nothing is due. */
    static PushMessage message(List<Transaction> transactions, LocalDate dueDate) {
        List<Item> items = items(transactions);
        if (items.isEmpty()) {
            return null;
        }

        List<String> listed = items.stream()
                .limit(MAX_LISTED)
                .map(item -> items.size() == 1
                        ? item.label() + ", " + money(item.amount())
                        : item.label() + " " + money(item.amount()))
                .toList();
        StringBuilder body = new StringBuilder(joinWithAnd(listed, items.size() - listed.size()));
        if (items.size() > 1) {
            BigDecimal total = items.stream().map(Item::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
            body.append(". Total ").append(money(total));
        }
        body.append('.');
        return new PushMessage("Due tomorrow", body.toString(), "/", "bills-due-" + dueDate);
    }

    private static List<Item> items(List<Transaction> transactions) {
        Map<Long, Item> cards = new LinkedHashMap<>();
        List<Item> items = new ArrayList<>();
        for (Transaction transaction : transactions) {
            BigDecimal amount = transaction.getAmount();
            if (amount == null || amount.signum() <= 0) {
                continue;
            }
            PaymentMethod method = transaction.getPaymentMethod();
            if (method != null && method.getType() == PaymentMethodType.CREDIT_CARD) {
                cards.merge(
                        method.getId(),
                        new Item(cardLabel(method), amount),
                        (current, extra) -> new Item(current.label(), current.amount().add(extra.amount())));
            } else if (transaction.getStatus() == TransactionStatus.PLANNED
                    || transaction.getStatus() == TransactionStatus.PENDING) {
                items.add(new Item(label(transaction), amount));
            }
        }
        items.addAll(cards.values());
        items.sort(Comparator.comparing(Item::amount).reversed());
        return items;
    }

    private static String label(Transaction transaction) {
        if (transaction.getDescription() != null && !transaction.getDescription().isBlank()) {
            return transaction.getDescription().trim();
        }
        if (transaction.getCategory() != null && !transaction.getCategory().isBlank()) {
            return transaction.getCategory().trim();
        }
        return "A payment";
    }

    private static String cardLabel(PaymentMethod method) {
        String name = method.getName() == null || method.getName().isBlank() ? "Credit" : method.getName().trim();
        return name.toLowerCase(Locale.ROOT).contains("card") ? name : name + " card";
    }

    private static String joinWithAnd(List<String> parts, int hidden) {
        List<String> all = new ArrayList<>(parts);
        if (hidden > 0) {
            all.add(hidden + " more");
        }
        if (all.size() == 1) {
            return all.get(0);
        }
        return String.join(", ", all.subList(0, all.size() - 1)) + " and " + all.get(all.size() - 1);
    }

    private static String money(BigDecimal amount) {
        return NumberFormat.getCurrencyInstance(Locale.UK).format(amount);
    }

    private record Item(String label, BigDecimal amount) {}
}
