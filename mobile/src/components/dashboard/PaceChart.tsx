import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Transaction } from "@/types/finance";
import { toLocalIsoDate } from "@/utils/period";
import { isExpensePaceTransaction } from "@/utils/variableSpending";

import { nu } from "./nuTheme";

export { isExpensePaceTransaction } from "@/utils/variableSpending";

type SymbolName = ComponentProps<typeof SymbolView>["name"];
type PaceTone = "income" | "expense";

const trendIcons = {
  up: { ios: "arrow.up.right", android: "north_east", web: "north_east" },
  down: { ios: "arrow.down.right", android: "south_east", web: "south_east" },
} satisfies Record<string, SymbolName>;

const hideIcon = {
  ios: "xmark",
  android: "close",
  web: "close",
} satisfies SymbolName;

const CHART_HEIGHT = 142;
const PLOT_TOP = 12;
const PLOT_BOTTOM = 22;
const PLOT_HORIZONTAL = 4;

interface PaceChartProps {
  category?: string;
  date: Date;
  description?: string;
  interactive?: boolean;
  onHide?: () => void;
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
          strokeWidth={opacity ? 1.75 : 3}
          to={point}
        />
      ))}
      {opacity === undefined && visiblePoints.length > 0 ? (
        <View
          style={[
            styles.currentDot,
            {
              backgroundColor: color,
              left: visiblePoints[visiblePoints.length - 1].x - 5,
              top: visiblePoints[visiblePoints.length - 1].y - 5,
            },
          ]}
        />
      ) : null}
    </>
  );
}

