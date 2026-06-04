package com.example.budget.service.pdf;

import com.example.budget.dto.ReportResponse;
import com.example.budget.model.ReportPeriod;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.service.ReportMoneyFormatter;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import static com.example.budget.service.pdf.PdfRenderState.CONTENT_WIDTH;
import static com.example.budget.service.pdf.PdfRenderState.FOOTER_SAFE_TOP;
import static com.example.budget.service.pdf.PdfRenderState.MARGIN;
import static com.example.budget.service.pdf.PdfRenderState.PAGE_HEIGHT;
import static com.example.budget.service.pdf.PdfRenderState.PAGE_WIDTH;

/**
 * Renders the visual sections of the PDF report: cover header, KPI cards, insight cards,
 * category breakdown panels, payment-method panel and the movement table. Holds no
 * financial logic — it only lays out data already computed in the {@link ReportResponse}.
 */
class PdfReportSections {
    private final PdfRenderState state;
    private final PdfTheme theme;
    private final PdfText text;
    private final PdfLayout layout;
    private final ReportResponse report;
    private final User user;
    private final List<Transaction> movementTransactions;
    private final ReportMoneyFormatter moneyFormatter;

    PdfReportSections(
            PdfRenderState state,
            PdfTheme theme,
            PdfText text,
            PdfLayout layout,
            ReportResponse report,
            User user,
            List<Transaction> movementTransactions,
            ReportMoneyFormatter moneyFormatter) {
        this.state = state;
        this.theme = theme;
        this.text = text;
        this.layout = layout;
        this.report = report;
        this.user = user;
        this.movementTransactions = movementTransactions;
        this.moneyFormatter = moneyFormatter;
    }

    void renderCoverHeader() throws IOException {
        theme.fill(0, PAGE_HEIGHT - 148, PAGE_WIDTH, 148, theme.offWhite());
        theme.fill(0, PAGE_HEIGHT - 148, 7, 148, theme.primary());

        float logoSize = 38;
        theme.fill(MARGIN, state.y - logoSize, logoSize, logoSize, theme.primary());
        theme.whiteText();
        text.draw("PB", MARGIN + 9, state.y - 25, PDType1Font.HELVETICA_BOLD, 14);

        theme.primaryText();
        text.draw("PERSONAL BUDGET", MARGIN + 52, state.y - 9, PDType1Font.HELVETICA_BOLD, 8.5f);
        theme.heading();
        text.draw("Financial report", MARGIN + 52, state.y - 34, PDType1Font.HELVETICA_BOLD, 26);
        theme.mutedText();
        text.draw(
                "Premium overview based on payment dates, card impact dates, installments, and recurring expenses",
                MARGIN + 52, state.y - 51, PDType1Font.HELVETICA, 8.2f);

        float metaW = 184;
        float metaX = PAGE_WIDTH - MARGIN - metaW;
        layout.card(metaX, state.y - 68, metaW, 70, theme.white(), theme.border());
        theme.mutedText();
        text.draw("REPORT PERIOD", metaX + 14, state.y - 17, PDType1Font.HELVETICA_BOLD, 7);
        theme.heading();
        text.drawFitted(report.getPeriodLabel(), metaX + 14, state.y - 37, metaW - 28, PDType1Font.HELVETICA_BOLD,
                12.5f);
        theme.mutedText();
        text.draw(formatDate(report.getStartDate()) + " to " + formatDate(report.getEndDate()),
                metaX + 14, state.y - 54, PDType1Font.HELVETICA, 8);

        state.y -= 88;
        theme.secondaryText();
        text.draw("Prepared for " + blankToDefault(user.getName(), "User"), MARGIN, state.y, PDType1Font.HELVETICA, 10);
        text.drawRight(report.getTransactionCount() + " transactions", MARGIN + CONTENT_WIDTH, state.y,
                PDType1Font.HELVETICA, 10);
        state.y -= 30;
    }

