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
  const hasPayments = month.count > 0;

  return (
    <View
      accessibilityLabel={`${month.label}, ${paymentLabel}, ${formatCurrency(month.total)}`}
      style={[styles.card, hasPayments ? styles.scheduledCard : styles.emptyCard]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View
            accessibilityElementsHidden
            style={[styles.iconBox, hasPayments ? styles.scheduledIconBox : styles.emptyIconBox]}
          >
            <View style={[styles.iconLineWide, hasPayments ? styles.scheduledIconLine : styles.emptyIconLine]} />
            <View style={[styles.iconLine, hasPayments ? styles.scheduledIconLine : styles.emptyIconLine]} />
            <View style={[styles.iconLineWide, hasPayments ? styles.scheduledIconLine : styles.emptyIconLine]} />
          </View>
          <View style={styles.titleCopy}>
            <Text style={styles.eyebrow}>INSTALLMENTS</Text>
            <Text numberOfLines={1} style={styles.monthLabel}>{month.label}</Text>
          </View>
        </View>
        <Text style={[styles.paymentCount, hasPayments ? styles.scheduledCount : styles.emptyCount]}>
          {paymentLabel}
        </Text>
      </View>

      <View style={styles.amountRow}>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[styles.amount, hasPayments ? styles.scheduledAmount : styles.emptyAmount]}
        >
          {formatCurrency(month.total)}
        </Text>
        <Text style={styles.perMonth}>/ MONTH</Text>
      </View>

      <Text style={styles.description}>
        {month.count > 0
          ? `Installments scheduled for ${month.label}.`
          : `No installments due in ${month.label}.`}
      </Text>

      <View style={[styles.statusRow, hasPayments ? styles.scheduledStatus : styles.emptyStatus]}>
        <View style={[styles.statusDot, !hasPayments && styles.statusDotEmpty]} />
        <Text style={[styles.statusText, !hasPayments && styles.statusTextEmpty]}>
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
    borderTopWidth: 4,
    elevation: 2,
    minHeight: 230,
    padding: 20,
    shadowColor: colors.ink,
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  scheduledCard: {
    backgroundColor: "#FFF9ED",
    borderColor: "#E8D4A7",
    borderTopColor: "#C89432",
  },
  emptyCard: {
    backgroundColor: "#F7FAF7",
    borderColor: "#D6E5DB",
    borderTopColor: "#4A826B",
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
    borderRadius: 12,
    gap: 3,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  scheduledIconBox: { backgroundColor: "#EEDDAF" },
  emptyIconBox: { backgroundColor: "#DCECE3" },
  iconLine: { borderRadius: 1, height: 3, width: 15 },
  iconLineWide: { borderRadius: 1, height: 3, width: 20 },
  scheduledIconLine: { backgroundColor: "#966F20" },
  emptyIconLine: { backgroundColor: "#3D765F" },
  titleCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.gold, fontSize: 9, fontWeight: "800", letterSpacing: 1.3 },
  monthLabel: { color: colors.ink, fontSize: 14, fontWeight: "700", marginTop: 4 },
  paymentCount: {
    borderRadius: 11,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  scheduledCount: { backgroundColor: "#F1DEB2", color: "#855F18" },
  emptyCount: { backgroundColor: "#DCECE3", color: "#3D765F" },
  amountRow: { alignItems: "baseline", flexDirection: "row", gap: 7, marginTop: 28 },
  amount: { flexShrink: 1, fontSize: 31, fontWeight: "800", letterSpacing: -0.8 },
  scheduledAmount: { color: "#A16F19" },
  emptyAmount: { color: "#3D765F" },
  perMonth: { color: colors.inkFaint, fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  description: { color: colors.inkSoft, fontSize: 13, lineHeight: 19, marginTop: 12 },
  statusRow: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 11,
    flexDirection: "row",
    gap: 7,
    marginTop: 18,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  scheduledStatus: { backgroundColor: "#F4E5C2" },
  emptyStatus: { backgroundColor: "#E2EFE7" },
  statusDot: { backgroundColor: "#C89432", borderRadius: 4, height: 7, width: 7 },
  statusDotEmpty: { backgroundColor: "#4A826B" },
  statusText: { color: "#855F18", fontSize: 8, fontWeight: "800", letterSpacing: 0.8 },
  statusTextEmpty: { color: "#3D765F" },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 12,
  },
  dot: { backgroundColor: "#D5D0C3", borderRadius: 4, height: 7, width: 7 },
  activeDot: { backgroundColor: "#C89432", width: 22 },
});
