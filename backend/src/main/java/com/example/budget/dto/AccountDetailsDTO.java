package com.example.budget.dto;

import java.util.List;

public record AccountDetailsDTO(
        FinancialAccountDTO account,
        List<AccountActivityItemDTO> recentActivity,
        List<AccountActivityItemDTO> upcomingActivity
) {}