    void renderKpiCards() throws IOException {
        layout.ensure(84);
        float gap = 12;
        float width = (CONTENT_WIDTH - gap * 3) / 4;
        float x = MARGIN;
        renderKpiCard(x, width, "Income", money(report.getTotalIncome()), report.getIncomeCount() + " records",
                theme.success());
        x += width + gap;
        renderKpiCard(x, width, "Expenses", money(report.getTotalExpense()), report.getExpenseCount() + " records",
                theme.danger());
        x += width + gap;
        renderKpiCard(x, width, "Balance", money(report.getBalance()),
                report.getBalance().signum() >= 0 ? "Positive net" : "Negative net", theme.primary());
        x += width + gap;
        renderKpiCard(x, width, "Avg expense", money(report.getAverageExpense()), "Per expense", theme.purple());
        state.y -= 84;
    }

    private void renderKpiCard(float x, float width, String label, String value, String detail, int[] accent)
            throws IOException {
        layout.card(x, state.y - 68, width, 68, theme.white(), theme.border());
        theme.fill(x, state.y - 68, 4, 68, accent);
        theme.mutedText();
        text.draw(label.toUpperCase(Locale.ROOT), x + 14, state.y - 16, PDType1Font.HELVETICA_BOLD, 7);
        theme.color(accent);
        text.drawFitted(value, x + 14, state.y - 40, width - 28, PDType1Font.HELVETICA_BOLD, 13);
        theme.mutedText();
        text.drawFitted(detail, x + 14, state.y - 56, width - 28, PDType1Font.HELVETICA, 8);
    }

    void renderInsightCards() throws IOException {
        layout.ensure(124);
        float gap = 14;
        float cardWidth = (CONTENT_WIDTH - gap) / 2;
        float top = state.y;
        renderExecutiveSummary(MARGIN, top, cardWidth, 108);
        renderCommitmentCard(MARGIN + cardWidth + gap, top, cardWidth, 108);
        state.y = top - 126;
    }

    private void renderExecutiveSummary(float x, float top, float width, float height) throws IOException {
        layout.card(x, top - height, width, height, theme.offWhite(), theme.border());
        theme.heading();
        text.draw("Executive summary", x + 14, top - 18, PDType1Font.HELVETICA_BOLD, 12);
        float rowY = top - 40;
        List<String> insights = report.getInsights().isEmpty()
                ? List.of("No insights are available for this period yet.")
                : report.getInsights().stream().limit(3).toList();
        for (String insight : insights) {
            theme.fill(x + 14, rowY - 5, 4, 4, theme.primary());
            theme.secondaryText();
            List<String> lines = text.wrap(insight, width - 46, PDType1Font.HELVETICA, 8.2f, 2);
            for (String line : lines) {
                text.draw(line, x + 28, rowY, PDType1Font.HELVETICA, 8.2f);
                rowY -= 10;
            }
            rowY -= 5;
            if (rowY < top - height + 14) {
                break;
            }
        }
    }

    private void renderCommitmentCard(float x, float top, float width, float height) throws IOException {
        layout.card(x, top - height, width, height, theme.white(), theme.border());
        theme.heading();
        text.draw("Commitments", x + 14, top - 18, PDType1Font.HELVETICA_BOLD, 12);
        theme.mutedText();
        text.draw("Installments and fixed payments", x + 14, top - 34, PDType1Font.HELVETICA, 8);
        float metricWidth = (width - 42) / 2;
        renderMiniMetric(x + 14, top - 66, metricWidth, "Installments", money(report.getInstallmentExpenseTotal()),
                theme.purple());
        renderMiniMetric(x + 28 + metricWidth, top - 66, metricWidth, "Recurring",
                money(report.getRecurringExpenseTotal()), theme.primary());
    }

    private void renderMiniMetric(float x, float baseline, float width, String label, String value, int[] accent)
            throws IOException {
        theme.mutedText();
        text.draw(label.toUpperCase(Locale.ROOT), x, baseline + 16, PDType1Font.HELVETICA_BOLD, 7);
        theme.color(accent);
        text.drawFitted(value, x, baseline, width, PDType1Font.HELVETICA_BOLD, 12);
    }

