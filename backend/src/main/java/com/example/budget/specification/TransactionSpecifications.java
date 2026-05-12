package com.example.budget.specification;

import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * JPA Specifications for building dynamic queries on Transaction entities.
 * 
 * Provides reusable specification methods for filtering transactions by various criteria.
 * All specifications can be combined using JPA Specification's and() method.
 */
public final class TransactionSpecifications {

    private TransactionSpecifications() {
    }

    /**
     * Creates a specification to filter transactions by user.
     * 
     * This filter is always required to ensure data isolation between users.
     * 
     * @param user User to filter by
     * @return Specification for user filtering
     */
    public static Specification<Transaction> belongsToUser(User user) {
        return (root, query, cb) ->
                cb.equal(root.get("user").get("id"), user.getId());
    }

    /**
     * Creates a specification to filter transactions by description text.
     * 
     * Performs case-insensitive partial matching on the description field.
     * Returns null if text is empty, allowing it to be safely combined with other specifications.
     * 
     * @param text Text to search for in descriptions
     * @return Specification for text filtering, or null if text is empty
     */
    public static Specification<Transaction> descriptionContains(String text) {
        if (!StringUtils.hasText(text)) {
            return null;
        }

        String pattern = "%" + text.toLowerCase() + "%";

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("description")), pattern);
    }

    /**
     * Creates a specification to filter transactions by type.
     * 
     * @param type Transaction type to filter by (INCOME or EXPENSE)
     * @return Specification for type filtering, or null if type is null
     */
    public static Specification<Transaction> hasType(TransactionType type) {
        return (type == null)
                ? null
                : (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    /**
     * Creates a specification to filter transactions by category.
     * 
     * Performs case-insensitive partial matching on the category field.
     * Returns null if category is empty, allowing it to be safely combined with other specifications.
     * 
     * @param category Category text to search for
     * @return Specification for category filtering, or null if category is empty
     */
    public static Specification<Transaction> categoryContains(String category) {
        if (!StringUtils.hasText(category)) {
            return null;
        }

        String pattern = "%" + category.toLowerCase() + "%";

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("category")), pattern);
    }

    /**
     * Creates a specification to filter transactions from a start date.
     * 
     * Filters transactions with dateTime greater than or equal to the start date.
     * 
     * @param start Start date and time (inclusive)
     * @return Specification for start date filtering, or null if start is null
     */
    public static Specification<Transaction> dateFrom(LocalDateTime start) {
        return (start == null)
                ? null
                : (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("paymentDate"), start.toLocalDate());
    }

    /**
     * Creates a specification to filter transactions until an end date.
     * 
     * Filters transactions with dateTime less than or equal to the end date.
     * 
     * @param end End date and time (inclusive)
     * @return Specification for end date filtering, or null if end is null
     */
    public static Specification<Transaction> dateTo(LocalDateTime end) {
        return (end == null)
                ? null
                : (root, query, cb) -> cb.lessThanOrEqualTo(root.get("paymentDate"), end.toLocalDate());
    }

    /**
     * Builds a complete search specification combining all filters.
     * 
     * Combines user filtering (required) with optional filters for text, type,
     * category, and date range. Null filters are automatically ignored.
     * 
     * @param user User to filter by (required)
     * @param text Optional text to search in descriptions
     * @param type Optional transaction type filter
     * @param category Optional category filter
     * @param startDate Optional start date filter
     * @param endDate Optional end date filter
     * @return Combined specification for transaction search
     */
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
