package com.example.budget.service;

import com.example.budget.dto.ReportResponse;
import com.example.budget.model.PeriodRange;
import com.example.budget.model.ReportPeriod;
import com.example.budget.model.User;
import com.example.budget.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Orchestrates report generation: resolves the requested period, fetches the period's
 * transactions and delegates to {@link ReportCalculator}. JSON-only — PDF generation
 * has been moved to the frontend (browser print).
 */
@Service
public class ReportService {
    private final TransactionRepository transactionRepository;
    private final ReportCalculator reportCalculator;

    public ReportService(TransactionRepository transactionRepository, ReportCalculator reportCalculator) {
        this.transactionRepository = transactionRepository;
        this.reportCalculator = reportCalculator;
    }

    @Transactional(readOnly = true)
    public ReportResponse generateReport(String periodParam, LocalDate referenceDate, User user) {
        ReportPeriod period = ReportPeriod.from(periodParam);
        LocalDate date = referenceDate != null ? referenceDate : LocalDate.now();
        PeriodRange range = period.range(date);
        return reportCalculator.buildReport(period, date, range,
                transactionRepository.findReportTransactions(user, range.start(), range.end()));
    }
}
