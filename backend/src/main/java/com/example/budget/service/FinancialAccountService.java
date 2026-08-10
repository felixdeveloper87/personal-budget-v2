package com.example.budget.service;

import com.example.budget.dto.*;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.*;
import com.example.budget.repository.AccountTransferRepository;
import com.example.budget.repository.FinancialAccountRepository;
import com.example.budget.repository.TransactionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
public class FinancialAccountService {
    private final FinancialAccountRepository accountRepository;
    private final AccountTransferRepository transferRepository;
    private final TransactionRepository transactionRepository;

    public FinancialAccountService(
            FinancialAccountRepository accountRepository,
            AccountTransferRepository transferRepository,
            TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transferRepository = transferRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public AccountSummaryDTO summary(User user) {
        List<FinancialAccountDTO> accounts = accountRepository
                .findByUserOrderByActiveDescNameAsc(user)
                .stream()
                .map(account -> toDTO(account, user))
                .toList();
        BigDecimal total = accounts.stream()
                .filter(FinancialAccountDTO::active)
                .map(FinancialAccountDTO::currentBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new AccountSummaryDTO(
                total,
                transactionRepository.countByUserAndAccountIsNull(user),
                accounts);
    }

    @Transactional(readOnly = true)
    public List<FinancialAccountDTO> list(User user) {
        return accountRepository.findByUserOrderByActiveDescNameAsc(user).stream()
                .map(account -> toDTO(account, user))
                .toList();
    }

    @Transactional(readOnly = true)
    public AccountDetailsDTO details(Long id, User user) {
        FinancialAccount account = getOwnedAccount(id, user);
        LocalDate today = LocalDate.now();

        List<AccountActivityItemDTO> recent = mergeRecentActivity(account, user, today, 10);

        List<AccountActivityItemDTO> upcoming = Stream.concat(
                        transactionRepository
                                .findTop20ByUserAndAccountAndPaymentDateGreaterThanOrderByPaymentDateAscIdAsc(
                                        user, account, today)
                                .stream()
                                .map(this::toActivity),
                        Stream.concat(
                                transferRepository
                                        .findTop20ByFromAccountAndTransferDateGreaterThanOrderByTransferDateAscIdAsc(
                                                account, today)
                                        .stream()
                                        .map(transfer -> toTransferActivity(transfer, false)),
                                transferRepository
                                        .findTop20ByToAccountAndTransferDateGreaterThanOrderByTransferDateAscIdAsc(
                                                account, today)
                                        .stream()
                                        .map(transfer -> toTransferActivity(transfer, true))))
                .sorted(Comparator.comparing(AccountActivityItemDTO::date)
                        .thenComparing(AccountActivityItemDTO::id))
                .limit(10)
                .toList();

        return new AccountDetailsDTO(toDTO(account, user), recent, upcoming);
    }

    /**
     * One page of an account's past activity (transactions + transfers, both
     * directions), most recent first. Unlike {@link #details}'s fixed 10-row
     * preview, this pages arbitrarily far back.
     *
     * Each source query is capped at {@code (page + 1) * size + 1} rows (the
     * "+1" is a sentinel used only to detect whether another page exists) —
     * since every source is independently sorted newest-first, merging each
     * source's own top-N and re-cutting to top-N globally is exactly correct,
     * as long as N is at least the true global top-N need, which it is here.
     */
    @Transactional(readOnly = true)
    public AccountActivityPageDTO recentActivityPage(Long id, User user, int page, int size) {
        FinancialAccount account = getOwnedAccount(id, user);
        LocalDate today = LocalDate.now();

        int fetchLimit = (page + 1) * size + 1;
        List<AccountActivityItemDTO> merged = mergeRecentActivity(account, user, today, fetchLimit);

        int from = Math.min(page * size, merged.size());
        int to = Math.min(from + size, merged.size());
        boolean hasMore = merged.size() > to;

        return new AccountActivityPageDTO(merged.subList(from, to), page, size, hasMore);
    }

    /** Shared merge-sort of transactions + both transfer directions, capped at {@code limit}. */
    private List<AccountActivityItemDTO> mergeRecentActivity(
            FinancialAccount account, User user, LocalDate today, int limit) {
        PageRequest cap = PageRequest.of(0, limit);
        return Stream.concat(
                        Stream.concat(
                                transactionRepository
                                        .findNonCreditCardAccountActivity(
                                                user, account, today, PaymentMethodType.CREDIT_CARD, cap)
                                        .stream()
                                        .map(this::toActivity),
                                transactionRepository
                                        .findCreditCardStatementActivity(
                                                user, account, today, PaymentMethodType.CREDIT_CARD,
                                                TransactionType.EXPENSE, cap)
                                        .stream()
                                        .map(this::toCreditCardStatementActivity)),
                        Stream.concat(
                                transferRepository
                                        .findByFromAccountAndTransferDateLessThanEqualOrderByTransferDateDescIdDesc(
                                                account, today, cap)
                                        .stream()
                                        .map(transfer -> toTransferActivity(transfer, false)),
                                transferRepository
                                        .findByToAccountAndTransferDateLessThanEqualOrderByTransferDateDescIdDesc(
                                                account, today, cap)
                                        .stream()
                                        .map(transfer -> toTransferActivity(transfer, true))))
                .sorted(Comparator.comparing(AccountActivityItemDTO::date).reversed()
                        .thenComparing(AccountActivityItemDTO::id, Comparator.reverseOrder()))
                .limit(limit)
                .toList();
    }

    private AccountActivityItemDTO toCreditCardStatementActivity(Object[] statement) {
        Long id = (Long) statement[0];
        LocalDate paymentDate = (LocalDate) statement[1];
        String paymentMethodName = (String) statement[2];
        BigDecimal signedAmount = (BigDecimal) statement[3];
        TransactionType type = signedAmount.signum() < 0
                ? TransactionType.INCOME
                : TransactionType.EXPENSE;

        return new AccountActivityItemDTO(
                id,
                paymentDate,
                type.name(),
                "Paid with " + paymentMethodName + " credit card",
                "Credit card statement",
                signedAmount.abs(),
                null,
                paymentMethodName,
                PaymentMethodType.CREDIT_CARD);
    }

    @Transactional
    public FinancialAccountDTO create(FinancialAccountRequest request, User user) {
        FinancialAccount account = new FinancialAccount();
        apply(account, request);
        account.setUser(user);
        account.setBalanceAnchorAt(LocalDateTime.now());
        return toDTO(accountRepository.save(account), user);
    }

    @Transactional
    public FinancialAccountDTO update(Long id, FinancialAccountRequest request, User user) {
        FinancialAccount account = getOwnedAccount(id, user);
        BigDecimal currentBalance = currentBalance(account, user);
        BigDecimal adjustedOpeningBalance = account.getOpeningBalance()
                .add(request.getOpeningBalance().subtract(currentBalance));
        apply(account, request);
        account.setOpeningBalance(adjustedOpeningBalance);
        return toDTO(accountRepository.save(account), user);
    }

    @Transactional
    public void archive(Long id, User user) {
        FinancialAccount account = getOwnedAccount(id, user);
        account.setActive(false);
        accountRepository.save(account);
    }

    @Transactional
    public AccountTransferDTO transfer(AccountTransferRequest request, User user) {
        FinancialAccount from = getOwnedAccount(request.getFromAccountId(), user);
        FinancialAccount to = getOwnedAccount(request.getToAccountId(), user);
        if (from.getId().equals(to.getId())) {
            throw new IllegalArgumentException("Source and destination accounts must be different");
        }
        if (!from.isActive() || !to.isActive()) {
            throw new IllegalArgumentException("Transfers require active accounts");
        }
        if (!from.getCurrency().equalsIgnoreCase(to.getCurrency())) {
            throw new IllegalArgumentException("Transfers between different currencies are not supported");
        }

        AccountTransfer transfer = new AccountTransfer();
        transfer.setUser(user);
        transfer.setFromAccount(from);
        transfer.setToAccount(to);
        transfer.setAmount(request.getAmount());
        transfer.setTransferDate(request.getTransferDate());
        transfer.setDescription(request.getDescription());
        return toDTO(transferRepository.save(transfer));
    }

    @Transactional(readOnly = true)
    public List<AccountTransferDTO> listTransfers(User user) {
        return transferRepository.findByUserOrderByTransferDateDescIdDesc(user).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public FinancialAccount getOwnedAccount(Long id, User user) {
        if (id == null) {
            return null;
        }
        FinancialAccount account = accountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FinancialAccount", id));
        if (!account.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: Account does not belong to user");
        }
        return account;
    }

    @Transactional(readOnly = true)
    public List<FinancialAccount> findEntitiesByUser(User user) {
        return accountRepository.findByUserOrderByActiveDescNameAsc(user);
    }

    @Transactional(readOnly = true)
    public BigDecimal currentBalance(FinancialAccount account, User user) {
        LocalDate today = LocalDate.now();
        LocalDate anchorDate = account.getBalanceAnchorAt().toLocalDate();
        BigDecimal balance = account.getOpeningBalance();

        for (Transaction transaction : transactionRepository
                .findByUserAndAccountAndPaymentDateBetween(user, account, anchorDate, today)) {
            if (transaction.getDateTime() == null
                    || !transaction.getDateTime().isAfter(account.getBalanceAnchorAt())
                    || transaction.getStatus() == null
                    || !transaction.getStatus().affectsCurrentBalance()) {
                continue;
            }
            balance = transaction.getType() == TransactionType.INCOME
                    ? balance.add(transaction.getAmount())
                    : balance.subtract(transaction.getAmount());
        }

        for (AccountTransfer transfer : transferRepository
                .findByFromAccountAndTransferDateBetween(account, anchorDate, today)) {
            balance = balance.subtract(transfer.getAmount());
        }
        for (AccountTransfer transfer : transferRepository
                .findByToAccountAndTransferDateBetween(account, anchorDate, today)) {
            balance = balance.add(transfer.getAmount());
        }
        return balance;
    }

    private void apply(FinancialAccount account, FinancialAccountRequest request) {
        BigDecimal overdraftLimit = request.getOverdraftLimit() != null
                ? request.getOverdraftLimit()
                : BigDecimal.ZERO;
        if (request.getType() != AccountType.CURRENT && overdraftLimit.signum() > 0) {
            throw new IllegalArgumentException("Overdraft is only supported for current accounts");
        }
        account.setName(request.getName().trim());
        account.setType(request.getType());
        account.setInstitution(StringUtils.hasText(request.getInstitution())
                ? request.getInstitution().trim()
                : null);
        account.setCurrency(StringUtils.hasText(request.getCurrency())
                ? request.getCurrency().trim().toUpperCase()
                : "GBP");
        account.setOpeningBalance(request.getOpeningBalance());
        account.setOverdraftLimit(overdraftLimit);
        account.setActive(request.isActive());
    }

    private FinancialAccountDTO toDTO(FinancialAccount account, User user) {
        BigDecimal currentBalance = currentBalance(account, user);
        BigDecimal overdraftLimit = account.getType() == AccountType.CURRENT
                ? account.getOverdraftLimit()
                : BigDecimal.ZERO;
        BigDecimal overdraftUsed = currentBalance.signum() < 0
                ? currentBalance.abs()
                : BigDecimal.ZERO;
        BigDecimal overdraftAvailable = overdraftLimit.subtract(overdraftUsed).max(BigDecimal.ZERO);
        BigDecimal overdraftPercentageUsed;
        if (overdraftLimit.signum() > 0) {
            overdraftPercentageUsed = overdraftUsed
                    .multiply(BigDecimal.valueOf(100))
                    .divide(overdraftLimit, 2, RoundingMode.HALF_UP);
        } else {
            overdraftPercentageUsed = overdraftUsed.signum() > 0
                    ? BigDecimal.valueOf(100)
                    : BigDecimal.ZERO;
        }
        return new FinancialAccountDTO(
                account.getId(),
                account.getName(),
                account.getType(),
                account.getInstitution(),
                account.getCurrency(),
                account.getOpeningBalance(),
                account.getBalanceAnchorAt(),
                currentBalance,
                overdraftLimit,
                overdraftUsed,
                overdraftAvailable,
                overdraftPercentageUsed,
                account.isActive(),
                account.getCreatedAt(),
                account.getUpdatedAt());
    }

    private AccountTransferDTO toDTO(AccountTransfer transfer) {
        return new AccountTransferDTO(
                transfer.getId(),
                transfer.getFromAccount().getId(),
                transfer.getFromAccount().getName(),
                transfer.getToAccount().getId(),
                transfer.getToAccount().getName(),
                transfer.getAmount(),
                transfer.getTransferDate(),
                transfer.getDescription(),
                transfer.getCreatedAt());
    }

    private AccountActivityItemDTO toActivity(Transaction transaction) {
        return new AccountActivityItemDTO(
                transaction.getId(),
                transaction.getPaymentDate(),
                transaction.getType().name(),
                transaction.getDescription(),
                transaction.getCategory(),
                transaction.getAmount(),
                transaction.getStatus(),
                transaction.getPaymentMethod() != null ? transaction.getPaymentMethod().getName() : null,
                transaction.getPaymentMethod() != null ? transaction.getPaymentMethod().getType() : null);
    }

    private AccountActivityItemDTO toTransferActivity(AccountTransfer transfer, boolean incoming) {
        FinancialAccount otherAccount = incoming ? transfer.getFromAccount() : transfer.getToAccount();
        String fallbackDescription = incoming
                ? "Transfer from " + otherAccount.getName()
                : "Transfer to " + otherAccount.getName();
        return new AccountActivityItemDTO(
                transfer.getId(),
                transfer.getTransferDate(),
                incoming ? "TRANSFER_IN" : "TRANSFER_OUT",
                StringUtils.hasText(transfer.getDescription())
                        ? transfer.getDescription()
                        : fallbackDescription,
                "Transfer",
                transfer.getAmount(),
                TransactionStatus.CLEARED,
                null,
                null);
    }
}
