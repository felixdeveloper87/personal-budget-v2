package com.example.budget.cache;

import com.example.budget.dto.InstallmentPlanDTO;

import java.util.List;

public final class CachedInstallmentPlanList extends BaseCachedList<InstallmentPlanDTO> {

    public static CachedInstallmentPlanList copyOf(List<InstallmentPlanDTO> fromDb) {
        CachedInstallmentPlanList w = new CachedInstallmentPlanList();
        w.setItems(defensiveCopy(fromDb));
        return w;
    }
}
