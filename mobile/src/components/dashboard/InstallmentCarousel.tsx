import { useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import type { InstallmentPlan } from "@/types/finance";

import { nu, nuSection, SECTION_GUTTER } from "./nuTheme";

const CARD_GAP = 12;
const PAGE_HORIZONTAL_PADDING = SECTION_GUTTER;
const MONTH_OFFSETS = [-3, -2, -1, 0, 1, 2, 3] as const;
const CURRENT_MONTH_INDEX = 3;

interface InstallmentCarouselProps {
  date: Date;
  plans: InstallmentPlan[];
}

interface InstallmentMonth {
  count: number;
  key: string;
  label: string;
  total: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    currency: "GBP",
    style: "currency",
  }).format(value);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonths(date: Date, plans: InstallmentPlan[]): InstallmentMonth[] {
  const months = MONTH_OFFSETS.map((offset) => {
    const monthDate = new Date(date.getFullYear(), date.getMonth() + offset, 1);
    return {
      count: 0,
      key: monthKey(monthDate),
      label: new Intl.DateTimeFormat("en-GB", {
        month: "long",
        year: "numeric",
      }).format(monthDate),
      total: 0,
    };
  });
  const monthByKey = new Map(months.map((month) => [month.key, month]));

  for (const plan of plans) {
    for (const installment of plan.transactions) {
      const month = monthByKey.get(installment.date.slice(0, 7));
      if (!month) continue;
      month.count += 1;
      month.total += Number(installment.amount || 0);
    }
  }

  return months;
}

function InstallmentMonthCard({ month }: { month: InstallmentMonth }) {
  const paymentLabel = month.count === 1 ? "1 payment" : `${month.count} payments`;
  const hasPayments = month.count > 0;

  return (
    <View
      accessibilityLabel={`${month.label}, ${paymentLabel}, ${formatCurrency(month.total)}`}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View accessibilityElementsHidden style={styles.iconBox}>
            <View style={[styles.iconLineWide, !hasPayments && styles.emptyIconLine]} />
            <View style={[styles.iconLine, !hasPayments && styles.emptyIconLine]} />
            <View style={[styles.iconLineWide, !hasPayments && styles.emptyIconLine]} />
          </View>
          <Text numberOfLines={1} style={styles.monthLabel}>{month.label}</Text>
        </View>
        <View style={[styles.paymentCount, !hasPayments && styles.emptyCount]}>
          <Text style={[styles.paymentCountText, !hasPayments && styles.emptyCountText]}>{paymentLabel}</Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[styles.amount, !hasPayments && styles.emptyAmount]}
        >
          {formatCurrency(month.total)}
        </Text>
        <Text style={styles.perMonth}>/ month</Text>
      </View>

      <Text style={styles.description}>
        {month.count > 0
          ? `Installments scheduled for ${month.label}.`
          : `No installments due in ${month.label}.`}
      </Text>
    </View>
  );
}

export function InstallmentCarousel({ date, plans }: InstallmentCarouselProps) {
  const router = useRouter();
  const listRef = useRef<FlatList<InstallmentMonth>>(null);
  const { width: windowWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(CURRENT_MONTH_INDEX);
  const cardWidth = Math.max(280, windowWidth - PAGE_HORIZONTAL_PADDING);
  const months = useMemo(() => buildMonths(date, plans), [date, plans]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + CARD_GAP));
    setActiveIndex(Math.min(Math.max(nextIndex, 0), months.length - 1));
  };

  const goToMonth = (index: number) => {
    listRef.current?.scrollToIndex({ animated: true, index });
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeading}>
        <View style={styles.headingRow}>
          <Text style={styles.sectionTitle}>Installments</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Ver todos os parcelamentos" onPress={() => router.navigate({ pathname: "/commitments", params: { tab: "installments" } })} hitSlop={8} style={styles.viewAll}>
            <Text style={styles.viewAllText}>Ver todos</Text>
          </Pressable>
        </View>
        <Text style={styles.sectionEyebrow}>Your monthly commitments</Text>
      </View>

      <FlatList
        ref={listRef}
        accessibilityLabel="Installments by month"
        data={months}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          index,
          length: cardWidth + CARD_GAP,
          offset: (cardWidth + CARD_GAP) * index,
        })}
        horizontal
        initialNumToRender={MONTH_OFFSETS.length}
        initialScrollIndex={CURRENT_MONTH_INDEX}
        keyExtractor={(month) => month.key}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <View style={{ marginRight: CARD_GAP, width: cardWidth }}>
            <InstallmentMonthCard month={item} />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={cardWidth + CARD_GAP}
      />

      <View style={styles.dots}>
        {months.map((month, index) => (
          <Pressable
            accessibilityLabel={`Show ${month.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: index === activeIndex }}
            hitSlop={8}
            key={month.key}
            onPress={() => goToMonth(index)}
            style={[styles.dot, index === activeIndex && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: nuSection.container,
  sectionHeading: { marginBottom: 14 },
  headingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  viewAll: { minHeight: 44, justifyContent: "center" },
  viewAllText: { color: nu.brand, fontSize: 13, fontWeight: "600" },
  sectionTitle: nuSection.title,
  sectionEyebrow: nuSection.subtitle,
  card: { backgroundColor: nu.surface, borderRadius: 16, minHeight: 170, padding: 16 },
  headerRow: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "space-between" },
  titleRow: { alignItems: "center", flex: 1, flexDirection: "row", gap: 10, minWidth: 0 },
  iconBox: { alignItems: "center", backgroundColor: nu.white, borderRadius: 20, gap: 3, height: 40, justifyContent: "center", width: 40 },
  iconLine: { backgroundColor: nu.brand, borderRadius: 1, height: 2.5, width: 12 },
  iconLineWide: { backgroundColor: nu.brand, borderRadius: 1, height: 2.5, width: 17 },
  emptyIconLine: { backgroundColor: nu.inkFaint },
  monthLabel: { color: nu.ink, flex: 1, fontSize: 15, fontWeight: "600" },
  paymentCount: { backgroundColor: nu.brandTint, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  paymentCountText: { color: nu.brand, fontSize: 12, fontWeight: "600" },
  emptyCount: { backgroundColor: nu.track },
  emptyCountText: { color: nu.inkSoft },
  amountRow: { alignItems: "baseline", flexDirection: "row", gap: 6, marginTop: 22 },
  amount: { color: nu.ink, flexShrink: 1, fontSize: 28, fontWeight: "700", letterSpacing: -0.7, fontVariant: ["tabular-nums"] },
  emptyAmount: { color: nu.inkFaint },
  perMonth: { color: nu.inkSoft, fontSize: 13 },
  description: { color: nu.inkSoft, fontSize: 13, lineHeight: 19, marginTop: 6 },
  dots: nuSection.dots,
  dot: nuSection.dot,
  activeDot: nuSection.activeDot,
});
