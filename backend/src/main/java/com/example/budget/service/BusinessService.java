package com.example.budget.service;

import com.example.budget.dto.BusinessDTOs.CostBasis;
import com.example.budget.dto.BusinessDTOs.DaySummary;
import com.example.budget.dto.BusinessDTOs.ManualSessionRequest;
import com.example.budget.dto.BusinessDTOs.Summary;
import com.example.budget.dto.BusinessDTOs.Totals;
import com.example.budget.dto.BusinessDTOs.WorkSessionDTO;
import com.example.budget.model.TransactionType;
import com.example.budget.model.WorkSession;
import com.example.budget.repository.TransactionRepository;
import com.example.budget.repository.WorkSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;

/**
 * Business time tracking. Sessions are timed live (start / pause / resume / end)
 * or entered by hand; "earned" is the income recorded in the Salary category.
 * Costs are the running costs in the Transport category (petrol, oil, bike
 * insurance) over the last three complete months, divided by the days with
 * earnings in those months: a cost per working day. Parts that last longer than
 * the window (tyres, brake pads, belts) are left out of the spend and come in
 * instead as an estimated maintenance allowance from mileage and part lifespans.
 * Profit = earned - cost.
 */
@Service
public class BusinessService {
    /** Income category whose transactions count as earnings (the add-income default). */
    public static final String EARNINGS_CATEGORY = "Salary";
    /** Expense category treated as business running costs. */
    public static final String COST_CATEGORY = "Transport";
    /**
     * Description prefixes (case-insensitive) of the running costs within
     * {@link #COST_CATEGORY}; installments keep the prefix ("Bike insurance (Installment 2/8)").
     */
    static final List<String> RUNNING_COST_PREFIXES = List.of("petrol", "oil", "bike insurance");
    /** Weekly mileage the maintenance allowance assumes. */
    static final int MILES_PER_WEEK = 400;
    /** Wear parts: price and how many miles each one lasts. */
    static final List<WearPart> WEAR_PARTS = List.of(
            new WearPart(new BigDecimal("70"), 6_000),   // rear tyre
            new WearPart(new BigDecimal("70"), 10_000),  // front tyre
            new WearPart(new BigDecimal("30"), 8_000),   // front brake pads
            new WearPart(new BigDecimal("30"), 8_000));  // rear brake pads
    /** Flat monthly allowance for everything else (accessories, belt, muffs...). */
    static final BigDecimal GENERAL_MAINTENANCE_PER_MONTH = new BigDecimal("40");

    record WearPart(BigDecimal price, int lifeMiles) {}
    /** How many complete months the daily cost averages over. */
    static final int COST_WINDOW_MONTHS = 3;
    private static final int MAX_RANGE_DAYS = 400;

    private final WorkSessionRepository sessionRepository;
    private final TransactionRepository transactionRepository;
    private final Clock clock;

    @Autowired
    public BusinessService(WorkSessionRepository sessionRepository, TransactionRepository transactionRepository) {
        this(sessionRepository, transactionRepository, Clock.systemUTC());
    }

