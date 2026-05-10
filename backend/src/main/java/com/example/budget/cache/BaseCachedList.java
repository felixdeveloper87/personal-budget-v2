package com.example.budget.cache;

import java.util.ArrayList;
import java.util.List;

/**
 * Shared envelope for Redis JSON list payloads; concrete subclasses fix the element type for Jackson.
 */
abstract class BaseCachedList<T> {

    private List<T> items;

    protected BaseCachedList() {
    }

    public List<T> getItems() {
        return items;
    }

    public void setItems(List<T> items) {
        this.items = items;
    }

    protected static <E> List<E> defensiveCopy(List<E> from) {
        return new ArrayList<>(from);
    }
}
