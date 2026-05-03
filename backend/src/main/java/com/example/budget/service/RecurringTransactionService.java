package com.example.budget.service;

import com.example.budget.dto.CreateRecurringTransactionRequest;
import com.example.budget.dto.RecurringTransactionDTO;
import com.example.budget.dto.UpdateRecurringTransactionAmountRequest;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.mapper.RecurringTransactionMapper;
import com.example.budget.model.RecurringTransaction;
import com.example.budget.model.Transaction;
import com.example.budget.model.User;
import com.example.budget.repository.RecurringTransactionRepository;
import com.example.budget.repository.TransactionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
public class RecurringTransactionService {
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final TransactionRepository transactionRepository;
    private final RecurringTransactionMapper recurringTransactionMapper;

    public RecurringTransactionService(
            RecurringTransactionRepository recurringTransactionRepository,
            TransactionRepository transactionRepository,
            RecurringTransactionMapper recurringTransactionMapper
    ) {
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.transactionRepository = transactionRepository;
        this.recurringTransactionMapper = recurringTransactionMapper;
    }

    @Transactional
    public RecurringTransactionDTO create(CreateRecurringTransactionRequest request, User user) {
        validateDateRange(request.getStartDate(), request.getEndDate());

        RecurringTransaction recurringTransaction = recurringTransactionMapper.toEntity(request, user);
        recurringTransaction = recurringTransactionRepository.save(recurringTransaction);
        generateTransactionsForMonth(recurringTransaction, YearMonth.now());
        return recurringTransactionMapper.toDTO(recurringTransaction);
    }

    public List<RecurringTransactionDTO> findAllByUser(User user) {
        return recurringTransactionRepository.findByUserOrderByIdDesc(user).stream()
                .map(recurringTransactionMapper::toDTO)
                .toList();
    }

    public RecurringTransactionDTO findById(Long id, User user) {
        RecurringTransaction recurringTransaction = getOwnedRecurringTransaction(id, user);
        return recurringTransactionMapper.toDTO(recurringTransaction);
    }

    @Transactional
    public RecurringTransactionDTO cancel(Long id, User user) {
        RecurringTransaction recurringTransaction = getOwnedRecurringTransaction(id, user);
        recurringTransaction.setActive(false);
        return recurringTransactionMapper.toDTO(recurringTransactionRepository.save(recurringTransaction));
    }

    @Transactional
    public RecurringTransactionDTO updateAmount(Long id, UpdateRecurringTransactionAmountRequest request, User user) {
        RecurringTransaction recurringTransaction = getOwnedRecurringTransaction(id, user);
        recurringTransaction.setAmount(request.getAmount());
        return recurringTransactionMapper.toDTO(recurringTransactionRepository.save(recurringTransaction));
    }

    @Transactional
    public RecurringTransactionDTO generateDueTransactions(Long id, User user) {
        RecurringTransaction recurringTransaction = getOwnedRecurringTransaction(id, user);
        generateTransactionsForMonth(recurringTransaction, YearMonth.now());
        return recurringTransactionMapper.toDTO(recurringTransaction);
    }

    @Scheduled(cron = "0 15 0 1 * *")
    @Transactional
    public void generateDueTransactionsForAllUsers() {
        YearMonth currentMonth = YearMonth.now();
        recurringTransactionRepository.findByActiveTrue()
                .forEach(recurringTransaction -> generateTransactionsForMonth(recurringTransaction, currentMonth));
    }

    private void generateTransactionsForMonth(RecurringTransaction recurringTransaction, YearMonth month) {
        LocalDate dueDate = dateInMonth(month, recurringTransaction.getDayOfMonth());

        if (dueDate.isBefore(recurringTransaction.getStartDate())) {
            recurringTransaction.setNextRunDate(nextMonthlyDate(dueDate, recurringTransaction.getDayOfMonth()));
            return;
        }

        LocalDate endDate = recurringTransaction.getEndDate();
        if (endDate != null && dueDate.isAfter(endDate)) {
            recurringTransaction.setActive(false);
            return;
        }

        createTransactionIfMissing(recurringTransaction, dueDate);
        recurringTransaction.setNextRunDate(nextMonthlyDate(dueDate, recurringTransaction.getDayOfMonth()));

        if (endDate != null && recurringTransaction.getNextRunDate().isAfter(endDate)) {
            recurringTransaction.setActive(false);
        }
    }

    private void createTransactionIfMissing(RecurringTransaction recurringTransaction, LocalDate dueDate) {
        LocalDateTime start = dueDate.atStartOfDay();
        LocalDateTime end = dueDate.atTime(23, 59, 59);

        boolean exists = transactionRepository.existsByRecurringTransactionIdAndDateTimeBetween(
                recurringTransaction.getId(),
                start,
                end
        );

        if (exists) {
            return;
        }

        Transaction transaction = new Transaction();
        transaction.setDateTime(dueDate.atTime(12, 0));
        transaction.setType(recurringTransaction.getType());
        transaction.setCategory(recurringTransaction.getCategory());
        transaction.setDescription(recurringTransaction.getDescription());
        transaction.setAmount(recurringTransaction.getAmount());
        transaction.setUser(recurringTransaction.getUser());
        transaction.setRecurringTransaction(recurringTransaction);

        transactionRepository.save(transaction);
    }

    private LocalDate nextMonthlyDate(LocalDate currentDate, int targetDayOfMonth) {
        LocalDate nextMonth = currentDate.plusMonths(1).withDayOfMonth(1);
        int day = Math.min(targetDayOfMonth, nextMonth.lengthOfMonth());
        return nextMonth.withDayOfMonth(day);
    }

    private LocalDate dateInMonth(YearMonth month, int targetDayOfMonth) {
        int day = Math.min(targetDayOfMonth, month.lengthOfMonth());
        return month.atDay(day);
    }

    private RecurringTransaction getOwnedRecurringTransaction(Long id, User user) {
        RecurringTransaction recurringTransaction = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("RecurringTransaction", id));

        if (!recurringTransaction.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: Recurring transaction does not belong to user");
        }

        return recurringTransaction;
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must be after start date");
        }
    }
}
