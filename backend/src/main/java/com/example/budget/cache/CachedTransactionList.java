package com.example.budget.cache;

import com.example.budget.model.Transaction;

import java.util.List;

public final class CachedTransactionList extends BaseCachedList<Transaction> {

    public static CachedTransactionList copyOf(List<Transaction> fromDb) {
        CachedTransactionList w = new CachedTransactionList();
        w.setItems(defensiveCopy(fromDb));
        return w;
    }
}