    void renderBreakdownPanels() throws IOException {
        float panelHeight = 224;
        layout.ensure(panelHeight + 42);
        layout.sectionTitle("Category breakdown");
        float gap = 18;
        float width = (CONTENT_WIDTH - gap) / 2;
        float top = state.y;
        renderCategoryPanel(MARGIN, top, width, panelHeight, "Expenses", report.getExpenseCategories(),
                theme.danger());
        renderCategoryPanel(MARGIN + width + gap, top, width, panelHeight, "Income", report.getIncomeCategories(),
                theme.success());
        state.y = top - panelHeight - 22;
    }

    private void renderCategoryPanel(
            float x,
            float top,
            float width,
            float height,
            String title,
            List<ReportResponse.CategoryBreakdown> items,
            int[] accent) throws IOException {
        layout.card(x, top - height, width, height, theme.white(), theme.border());
        theme.heading();
        text.draw(title, x + 14, top - 18, PDType1Font.HELVETICA_BOLD, 11.5f);
        if (items.isEmpty()) {
            theme.mutedText();
            text.draw("No data for this period.", x + 14, top - 44, PDType1Font.HELVETICA, 9);
            return;
        }
        float rowY = top - 42;
        for (ReportResponse.CategoryBreakdown item : items.stream().limit(5).toList()) {
            renderProgressBreakdownRow(
                    x + 14,
                    rowY,
                    width - 28,
                    item.getCategory(),
                    money(item.getAmount()),
                    item.getPercentage(),
                    item.getTransactionCount() + " records",
                    accent);
            rowY -= 34;
        }
    }

    void renderPaymentMethodPanel() throws IOException {
        layout.ensure(202);
        layout.sectionTitle("Payment breakdown");
        float top = state.y;
        float height = 180;
        layout.card(MARGIN, top - height, CONTENT_WIDTH, height, theme.white(), theme.border());
        if (report.getPaymentMethods().isEmpty()) {
            theme.mutedText();
            text.draw("No expense payment methods in this period.", MARGIN + 14, top - 30, PDType1Font.HELVETICA,
                    9);
            state.y = top - height - 22;
            return;
        }

        float leftX = MARGIN + 14;
        float rightX = MARGIN + CONTENT_WIDTH / 2 + 10;
        float colWidth = CONTENT_WIDTH / 2 - 28;
        float rowYLeft = top - 32;
        float rowYRight = top - 32;
        List<ReportResponse.PaymentMethodBreakdown> methods = report.getPaymentMethods().stream().limit(8).toList();
        for (int i = 0; i < methods.size(); i++) {
            ReportResponse.PaymentMethodBreakdown method = methods.get(i);
            if (i < 4) {
                renderProgressBreakdownRow(leftX, rowYLeft, colWidth, method.getName(),
                        money(method.getAmount()),
                        method.getPercentage(), method.getTransactionCount() + " payments", theme.primary());
                rowYLeft -= 34;
            } else {
                renderProgressBreakdownRow(rightX, rowYRight, colWidth, method.getName(),
                        money(method.getAmount()),
                        method.getPercentage(), method.getTransactionCount() + " payments", theme.purple());
                rowYRight -= 34;
            }
        }
        state.y = top - height - 22;
    }

    private void renderProgressBreakdownRow(
            float x,
            float baseline,
            float width,
            String label,
            String amount,
            BigDecimal percentage,
            String detail,
            int[] accent) throws IOException {
        theme.secondaryText();
        text.drawFitted(label, x, baseline, width - 92, PDType1Font.HELVETICA_BOLD, 8.5f);
        theme.heading();
        text.drawRight(percentage + "%", x + width, baseline, PDType1Font.HELVETICA_BOLD, 8);
        layout.progressBar(x, baseline - 15, width, 5, percentage, accent);
        theme.mutedText();
        text.drawFitted(amount + " | " + detail, x, baseline - 27, width, PDType1Font.HELVETICA, 7.6f);
    }

