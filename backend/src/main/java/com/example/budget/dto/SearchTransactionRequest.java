package com.example.budget.dto;

import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for transaction search requests.
 * 
 * Used to filter transactions by various criteria. All fields are optional,
 * allowing flexible search combinations. Provides helper methods to convert
 * date strings to LocalDateTime and check if any filters are applied.
 */
public class SearchTransactionRequest {

    private String text;

    @Pattern(
        regexp = "^(income|expense)$",
        flags = Pattern.Flag.CASE_INSENSITIVE,
        message = "Type must be 'income' or 'expense'"
    )
    private String type;

    private String category;

    @Pattern(
        regexp = "^\\d{4}-\\d{2}-\\d{2}$",
        message = "Date must be in format yyyy-MM-dd"
    )
    private String startDate;

    @Pattern(
        regexp = "^\\d{4}-\\d{2}-\\d{2}$",
        message = "Date must be in format yyyy-MM-dd"
    )
    private String endDate;

    public SearchTransactionRequest() {
    }

    public SearchTransactionRequest(
            String text,
            String type,
            String category,
            String startDate,
            String endDate
    ) {
        this.text = text;
        this.type = type;
        this.category = category;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public String getText() {
        return text;
    }

    public String getType() {
        return type;
    }

    public String getCategory() {
        return category;
    }

    public String getStartDate() {
        return startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public LocalDateTime getStartDateTime() {
        return (startDate == null || startDate.isBlank())
                ? null
                : LocalDate.parse(startDate).atStartOfDay();
    }

    public LocalDateTime getEndDateTime() {
        return (endDate == null || endDate.isBlank())
                ? null
                : LocalDate.parse(endDate).atTime(23, 59, 59);
    }

    public boolean hasFilters() {
        return isFilled(text) ||
               isFilled(type) ||
               isFilled(category) ||
               isFilled(startDate) ||
               isFilled(endDate);
    }

    private boolean isFilled(String value) {
        return value != null && !value.isBlank();
    }
}
