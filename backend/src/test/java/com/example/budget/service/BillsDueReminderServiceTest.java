package com.example.budget.service;

import com.example.budget.model.PaymentMethod;
import com.example.budget.model.PaymentMethodType;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionStatus;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.repository.TransactionRepository;
import com.example.budget.service.PushNotificationService.PushMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BillsDueReminderServiceTest {
    private static final LocalDate TOMORROW = LocalDate.of(2026, 10, 7);

    @Mock private TransactionRepository transactionRepository;
    @Mock private PushNotificationService pushNotificationService;

    @Test
    void singleScheduledExpenseReadsLikeTheExample() {
        PushMessage message = BillsDueReminderService.message(
                List.of(expense("Rent", "850.00", TransactionStatus.PLANNED, null)), TOMORROW);

        assertThat(message.title()).isEqualTo("Due tomorrow");
        assertThat(message.body()).isEqualTo("Rent, £850.00.");
        assertThat(message.tag()).isEqualTo("bills-due-2026-10-07");
    }

    @Test
    void creditCardSpendingIsGroupedIntoOneLinePerCard() {
        PaymentMethod nubank = card(1L, "Nubank");
        PushMessage message = BillsDueReminderService.message(List.of(
                expense("Rent", "850.00", TransactionStatus.PLANNED, null),
                // Card purchases count whatever their status: the bill is what gets paid.
                expense("Groceries", "120.00", TransactionStatus.CLEARED, nubank),
                expense("Laptop 3/10", "200.00", TransactionStatus.PLANNED, nubank)), TOMORROW);

        assertThat(message.body()).isEqualTo("Rent £850.00 and Nubank card £320.00. Total £1,170.00.");
    }

    @Test
    void alreadyPaidNonCardExpensesAreNotDue() {
        PushMessage message = BillsDueReminderService.message(
                List.of(expense("Coffee", "3.50", TransactionStatus.CLEARED, null)), TOMORROW);

        assertThat(message).isNull();
    }

    @Test
    void longListsShowTheThreeLargestAndCountTheRest() {
        PushMessage message = BillsDueReminderService.message(List.of(
                expense("Gym", "30.00", TransactionStatus.PLANNED, null),
                expense("Rent", "850.00", TransactionStatus.PLANNED, null),
                expense("Phone", "20.00", TransactionStatus.PENDING, null),
                expense("Council tax", "150.00", TransactionStatus.PLANNED, null),
                expense("Netflix", "10.99", TransactionStatus.PLANNED, null)), TOMORROW);

        assertThat(message.body()).isEqualTo(
                "Rent £850.00, Council tax £150.00, Gym £30.00 and 2 more. Total £1,060.99.");
    }

    @Test
    void usersWhoTurnedTheReminderOffAreSkipped() {
        BillsDueReminderService service =
                new BillsDueReminderService(transactionRepository, pushNotificationService, "Europe/London");
        User optedOut = user(1L, false);
        User optedIn = user(2L, true);
        Transaction a = expense("Rent", "850.00", TransactionStatus.PLANNED, null);
        a.setUser(optedOut);
        Transaction b = expense("Rent", "700.00", TransactionStatus.PLANNED, null);
        b.setUser(optedIn);
        when(pushNotificationService.isEnabled()).thenReturn(true);
        when(transactionRepository.findByTypeAndPaymentDate(TransactionType.EXPENSE, TOMORROW))
                .thenReturn(List.of(a, b));

        service.sendDueTomorrowReminders(TOMORROW.minusDays(1));

        ArgumentCaptor<PushMessage> captor = ArgumentCaptor.forClass(PushMessage.class);
        verify(pushNotificationService).sendToUser(eq(2L), captor.capture());
        verify(pushNotificationService, never()).sendToUser(eq(1L), any());
        assertThat(captor.getValue().body()).isEqualTo("Rent, £700.00.");
    }

    private static Transaction expense(String description, String amount, TransactionStatus status, PaymentMethod card) {
        Transaction transaction = new Transaction();
        transaction.setType(TransactionType.EXPENSE);
        transaction.setDescription(description);
        transaction.setAmount(new BigDecimal(amount));
        transaction.setStatus(status);
        transaction.setPaymentMethod(card);
        transaction.setPaymentDate(TOMORROW);
        return transaction;
    }

    private static PaymentMethod card(Long id, String name) {
        PaymentMethod method = new PaymentMethod();
        ReflectionTestUtils.setField(method, "id", id);
        method.setName(name);
        method.setType(PaymentMethodType.CREDIT_CARD);
        return method;
    }

    private static User user(Long id, boolean billsDue) {
        User user = new User("u" + id + "@example.com", "secret", "User " + id);
        ReflectionTestUtils.setField(user, "id", id);
        user.setPushBillsDue(billsDue);
        return user;
    }
}
