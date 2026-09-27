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

import { MerchantLogo } from "@/components/merchant/MerchantLogo";
import { colors } from "@/theme/colors";
import type { Transaction } from "@/types/finance";

import { getPaceTransactionDate, isExpensePaceTransaction } from "./PaceChart";

const CARD_GAP = 12;
const PAGE_HORIZONTAL_PADDING = 36;
const MONTH_COUNT = 4;
const MAX_MERCHANTS = 5;
const MERCHANT_TONES = [
  { accent: "#2D8062", tint: "#D9ECE2" },
  { accent: "#BC5D52", tint: "#F1DAD5" },
  { accent: "#98752D", tint: "#EEE4C9" },
  { accent: "#397780", tint: "#D9E9EA" },
  { accent: "#705E78", tint: "#E7DFE9" },
] as const;

interface TopMerchantsCarouselProps {
  date: Date;
  transactions: Transaction[];
}

interface MerchantStat {
  category: string;
  count: number;
  key: string;
  name: string;
  total: number;
}

interface MerchantMonth {
  key: string;
  label: string;
  merchantTotal: number;
  merchants: MerchantStat[];
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

function normaliseMerchant(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function merchantDisplayName(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (trimmed !== trimmed.toLocaleLowerCase()) return trimmed;
  return trimmed.replace(/(^|\s)\S/g, (character) => character.toLocaleUpperCase());
}

function buildMonths(date: Date, transactions: Transaction[]): MerchantMonth[] {
  const months = Array.from({ length: MONTH_COUNT }, (_, index) => {
    const monthDate = new Date(date.getFullYear(), date.getMonth() - index, 1);
    return {
      date: monthDate,
      key: monthKey(monthDate),
      merchants: new Map<string, MerchantStat>(),
    };
  });
  const monthByKey = new Map(months.map((month) => [month.key, month]));

  for (const transaction of transactions) {
    if (
      transaction.type !== "EXPENSE" ||
      !isExpensePaceTransaction(transaction) ||
      !transaction.description?.trim()
    ) {
      continue;
    }

    const month = monthByKey.get(getPaceTransactionDate(transaction).slice(0, 7));
    if (!month) continue;

    const rawName = transaction.description.trim();
    const key = normaliseMerchant(rawName);
    const amount = Number(transaction.amount || 0);
    const merchant = month.merchants.get(key);

    if (merchant) {
      merchant.count += 1;
      merchant.total += amount;
    } else {
      month.merchants.set(key, {
        category: transaction.category,
        count: 1,
        key,
        name: merchantDisplayName(rawName),
        total: amount,
      });
    }
  }

  return months.map((month) => {
    const merchants = [...month.merchants.values()].sort(
      (first, second) => second.total - first.total || first.name.localeCompare(second.name),
    );
    return {
      key: month.key,
      label: new Intl.DateTimeFormat("en-GB", {
        month: "long",
        year: "numeric",
      }).format(month.date),
      merchantTotal: merchants.reduce((total, merchant) => total + merchant.total, 0),
      merchants: merchants.slice(0, MAX_MERCHANTS),
    };
  });
}

function MerchantRow({ merchant, rank, total }: {
  merchant: MerchantStat;
  rank: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((merchant.total / total) * 100) : 0;
  const progressWidth = `${Math.max(percentage, 3)}%` as `${number}%`;
  const tone = MERCHANT_TONES[(rank - 1) % MERCHANT_TONES.length];

  return (
    <View
      accessibilityLabel={`${rank}. ${merchant.name}, ${merchant.count} transactions, ${formatCurrency(merchant.total)}, ${percentage}% of tracked spend`}
      style={styles.merchantRow}
    >
      <View style={styles.logoWrap}>
        <MerchantLogo category={merchant.category} name={merchant.name} size={57} />
        <View style={[styles.rankBadge, { backgroundColor: tone.tint, borderColor: tone.accent }]}>
          <Text style={[styles.rankText, { color: tone.accent }]}>{rank}</Text>
        </View>
      </View>

      <View style={styles.merchantDetails}>
        <View style={styles.merchantHeading}>
          <View style={styles.merchantNameRow}>
            <Text numberOfLines={1} style={styles.merchantName}>{merchant.name}</Text>
            <Text style={styles.merchantCount}>x{merchant.count}</Text>
          </View>
          <View style={styles.merchantValueWrap}>
            <Text numberOfLines={1} style={[styles.merchantValue, { color: tone.accent }]}>
              {formatCurrency(merchant.total)}
            </Text>
            <Text style={styles.merchantShare}>{percentage}% OF TOTAL</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { backgroundColor: tone.accent, width: progressWidth }]} />
        </View>
      </View>
    </View>
  );
}

function MerchantMonthCard({ month }: { month: MerchantMonth }) {
  return (
    <View
      accessibilityLabel={`Top 5 merchants for ${month.label}`}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.eyebrow}>TOP 5 MERCHANTS</Text>
          <Text style={styles.monthLabel}>{month.label}</Text>
        </View>
        {month.merchants.length > 0 ? (
          <View style={styles.totalWrap}>
            <Text style={styles.totalLabel}>TRACKED SPEND</Text>
            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.totalValue}>
              {formatCurrency(month.merchantTotal)}
            </Text>
          </View>
        ) : null}
      </View>

