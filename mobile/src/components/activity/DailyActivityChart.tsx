import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { toLocalIsoDate, type PeriodUnit } from "@/utils/period";

export interface DailyActivityEntry {
  amount: number;
  date: string;
}

interface DailyActivityChartProps {
  entries: DailyActivityEntry[];
  endDate: Date;
  onSelectDay: (date: string) => void;
  period: PeriodUnit;
  selectedDay: string | null;
  startDate: Date;
  title: string;
  tone: "income" | "expense";
}

interface ActivityDay {
  amount: number;
  date: Date;
  iso: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function buildDays(startDate: Date, endDate: Date, entries: DailyActivityEntry[]) {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    totals.set(entry.date, (totals.get(entry.date) ?? 0) + Number(entry.amount || 0));
  }

  const days: ActivityDay[] = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  while (current <= end && days.length < 32) {
    const iso = toLocalIsoDate(current);
    days.push({ amount: totals.get(iso) ?? 0, date: new Date(current), iso });
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function DailyActivityChart({
  entries,
  endDate,
  onSelectDay,
  period,
  selectedDay,
  startDate,
  title,
  tone,
}: DailyActivityChartProps) {
  const days = useMemo(
    () => buildDays(startDate, endDate, entries),
    [endDate, entries, startDate],
  );
  const total = useMemo(() => days.reduce((sum, day) => sum + day.amount, 0), [days]);
  const activeDays = useMemo(() => days.filter((day) => day.amount > 0).length, [days]);
  const peak = useMemo(
    () => days.reduce<ActivityDay | null>((highest, day) => {
      if (day.amount <= 0 || (highest && highest.amount >= day.amount)) return highest;
      return day;
    }, null),
    [days],
  );
  const maxAmount = peak?.amount || 1;
  const accent = tone === "income" ? colors.income : colors.expense;
  const tint = tone === "income" ? colors.incomeTint : colors.expenseTint;

  const cells = days.map((day) => (
    <DayCell
      accent={accent}
      amount={day.amount}
      day={day.date}
      intensity={day.amount > 0 ? 0.18 + Math.sqrt(day.amount / maxAmount) * 0.72 : 0}
      isWeek={period === "week"}
      key={day.iso}
      onPress={() => onSelectDay(day.iso)}
      selected={selectedDay === day.iso}
      tint={tint}
      tone={tone}
    />
  ));

  return (
    <View style={[styles.card, { borderColor: tint }]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>ATIVIDADE DE RECEITAS</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={[styles.totalPanel, { backgroundColor: tint }]}>
          <Text style={[styles.total, { color: accent }]}>{formatCurrency(total)}</Text>
          <Text style={styles.activeDays}>
            {activeDays === 1 ? "1 dia ativo" : `${activeDays} dias ativos`}
          </Text>
        </View>
      </View>

      {peak ? (
        <View style={[styles.peakBadge, { backgroundColor: tint }]}>
          <View style={[styles.peakDot, { backgroundColor: accent }]} />
          <Text numberOfLines={1} style={styles.peakText}>
            Maior dia: {formatCurrency(peak.amount)} · {formatDayLabel(peak.date)}
          </Text>
        </View>
      ) : null}

      {period === "week" ? (
        <View style={styles.weekGrid}>{cells}</View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.monthGrid}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {cells}
        </ScrollView>
      )}

      <View style={styles.legend}>
        <Text style={styles.legendText}>MENOR</Text>
        {[0.24, 0.42, 0.62, 0.9].map((opacity) => (
          <View
            key={opacity}
            style={[
              styles.legendSquare,
              { backgroundColor: intensityColor(tone, opacity) },
            ]}
          />
        ))}
        <Text style={styles.legendText}>MAIOR</Text>
        <Text style={styles.legendHint}>TOQUE EM UM DIA</Text>
      </View>
    </View>
  );
}

function DayCell({
  accent,
  amount,
  day,
  intensity,
  isWeek,
  onPress,
  selected,
  tint,
  tone,
}: {
  accent: string;
  amount: number;
  day: Date;
  intensity: number;
  isWeek: boolean;
  onPress: () => void;
  selected: boolean;
  tint: string;
  tone: "income" | "expense";
}) {
  return (
    <Pressable
      accessibilityLabel={`${formatDayLabel(day)}, ${formatCurrency(amount)}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.dayCell,
        isWeek ? styles.weekCell : styles.monthCell,
        selected && { backgroundColor: tint, borderColor: accent },
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.weekday}>
        {new Intl.DateTimeFormat("pt-BR", { weekday: "narrow" }).format(day).toUpperCase()}
      </Text>
      <Text style={[styles.dayNumber, amount > 0 && styles.dayNumberActive]}>{day.getDate()}</Text>
      <View
        style={[
          styles.intensity,
          {
            backgroundColor:
              amount > 0 ? intensityColor(tone, intensity) : colors.paperMuted,
          },
        ]}
      />
    </Pressable>
  );
}

function intensityColor(tone: "income" | "expense", opacity: number) {
  return tone === "income"
    ? `rgba(49, 95, 77, ${opacity})`
    : `rgba(145, 70, 62, ${opacity})`;
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paperRaised,
    borderRadius: 23,
    borderWidth: 1,
    marginTop: 18,
    padding: 17,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  headerCopy: { flex: 1, paddingRight: 10 },
  eyebrow: { color: colors.ink, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: colors.inkSoft, fontSize: 12, lineHeight: 17, marginTop: 5 },
  totalPanel: { alignItems: "flex-end", borderRadius: 13, minWidth: 116, padding: 10 },
  total: { fontSize: 17, fontWeight: "800" },
  activeDays: { color: colors.inkFaint, fontSize: 9, fontWeight: "700", marginTop: 4 },
  peakBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 12,
    flexDirection: "row",
    marginTop: 14,
    maxWidth: "100%",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  peakDot: { borderRadius: 4, height: 7, marginRight: 7, width: 7 },
  peakText: { color: colors.inkSoft, flexShrink: 1, fontSize: 10, fontWeight: "600" },
  weekGrid: { flexDirection: "row", gap: 3, marginTop: 17 },
  monthGrid: { gap: 4, paddingHorizontal: 1, paddingTop: 17 },
  dayCell: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 11,
    borderWidth: 2,
    padding: 4,
  },
  weekCell: { flex: 1, minWidth: 0 },
  monthCell: { width: 43 },
  weekday: { color: colors.inkFaint, fontSize: 8, fontWeight: "700" },
  dayNumber: { color: colors.inkFaint, fontSize: 10, marginTop: 2 },
  dayNumberActive: { color: colors.ink, fontWeight: "800" },
  intensity: {
    borderColor: colors.line,
    borderRadius: 7,
    borderWidth: StyleSheet.hairlineWidth,
    height: 32,
    marginTop: 6,
    width: "100%",
  },
  legend: {
    alignItems: "center",
    borderColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 13,
  },
  legendText: { color: colors.inkFaint, fontSize: 8, fontWeight: "700", letterSpacing: 0.5 },
  legendSquare: { borderRadius: 3, height: 10, marginLeft: 4, width: 10 },
  legendHint: {
    color: colors.inkFaint,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.4,
    marginLeft: "auto",
  },
  pressed: { opacity: 0.72 },
});
