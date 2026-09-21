import { useCallback, useMemo, useState } from "react";

import {
  formatPeriodLabel,
  getPeriodRange,
  isCurrentPeriod,
  type PeriodUnit,
  shiftPeriod,
} from "@/utils/period";

export function usePeriodNavigation(initialPeriod: PeriodUnit = "month") {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodUnit>(initialPeriod);

  const navigate = useCallback(
    (direction: "previous" | "next") => {
      setSelectedDate((current) =>
        shiftPeriod(current, selectedPeriod, direction === "next" ? 1 : -1),
      );
    },
    [selectedPeriod],
  );

  const goToToday = useCallback(() => setSelectedDate(new Date()), []);
  const range = useMemo(
    () => getPeriodRange(selectedDate, selectedPeriod),
    [selectedDate, selectedPeriod],
  );
  const label = useMemo(
    () => formatPeriodLabel(selectedDate, selectedPeriod),
    [selectedDate, selectedPeriod],
  );
  const current = useMemo(
    () => isCurrentPeriod(selectedDate, selectedPeriod),
    [selectedDate, selectedPeriod],
  );

  return {
    selectedDate,
    selectedPeriod,
    setSelectedPeriod,
    navigate,
    goToToday,
    range,
    label,
    isCurrent: current,
  };
}