export function PaceChart({
  category,
  date,
  description,
  interactive = false,
  onHide,
  tone,
  transactions,
}: PaceChartProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const isIncome = tone === "income";
  const accent = nu.brand;
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
  const chartSurface = nu.white;
  const favorable = isIncome ? higherThanPrevious : !higherThanPrevious;
  const deltaColor = favorable ? nu.positive : nu.negative;
  const deltaTint = favorable ? nu.positiveTint : nu.negativeTint;
  const hasData = pace.amountSoFar > 0 || pace.previousTotal > 0;
  const paceTitle = description ?? category ?? (isIncome ? "Income pace" : "Expense pace");
  const selectedIndex = selectedDay === null ? null : selectedDay - 1;
  const selectedCurrent = selectedIndex === null || !pace.current[selectedIndex]?.visible
    ? null
    : pace.current[selectedIndex].value;
  const selectedPrevious = selectedIndex === null || !pace.previous[selectedIndex]?.visible
    ? null
    : pace.previous[selectedIndex].value;
  const selectedX = selectedIndex === null || pace.current.length <= 1
    ? PLOT_HORIZONTAL
    : PLOT_HORIZONTAL +
      (selectedIndex / (pace.current.length - 1)) * (chartWidth - PLOT_HORIZONTAL * 2);
  const selectedCurrentY = selectedCurrent === null
    ? null
    : PLOT_TOP + plotHeight - (selectedCurrent / maxValue) * plotHeight;
  const selectedPreviousY = selectedPrevious === null
    ? null
    : PLOT_TOP + plotHeight - (selectedPrevious / maxValue) * plotHeight;

  const handleChartPress = (locationX: number) => {
    if (!interactive || chartWidth <= PLOT_HORIZONTAL * 2 || pace.elapsedDays <= 0) return;
    const plotWidth = chartWidth - PLOT_HORIZONTAL * 2;
    const relativeX = Math.min(Math.max(locationX - PLOT_HORIZONTAL, 0), plotWidth);
    const rawIndex = Math.round((relativeX / plotWidth) * (pace.current.length - 1));
    const nextDay = Math.min(rawIndex + 1, pace.elapsedDays);
    setSelectedDay((current) => current === nextDay ? null : nextDay);
  };

  const currentMonthLabel = new Intl.DateTimeFormat("en-GB", { month: "short" })
    .format(date)
    .toLocaleUpperCase();
  const previousMonthLabel = new Intl.DateTimeFormat("en-GB", { month: "short" })
    .format(new Date(date.getFullYear(), date.getMonth() - 1, 1))
    .toLocaleUpperCase();
  const selectedDateLabel = selectedDay === null
    ? ""
    : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(
      new Date(date.getFullYear(), date.getMonth(), selectedDay),
    );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.eyebrow}>
            {paceTitle}
          </Text>
          <View style={styles.totalRow}>
            <Text style={styles.total}>{formatCurrency(pace.amountSoFar)}</Text>
            <Text style={styles.dayLabel}>by day {pace.elapsedDays}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {hasData ? (
            <View style={[styles.deltaBadge, { backgroundColor: deltaTint }]}>
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
          {onHide ? (
            <Pressable
              accessibilityLabel={`Hide ${paceTitle} chart`}
              accessibilityRole="button"
              hitSlop={8}
              onPress={onHide}
              style={({ pressed }) => [styles.hideButton, pressed && styles.hideButtonPressed]}
            >
              <SymbolView name={hideIcon} size={12} tintColor={nu.inkSoft} weight="bold" />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View
        accessibilityLabel={`${paceTitle} pace: ${formatCurrency(pace.amountSoFar)} by day ${pace.elapsedDays}. Last month: ${formatCurrency(pace.previousTotal)}.`}
        accessibilityRole="image"
        onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
        style={[styles.chart, { backgroundColor: chartSurface }]}
      >
        {[0, 0.5, 1].map((position) => (
          <View
            key={position}
            style={[styles.gridLine, { top: PLOT_TOP + plotHeight * position }]}
          />
        ))}
        <Text style={[styles.maxLabel, { backgroundColor: chartSurface }]}>
          {formatCurrency(maxValue, true)}
        </Text>

        {chartWidth > 0 && hasData ? (
          <>
            <ChartLine
              color={nu.inkFaint}
              maxValue={maxValue}
              opacity={0.72}
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

        {interactive && hasData ? (
          <Pressable
            accessibilityHint="Shows the cumulative value for this month and last month"
            accessibilityLabel={`Inspect ${paceTitle} by day`}
            accessibilityRole="button"
            onPress={(event) => handleChartPress(event.nativeEvent.locationX)}
            style={styles.interactionLayer}
          />
        ) : null}

        {interactive && selectedIndex !== null && chartWidth > 0 ? (
          <View pointerEvents="none" style={styles.selectionOverlay}>
            <View style={[styles.selectionGuide, { backgroundColor: accent, left: selectedX }]} />
            {selectedPreviousY !== null ? (
              <View
                style={[
                  styles.selectionDot,
                  styles.previousSelectionDot,
                  { left: selectedX - 4, top: selectedPreviousY - 4 },
                ]}
              />
            ) : null}
            {selectedCurrentY !== null ? (
              <View
                style={[
                  styles.selectionDot,
                  { backgroundColor: accent, left: selectedX - 5, top: selectedCurrentY - 5 },
                ]}
              />
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.legend}>
        <View style={[styles.legendLine, { backgroundColor: accent }]} />
        <Text style={styles.legendText}>This month</Text>
        <View style={[styles.legendLine, styles.previousLegendLine]} />
        <Text style={styles.legendText}>Last month</Text>
      </View>

      {interactive && selectedDay !== null ? (
        <View
          accessibilityLiveRegion="polite"
          style={styles.selectionCard}
        >
          <Text style={styles.selectionTitle}>Cumulative to {selectedDateLabel}</Text>
          <View style={styles.selectionValues}>
            <View style={styles.selectionValueColumn}>
              <Text style={styles.selectionLabel}>{currentMonthLabel}</Text>
              <Text numberOfLines={1} style={[styles.selectionValue, { color: accent }]}>
                {selectedCurrent === null ? "—" : formatCurrency(selectedCurrent)}
              </Text>
            </View>
            <View style={styles.selectionDivider} />
            <View style={styles.selectionValueColumn}>
              <Text style={styles.selectionLabel}>{previousMonthLabel}</Text>
              <Text numberOfLines={1} style={styles.previousSelectionValue}>
                {selectedPrevious === null ? "—" : formatCurrency(selectedPrevious)}
              </Text>
            </View>
          </View>
        </View>
      ) : interactive && hasData ? (
        <Text style={styles.interactionHint}>Tap a day on the chart to compare cumulative values.</Text>
      ) : null}

      <Text style={styles.caption}>
        {hasData
          ? `At this pace you'll ${isIncome ? "earn" : "spend"} about ${formatCurrency(pace.projected)} this month. Last month closed at ${formatCurrency(pace.previousTotal)}.`
          : `Add ${isIncome ? "income" : "expenses"} to start tracking your monthly pace.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: nu.surface, borderRadius: 16, marginTop: 14, padding: 16 },
  header: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  headerCopy: { flex: 1, minWidth: 0 },
  headerActions: { alignItems: "center", flexDirection: "row", gap: 6, marginLeft: 8 },
  eyebrow: { color: nu.inkSoft, fontSize: 13, fontWeight: "500" },
  totalRow: { alignItems: "baseline", flexDirection: "row", gap: 8, marginTop: 4 },
  total: { color: nu.ink, fontSize: 22, fontWeight: "700", letterSpacing: -0.5, fontVariant: ["tabular-nums"] },
  dayLabel: { color: nu.inkSoft, fontSize: 12 },
  deltaBadge: { alignItems: "center", borderRadius: 999, flexDirection: "row", gap: 3, paddingHorizontal: 9, paddingVertical: 5 },
  deltaText: { fontSize: 11, fontWeight: "700" },
  hideButton: { alignItems: "center", backgroundColor: nu.white, borderRadius: 13, height: 26, justifyContent: "center", width: 26 },
  hideButtonPressed: { backgroundColor: nu.surfacePressed },
  chart: { borderRadius: 12, height: CHART_HEIGHT, marginTop: 14, overflow: "hidden", position: "relative" },
  interactionLayer: { bottom: PLOT_BOTTOM, left: 0, position: "absolute", right: 0, top: PLOT_TOP, zIndex: 3 },
  gridLine: { backgroundColor: nu.hairline, height: 1, left: 0, position: "absolute", right: 0 },
  maxLabel: { color: nu.inkFaint, fontSize: 9, left: 4, paddingRight: 4, position: "absolute", top: 0, zIndex: 2 },
  currentDot: {
    borderColor: nu.white,
    borderRadius: 5,
    borderWidth: 2,
    height: 10,
    position: "absolute",
    width: 10,
  },
  selectionOverlay: { bottom: PLOT_BOTTOM, left: 0, position: "absolute", right: 0, top: PLOT_TOP, zIndex: 4 },
  selectionGuide: { bottom: 0, opacity: 0.35, position: "absolute", top: 0, width: 1 },
  selectionDot: { borderColor: nu.white, borderRadius: 5, borderWidth: 2, height: 10, position: "absolute", width: 10 },
  previousSelectionDot: { backgroundColor: nu.inkFaint, height: 8, width: 8 },
  emptyPlot: { alignItems: "center", flex: 1, justifyContent: "center" },
  emptyText: { color: nu.inkSoft, fontSize: 12 },
  axisLabels: { bottom: 2, flexDirection: "row", justifyContent: "space-between", left: 4, position: "absolute", right: 4 },
  axisLabel: { color: nu.inkFaint, fontSize: 9 },
  legend: { alignItems: "center", flexDirection: "row", gap: 6, marginTop: 10 },
  legendLine: { borderRadius: 1, height: 3, width: 14 },
  previousLegendLine: { backgroundColor: nu.inkFaint },
  legendText: { color: nu.inkSoft, fontSize: 11, marginRight: 10 },
  interactionHint: { color: nu.inkFaint, fontSize: 11, marginTop: 10 },
  selectionCard: { backgroundColor: nu.white, borderRadius: 12, marginTop: 12, paddingHorizontal: 14, paddingVertical: 12 },
  selectionTitle: { color: nu.inkSoft, fontSize: 12 },
  selectionValues: { flexDirection: "row", marginTop: 8 },
  selectionValueColumn: { flex: 1, minWidth: 0 },
  selectionDivider: { backgroundColor: nu.hairline, marginHorizontal: 12, width: 1 },
  selectionLabel: { color: nu.inkFaint, fontSize: 11 },
  selectionValue: { fontSize: 16, fontWeight: "700", marginTop: 2 },
  previousSelectionValue: { color: nu.inkSoft, fontSize: 16, fontWeight: "700", marginTop: 2 },
  caption: { color: nu.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 12 },
});

