import { useMemo, useRef, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { colors } from "@/theme/colors";
import type { InstallmentPlan } from "@/types/finance";

const CARD_GAP = 12;
const PAGE_HORIZONTAL_PADDING = 36;
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

  return (
    <View
      accessibilityLabel={`${month.label}, ${paymentLabel}, ${formatCurrency(month.total)}`}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View accessibilityElementsHidden style={styles.iconBox}>
            <View style={styles.iconLineWide} />
            <View style={styles.iconLine} />
            <View style={styles.iconLineWide} />
          </View>
          <View style={styles.titleCopy}>
            <Text style={styles.eyebrow}>INSTALLMENTS</Text>
            <Text numberOfLines={1} style={styles.monthLabel}>{month.label}</Text>
          </View>
        </View>
        <Text style={styles.paymentCount}>{paymentLabel}</Text>
      </View>

      <View style={styles.amountRow}>
        <Text adjustsFontSizeToFit numberOfLines={1} style={styles.amount}>
          {formatCurrency(month.total)}
        </Text>
        <Text style={styles.perMonth}>/ MONTH</Text>
      </View>

      <Text style={styles.description}>
        {month.count > 0
          ? `Installments scheduled for ${month.label}.`
          : `No installments due in ${month.label}.`}
      </Text>

      <View style={styles.statusRow}>
        <View style={[styles.statusDot, month.count === 0 && styles.statusDotEmpty]} />
        <Text style={styles.statusText}>
          {month.count > 0 ? "SCHEDULED PAYMENTS" : "NO PAYMENTS"}
        </Text>
      </View>
    </View>
  );
}

export function InstallmentCarousel({ date, plans }: InstallmentCarouselProps) {
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
        <Text style={styles.sectionEyebrow}>MONTHLY COMMITMENTS</Text>
        <Text style={styles.sectionTitle}>Installments by month</Text>
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
  container: { marginTop: 30 },
  sectionHeading: { marginBottom: 16, paddingHorizontal: 3 },
  sectionEyebrow: {
    color: colors.forest,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: -0.35,
    marginTop: 5,
  },
  card: {
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 230,
    padding: 20,
    shadowColor: colors.ink,
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  titleRow: { alignItems: "center", flex: 1, flexDirection: "row", gap: 10, minWidth: 0 },
  iconBox: {
    alignItems: "center",
    backgroundColor: colors.incomeTint,
    borderRadius: 10,
    gap: 3,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  iconLine: { backgroundColor: colors.forest, borderRadius: 1, height: 2, width: 13 },
  iconLineWide: { backgroundColor: colors.forest, borderRadius: 1, height: 2, width: 17 },
  titleCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.inkFaint, fontSize: 9, fontWeight: "800", letterSpacing: 1.3 },
  monthLabel: { color: colors.inkSoft, fontSize: 13, fontWeight: "700", marginTop: 4 },
  paymentCount: { color: colors.inkFaint, fontSize: 10, fontWeight: "700", marginTop: 3 },
  amountRow: { alignItems: "baseline", flexDirection: "row", gap: 7, marginTop: 28 },
  amount: { color: colors.forest, flexShrink: 1, fontSize: 31, fontWeight: "800", letterSpacing: -0.8 },
  perMonth: { color: colors.inkFaint, fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  description: { color: colors.inkSoft, fontSize: 13, lineHeight: 19, marginTop: 12 },
  statusRow: { alignItems: "center", flexDirection: "row", gap: 7, marginTop: 18 },
  statusDot: { backgroundColor: colors.forest, borderRadius: 4, height: 7, width: 7 },
  statusDotEmpty: { backgroundColor: colors.line },
  statusText: { color: colors.inkFaint, fontSize: 8, fontWeight: "800", letterSpacing: 0.8 },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 12,
  },
  dot: { backgroundColor: colors.line, borderRadius: 4, height: 7, width: 7 },
  activeDot: { backgroundColor: colors.forest, width: 22 },
});
