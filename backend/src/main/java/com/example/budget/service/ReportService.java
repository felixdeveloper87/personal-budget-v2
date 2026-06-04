package com.example.budget.service;

import com.example.budget.dto.ReportResponse;
import com.example.budget.model.PeriodRange;
import com.example.budget.model.ReportPeriod;
import com.example.budget.model.Transaction;
import com.example.budget.model.User;
import com.example.budget.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Orchestrates report generation: resolves the requested period, fetches the period's
 * transactions and delegates the heavy lifting to {@link ReportCalculator} (data) and
 * {@link ReportPdfService} (PDF). Holds no calculation, formatting or rendering logic.
 */
@Service
public class ReportService {
    private final TransactionRepository transactionRepository;
    private final ReportCalculator reportCalculator;
    private final ReportPdfService reportPdfService;

    public ReportService(
            TransactionRepository transactionRepository,
            ReportCalculator reportCalculator,
            ReportPdfService reportPdfService) {
        this.transactionRepository = transactionRepository;
        this.reportCalculator = reportCalculator;
        this.reportPdfService = reportPdfService;
    }

    @Transactional(readOnly = true)
    public ReportResponse generateReport(String periodParam, LocalDate referenceDate, User user) {
        ReportPeriod period = ReportPeriod.from(periodParam);
        LocalDate date = referenceDate != null ? referenceDate : LocalDate.now();
        PeriodRange range = period.range(date);
        List<Transaction> transactions = transactionRepository.findReportTransactions(user, range.start(), range.end());
        return reportCalculator.buildReport(period, date, range, transactions);
    }

    @Transactional(readOnly = true)
    public byte[] generatePdf(String periodParam, LocalDate referenceDate, User user) {
        ReportPeriod period = ReportPeriod.from(periodParam);
        LocalDate date = referenceDate != null ? referenceDate : LocalDate.now();
        PeriodRange range = period.range(date);
        List<Transaction> transactions = transactionRepository.findReportTransactions(user, range.start(), range.end());
        ReportResponse report = reportCalculator.buildReport(period, date, range, transactions);
        return reportPdfService.generate(report, user, transactions);
    }
}
