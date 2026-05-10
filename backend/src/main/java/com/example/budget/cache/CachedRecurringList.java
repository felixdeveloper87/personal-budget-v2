package com.example.budget.cache;

import com.example.budget.dto.RecurringTransactionDTO;

import java.util.List;

public final class CachedRecurringList extends BaseCachedList<RecurringTransactionDTO> {

    public static CachedRecurringList copyOf(List<RecurringTransactionDTO> fromDb) {
        CachedRecurringList w = new CachedRecurringList();
        w.setItems(defensiveCopy(fromDb));
        return w;
    }
}