      {month.merchants.length > 0 ? (
        <View style={styles.merchantList}>
          {month.merchants.map((merchant, index) => (
            <MerchantRow
              key={merchant.key}
              merchant={merchant}
              rank={index + 1}
              total={month.merchantTotal}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No merchants recorded for this month.</Text>
        </View>
      )}
    </View>
  );
}

export function TopMerchantsCarousel({ date, transactions }: TopMerchantsCarouselProps) {
  const listRef = useRef<FlatList<MerchantMonth>>(null);
  const { width: windowWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const cardWidth = Math.max(280, windowWidth - PAGE_HORIZONTAL_PADDING);
  const months = useMemo(() => buildMonths(date, transactions), [date, transactions]);

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
      <FlatList
        ref={listRef}
        accessibilityLabel="Top 5 merchants by month"
        data={months}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          index,
          length: cardWidth + CARD_GAP,
          offset: (cardWidth + CARD_GAP) * index,
        })}
        horizontal
        initialNumToRender={MONTH_COUNT}
        keyExtractor={(month) => month.key}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <View style={{ marginRight: CARD_GAP, width: cardWidth }}>
            <MerchantMonthCard month={item} />
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
  card: {
    backgroundColor: "#FCFBF7",
    borderColor: "#D7E0DC",
    borderRadius: 22,
    borderWidth: 1,
    elevation: 2,
    minHeight: 410,
    padding: 20,
    shadowColor: colors.ink,
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  cardTitleWrap: { flex: 1, minWidth: 0 },
  eyebrow: {
    color: colors.forest,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  monthLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 5,
  },
  totalWrap: {
    alignItems: "flex-end",
    backgroundColor: "#F1E8D5",
    borderColor: "#E3D6B8",
    borderRadius: 13,
    borderWidth: 1,
    maxWidth: "48%",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  totalLabel: {
    color: colors.gold,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.9,
  },
  totalValue: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.45,
    marginTop: 3,
    textAlign: "right",
  },
  merchantList: { gap: 2, marginTop: 18 },
  merchantRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    minHeight: 78,
    borderBottomColor: "rgba(36, 56, 60, 0.055)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 2,
    paddingVertical: 10,
  },
  logoWrap: { height: 57, position: "relative", width: 57 },
  rankBadge: {
    alignItems: "center",
    borderRadius: 9,
    borderWidth: 1,
    bottom: -4,
    height: 20,
    justifyContent: "center",
    minWidth: 20,
    paddingHorizontal: 3,
    position: "absolute",
    right: -4,
  },
  rankText: { fontSize: 9, fontWeight: "800" },
  merchantDetails: { flex: 1, minWidth: 0 },
  merchantHeading: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  merchantNameRow: {
    alignItems: "baseline",
    flex: 1,
    flexDirection: "row",
    gap: 6,
    minWidth: 0,
  },
  merchantName: {
    color: colors.ink,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  merchantCount: { color: colors.inkFaint, fontSize: 9, fontWeight: "600" },
  merchantValueWrap: { alignItems: "flex-end", flexShrink: 0 },
  merchantValue: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  merchantShare: {
    color: colors.inkFaint,
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 0.35,
    marginTop: 2,
  },
  progressTrack: {
    backgroundColor: "#E8E4DB",
    borderRadius: 3,
    height: 6,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: { borderRadius: 3, height: 6 },
  emptyState: { alignItems: "center", flex: 1, justifyContent: "center", padding: 24 },
  emptyText: { color: colors.inkFaint, fontSize: 13, textAlign: "center" },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 12,
  },
  dot: { backgroundColor: "#C9D2CF", borderRadius: 4, height: 7, width: 7 },
  activeDot: { backgroundColor: "#2D8062", width: 22 },
});
