package com.example.budget.cache;

import com.example.budget.config.RedisCacheConfig;
import com.example.budget.model.User;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

/**
 * Single entry point for application-driven cache eviction (monthly aggregates and user list endpoints).
 */
@Service
public class CacheInvalidationService {

    private static final int MONTH_WINDOW_PAST_YEARS = 3;
    private static final int MONTH_WINDOW_FUTURE_YEARS = 15;

    private final Cache monthlySummaryCache;
    private final Cache transactionsListCache;
    private final Cache installmentPlansListCache;
    private final Cache recurringListCache;

    public CacheInvalidationService(CacheManager cacheManager) {
        this.monthlySummaryCache = require(cacheManager, RedisCacheConfig.MONTHLY_SUMMARY_CACHE);
        this.transactionsListCache = require(cacheManager, RedisCacheConfig.TRANSACTIONS_LIST_CACHE);
        this.installmentPlansListCache = require(cacheManager, RedisCacheConfig.INSTALLMENT_PLANS_LIST_CACHE);
        this.recurringListCache = require(cacheManager, RedisCacheConfig.RECURRING_LIST_CACHE);
    }

    public void evictMonthlySummary(User user, LocalDateTime transactionDateTime) {
        if (user == null || transactionDateTime == null) {
            return;
        }
        monthlySummaryCache.evict(monthlyKey(user.getId(), YearMonth.from(transactionDateTime)));
    }

    public void evictMonthlySummary(User user, LocalDate paymentDate) {
        if (user == null || paymentDate == null) {
            return;
        }
        monthlySummaryCache.evict(monthlyKey(user.getId(), YearMonth.from(paymentDate)));
    }

    /**
     * After bulk changes (e.g. cancel recurring + delete future postings), evict a wide month range for that user.
     */
    public void evictMonthlySummariesWideWindow(Long userId) {
        if (userId == null) {
            return;
        }
        YearMonth start = YearMonth.now().minusYears(MONTH_WINDOW_PAST_YEARS);
        YearMonth end = YearMonth.now().plusYears(MONTH_WINDOW_FUTURE_YEARS);
        for (YearMonth ym = start; !ym.isAfter(end); ym = ym.plusMonths(1)) {
            monthlySummaryCache.evict(monthlyKey(userId, ym));
        }
    }

    public void evictTransactionsList(Long userId) {
        evictUserKey(transactionsListCache, userId);
    }

    public void evictInstallmentPlansList(Long userId) {
        evictUserKey(installmentPlansListCache, userId);
    }

    public void evictRecurringList(Long userId) {
        evictUserKey(recurringListCache, userId);
    }

    private static void evictUserKey(Cache cache, Long userId) {
        if (userId != null) {
            cache.evict(String.valueOf(userId));
        }
    }

    private static String monthlyKey(Long userId, YearMonth ym) {
        return userId + ":" + ym.getYear() + ":" + ym.getMonthValue();
    }

    private static Cache require(CacheManager cacheManager, String name) {
        Cache cache = cacheManager.getCache(name);
        if (cache == null) {
            throw new IllegalStateException("Cache '" + name + "' is not configured");
        }
        return cache;
    }
}
