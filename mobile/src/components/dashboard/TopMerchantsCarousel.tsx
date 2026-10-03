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
import type { Transaction } from "@/types/finance";

import { nu, nuSection, SECTION_GUTTER } from "./nuTheme";
import { getPaceTransactionDate, isExpensePaceTransaction } from "./PaceChart";

const CARD_GAP = 12;
const PAGE_HORIZONTAL_PADDING = SECTION_GUTTER;
const MONTH_COUNT = 4;
const MAX_MERCHANTS = 5;

interface TopMerchantsCarouselProps {
  date: Date;
  transactions: Transaction[];
}

interface MerchantStat {
  category: string;
  count: number;
  domain?: string | null;
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

    const rawName = transaction.merchantName?.trim() || transaction.description.trim();
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
        domain: transaction.merchantDomain,
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

  return (
    <View
      accessibilityLabel={`${rank}. ${merchant.name}, ${merchant.count} transactions, ${formatCurrency(merchant.total)}, ${percentage}% of tracked spend`}
      style={styles.merchantRow}
    >
      <View style={styles.logoWrap}>
        <MerchantLogo
          category={merchant.category}
          domain={merchant.domain}
          name={merchant.name}
          size={44}
        />
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
      </View>

      <View style={styles.merchantDetails}>
        <View style={styles.merchantHeading}>
          <View style={styles.merchantNameRow}>
            <Text numberOfLines={1} style={styles.merchantName}>{merchant.name}</Text>
            <Text style={styles.merchantCount}>{merchant.count}×</Text>
          </View>
          <View style={styles.merchantValueWrap}>
            <Text numberOfLines={1} style={styles.merchantValue}>
              {formatCurrency(merchant.total)}
            </Text>
            <Text style={styles.merchantShare}>{percentage}% of total</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progressWidth }]} />
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
          <Text style={styles.monthLabel}>{month.label}</Text>
        </View>
        {month.merchants.length > 0 ? (
          <View style={styles.totalWrap}>
            <Text style={styles.totalLabel}>Tracked spend</Text>
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
      <Text style={styles.sectionTitle}>Top merchants</Text>
      <Text style={styles.sectionSubtitle}>Your 5 biggest everyday spends per month</Text>
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
  container: nuSection.container,
  sectionTitle: nuSection.title,
  sectionSubtitle: { ...nuSection.subtitle, marginBottom: 14 },
  card: { backgroundColor: nu.surface, borderRadius: 16, minHeight: 360, padding: 16 },
  cardHeader: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between" },
  cardTitleWrap: { flex: 1, minWidth: 0 },
  monthLabel: { color: nu.ink, fontSize: 15, fontWeight: "600" },
  totalWrap: { alignItems: "flex-end", maxWidth: "50%" },
  totalLabel: { color: nu.inkSoft, fontSize: 11 },
  totalValue: { color: nu.ink, fontSize: 17, fontWeight: "700", letterSpacing: -0.3, marginTop: 1, textAlign: "right", fontVariant: ["tabular-nums"] },
  merchantList: { marginTop: 10 },
  merchantRow: {
    alignItems: "center",
    borderBottomColor: nu.track,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    paddingVertical: 11,
  },
  logoWrap: { height: 44, position: "relative", width: 44 },
  rankBadge: {
    alignItems: "center",
    backgroundColor: nu.brand,
    borderColor: nu.surface,
    borderRadius: 10,
    borderWidth: 2,
    bottom: -4,
    height: 20,
    justifyContent: "center",
    minWidth: 20,
    paddingHorizontal: 3,
    position: "absolute",
    right: -4,
  },
  rankText: { color: nu.white, fontSize: 10, fontWeight: "700" },
  merchantDetails: { flex: 1, minWidth: 0 },
  merchantHeading: { alignItems: "flex-start", flexDirection: "row", gap: 10, justifyContent: "space-between" },
  merchantNameRow: { alignItems: "baseline", flex: 1, flexDirection: "row", gap: 6, minWidth: 0 },
  merchantName: { color: nu.ink, flexShrink: 1, fontSize: 14, fontWeight: "600" },
  merchantCount: { color: nu.inkFaint, fontSize: 11 },
  merchantValueWrap: { alignItems: "flex-end", flexShrink: 0 },
  merchantValue: { color: nu.ink, fontSize: 14, fontWeight: "700", fontVariant: ["tabular-nums"] },
  merchantShare: { color: nu.inkSoft, fontSize: 11, marginTop: 1 },
  progressTrack: { backgroundColor: nu.track, borderRadius: 2, height: 4, marginTop: 8, overflow: "hidden" },
  progressFill: { backgroundColor: nu.brand, borderRadius: 2, height: 4 },
  emptyState: { alignItems: "center", flex: 1, justifyContent: "center", padding: 24 },
  emptyText: { color: nu.inkSoft, fontSize: 13, textAlign: "center" },
  dots: nuSection.dots,
  dot: nuSection.dot,
  activeDot: nuSection.activeDot,
});

