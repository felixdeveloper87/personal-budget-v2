import { useEffect, useMemo, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { colors } from "@/theme/colors";
import type { Transaction } from "@/types/finance";

import {
  getPaceTransactionDate,
  isExpensePaceTransaction,
  normalizePaceLabel,
  PaceChart,
} from "./PaceChart";

const CARD_GAP = 12;
const PAGE_HORIZONTAL_PADDING = 36;
const MAX_VISIBLE_DOTS = 7;

export type PaceCollectionDimension = "category" | "description";

interface PaceCollectionCarouselProps {
  accessibilityLabel: string;
  date: Date;
  dimension: PaceCollectionDimension;
  eyebrow: string;
  title: string;
  transactions: Transaction[];
}

interface PaceCollectionItem {
  key: string;
  label: string;
  currentTotal: number;
  previousTotal: number;
}

function displayLabel(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function PaceCollectionCarousel({
  accessibilityLabel,
  date,
  dimension,
  eyebrow,
  title,
  transactions,
}: PaceCollectionCarouselProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const cardWidth = Math.max(280, windowWidth - PAGE_HORIZONTAL_PADDING);

  const items = useMemo(() => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const previousDate = new Date(year, month - 1, 1);
    const currentPrefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
    const previousPrefix = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, "0")}-`;
    const grouped = new Map<string, PaceCollectionItem>();

    for (const transaction of transactions) {
      if (transaction.type !== "EXPENSE" || !isExpensePaceTransaction(transaction)) continue;

      const label = displayLabel(transaction[dimension]);
      if (!label) continue;

      const transactionDate = getPaceTransactionDate(transaction);
      const isCurrent = transactionDate.startsWith(currentPrefix);
      const isPrevious = transactionDate.startsWith(previousPrefix);
      if (!isCurrent && !isPrevious) continue;

      const key = normalizePaceLabel(label);
      const item = grouped.get(key) ?? {
        key,
        label,
        currentTotal: 0,
        previousTotal: 0,
      };
      const amount = Number(transaction.amount || 0);

      if (isCurrent) {
        item.label = label;
        item.currentTotal += amount;
      } else {
        item.previousTotal += amount;
      }
      grouped.set(key, item);
    }

    return [...grouped.values()].sort(
      (first, second) =>
        second.currentTotal - first.currentTotal ||
        second.previousTotal - first.previousTotal ||
        first.label.localeCompare(second.label),
    );
  }, [date, dimension, transactions]);

  const visibleDotIndexes = useMemo(() => {
    if (items.length <= MAX_VISIBLE_DOTS) {
      return items.map((_, index) => index);
    }

    const halfWindow = Math.floor(MAX_VISIBLE_DOTS / 2);
    const start = Math.min(
      Math.max(activeIndex - halfWindow, 0),
      items.length - MAX_VISIBLE_DOTS,
    );
    return Array.from({ length: MAX_VISIBLE_DOTS }, (_, index) => start + index);
  }, [activeIndex, items]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + CARD_GAP));
    setActiveIndex(Math.min(Math.max(nextIndex, 0), items.length - 1));
  };

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(items.length - 1, 0)));
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text numberOfLines={1} style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.counter}>{activeIndex + 1} / {items.length}</Text>
      </View>

      <FlatList
        accessibilityLabel={accessibilityLabel}
        data={items}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          index,
          length: cardWidth + CARD_GAP,
          offset: (cardWidth + CARD_GAP) * index,
        })}
        horizontal
        initialNumToRender={1}
        keyExtractor={(item) => item.key}
        maxToRenderPerBatch={2}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <View style={{ marginRight: CARD_GAP, width: cardWidth }}>
            <PaceChart
              category={dimension === "category" ? item.label : undefined}
              date={date}
              description={dimension === "description" ? item.label : undefined}
              tone="expense"
              transactions={transactions}
            />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={cardWidth + CARD_GAP}
        windowSize={3}
      />

      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.dots}>
        {visibleDotIndexes.map((index) => (
          <View
            key={items[index].key}
            style={[styles.dot, index === activeIndex && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 30 },
  headingRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 3,
  },
  headingCopy: { flex: 1, minWidth: 0, paddingRight: 12 },
  eyebrow: {
    color: colors.forest,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  title: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: -0.35,
    marginTop: 5,
  },
  counter: { color: colors.inkFaint, fontSize: 10, fontWeight: "700", marginBottom: 3 },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 30,
  },
  dot: { backgroundColor: colors.line, borderRadius: 3, height: 5, width: 5 },
  activeDot: { backgroundColor: colors.expense, width: 16 },
});
