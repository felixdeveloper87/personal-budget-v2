package com.example.budget.transaction.dto;

import java.util.List;

/** One page of transactions, newest first. */
public record TransactionPageDTO(
        List<TransactionDTO> items,
        int page,
        int size,
        long totalElements,
        boolean hasNext
) {}
