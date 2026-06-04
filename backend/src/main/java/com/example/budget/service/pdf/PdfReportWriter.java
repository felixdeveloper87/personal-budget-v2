package com.example.budget.service.pdf;

import com.example.budget.dto.ReportResponse;
import com.example.budget.model.Transaction;
import com.example.budget.model.User;
import com.example.budget.service.ReportMoneyFormatter;
import org.apache.pdfbox.pdmodel.PDDocument;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

/**
 * Orchestrates the construction of the PDF report document. Holds no financial logic:
 * it wires the rendering collaborators around a shared {@link PdfRenderState} and calls
 * the report sections in order.
 */
public class PdfReportWriter {
    private final ReportMoneyFormatter moneyFormatter;

    public PdfReportWriter(ReportMoneyFormatter moneyFormatter) {
        this.moneyFormatter = moneyFormatter;
    }

    public byte[] write(ReportResponse report, User user, List<Transaction> movementTransactions) throws IOException {
        List<Transaction> movements = movementTransactions == null ? List.of() : movementTransactions;
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PdfRenderState state = new PdfRenderState();
            state.document = doc;

            PdfTheme theme = new PdfTheme(state);
            PdfText text = new PdfText(state);
            PdfLayout layout = new PdfLayout(state, theme, text, report);
            PdfReportSections sections = new PdfReportSections(
                    state, theme, text, layout, report, user, movements, moneyFormatter);

            layout.newPage();
            sections.renderCoverHeader();
            sections.renderKpiCards();
            sections.renderInsightCards();
            sections.renderBreakdownPanels();
            sections.renderPaymentMethodPanel();
            sections.renderMovementTable();
            layout.closePage();
            doc.save(output);
            return output.toByteArray();
        }
    }
}
