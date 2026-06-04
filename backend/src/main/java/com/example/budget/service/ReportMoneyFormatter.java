package com.example.budget.service;

import com.example.budget.model.ReportPeriod;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.text.NumberFormat;

/**
 * Formats monetary values for the report (UK locale, GBP symbol, two decimals).
 */
@Component
public class ReportMoneyFormatter {

    public String format(BigDecimal value) {
        NumberFormat formatter = NumberFormat.getNumberInstance(ReportPeriod.REPORT_LOCALE);
        formatter.setMinimumFractionDigits(2);
        formatter.setMaximumFractionDigits(2);
        return "£" + formatter.format(value == null ? BigDecimal.ZERO : value);
    }
}
