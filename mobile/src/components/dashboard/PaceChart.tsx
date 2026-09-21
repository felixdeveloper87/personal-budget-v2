import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import type { Transaction } from "@/types/finance";
import { toLocalIsoDate } from "@/utils/period";

type SymbolName = ComponentProps<typeof SymbolView>["name"];
type PaceTone = "income" | "expense";

const trendIcons = {
  up: { ios: "arrow.up.right", android: "north_east", web: "north_east" },
  down: { ios: "arrow.down.right", android: "south_east", web: "south_east" },
} satisfies Record<string, SymbolName>;

const CHART_HEIGHT = 142;
const PLOT_TOP = 12;
const PLOT_BOTTOM = 22;
const PLOT_HORIZONTAL = 4;

interface PaceChartProps {
  category?: string;
  date: Date;
  description?: string;
  tone: PaceTone;
  transactions: Transaction[];
}

interface Point {
  value: number;
  visible: boolean;
}

function formatCurrency(value: number, compact = false) {
  return new Intl.NumberFormat("en-GB", {
    compactDisplay: "short",
    currency: "GBP",
    maximumFractionDigits: compact ? 1 : 2,
    notation: compact ? "compact" : "standard",
    style: "currency",
  }).format(value);
}

export function getPaceTransactionDate(transaction: Transaction) {
  const source = transaction.transactionDate ?? transaction.dateTime;
  return source.length === 10 ? source : toLocalIsoDate(new Date(source));
}

export function isExpensePaceTransaction(transaction: Transaction) {
  return !(
    transaction.isInstallment ||
    transaction.installmentPlanId != null ||
    transaction.isRecurring ||
    transaction.recurringTransactionId != null
  );
}