    BusinessService(WorkSessionRepository sessionRepository, TransactionRepository transactionRepository, Clock clock) {
        this.sessionRepository = sessionRepository;
        this.transactionRepository = transactionRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public WorkSessionDTO active(Long userId) {
        return sessionRepository.findFirstByUserIdAndEndedAtIsNull(userId).map(this::toDto).orElse(null);
    }

    /** {@code workDate} is the user's local day, sent by the app. */
    @Transactional
    public WorkSessionDTO start(Long userId, LocalDate workDate) {
        if (sessionRepository.findFirstByUserIdAndEndedAtIsNull(userId).isPresent()) {
            throw new IllegalArgumentException("A work session is already running. End it before starting another.");
        }
        WorkSession session = new WorkSession();
        session.setUserId(userId);
        session.setWorkDate(workDate != null ? workDate : LocalDate.now(clock));
        session.setStartedAt(now());
        return toDto(sessionRepository.save(session));
    }

    @Transactional
    public WorkSessionDTO pause(Long userId, Long id) {
        WorkSession session = requireOpen(userId, id);
        if (session.getPausedAt() == null) {
            session.setPausedAt(now());
        }
        return toDto(sessionRepository.save(session));
    }

    @Transactional
    public WorkSessionDTO resume(Long userId, Long id) {
        WorkSession session = requireOpen(userId, id);
        foldPause(session);
        return toDto(sessionRepository.save(session));
    }

    @Transactional
    public WorkSessionDTO end(Long userId, Long id) {
        WorkSession session = requireOpen(userId, id);
        foldPause(session);
        Instant now = now();
        // A database check requires the end to be after the start.
        session.setEndedAt(now.isAfter(session.getStartedAt()) ? now : session.getStartedAt().plusSeconds(1));
        return toDto(sessionRepository.save(session));
    }

    /** For when the buttons were forgotten: a finished session entered by hand. */
    @Transactional
    public WorkSessionDTO createManual(Long userId, ManualSessionRequest request) {
        WorkSession session = new WorkSession();
        session.setUserId(userId);
        apply(session, request);
        return toDto(sessionRepository.save(session));
    }

    @Transactional
    public WorkSessionDTO update(Long userId, Long id, ManualSessionRequest request) {
        WorkSession session = sessionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Work session not found"));
        apply(session, request);
        return toDto(sessionRepository.save(session));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        WorkSession session = sessionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Work session not found"));
        sessionRepository.delete(session);
    }

    /** Hours, earnings and hourly rate per day and in total, for {@code from}..{@code to} inclusive. */
    @Transactional(readOnly = true)
    public Summary summary(Long userId, LocalDate from, LocalDate to) {
        if (from == null || to == null || to.isBefore(from)) {
            throw new IllegalArgumentException("Invalid date range");
        }
        if (ChronoUnit.DAYS.between(from, to) > MAX_RANGE_DAYS) {
            throw new IllegalArgumentException("Date range is too long");
        }
        Instant now = now();
        List<WorkSession> sessions =
                sessionRepository.findByUserIdAndWorkDateBetweenOrderByStartedAtDesc(userId, from, to);

        Map<LocalDate, Long> secondsByDay = new HashMap<>();
        for (WorkSession session : sessions) {
            secondsByDay.merge(session.getWorkDate(), session.workedSeconds(now), Long::sum);
        }
        Map<LocalDate, BigDecimal> earnedByDay = new HashMap<>();
        for (Object[] row : transactionRepository.sumByDayForCategory(
                userId, TransactionType.INCOME, EARNINGS_CATEGORY, from, to)) {
            earnedByDay.put((LocalDate) row[0], (BigDecimal) row[1]);
        }

        CostBasis costBasis = costBasis(userId, LocalDate.now(clock));
        BigDecimal dailyCost = costBasis.dailyCost();

        // Days with work or earnings, newest first. The daily cost is charged on
        // days with earnings: a day whose income is not entered yet stays neutral.
        TreeMap<LocalDate, DaySummary> days = new TreeMap<>(java.util.Comparator.reverseOrder());
        for (LocalDate day : union(secondsByDay.keySet(), earnedByDay.keySet())) {
            long seconds = secondsByDay.getOrDefault(day, 0L);
            BigDecimal earned = earnedByDay.getOrDefault(day, BigDecimal.ZERO);
            BigDecimal cost = earned.signum() > 0 ? dailyCost : BigDecimal.ZERO;
            BigDecimal profit = earned.subtract(cost);
            days.put(day, new DaySummary(
                    day, seconds, earned, hourlyRate(earned, seconds),
                    cost, profit, earned.signum() > 0 ? rate(profit, seconds) : null));
        }

        long totalSeconds = secondsByDay.values().stream().mapToLong(Long::longValue).sum();
        BigDecimal totalEarned = earnedByDay.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCost = days.values().stream().map(DaySummary::cost).reduce(BigDecimal.ZERO, BigDecimal::add);
        // The overall rates only count days that have both hours and earnings,
        // so a day whose income is not entered yet does not drag them down.
        List<DaySummary> paired = days.values().stream()
                .filter(day -> day.workedSeconds() > 0 && day.earned().signum() > 0)
                .toList();
        long pairedSeconds = paired.stream().mapToLong(DaySummary::workedSeconds).sum();
        BigDecimal pairedEarned = paired.stream().map(DaySummary::earned).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal pairedProfit = paired.stream().map(DaySummary::profit).reduce(BigDecimal.ZERO, BigDecimal::add);

        return new Summary(
                from,
                to,
                new Totals(
                        totalSeconds,
                        totalEarned,
                        hourlyRate(pairedEarned, pairedSeconds),
                        totalCost,
                        totalEarned.subtract(totalCost),
                        paired.isEmpty() ? null : rate(pairedProfit, pairedSeconds)),
                costBasis,
                new ArrayList<>(days.values()),
                sessions.stream().map(session -> toDto(session, now)).toList());
    }

    /**
     * Daily cost from the last three complete months (in October: July to
     * September): the running costs paid in it plus the maintenance allowance
     * for it. Costs count on their payment date, when the money left (a card
     * purchase on its bill date). Working days are the days with earnings in that
     * window, by transaction date, so days off and extra days count as they happened.
     */
    @Transactional(readOnly = true)
    public CostBasis costBasis(Long userId, LocalDate today) {
        YearMonth current = YearMonth.from(today);
        LocalDate windowFrom = current.minusMonths(COST_WINDOW_MONTHS).atDay(1);
        LocalDate windowTo = current.minusMonths(1).atEndOfMonth();
        BigDecimal spend = transactionRepository
                .sumByDescriptionForCategoryPaidBetween(userId, TransactionType.EXPENSE, COST_CATEGORY, windowFrom, windowTo)
                .stream()
                .filter(row -> isRunningCost((String) row[0]))
                .map(row -> (BigDecimal) row[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal maintenance = maintenanceAllowance(COST_WINDOW_MONTHS);
        int workingDays = (int) transactionRepository
                .sumByDayForCategory(userId, TransactionType.INCOME, EARNINGS_CATEGORY, windowFrom, windowTo)
                .stream()
                .filter(row -> ((BigDecimal) row[1]).signum() > 0)
                .count();
        BigDecimal dailyCost = workingDays > 0
                ? spend.add(maintenance).divide(BigDecimal.valueOf(workingDays), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal months = BigDecimal.valueOf(COST_WINDOW_MONTHS);
        return new CostBasis(COST_CATEGORY, windowFrom, windowTo, spend, maintenance, workingDays,
                spend.divide(months, 2, RoundingMode.HALF_UP),
                maintenance.divide(months, 2, RoundingMode.HALF_UP),
                BigDecimal.valueOf(workingDays).divide(months, 1, RoundingMode.HALF_UP),
                dailyCost);
    }

    /**
     * Estimated maintenance over {@code months}: each wear part's price times the
     * share of its lifespan ridden (400 mi a week = 5,200 mi in three months),
     * plus the flat general allowance. About £85 a month.
     */
    static BigDecimal maintenanceAllowance(int months) {
        BigDecimal miles = BigDecimal.valueOf((long) MILES_PER_WEEK * 52 * months)
                .divide(BigDecimal.valueOf(12), 4, RoundingMode.HALF_UP);
        BigDecimal wear = WEAR_PARTS.stream()
                .map(part -> part.price().multiply(miles)
                        .divide(BigDecimal.valueOf(part.lifeMiles()), 2, RoundingMode.HALF_UP))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return wear.add(GENERAL_MAINTENANCE_PER_MONTH.multiply(BigDecimal.valueOf(months)));
    }

    static boolean isRunningCost(String description) {
        if (description == null) {
            return false;
        }
        String normalized = description.trim().toLowerCase(Locale.ROOT);
        return RUNNING_COST_PREFIXES.stream().anyMatch(normalized::startsWith);
    }

    /** Signed per-hour rate (profit can be negative), or null without hours. */
    static BigDecimal rate(BigDecimal amount, long seconds) {
        if (seconds <= 0 || amount == null) {
            return null;
        }
        return amount.multiply(BigDecimal.valueOf(3600))
                .divide(BigDecimal.valueOf(seconds), 2, RoundingMode.HALF_UP);
    }

    static BigDecimal hourlyRate(BigDecimal earned, long seconds) {
        if (seconds <= 0 || earned == null || earned.signum() <= 0) {
            return null;
        }
        return earned.multiply(BigDecimal.valueOf(3600))
                .divide(BigDecimal.valueOf(seconds), 2, RoundingMode.HALF_UP);
    }

    private void apply(WorkSession session, ManualSessionRequest request) {
        if (request.workDate() == null || request.startedAt() == null || request.endedAt() == null) {
            throw new IllegalArgumentException("Date, start and end are required");
        }
        if (!request.endedAt().isAfter(request.startedAt())) {
            throw new IllegalArgumentException("The end must be after the start");
        }
        long span = Duration.between(request.startedAt(), request.endedAt()).getSeconds();
        if (span > Duration.ofHours(24).getSeconds()) {
            throw new IllegalArgumentException("A session cannot be longer than 24 hours");
        }
        int breakSeconds = Math.max(0, request.breakMinutes() == null ? 0 : request.breakMinutes()) * 60;
        if (breakSeconds >= span) {
            throw new IllegalArgumentException("The break must be shorter than the session");
        }
        session.setWorkDate(request.workDate());
        session.setStartedAt(request.startedAt());
        session.setEndedAt(request.endedAt());
        session.setPausedAt(null);
        session.setBreakSeconds(breakSeconds);
        session.setNote(request.note() == null || request.note().isBlank() ? null : request.note().trim());
    }

    private WorkSession requireOpen(Long userId, Long id) {
        WorkSession session = sessionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Work session not found"));
        if (!session.isOpen()) {
            throw new IllegalArgumentException("This work session has already ended");
        }
        return session;
    }

    private void foldPause(WorkSession session) {
        if (session.getPausedAt() != null) {
            long paused = Math.max(0, Duration.between(session.getPausedAt(), now()).getSeconds());
            session.setBreakSeconds((int) Math.min(Integer.MAX_VALUE, session.getBreakSeconds() + paused));
            session.setPausedAt(null);
        }
    }

    private Instant now() {
        return clock.instant().truncatedTo(ChronoUnit.SECONDS);
    }

    private WorkSessionDTO toDto(WorkSession session) {
        return toDto(session, now());
    }

    private WorkSessionDTO toDto(WorkSession session, Instant now) {
        String status = !session.isOpen() ? "ENDED" : session.isPaused() ? "PAUSED" : "RUNNING";
        return new WorkSessionDTO(
                session.getId(),
                session.getWorkDate(),
                session.getStartedAt(),
                session.getEndedAt(),
                session.getPausedAt(),
                session.getBreakSeconds(),
                session.workedSeconds(now),
                status,
                session.getNote());
    }

    private static List<LocalDate> union(java.util.Set<LocalDate> a, java.util.Set<LocalDate> b) {
        java.util.Set<LocalDate> all = new java.util.HashSet<>(a);
        all.addAll(b);
        return new ArrayList<>(all);
    }
}
