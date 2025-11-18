package com.example.budget.specification;

import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

public final class TransactionSpecifications {

    private TransactionSpecifications() {
    }

    // ===========================================================
    // USER FILTER (sempre obrigatório)
    // ===========================================================
    public static Specification<Transaction> belongsToUser(User user) {
        return (root, query, cb) ->
                cb.equal(root.get("user").get("id"), user.getId());
    }

    // ===========================================================
    // TEXT FILTER
    // ===========================================================
    public static Specification<Transaction> descriptionContains(String text) {
        if (!StringUtils.hasText(text)) {
            return null;
        }

        String pattern = "%" + text.toLowerCase() + "%";

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("description")), pattern);
    }

    // ===========================================================
    // TYPE FILTER
    // ===========================================================
    public static Specification<Transaction> hasType(TransactionType type) {
        return (type == null)
                ? null
                : (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    // ===========================================================
    // CATEGORY FILTER
    // ===========================================================
    public static Specification<Transaction> categoryContains(String category) {
        if (!StringUtils.hasText(category)) {
            return null;
        }

        String pattern = "%" + category.toLowerCase() + "%";

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("category")), pattern);
    }

    // ===========================================================
    // DATE FILTERS
    // ===========================================================
    public static Specification<Transaction> dateFrom(LocalDateTime start) {
        return (start == null)
                ? null
                : (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("dateTime"), start);
    }

    public static Specification<Transaction> dateTo(LocalDateTime end) {
        return (end == null)
                ? null
                : (root, query, cb) -> cb.lessThanOrEqualTo(root.get("dateTime"), end);
    }

    // ===========================================================
    // SPECIFICATION BUILDER
    // ===========================================================
    public static Specification<Transaction> buildSearchSpecification(
            User user,
            String text,
            TransactionType type,
            String category,
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {
        return Specification
                .where(belongsToUser(user))
                .and(descriptionContains(text))
                .and(hasType(type))
                .and(categoryContains(category))
                .and(dateFrom(startDate))
                .and(dateTo(endDate));
    }
}