export function normalizePaceLabel(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function buildCumulative(
  transactions: Transaction[],
  type: Transaction["type"],
  year: number,
  month: number,
  category?: string,
  description?: string,
) {
  const days = new Date(year, month + 1, 0).getDate();
  const daily = Array.from({ length: days }, () => 0);
  const prefix = `${monthKey(year, month)}-`;

  for (const transaction of transactions) {
    const date = getPaceTransactionDate(transaction);
    if (transaction.type !== type || !date.startsWith(prefix)) continue;
    if (category && normalizePaceLabel(transaction.category) !== normalizePaceLabel(category)) {
      continue;
    }
    if (
      description &&
      normalizePaceLabel(transaction.description) !== normalizePaceLabel(description)
    ) {
      continue;
    }
    if (type === "EXPENSE" && !isExpensePaceTransaction(transaction)) {
      continue;
    }
    const day = Number(date.slice(8, 10));
    if (day >= 1 && day <= days) daily[day - 1] += Number(transaction.amount || 0);
  }

  let running = 0;
  return daily.map((amount) => {
    running += amount;
    return running;
  });
}

function LineSegment({
  color,
  from,
  opacity = 1,
  strokeWidth,
  to,
}: {
  color: string;
  from: { x: number; y: number };
  opacity?: number;
  strokeWidth: number;
  to: { x: number; y: number };
}) {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = Math.atan2(deltaY, deltaX);

  return (
    <View
      style={{
        backgroundColor: color,
        borderRadius: strokeWidth,
        height: strokeWidth,
        left: (from.x + to.x) / 2 - length / 2,
        opacity,
        position: "absolute",
        top: (from.y + to.y) / 2 - strokeWidth / 2,
        transform: [{ rotateZ: `${angle}rad` }],
        width: length,
      }}
    />
  );
}

function ChartLine({
  color,
  maxValue,
  opacity,
  plotHeight,
  points,
  width,
}: {
  color: string;
  maxValue: number;
  opacity?: number;
  plotHeight: number;
  points: Point[];
  width: number;
}) {
  const visiblePoints = points
    .map((point, index) => ({
      ...point,
      x:
        points.length === 1
          ? PLOT_HORIZONTAL
          : PLOT_HORIZONTAL +
            (index / (points.length - 1)) * (width - PLOT_HORIZONTAL * 2),
      y: PLOT_TOP + plotHeight - (point.value / maxValue) * plotHeight,
    }))
    .filter((point) => point.visible);

  return (
    <>
      {visiblePoints.slice(1).map((point, index) => (
        <LineSegment
          color={color}
          from={visiblePoints[index]}
          key={`${point.x}-${point.y}`}
          opacity={opacity}
          strokeWidth={opacity ? 1.5 : 2.5}
          to={point}
        />
      ))}
      {opacity === undefined && visiblePoints.length > 0 ? (
        <View
          style={[
            styles.currentDot,
            {
              backgroundColor: color,
              left: visiblePoints[visiblePoints.length - 1].x - 4,
              top: visiblePoints[visiblePoints.length - 1].y - 4,
            },
          ]}
        />
      ) : null}
    </>
  );
}

export function PaceChart({ category, date, description, tone, transactions }: PaceChartProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const isIncome = tone === "income";
  const accent = isIncome ? colors.income : colors.expense;
  const tint = isIncome ? colors.incomeTint : colors.expenseTint;
  const type = isIncome ? "INCOME" : "EXPENSE";

  const pace = useMemo(() => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const previousDate = new Date(year, month - 1, 1);
    const current = buildCumulative(transactions, type, year, month, category, description);
    const previous = buildCumulative(
      transactions,
      type,
      previousDate.getFullYear(),
      previousDate.getMonth(),
      category,
      description,
    );
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const elapsedDays = isCurrentMonth ? Math.min(today.getDate(), current.length) : current.length;
    const totalDays = Math.max(current.length, previous.length);
    const amountSoFar = current[elapsedDays - 1] ?? 0;
    const previousAtSameDay = previous[Math.min(elapsedDays, previous.length) - 1] ?? 0;
    const previousTotal = previous[previous.length - 1] ?? 0;
    const projected = elapsedDays > 0 ? (amountSoFar / elapsedDays) * current.length : 0;

    return {
      amountSoFar,
      current: Array.from({ length: totalDays }, (_, index): Point => ({
        value: current[Math.min(index, current.length - 1)] ?? 0,
        visible: index < elapsedDays,
      })),
      delta: amountSoFar - previousAtSameDay,
      elapsedDays,
      previous: Array.from({ length: totalDays }, (_, index): Point => ({
        value: previous[Math.min(index, previous.length - 1)] ?? 0,
        visible: index < previous.length,
      })),
      previousTotal,
      projected,
    };
  }, [category, date, description, transactions, type]);

  const maxValue = Math.max(
    1,
    pace.projected,
    ...pace.current.filter((point) => point.visible).map((point) => point.value),
    ...pace.previous.map((point) => point.value),
  );
  const plotHeight = CHART_HEIGHT - PLOT_TOP - PLOT_BOTTOM;
  const higherThanPrevious = pace.delta > 0;
  const deltaColor = isIncome
    ? higherThanPrevious ? colors.income : colors.expense
    : higherThanPrevious ? colors.expense : colors.income;
  const hasData = pace.amountSoFar > 0 || pace.previousTotal > 0;
  const paceTitle = description ?? category ?? (isIncome ? "INCOME PACE" : "EXPENSE PACE");

  return (
    <View style={[styles.card, { borderColor: tint }]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.eyebrow}>
            {paceTitle.toLocaleUpperCase()}
          </Text>
          <View style={styles.totalRow}>
            <Text style={styles.total}>{formatCurrency(pace.amountSoFar)}</Text>
            <Text style={styles.dayLabel}>BY DAY {pace.elapsedDays}</Text>
          </View>
        </View>

        {hasData ? (
          <View style={[styles.deltaBadge, { backgroundColor: tint }]}>
            <SymbolView
              name={higherThanPrevious ? trendIcons.up : trendIcons.down}
              size={12}
              tintColor={deltaColor}
              weight="bold"
            />
            <Text style={[styles.deltaText, { color: deltaColor }]}>
              {formatCurrency(Math.abs(pace.delta), true)}
            </Text>
          </View>
        ) : null}
      </View>

      <View
        accessibilityLabel={`${paceTitle} pace: ${formatCurrency(pace.amountSoFar)} by day ${pace.elapsedDays}. Last month: ${formatCurrency(pace.previousTotal)}.`}
        accessibilityRole="image"
        onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
        style={styles.chart}
      >
        {[0, 0.5, 1].map((position) => (
          <View
            key={position}
            style={[styles.gridLine, { top: PLOT_TOP + plotHeight * position }]}
          />
        ))}
        <Text style={styles.maxLabel}>{formatCurrency(maxValue, true)}</Text>

        {chartWidth > 0 && hasData ? (
          <>
            <ChartLine
              color={colors.inkFaint}
              maxValue={maxValue}
              opacity={0.55}
              plotHeight={plotHeight}
              points={pace.previous}
              width={chartWidth}
            />
            <ChartLine
              color={accent}
              maxValue={maxValue}
              plotHeight={plotHeight}
              points={pace.current}
              width={chartWidth}
            />
          </>
        ) : (
          <View style={styles.emptyPlot}>
            <Text style={styles.emptyText}>No activity yet</Text>
          </View>
        )}

        <View style={styles.axisLabels}>
          {[1, 8, 15, 22, pace.current.length].map((day) => (
            <Text key={day} style={styles.axisLabel}>{day}</Text>
          ))}
        </View>
      </View>

      <View style={styles.legend}>
        <View style={[styles.legendLine, { backgroundColor: accent }]} />
        <Text style={styles.legendText}>This month</Text>
        <View style={[styles.legendLine, styles.previousLegendLine]} />
        <Text style={styles.legendText}>Last month</Text>
      </View>

      <Text style={styles.caption}>
        {hasData
          ? `At this pace you'll ${isIncome ? "earn" : "spend"} about ${formatCurrency(pace.projected)} this month. Last month closed at ${formatCurrency(pace.previousTotal)}.`
          : `Add ${isIncome ? "income" : "expenses"} to start tracking your monthly pace.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paperRaised,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 16,
    padding: 17,
    shadowColor: colors.ink,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  header: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  headerCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.inkFaint, fontSize: 9, fontWeight: "800", letterSpacing: 1.5 },
  totalRow: { alignItems: "baseline", flexDirection: "row", gap: 9, marginTop: 7 },
  total: { color: colors.ink, fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  dayLabel: { color: colors.inkFaint, fontSize: 9, fontWeight: "700", letterSpacing: 0.7 },
  deltaBadge: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 3,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  deltaText: { fontSize: 10, fontWeight: "800" },
  chart: { height: CHART_HEIGHT, marginTop: 13, overflow: "hidden", position: "relative" },
  gridLine: {
    backgroundColor: colors.line,
    height: StyleSheet.hairlineWidth,
    left: 0,
    opacity: 0.75,
    position: "absolute",
    right: 0,
  },
  maxLabel: {
    backgroundColor: colors.paperRaised,
    color: colors.inkFaint,
    fontSize: 8,
    left: 0,
    paddingRight: 4,
    position: "absolute",
    top: 0,
    zIndex: 2,
  },
  currentDot: { borderRadius: 4, height: 8, position: "absolute", width: 8 },
  emptyPlot: { alignItems: "center", flex: 1, justifyContent: "center" },
  emptyText: { color: colors.inkFaint, fontSize: 11 },
  axisLabels: {
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    left: 0,
    position: "absolute",
    right: 0,
  },
  axisLabel: { color: colors.inkFaint, fontSize: 8, fontWeight: "600" },
  legend: { alignItems: "center", flexDirection: "row", gap: 6, marginTop: 1 },
  legendLine: { borderRadius: 1, height: 2, width: 15 },
  previousLegendLine: { backgroundColor: colors.inkFaint, opacity: 0.55 },
  legendText: { color: colors.inkFaint, fontSize: 9, marginRight: 8 },
  caption: { color: colors.inkSoft, fontSize: 11, lineHeight: 17, marginTop: 13 },
});
