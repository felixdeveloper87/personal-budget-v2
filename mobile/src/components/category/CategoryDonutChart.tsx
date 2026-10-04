import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

import { nu } from "@/components/dashboard/nuTheme";

export interface CategoryDonutEntry {
  amount: number;
  category: string;
}

interface CategoryDonutChartProps {
  entries: CategoryDonutEntry[];
  /** Label shown in the donut centre when no slice is selected. */
  totalLabel: string;
}

interface Slice {
  amount: number;
  color: string;
  key: string;
  label: string;
  share: number;
}

const MAX_SLICES = 6;
const SLICE_COLORS = ["#820AD1", "#2E6FD8", "#1E9E8A", "#E0912F", "#D24D7A"] as const;
const OTHER_COLOR = "#B9B9C3";

const SIZE = 168;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function formatShare(share: number) {
  const percent = share * 100;
  return `${percent < 10 ? percent.toFixed(1) : Math.round(percent)}%`;
}

function buildSlices(entries: CategoryDonutEntry[]) {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    const category = entry.category?.trim() || "Sem categoria";
    totals.set(category, (totals.get(category) ?? 0) + Number(entry.amount || 0));
  }

  const sorted = [...totals.entries()]
    .filter(([, amount]) => amount > 0)
    .sort((first, second) => second[1] - first[1]);
  const total = sorted.reduce((sum, [, amount]) => sum + amount, 0);

  const visible = sorted.length > MAX_SLICES ? sorted.slice(0, MAX_SLICES - 1) : sorted;
  const slices: Slice[] = visible.map(([label, amount], index) => ({
    amount,
    color: SLICE_COLORS[index % SLICE_COLORS.length],
    key: label,
    label,
    share: total > 0 ? amount / total : 0,
  }));

  if (sorted.length > MAX_SLICES) {
    const rest = sorted.slice(MAX_SLICES - 1);
    const amount = rest.reduce((sum, [, value]) => sum + value, 0);
    slices.push({
      amount,
      color: OTHER_COLOR,
      key: "__other__",
      label: `Outras (${rest.length})`,
      share: total > 0 ? amount / total : 0,
    });
  }

  return { slices, total };
}

export function CategoryDonutChart({ entries, totalLabel }: CategoryDonutChartProps) {
  const { slices, total } = useMemo(() => buildSlices(entries), [entries]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selected = slices.find((slice) => slice.key === selectedKey) ?? null;

  if (slices.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>Sem valores por categoria neste período.</Text>
      </View>
    );
  }

  const toggle = (key: string) => setSelectedKey((current) => (current === key ? null : key));
  const singleSlice = slices.length === 1;
  let offset = 0;

  return (
    <View style={styles.card}>
      <View style={styles.chartWrap}>
        <Svg height={SIZE} width={SIZE}>
          <G origin={`${SIZE / 2}, ${SIZE / 2}`} rotation={-90}>
            <Circle cx={SIZE / 2} cy={SIZE / 2} fill="none" r={RADIUS} stroke={nu.track} strokeWidth={STROKE} />
            {slices.map((slice) => {
              const length = slice.share * CIRCUMFERENCE;
              const visibleLength = singleSlice ? length : Math.max(length - GAP, 0.5);
              const dashOffset = -offset;
              offset += length;
              const dimmed = selected != null && selected.key !== slice.key;
              return (
                <Circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  fill="none"
                  key={slice.key}
                  onPress={() => toggle(slice.key)}
                  opacity={dimmed ? 0.25 : 1}
                  r={RADIUS}
                  stroke={slice.color}
                  strokeDasharray={`${visibleLength} ${CIRCUMFERENCE}`}
                  strokeDashoffset={dashOffset}
                  strokeWidth={STROKE}
                />
              );
            })}
          </G>
        </Svg>
        <View pointerEvents="none" style={styles.centre}>
          <Text numberOfLines={1} style={styles.centreLabel}>
            {selected ? selected.label : totalLabel}
          </Text>
          <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.centreValue}>
            {formatCurrency(selected ? selected.amount : total)}
          </Text>
          {selected ? <Text style={styles.centreShare}>{formatShare(selected.share)}</Text> : null}
        </View>
      </View>

      <View style={styles.legend}>
        {slices.map((slice) => {
          const active = selected?.key === slice.key;
          const dimmed = selected != null && !active;
          return (
            <Pressable
              key={slice.key}
              onPress={() => toggle(slice.key)}
              style={({ pressed }) => [styles.legendRow, active && styles.legendRowActive, pressed && styles.pressed]}
            >
              <View style={[styles.swatch, { backgroundColor: slice.color }, dimmed && styles.dimmed]} />
              <Text numberOfLines={1} style={[styles.legendLabel, dimmed && styles.dimmed]}>{slice.label}</Text>
              <Text style={[styles.legendShare, dimmed && styles.dimmed]}>{formatShare(slice.share)}</Text>
              <Text numberOfLines={1} style={[styles.legendAmount, dimmed && styles.dimmed]}>{formatCurrency(slice.amount)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: nu.surface, borderRadius: 16, padding: 16 },
  chartWrap: { alignItems: "center", alignSelf: "center", height: SIZE, justifyContent: "center", width: SIZE },
  centre: { alignItems: "center", left: STROKE + 6, position: "absolute", right: STROKE + 6 },
  centreLabel: { color: nu.inkSoft, fontSize: 12 },
  centreValue: { color: nu.ink, fontSize: 18, fontVariant: ["tabular-nums"], fontWeight: "700", letterSpacing: -0.4, marginTop: 2 },
  centreShare: { color: nu.inkSoft, fontSize: 12, fontVariant: ["tabular-nums"], marginTop: 1 },
  legend: { marginTop: 14 },
  legendRow: { alignItems: "center", borderRadius: 10, flexDirection: "row", gap: 10, paddingHorizontal: 8, paddingVertical: 8 },
  legendRowActive: { backgroundColor: nu.white },
  swatch: { borderRadius: 5, height: 10, width: 10 },
  legendLabel: { color: nu.ink, flex: 1, fontSize: 14, fontWeight: "500" },
  legendShare: { color: nu.inkSoft, fontSize: 12, fontVariant: ["tabular-nums"], minWidth: 40, textAlign: "right" },
  legendAmount: { color: nu.ink, fontSize: 14, fontVariant: ["tabular-nums"], fontWeight: "600", minWidth: 84, textAlign: "right" },
  dimmed: { opacity: 0.4 },
  emptyText: { color: nu.inkSoft, fontSize: 13, paddingVertical: 12, textAlign: "center" },
  pressed: { opacity: 0.75 },
});
