package com.example.budget.dto;

import java.util.List;

/** One page of an account's past activity, most recent first. */
public record AccountActivityPageDTO(
        List<AccountActivityItemDTO> items,
        int page,
        int size,
        boolean hasMore
) {}
