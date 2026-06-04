package com.example.budget.service.pdf;

import com.example.budget.dto.ReportResponse;
import com.example.budget.model.ReportPeriod;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import java.math.BigDecimal;

import static com.example.budget.service.pdf.PdfRenderState.CONTENT_WIDTH;
import static com.example.budget.service.pdf.PdfRenderState.FOOTER_SAFE_TOP;
import static com.example.budget.service.pdf.PdfRenderState.FOOTER_Y;
import static com.example.budget.service.pdf.PdfRenderState.MARGIN;
import static com.example.budget.service.pdf.PdfRenderState.PAGE_HEIGHT;

import java.io.IOException;

/**
 * Page lifecycle and structural primitives for the PDF report: page creation and breaks,
 * vertical-space guards, cards, section titles, progress bars, plus the per-page chrome
 * (continuation header and footer).
 */
class PdfLayout {
    private final PdfRenderState state;
    private final PdfTheme theme;
    private final PdfText text;
    private final ReportResponse report;

    PdfLayout(PdfRenderState state, PdfTheme theme, PdfText text, ReportResponse report) {
        this.state = state;
        this.theme = theme;
        this.text = text;
        this.report = report;
    }

    void newPage() throws IOException {
        closePage();
        state.document.addPage(new PDPage(PDRectangle.A4));
        state.content = new PDPageContentStream(state.document,
                state.document.getPage(state.document.getNumberOfPages() - 1));
        state.pageNumber++;
        state.y = PAGE_HEIGHT - MARGIN;
        if (state.pageNumber > 1) {
            renderContinuationHeader();
        }
    }

    void closePage() throws IOException {
        if (state.content != null) {
            footer();
            state.content.close();
            state.content = null;
        }
    }

    void ensure(float requiredHeight) throws IOException {
        if (state.y - requiredHeight < FOOTER_SAFE_TOP) {
            newPage();
        }
    }

    void card(float x, float rectY, float width, float height, int[] fill, int[] border) throws IOException {
        theme.fill(x, rectY, width, height, fill);
        theme.stroke(x, rectY, width, height, border);
    }

    void sectionTitle(String title) throws IOException {
        ensure(42);
        theme.heading();
        text.draw(title, MARGIN, state.y, PDType1Font.HELVETICA_BOLD, 13);
        theme.line(MARGIN, state.y - 7, MARGIN + 34, state.y - 7, theme.primary());
        state.y -= 24;
    }

    void progressBar(float x, float rectY, float width, float height, BigDecimal percentage, int[] accent)
            throws IOException {
        theme.fill(x, rectY, width, height, theme.progressTrack());
        float safePercent = Math.max(0f, Math.min(100f, percentage == null ? 0f : percentage.floatValue()));
        theme.fill(x, rectY, width * safePercent / 100f, height, accent);
    }

    private void renderContinuationHeader() throws IOException {
        theme.primaryText();
        text.draw("PERSONAL BUDGET", MARGIN, state.y, PDType1Font.HELVETICA_BOLD, 8);
        theme.secondaryText();
        text.drawRight(report.getPeriodLabel(), MARGIN + CONTENT_WIDTH, state.y, PDType1Font.HELVETICA, 9);
        state.y -= 14;
        theme.line(MARGIN, state.y, MARGIN + CONTENT_WIDTH, state.y, theme.border());
        state.y -= 24;
    }

    private void footer() throws IOException {
        if (state.content == null) {
            return;
        }
        theme.line(MARGIN, FOOTER_Y + 14, MARGIN + CONTENT_WIDTH, FOOTER_Y + 14, theme.border());
        theme.mutedText();
        text.draw("Generated " + ReportPeriod.formatDate(report.getGeneratedAt().toLocalDate())
                + " - Based on payment dates, including card and installment impact dates.",
                MARGIN, FOOTER_Y, PDType1Font.HELVETICA, 7.5f);
        text.drawRight("Page " + state.pageNumber, MARGIN + CONTENT_WIDTH, FOOTER_Y, PDType1Font.HELVETICA_BOLD, 7.5f);
    }
}
