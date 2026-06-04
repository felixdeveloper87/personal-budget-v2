package com.example.budget.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class ReportMoneyFormatterTest {
    private final ReportMoneyFormatter formatter = new ReportMoneyFormatter();

    @Test
    void format_addsPoundSymbolAndTwoDecimals() {
        assertThat(formatter.format(new BigDecimal("1234.5"))).isEqualTo("£1,234.50");
    }

    @Test
    void format_roundsToTwoDecimals() {
        assertThat(formatter.format(new BigDecimal("1234.567"))).isEqualTo("£1,234.57");
    }

    @Test
    void format_nullIsZero() {
        assertThat(formatter.format(null)).isEqualTo("£0.00");
    }

    @Test
    void format_zero() {
        assertThat(formatter.format(BigDecimal.ZERO)).isEqualTo("£0.00");
    }
}
