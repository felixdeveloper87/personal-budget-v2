export type PeriodUnit = "week" | "month";

export interface PeriodRange {
  start: Date;
  end: Date;
  startDate: string;
  endDate: string;
}

function atStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPeriodRange(date: Date, period: PeriodUnit): PeriodRange {
  let start: Date;
  let end: Date;

  if (period === "week") {
    start = atStartOfDay(date);
    const weekday = start.getDay();
    const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
    start.setDate(start.getDate() - daysFromMonday);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
  } else {
    start = new Date(date.getFullYear(), date.getMonth(), 1);
    end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  return {
    start,
    end,
    startDate: toLocalIsoDate(start),
    endDate: toLocalIsoDate(end),
  };
}

export function shiftPeriod(date: Date, period: PeriodUnit, amount: number) {
  if (period === "month") {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1);
  }

  const next = atStartOfDay(date);
  next.setDate(next.getDate() + amount * 7);
  return next;
}

export function formatPeriodLabel(date: Date, period: PeriodUnit) {
  if (period === "month") {
    const label = new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  const { start, end } = getPeriodRange(date, period);
  const startLabel = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(start);
  const endLabel = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(end);
  return `${startLabel} – ${endLabel}`;
}

export function isCurrentPeriod(date: Date, period: PeriodUnit) {
  const today = atStartOfDay(new Date());
  const { start, end } = getPeriodRange(date, period);
  return today >= start && today <= end;
}