    void renderMovementTable() throws IOException {
        layout.ensure(112);
        layout.sectionTitle("Period movement");
        renderMovementHeader();
        int index = 0;
        List<Transaction> rows = movementTransactions.stream()
                .sorted(Comparator
                        .comparing(Transaction::getPaymentDate)
                        .thenComparing(Transaction::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
        for (Transaction transaction : rows) {
            int[] accent = transaction.getType() == TransactionType.INCOME ? theme.success() : theme.danger();
            String type = transaction.getType() == TransactionType.INCOME ? "Income" : "Expense";
            renderMovementRow(
                    index++,
                    formatDate(transaction.getPaymentDate()),
                    type,
                    blankToDefault(transaction.getCategory(), "Uncategorised"),
                    shortDescription(transaction.getDescription()),
                    money(transaction.getAmount()),
                    accent);
        }
        if (rows.isEmpty()) {
            theme.mutedText();
            text.draw("No income or expense movement in this period.", MARGIN, state.y, PDType1Font.HELVETICA, 9);
            state.y -= 24;
        }
        state.y -= 16;
    }

    private void renderMovementHeader() throws IOException {
        layout.ensure(48);
        theme.fill(MARGIN, state.y - 16, CONTENT_WIDTH, 22, theme.offWhite());
        theme.stroke(MARGIN, state.y - 16, CONTENT_WIDTH, 22, theme.border());
        theme.mutedText();
        text.draw("DATE", MARGIN + 8, state.y - 8, PDType1Font.HELVETICA_BOLD, 7);
        text.draw("TRANSACTION", MARGIN + 124, state.y - 8, PDType1Font.HELVETICA_BOLD, 7);
        text.draw("CATEGORY", MARGIN + 214, state.y - 8, PDType1Font.HELVETICA_BOLD, 7);
        text.draw("DESCRIPTION", MARGIN + 360, state.y - 8, PDType1Font.HELVETICA_BOLD, 7);
        text.drawRight("AMOUNT", MARGIN + CONTENT_WIDTH - 8, state.y - 8, PDType1Font.HELVETICA_BOLD, 7);
        state.y -= 24;
    }

    private void renderMovementRow(
            int index,
            String date,
            String type,
            String category,
            String description,
            String amount,
            int[] accent)
            throws IOException {
        float rowHeight = 24;
        if (state.y - rowHeight < FOOTER_SAFE_TOP) {
            layout.newPage();
            layout.sectionTitle("Period movement");
            renderMovementHeader();
        }
        if (index % 2 == 1) {
            theme.fill(MARGIN, state.y - 13, CONTENT_WIDTH, rowHeight, theme.zebra());
        }
        theme.secondaryText();
        text.drawFitted(date, MARGIN + 8, state.y, 72, PDType1Font.HELVETICA, 8.5f);
        theme.color(accent);
        text.draw(type, MARGIN + 124, state.y, PDType1Font.HELVETICA_BOLD, 8.5f);
        theme.secondaryText();
        text.drawFitted(category, MARGIN + 214, state.y, 132, PDType1Font.HELVETICA, 8.5f);
        text.drawFitted(description, MARGIN + 360, state.y, 78, PDType1Font.HELVETICA, 8.5f);
        theme.color(accent);
        text.drawRight(amount, MARGIN + CONTENT_WIDTH - 8, state.y, PDType1Font.HELVETICA_BOLD, 8.5f);
        state.y -= rowHeight;
        theme.line(MARGIN, state.y + 7, MARGIN + CONTENT_WIDTH, state.y + 7, theme.subtleBorder());
    }

    private String shortDescription(String description) {
        String value = blankToDefault(description, "-");
        return value.length() <= 10 ? value : value.substring(0, 10);
    }

    private String money(BigDecimal value) {
        return moneyFormatter.format(value);
    }

    private String formatDate(java.time.LocalDate date) {
        return ReportPeriod.formatDate(date);
    }

    private static String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
