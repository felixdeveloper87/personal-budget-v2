package com.example.budget.service;

import com.example.budget.dto.ReportResponse;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.repository.TransactionRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {
    private static final Locale REPORT_LOCALE = Locale.UK;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy", REPORT_LOCALE);
    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("MMM yyyy", REPORT_LOCALE);
    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

    private final TransactionRepository transactionRepository;

    public ReportService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public ReportResponse generateReport(String periodParam, LocalDate referenceDate, User user) {
        ReportPeriod period = ReportPeriod.from(periodParam);
        LocalDate date = referenceDate != null ? referenceDate : LocalDate.now();
        PeriodRange range = period.range(date);
        List<Transaction> transactions = transactionRepository.findReportTransactions(user, range.start(), range.end());
        return buildReport(period, date, range, transactions);
    }

    private ReportResponse buildReport(
            ReportPeriod period,
            LocalDate date,
            PeriodRange range,
            List<Transaction> transactions) {
        BigDecimal totalIncome = sum(transactions, TransactionType.INCOME);
        BigDecimal totalExpense = sum(transactions, TransactionType.EXPENSE);
        int incomeCount = count(transactions, TransactionType.INCOME);
        int expenseCount = count(transactions, TransactionType.EXPENSE);

        ReportResponse response = new ReportResponse();
        response.setPeriod(period.requestValue());
        response.setPeriodLabel(period.label(date, range));
        response.setReferenceDate(date);
        response.setStartDate(range.start());
        response.setEndDate(range.end());
        response.setGeneratedAt(LocalDateTime.now());
        response.setTotalIncome(totalIncome);
        response.setTotalExpense(totalExpense);
        response.setBalance(totalIncome.subtract(totalExpense));
        response.setAverageExpense(expenseCount == 0
                ? BigDecimal.ZERO
                : totalExpense.divide(BigDecimal.valueOf(expenseCount), 2, RoundingMode.HALF_UP));
        response.setTransactionCount(transactions.size());
        response.setIncomeCount(incomeCount);
        response.setExpenseCount(expenseCount);
        response.setInstallmentExpenseTotal(sumSpecial(transactions, true));
        response.setRecurringExpenseTotal(sumSpecial(transactions, false));
        response.setIncomeCategories(categoryBreakdown(transactions, TransactionType.INCOME, totalIncome));
        response.setExpenseCategories(categoryBreakdown(transactions, TransactionType.EXPENSE, totalExpense));
        response.setPaymentMethods(paymentMethodBreakdown(transactions, totalExpense));
        response.setBuckets(timeBuckets(period, range, transactions));
        response.setTopIncome(topTransactions(transactions, TransactionType.INCOME));
        response.setTopExpenses(topTransactions(transactions, TransactionType.EXPENSE));
        response.setInsights(buildInsights(response));
        return response;
    }

    @Transactional(readOnly = true)
    public byte[] generatePdf(String periodParam, LocalDate referenceDate, User user) {
        ReportPeriod period = ReportPeriod.from(periodParam);
        LocalDate date = referenceDate != null ? referenceDate : LocalDate.now();
        PeriodRange range = period.range(date);
        List<Transaction> transactions = transactionRepository.findReportTransactions(user, range.start(), range.end());
        ReportResponse report = buildReport(period, date, range, transactions);
        try {
            return new PdfReportWriter().write(report, user, transactions);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not generate report PDF", ex);
        }
    }

    private BigDecimal sum(List<Transaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(tx -> tx.getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private int count(List<Transaction> transactions, TransactionType type) {
        return (int) transactions.stream().filter(tx -> tx.getType() == type).count();
    }

    private BigDecimal sumSpecial(List<Transaction> transactions, boolean installment) {
        return transactions.stream()
                .filter(tx -> tx.getType() == TransactionType.EXPENSE)
                .filter(tx -> installment ? tx.getInstallmentPlan() != null : tx.getRecurringTransaction() != null)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<ReportResponse.CategoryBreakdown> categoryBreakdown(
            List<Transaction> transactions,
            TransactionType type,
            BigDecimal total) {
        Map<String, List<Transaction>> grouped = transactions.stream()
                .filter(tx -> tx.getType() == type)
                .collect(Collectors.groupingBy(
                        tx -> blankToDefault(tx.getCategory(), "Uncategorised"),
                        LinkedHashMap::new,
                        Collectors.toList()));

        return grouped.entrySet().stream()
                .map(entry -> {
                    BigDecimal amount = entry.getValue().stream()
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new ReportResponse.CategoryBreakdown(
                            entry.getKey(),
                            amount,
                            percentage(amount, total),
                            entry.getValue().size());
                })
                .sorted(Comparator.comparing(ReportResponse.CategoryBreakdown::getAmount).reversed())
                .toList();
    }

    private List<ReportResponse.PaymentMethodBreakdown> paymentMethodBreakdown(
            List<Transaction> transactions,
            BigDecimal totalExpense) {
        Map<String, List<Transaction>> grouped = transactions.stream()
                .filter(tx -> tx.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        tx -> tx.getPaymentMethod() != null
                                ? blankToDefault(tx.getPaymentMethod().getName(), "Unnamed method")
                                : "No payment method",
                        LinkedHashMap::new,
                        Collectors.toList()));

        return grouped.entrySet().stream()
                .map(entry -> {
                    BigDecimal amount = entry.getValue().stream()
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new ReportResponse.PaymentMethodBreakdown(
                            entry.getKey(),
                            amount,
                            percentage(amount, totalExpense),
                            entry.getValue().size());
                })
                .sorted(Comparator.comparing(ReportResponse.PaymentMethodBreakdown::getAmount).reversed())
                .toList();
    }

    private List<ReportResponse.TimeBucket> timeBuckets(
            ReportPeriod period,
            PeriodRange range,
            List<Transaction> transactions) {
        List<PeriodRange> bucketRanges = period.bucketRanges(range);
        return bucketRanges.stream()
                .map(bucket -> {
                    List<Transaction> bucketTransactions = transactions.stream()
                            .filter(tx -> !tx.getPaymentDate().isBefore(bucket.start())
                                    && !tx.getPaymentDate().isAfter(bucket.end()))
                            .toList();
                    return new ReportResponse.TimeBucket(
                            bucket.label(),
                            bucket.start(),
                            bucket.end(),
                            sum(bucketTransactions, TransactionType.INCOME),
                            sum(bucketTransactions, TransactionType.EXPENSE),
                            bucketTransactions.size());
                })
                .toList();
    }

    private List<ReportResponse.ReportTransactionItem> topTransactions(
            List<Transaction> transactions,
            TransactionType type) {
        return transactions.stream()
                .filter(tx -> tx.getType() == type)
                .sorted(Comparator.comparing(Transaction::getAmount).reversed())
                .limit(8)
                .map(this::toReportItem)
                .toList();
    }

    private ReportResponse.ReportTransactionItem toReportItem(Transaction tx) {
        return new ReportResponse.ReportTransactionItem(
                tx.getId(),
                tx.getPaymentDate(),
                tx.getType(),
                tx.getCategory(),
                tx.getDescription(),
                tx.getAmount(),
                tx.getPaymentMethod() != null ? tx.getPaymentMethod().getName() : null,
                tx.getInstallmentPlan() != null,
                tx.getRecurringTransaction() != null);
    }

    private List<String> buildInsights(ReportResponse report) {
        List<String> insights = new ArrayList<>();
        if (report.getTransactionCount() == 0) {
            insights.add("No transactions were recorded in this period.");
            return insights;
        }

        if (report.getBalance().signum() >= 0) {
            insights.add("Income covered expenses in this period, leaving a positive balance of "
                    + money(report.getBalance()) + ".");
        } else {
            insights.add("Expenses exceeded income by " + money(report.getBalance().abs()) + ".");
        }

        report.getExpenseCategories().stream().findFirst()
                .ifPresent(category -> insights.add(category.getCategory() + " was the largest expense category at "
                        + money(category.getAmount()) + " (" + category.getPercentage() + "%)."));

        report.getPaymentMethods().stream().findFirst().ifPresent(
                method -> insights.add(paymentMethodName(method) + " carried the highest payment-method spend at "
                        + money(method.getAmount()) + " (" + method.getPercentage() + "%)."));

        if (report.getInstallmentExpenseTotal().signum() > 0 || report.getRecurringExpenseTotal().signum() > 0) {
            insights.add("Installments accounted for " + money(report.getInstallmentExpenseTotal())
                    + " and recurring expenses accounted for " + money(report.getRecurringExpenseTotal()) + ".");
        }
        return insights;
    }

    private String paymentMethodName(ReportResponse.PaymentMethodBreakdown method) {
        if (method == null) {
            return "No payment method";
        }

        String[] getterNames = { "getName", "getPaymentMethodName", "getMethodName" };
        for (String getterName : getterNames) {
            try {
                Object value = method.getClass().getMethod(getterName).invoke(method);
                if (value instanceof String label && !label.isBlank()) {
                    return label;
                }
            } catch (ReflectiveOperationException ignored) {
                // Keep compatibility with the actual DTO getter available in this codebase.
            }
        }

        return "No payment method";
    }

    private BigDecimal percentage(BigDecimal amount, BigDecimal total) {
        if (total == null || total.signum() == 0) {
            return BigDecimal.ZERO;
        }
        return amount.multiply(ONE_HUNDRED).divide(total, 1, RoundingMode.HALF_UP);
    }

    private String money(BigDecimal value) {
        NumberFormat formatter = NumberFormat.getNumberInstance(REPORT_LOCALE);
        formatter.setMinimumFractionDigits(2);
        formatter.setMaximumFractionDigits(2);
        return "\u00A3" + formatter.format(value == null ? BigDecimal.ZERO : value);
    }

    private String formatDate(LocalDate date) {
        return DATE_FORMAT.format(date);
    }

    private String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private enum ReportPeriod {
        DAY, WEEK, MONTH, YEAR;

        static ReportPeriod from(String value) {
            if (value == null || value.isBlank()) {
                return MONTH;
            }
            try {
                return ReportPeriod.valueOf(value.trim().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid report period: " + value);
            }
        }

        String requestValue() {
            return name().toLowerCase(Locale.ROOT);
        }

        PeriodRange range(LocalDate date) {
            return switch (this) {
                case DAY -> new PeriodRange(date, date, DATE_FORMAT.format(date));
                case WEEK -> {
                    LocalDate start = date.with(DayOfWeek.MONDAY);
                    LocalDate end = start.plusDays(6);
                    yield new PeriodRange(start, end, DATE_FORMAT.format(start) + " - " + DATE_FORMAT.format(end));
                }
                case MONTH -> {
                    YearMonth month = YearMonth.from(date);
                    yield new PeriodRange(month.atDay(1), month.atEndOfMonth(), MONTH_FORMAT.format(date));
                }
                case YEAR -> new PeriodRange(
                        LocalDate.of(date.getYear(), 1, 1),
                        LocalDate.of(date.getYear(), 12, 31),
                        String.valueOf(date.getYear()));
            };
        }

        String label(LocalDate date, PeriodRange range) {
            return switch (this) {
                case DAY -> "Daily " + DATE_FORMAT.format(date);
                case WEEK -> "Weekly " + DATE_FORMAT.format(range.start()) + " - " + DATE_FORMAT.format(range.end());
                case MONTH -> "Monthly " + MONTH_FORMAT.format(date);
                case YEAR -> "Annual " + date.getYear();
            };
        }

        List<PeriodRange> bucketRanges(PeriodRange range) {
            List<PeriodRange> buckets = new ArrayList<>();
            if (this == YEAR) {
                LocalDate cursor = range.start();
                while (!cursor.isAfter(range.end())) {
                    YearMonth month = YearMonth.from(cursor);
                    buckets.add(new PeriodRange(month.atDay(1), month.atEndOfMonth(), MONTH_FORMAT.format(cursor)));
                    cursor = cursor.plusMonths(1);
                }
                return buckets;
            }

            LocalDate cursor = range.start();
            while (!cursor.isAfter(range.end())) {
                String label = this == WEEK
                        ? cursor.getDayOfWeek().getDisplayName(TextStyle.SHORT, REPORT_LOCALE)
                        : DateTimeFormatter.ofPattern("dd MMM", REPORT_LOCALE).format(cursor);
                buckets.add(new PeriodRange(cursor, cursor, label));
                cursor = cursor.plusDays(1);
            }
            return buckets;
        }
    }

    private record PeriodRange(LocalDate start, LocalDate end, String label) {
    }

    private class PdfReportWriter {
        private static final float MARGIN = 42;
        private static final float PAGE_WIDTH = PDRectangle.A4.getWidth();
        private static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();
        private static final float CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
        private static final float FOOTER_Y = 30;
        private static final float FOOTER_SAFE_TOP = 66;

        private final PdfTheme theme = new PdfTheme();
        private final PdfText text = new PdfText();
        private final PdfLayout layout = new PdfLayout();

        private PDDocument document;
        private PDPageContentStream content;
        private ReportResponse report;
        private User user;
        private List<Transaction> movementTransactions;
        private float y;
        private int pageNumber;

        byte[] write(ReportResponse report, User user, List<Transaction> movementTransactions) throws IOException {
            this.report = report;
            this.user = user;
            this.movementTransactions = movementTransactions == null ? List.of() : movementTransactions;
            try (PDDocument doc = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                document = doc;
                layout.newPage();
                renderCoverHeader();
                renderKpiCards();
                renderInsightCards();
                renderBreakdownPanels();
                renderPaymentMethodPanel();
                renderMovementTable();
                layout.closePage();
                document.save(output);
                return output.toByteArray();
            }
        }

        private void renderCoverHeader() throws IOException {
            theme.fill(0, PAGE_HEIGHT - 148, PAGE_WIDTH, 148, theme.offWhite());
            theme.fill(0, PAGE_HEIGHT - 148, 7, 148, theme.primary());

            float logoSize = 38;
            theme.fill(MARGIN, y - logoSize, logoSize, logoSize, theme.primary());
            theme.whiteText();
            text.draw("PB", MARGIN + 9, y - 25, PDType1Font.HELVETICA_BOLD, 14);

            theme.primaryText();
            text.draw("PERSONAL BUDGET", MARGIN + 52, y - 9, PDType1Font.HELVETICA_BOLD, 8.5f);
            theme.heading();
            text.draw("Financial report", MARGIN + 52, y - 34, PDType1Font.HELVETICA_BOLD, 26);
            theme.mutedText();
            text.draw(
                    "Premium overview based on payment dates, card impact dates, installments, and recurring expenses",
                    MARGIN + 52, y - 51, PDType1Font.HELVETICA, 8.2f);

            float metaW = 184;
            float metaX = PAGE_WIDTH - MARGIN - metaW;
            layout.card(metaX, y - 68, metaW, 70, theme.white(), theme.border());
            theme.mutedText();
            text.draw("REPORT PERIOD", metaX + 14, y - 17, PDType1Font.HELVETICA_BOLD, 7);
            theme.heading();
            text.drawFitted(report.getPeriodLabel(), metaX + 14, y - 37, metaW - 28, PDType1Font.HELVETICA_BOLD, 12.5f);
            theme.mutedText();
            text.draw(formatDate(report.getStartDate()) + " to " + formatDate(report.getEndDate()),
                    metaX + 14, y - 54, PDType1Font.HELVETICA, 8);

            y -= 88;
            theme.secondaryText();
            text.draw("Prepared for " + blankToDefault(user.getName(), "User"), MARGIN, y, PDType1Font.HELVETICA, 10);
            text.drawRight(report.getTransactionCount() + " transactions", MARGIN + CONTENT_WIDTH, y,
                    PDType1Font.HELVETICA, 10);
            y -= 30;
        }

        private void renderContinuationHeader() throws IOException {
            theme.primaryText();
            text.draw("PERSONAL BUDGET", MARGIN, y, PDType1Font.HELVETICA_BOLD, 8);
            theme.secondaryText();
            text.drawRight(report.getPeriodLabel(), MARGIN + CONTENT_WIDTH, y, PDType1Font.HELVETICA, 9);
            y -= 14;
            theme.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y, theme.border());
            y -= 24;
        }

        private void renderKpiCards() throws IOException {
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
            y -= 84;
        }

        private void renderKpiCard(float x, float width, String label, String value, String detail, int[] accent)
                throws IOException {
            layout.card(x, y - 68, width, 68, theme.white(), theme.border());
            theme.fill(x, y - 68, 4, 68, accent);
            theme.mutedText();
            text.draw(label.toUpperCase(Locale.ROOT), x + 14, y - 16, PDType1Font.HELVETICA_BOLD, 7);
            theme.color(accent);
            text.drawFitted(value, x + 14, y - 40, width - 28, PDType1Font.HELVETICA_BOLD, 13);
            theme.mutedText();
            text.drawFitted(detail, x + 14, y - 56, width - 28, PDType1Font.HELVETICA, 8);
        }

        private void renderInsightCards() throws IOException {
            layout.ensure(124);
            float gap = 14;
            float cardWidth = (CONTENT_WIDTH - gap) / 2;
            float top = y;
            renderExecutiveSummary(MARGIN, top, cardWidth, 108);
            renderCommitmentCard(MARGIN + cardWidth + gap, top, cardWidth, 108);
            y = top - 126;
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

        private void renderBreakdownPanels() throws IOException {
            float panelHeight = 224;
            layout.ensure(panelHeight + 42);
            layout.sectionTitle("Category breakdown");
            float gap = 18;
            float width = (CONTENT_WIDTH - gap) / 2;
            float top = y;
            renderCategoryPanel(MARGIN, top, width, panelHeight, "Expenses", report.getExpenseCategories(),
                    theme.danger());
            renderCategoryPanel(MARGIN + width + gap, top, width, panelHeight, "Income", report.getIncomeCategories(),
                    theme.success());
            y = top - panelHeight - 22;
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

        private void renderPaymentMethodPanel() throws IOException {
            layout.ensure(202);
            layout.sectionTitle("Payment breakdown");
            float top = y;
            float height = 180;
            layout.card(MARGIN, top - height, CONTENT_WIDTH, height, theme.white(), theme.border());
            if (report.getPaymentMethods().isEmpty()) {
                theme.mutedText();
                text.draw("No expense payment methods in this period.", MARGIN + 14, top - 30, PDType1Font.HELVETICA,
                        9);
                y = top - height - 22;
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
                    renderProgressBreakdownRow(leftX, rowYLeft, colWidth, paymentMethodName(method),
                            money(method.getAmount()),
                            method.getPercentage(), method.getTransactionCount() + " payments", theme.primary());
                    rowYLeft -= 34;
                } else {
                    renderProgressBreakdownRow(rightX, rowYRight, colWidth, paymentMethodName(method),
                            money(method.getAmount()),
                            method.getPercentage(), method.getTransactionCount() + " payments", theme.purple());
                    rowYRight -= 34;
                }
            }
            y = top - height - 22;
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

        private void renderMovementTable() throws IOException {
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
                text.draw("No income or expense movement in this period.", MARGIN, y, PDType1Font.HELVETICA, 9);
                y -= 24;
            }
            y -= 16;
        }

        private void renderMovementHeader() throws IOException {
            layout.ensure(48);
            theme.fill(MARGIN, y - 16, CONTENT_WIDTH, 22, theme.offWhite());
            theme.stroke(MARGIN, y - 16, CONTENT_WIDTH, 22, theme.border());
            theme.mutedText();
            text.draw("DATE", MARGIN + 8, y - 8, PDType1Font.HELVETICA_BOLD, 7);
            text.draw("TRANSACTION", MARGIN + 124, y - 8, PDType1Font.HELVETICA_BOLD, 7);
            text.draw("CATEGORY", MARGIN + 214, y - 8, PDType1Font.HELVETICA_BOLD, 7);
            text.draw("DESCRIPTION", MARGIN + 360, y - 8, PDType1Font.HELVETICA_BOLD, 7);
            text.drawRight("AMOUNT", MARGIN + CONTENT_WIDTH - 8, y - 8, PDType1Font.HELVETICA_BOLD, 7);
            y -= 24;
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
            if (y - rowHeight < FOOTER_SAFE_TOP) {
                layout.newPage();
                layout.sectionTitle("Period movement");
                renderMovementHeader();
            }
            if (index % 2 == 1) {
                theme.fill(MARGIN, y - 13, CONTENT_WIDTH, rowHeight, theme.zebra());
            }
            theme.secondaryText();
            text.drawFitted(date, MARGIN + 8, y, 72, PDType1Font.HELVETICA, 8.5f);
            theme.color(accent);
            text.draw(type, MARGIN + 124, y, PDType1Font.HELVETICA_BOLD, 8.5f);
            theme.secondaryText();
            text.drawFitted(category, MARGIN + 214, y, 132, PDType1Font.HELVETICA, 8.5f);
            text.drawFitted(description, MARGIN + 360, y, 78, PDType1Font.HELVETICA, 8.5f);
            theme.color(accent);
            text.drawRight(amount, MARGIN + CONTENT_WIDTH - 8, y, PDType1Font.HELVETICA_BOLD, 8.5f);
            y -= rowHeight;
            theme.line(MARGIN, y + 7, MARGIN + CONTENT_WIDTH, y + 7, theme.subtleBorder());
        }

        private String shortDescription(String description) {
            String value = blankToDefault(description, "-");
            return value.length() <= 10 ? value : value.substring(0, 10);
        }

        private class PdfLayout {
            void newPage() throws IOException {
                closePage();
                document.addPage(new PDPage(PDRectangle.A4));
                content = new PDPageContentStream(document, document.getPage(document.getNumberOfPages() - 1));
                pageNumber++;
                y = PAGE_HEIGHT - MARGIN;
                if (pageNumber > 1) {
                    renderContinuationHeader();
                }
            }

            void closePage() throws IOException {
                if (content != null) {
                    footer();
                    content.close();
                    content = null;
                }
            }

            void ensure(float requiredHeight) throws IOException {
                if (y - requiredHeight < FOOTER_SAFE_TOP) {
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
                text.draw(title, MARGIN, y, PDType1Font.HELVETICA_BOLD, 13);
                theme.line(MARGIN, y - 7, MARGIN + 34, y - 7, theme.primary());
                y -= 24;
            }

            void progressBar(float x, float rectY, float width, float height, BigDecimal percentage, int[] accent)
                    throws IOException {
                theme.fill(x, rectY, width, height, theme.progressTrack());
                float safePercent = Math.max(0f, Math.min(100f, percentage == null ? 0f : percentage.floatValue()));
                theme.fill(x, rectY, width * safePercent / 100f, height, accent);
            }
        }

        private class PdfTable {
            private static final float HEADER_HEIGHT = 22;
            private static final float MIN_ROW_HEIGHT = 24;
            private static final float H_PADDING = 8;
            private static final float LINE_HEIGHT = 10;

            private final List<TableColumn> columns;

            PdfTable(List<TableColumn> columns) {
                this.columns = columns;
            }

            void header() throws IOException {
                layout.ensure(HEADER_HEIGHT + MIN_ROW_HEIGHT);
                theme.fill(MARGIN, y - 16, CONTENT_WIDTH, HEADER_HEIGHT, theme.offWhite());
                theme.stroke(MARGIN, y - 16, CONTENT_WIDTH, HEADER_HEIGHT, theme.border());
                theme.mutedText();
                float x = MARGIN + H_PADDING;
                for (TableColumn column : columns) {
                    float width = column.width(CONTENT_WIDTH) - H_PADDING * 2;
                    String title = column.title().toUpperCase(Locale.ROOT);
                    if (column.rightAligned()) {
                        text.drawRight(title, x + width, y - 8, PDType1Font.HELVETICA_BOLD, 7);
                    } else {
                        text.drawFitted(title, x, y - 8, width, PDType1Font.HELVETICA_BOLD, 7);
                    }
                    x += column.width(CONTENT_WIDTH);
                }
                y -= HEADER_HEIGHT + 2;
            }

            void row(int index, List<String> values) throws IOException {
                List<List<String>> wrappedValues = wrapped(values);
                int lineCount = wrappedValues.stream().mapToInt(List::size).max().orElse(1);
                float rowHeight = Math.max(MIN_ROW_HEIGHT, 12 + lineCount * LINE_HEIGHT);
                layout.ensure(rowHeight + 8);

                if (index % 2 == 1) {
                    theme.fill(MARGIN, y - rowHeight + 8, CONTENT_WIDTH, rowHeight, theme.zebra());
                }

                float x = MARGIN + H_PADDING;
                for (int i = 0; i < columns.size(); i++) {
                    TableColumn column = columns.get(i);
                    float colWidth = column.width(CONTENT_WIDTH) - H_PADDING * 2;
                    List<String> lines = wrappedValues.get(i);
                    PDFont font = column.rightAligned() ? PDType1Font.HELVETICA_BOLD : PDType1Font.HELVETICA;
                    theme.color(column.rightAligned() ? theme.headingColor() : theme.bodyColor());
                    for (int line = 0; line < lines.size(); line++) {
                        float lineY = y - line * LINE_HEIGHT;
                        if (column.rightAligned()) {
                            text.drawRight(lines.get(line), x + colWidth, lineY, font, 8.2f);
                        } else {
                            text.draw(lines.get(line), x, lineY, font, 8.2f);
                        }
                    }
                    x += column.width(CONTENT_WIDTH);
                }

                y -= rowHeight;
                theme.line(MARGIN, y + 7, MARGIN + CONTENT_WIDTH, y + 7, theme.subtleBorder());
            }

            private List<List<String>> wrapped(List<String> values) throws IOException {
                List<List<String>> result = new ArrayList<>();
                for (int i = 0; i < columns.size(); i++) {
                    TableColumn column = columns.get(i);
                    String value = i < values.size() ? values.get(i) : "";
                    float colWidth = column.width(CONTENT_WIDTH) - H_PADDING * 2;
                    PDFont font = column.rightAligned() ? PDType1Font.HELVETICA_BOLD : PDType1Font.HELVETICA;
                    int maxLines = column.rightAligned() ? 1 : 2;
                    result.add(text.wrap(value, colWidth, font, 8.2f, maxLines));
                }
                return result;
            }
        }

        private record TableColumn(String title, float widthRatio, boolean rightAligned) {
            float width(float tableWidth) {
                return tableWidth * widthRatio;
            }
        }

        private class PdfText {
            void draw(String value, float x, float textY, PDFont font, float size) throws IOException {
                content.beginText();
                content.setFont(font, size);
                content.newLineAtOffset(x, textY);
                content.showText(safe(value));
                content.endText();
            }

            void drawRight(String value, float rightX, float textY, PDFont font, float size) throws IOException {
                String safe = safe(value);
                draw(safe, rightX - width(safe, font, size), textY, font, size);
            }

            void drawFitted(String value, float x, float textY, float maxWidth, PDFont font, float size)
                    throws IOException {
                draw(fit(value, maxWidth, font, size), x, textY, font, size);
            }

            List<String> wrap(String value, float maxWidth, PDFont font, float size, int maxLines) throws IOException {
                String safe = safe(value).trim();
                if (safe.isEmpty()) {
                    return List.of("");
                }

                String[] words = safe.split("\\s+");
                List<String> lines = new ArrayList<>();
                StringBuilder current = new StringBuilder();
                for (String word : words) {
                    String candidate = current.length() == 0 ? word : current + " " + word;
                    if (width(candidate, font, size) <= maxWidth) {
                        current.setLength(0);
                        current.append(candidate);
                        continue;
                    }

                    if (current.length() == 0) {
                        lines.add(fit(word, maxWidth, font, size));
                    } else {
                        lines.add(current.toString());
                        current.setLength(0);
                        current.append(word);
                    }

                    if (lines.size() == maxLines) {
                        break;
                    }
                }

                if (current.length() > 0 && lines.size() < maxLines) {
                    lines.add(current.toString());
                }
                if (lines.isEmpty()) {
                    lines.add("");
                }
                if (lines.size() == maxLines && words.length > 0) {
                    int last = lines.size() - 1;
                    lines.set(last, fit(lines.get(last), maxWidth, font, size));
                }
                return lines;
            }

            String fit(String value, float maxWidth, PDFont font, float size) throws IOException {
                String safe = safe(value);
                if (width(safe, font, size) <= maxWidth) {
                    return safe;
                }
                String suffix = "...";
                while (!safe.isEmpty() && width(safe + suffix, font, size) > maxWidth) {
                    safe = safe.substring(0, safe.length() - 1);
                }
                return safe.isBlank() ? suffix : safe.stripTrailing() + suffix;
            }

            float width(String value, PDFont font, float size) throws IOException {
                return font.getStringWidth(safe(value)) / 1000f * size;
            }

            String safe(String value) {
                String normalized = blankToDefault(value, "")
                        .replace("\n", " ")
                        .replace("\r", " ")
                        .replace("\u2013", "-")
                        .replace("\u2014", "-")
                        .replace("\u2018", "'")
                        .replace("\u2019", "'")
                        .replace("\u201C", "\"")
                        .replace("\u201D", "\"");
                StringBuilder safe = new StringBuilder(normalized.length());
                for (int i = 0; i < normalized.length(); i++) {
                    char ch = normalized.charAt(i);
                    if (ch >= 32 && ch <= 255) {
                        safe.append(ch);
                    } else {
                        safe.append("?");
                    }
                }
                return safe.toString();
            }
        }

        private class PdfTheme {
            int[] primary() {
                return new int[] { 37, 99, 235 };
            }

            int[] success() {
                return new int[] { 22, 163, 74 };
            }

            int[] danger() {
                return new int[] { 220, 38, 38 };
            }

            int[] purple() {
                return new int[] { 124, 58, 237 };
            }

            int[] headingColor() {
                return new int[] { 15, 23, 42 };
            }

            int[] bodyColor() {
                return new int[] { 51, 65, 85 };
            }

            int[] mutedColor() {
                return new int[] { 100, 116, 139 };
            }

            int[] border() {
                return new int[] { 226, 232, 240 };
            }

            int[] subtleBorder() {
                return new int[] { 241, 245, 249 };
            }

            int[] offWhite() {
                return new int[] { 248, 250, 252 };
            }

            int[] white() {
                return new int[] { 255, 255, 255 };
            }

            int[] zebra() {
                return new int[] { 250, 252, 255 };
            }

            int[] progressTrack() {
                return new int[] { 241, 245, 249 };
            }

            void heading() throws IOException {
                color(headingColor());
            }

            void secondaryText() throws IOException {
                color(bodyColor());
            }

            void mutedText() throws IOException {
                color(mutedColor());
            }

            void primaryText() throws IOException {
                color(primary());
            }

            void whiteText() throws IOException {
                color(white());
            }

            void color(int[] rgb) throws IOException {
                content.setNonStrokingColor(rgb[0], rgb[1], rgb[2]);
                content.setStrokingColor(rgb[0], rgb[1], rgb[2]);
            }

            void fill(float x, float rectY, float width, float height, int[] rgb) throws IOException {
                color(rgb);
                content.addRect(x, rectY, width, height);
                content.fill();
            }

            void stroke(float x, float rectY, float width, float height, int[] rgb) throws IOException {
                color(rgb);
                content.addRect(x, rectY, width, height);
                content.stroke();
            }

            void line(float x1, float y1, float x2, float y2, int[] rgb) throws IOException {
                color(rgb);
                content.moveTo(x1, y1);
                content.lineTo(x2, y2);
                content.stroke();
            }
        }

        private void footer() throws IOException {
            if (content == null) {
                return;
            }
            theme.line(MARGIN, FOOTER_Y + 14, MARGIN + CONTENT_WIDTH, FOOTER_Y + 14, theme.border());
            theme.mutedText();
            text.draw("Generated " + formatDate(report.getGeneratedAt().toLocalDate())
                    + " - Based on payment dates, including card and installment impact dates.",
                    MARGIN, FOOTER_Y, PDType1Font.HELVETICA, 7.5f);
            text.drawRight("Page " + pageNumber, MARGIN + CONTENT_WIDTH, FOOTER_Y, PDType1Font.HELVETICA_BOLD, 7.5f);
        }
    }
}
