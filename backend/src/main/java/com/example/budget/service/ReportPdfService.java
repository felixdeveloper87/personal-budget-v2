package com.example.budget.service;

import com.example.budget.dto.ReportResponse;
import com.example.budget.model.Transaction;
import com.example.budget.model.User;
import com.example.budget.service.pdf.PdfReportWriter;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

/**
 * Produces the PDF byte payload for a report, delegating all rendering to the PDF writer.
 */
@Service
public class ReportPdfService {
    private final ReportMoneyFormatter moneyFormatter;

    public ReportPdfService(ReportMoneyFormatter moneyFormatter) {
        this.moneyFormatter = moneyFormatter;
    }

    public byte[] generate(ReportResponse report, User user, List<Transaction> transactions) {
        try {
            return new PdfReportWriter(moneyFormatter).write(report, user, transactions);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not generate report PDF", ex);
        }
    }
}
