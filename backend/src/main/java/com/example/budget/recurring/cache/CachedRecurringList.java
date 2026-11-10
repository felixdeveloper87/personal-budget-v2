package com.example.budget.recurring.cache;

import com.example.budget.shared.cache.BaseCachedList;

import com.example.budget.recurring.dto.RecurringTransactionDTO;

import java.util.List;

public final class CachedRecurringList extends BaseCachedList<RecurringTransactionDTO> {

    public static CachedRecurringList copyOf(List<RecurringTransactionDTO> fromDb) {
        CachedRecurringList w = new CachedRecurringList();
        w.setItems(defensiveCopy(fromDb));
        return w;
    }
}
