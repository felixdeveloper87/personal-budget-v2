package com.example.budget.installment.cache;

import com.example.budget.shared.cache.BaseCachedList;

import com.example.budget.installment.dto.InstallmentPlanDTO;

import java.util.List;

public final class CachedInstallmentPlanList extends BaseCachedList<InstallmentPlanDTO> {

    public static CachedInstallmentPlanList copyOf(List<InstallmentPlanDTO> fromDb) {
        CachedInstallmentPlanList w = new CachedInstallmentPlanList();
        w.setItems(defensiveCopy(fromDb));
        return w;
    }
}
