package com.example.budget.paymentmethod.service;

import com.example.budget.paymentmethod.dto.CardOverviewDTO;
import com.example.budget.paymentmethod.dto.CardStatementDTO;
import com.example.budget.paymentmethod.model.PaymentMethod;
import com.example.budget.paymentmethod.model.PaymentMethodType;
import com.example.budget.paymentmethod.repository.PaymentMethodRepository;
import com.example.budget.paymentmethod.service.CreditCardStatementCalculator.Statement;
import com.example.budget.paymentmethod.service.CreditCardStatementCalculator.Status;
import com.example.budget.shared.exception.EntityNotFoundException;
import com.example.budget.transaction.mapper.TransactionMapper;
import com.example.budget.transaction.model.Transaction;
import com.example.budget.transaction.model.TransactionType;
import com.example.budget.transaction.repository.TransactionRepository;
import com.example.budget.user.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/** Credit card statements (faturas) computed on the server from the card's charges. */
@Service
public class CreditCardStatementService {

    private final PaymentMethodRepository paymentMethodRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;

    public CreditCardStatementService(PaymentMethodRepository paymentMethodRepository,
                                      TransactionRepository transactionRepository,
                                      TransactionMapper transactionMapper) {
        this.paymentMethodRepository = paymentMethodRepository;
        this.transactionRepository = transactionRepository;
        this.transactionMapper = transactionMapper;
    }

    /** Summary numbers for every credit card of the user (one query for all charges). */
    @Transactional(readOnly = true)
    public List<CardOverviewDTO> overview(User user) {
        LocalDate today = LocalDate.now();
        Map<Long, List<Transaction>> chargesByCard = transactionRepository
                .findCreditCardCharges(user, TransactionType.EXPENSE, PaymentMethodType.CREDIT_CARD)
                .stream()
                .collect(Collectors.groupingBy(tx -> tx.getPaymentMethod().getId()));

        return paymentMethodRepository.findByUserOrderByActiveDescNameAsc(user).stream()
                .filter(card -> card.getType() == PaymentMethodType.CREDIT_CARD)
                .map(card -> toOverview(card,
                        CreditCardStatementCalculator.build(card, chargesByCard.getOrDefault(card.getId(), List.of()), today),
                        today))
                .toList();
    }

    /** Every statement of one card, newest first, each with its transactions. */
    @Transactional(readOnly = true)
    public List<CardStatementDTO> statements(Long cardId, User user) {
        PaymentMethod card = paymentMethodRepository.findByIdAndUser(cardId, user)
                .filter(method -> method.getType() == PaymentMethodType.CREDIT_CARD)
                .orElseThrow(() -> new EntityNotFoundException("Credit card", cardId));
        List<Transaction> charges = transactionRepository.findCardCharges(user, cardId, TransactionType.EXPENSE);
        return CreditCardStatementCalculator.build(card, charges, LocalDate.now()).stream()
                .map(statement -> new CardStatementDTO(
                        statement.key(),
                        statement.periodStart(),
                        statement.closingDate(),
                        statement.paymentDate(),
                        statement.status().name().toLowerCase(Locale.ROOT),
                        statement.total(),
                        statement.transactions().size(),
                        transactionMapper.toDTOList(statement.transactions())))
                .toList();
    }

    static CardOverviewDTO toOverview(PaymentMethod card, List<Statement> statements, LocalDate today) {
        BigDecimal currentTotal = statements.stream()
                .filter(statement -> statement.status() == Status.OPEN)
                .map(Statement::total)
                .findFirst()
                .orElse(BigDecimal.ZERO);
        // A closed statement keeps consuming the limit until its payment date.
        List<Statement> due = statements.stream()
                .filter(statement -> !statement.paymentDate().isBefore(today))
                .sorted(Comparator.comparing(Statement::paymentDate))
                .toList();
        BigDecimal outstanding = due.stream()
                .map(Statement::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Statement next = due.isEmpty() ? null : due.get(0);
        return new CardOverviewDTO(
                card.getId(),
                currentTotal,
                outstanding,
                next != null ? next.paymentDate() : null,
                next != null ? next.total() : BigDecimal.ZERO,
                statements.size());
    }
}
