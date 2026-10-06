package com.example.budget.service;

import com.example.budget.dto.BusinessDTOs.ManualSessionRequest;
import com.example.budget.dto.BusinessDTOs.Summary;
import com.example.budget.dto.BusinessDTOs.WorkSessionDTO;
import com.example.budget.model.TransactionType;
import com.example.budget.model.WorkSession;
import com.example.budget.repository.TransactionRepository;
import com.example.budget.repository.WorkSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BusinessServiceTest {
    private static final Long USER = 7L;
    private static final LocalDate DAY = LocalDate.of(2026, 10, 6);
    private static final Instant NINE = Instant.parse("2026-10-06T09:00:00Z");

    @Mock private WorkSessionRepository sessionRepository;
    @Mock private TransactionRepository transactionRepository;

    private final MutableClock clock = new MutableClock(NINE);
    private BusinessService service;

    @BeforeEach
    void setUp() {
        service = new BusinessService(sessionRepository, transactionRepository, clock);
    }

    @Test
    void pausesAreExcludedFromWorkedTime() {
        when(sessionRepository.findFirstByUserIdAndEndedAtIsNull(USER)).thenReturn(Optional.empty());
        when(sessionRepository.save(any())).thenAnswer(invocation -> withId(invocation.getArgument(0)));
        WorkSessionDTO started = service.start(USER, DAY);
        WorkSession session = stored(started);

        clock.advance(Duration.ofHours(2));
        service.pause(USER, 1L);
        clock.advance(Duration.ofMinutes(30));
        WorkSessionDTO paused = service.active(USER);
        assertThat(paused.status()).isEqualTo("PAUSED");
        assertThat(paused.workedSeconds()).isEqualTo(Duration.ofHours(2).getSeconds());

        service.resume(USER, 1L);
        clock.advance(Duration.ofHours(1));
        WorkSessionDTO ended = service.end(USER, 1L);

        assertThat(ended.status()).isEqualTo("ENDED");
        assertThat(ended.breakSeconds()).isEqualTo(30 * 60);
        assertThat(ended.workedSeconds()).isEqualTo(Duration.ofHours(3).getSeconds());
        assertThat(session.getEndedAt()).isEqualTo(NINE.plus(Duration.ofMinutes(210)));
    }

    @Test
    void endingWhilePausedCountsThePauseAsBreak() {
        WorkSession session = open(NINE);
        session.setPausedAt(NINE.plus(Duration.ofHours(1)));
        when(sessionRepository.findByIdAndUserId(1L, USER)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        clock.set(NINE.plus(Duration.ofHours(3)));

        WorkSessionDTO ended = service.end(USER, 1L);

        assertThat(ended.breakSeconds()).isEqualTo(2 * 3600);
        assertThat(ended.workedSeconds()).isEqualTo(3600);
    }

    @Test
    void onlyOneSessionCanRunAtATime() {
        when(sessionRepository.findFirstByUserIdAndEndedAtIsNull(USER)).thenReturn(Optional.of(open(NINE)));

        assertThatThrownBy(() -> service.start(USER, DAY)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void manualEntryRejectsAnEndBeforeTheStartOrAnOversizedBreak() {
        assertThatThrownBy(() -> service.createManual(USER, new ManualSessionRequest(
                DAY, NINE, NINE.minusSeconds(60), 0, null))).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.createManual(USER, new ManualSessionRequest(
                DAY, NINE, NINE.plus(Duration.ofHours(1)), 60, null))).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void summaryDividesBusinessEarningsByHoursWorked() {
        WorkSession monday = ended(DAY, NINE, NINE.plus(Duration.ofHours(5)), 30 * 60); // 4h30 worked
        WorkSession tuesday = ended(DAY.plusDays(1), NINE.plus(Duration.ofDays(1)),
                NINE.plus(Duration.ofDays(1)).plus(Duration.ofHours(2)), 0); // 2h, earnings not entered yet
        when(sessionRepository.findByUserIdAndWorkDateBetweenOrderByStartedAtDesc(USER, DAY, DAY.plusDays(1)))
                .thenReturn(List.of(tuesday, monday));
        when(transactionRepository.sumByDayForCategory(
                USER, TransactionType.INCOME, BusinessService.EARNINGS_CATEGORY, DAY, DAY.plusDays(1)))
                .thenReturn(List.<Object[]>of(new Object[] {DAY, new BigDecimal("135.00")}));

        Summary summary = service.summary(USER, DAY, DAY.plusDays(1));

        assertThat(summary.days()).hasSize(2);
        assertThat(summary.days().get(0).date()).isEqualTo(DAY.plusDays(1));
        assertThat(summary.days().get(0).hourlyRate()).isNull();
        assertThat(summary.days().get(1).hourlyRate()).isEqualByComparingTo("30.00");
        assertThat(summary.totals().workedSeconds()).isEqualTo((long) (6.5 * 3600));
        assertThat(summary.totals().earned()).isEqualByComparingTo("135.00");
        // Tuesday has no earnings yet, so it does not drag the overall rate down.
        assertThat(summary.totals().hourlyRate()).isEqualByComparingTo("30.00");
    }

    private WorkSession stored(WorkSessionDTO dto) {
        WorkSession session = open(dto.startedAt());
        session.setWorkDate(dto.workDate());
        when(sessionRepository.findByIdAndUserId(1L, USER)).thenReturn(Optional.of(session));
        when(sessionRepository.findFirstByUserIdAndEndedAtIsNull(USER)).thenReturn(Optional.of(session));
        return session;
    }

    private static WorkSession open(Instant startedAt) {
        WorkSession session = new WorkSession();
        ReflectionTestUtils.setField(session, "id", 1L);
        session.setUserId(USER);
        session.setWorkDate(DAY);
        session.setStartedAt(startedAt);
        return session;
    }

    private static WorkSession ended(LocalDate day, Instant start, Instant end, int breakSeconds) {
        WorkSession session = open(start);
        session.setWorkDate(day);
        session.setEndedAt(end);
        session.setBreakSeconds(breakSeconds);
        return session;
    }

    private static WorkSession withId(WorkSession session) {
        if (session.getId() == null) ReflectionTestUtils.setField(session, "id", 1L);
        return session;
    }

    private static final class MutableClock extends Clock {
        private Instant now;

        MutableClock(Instant now) { this.now = now; }
        void advance(Duration duration) { now = now.plus(duration); }
        void set(Instant instant) { now = instant; }

        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }
}
