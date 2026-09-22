import { useEffect, useMemo, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { loadHiddenPaceKeys, saveHiddenPaceKeys } from "@/services/pacePreferences";
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
  userId: number;
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
  userId,
}: PaceCollectionCarouselProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(() => new Set());
  const [preferencesReady, setPreferencesReady] = useState(false);
  const cardWidth = Math.max(280, windowWidth - PAGE_HORIZONTAL_PADDING);

  useEffect(() => {
    let active = true;
    setPreferencesReady(false);

    void loadHiddenPaceKeys(userId, dimension)
      .then((keys) => {
        if (active) setHiddenKeys(keys);
      })
      .catch(() => {
        if (active) setHiddenKeys(new Set());
      })
      .finally(() => {
        if (active) setPreferencesReady(true);
      });

    return () => {
      active = false;
    };
  }, [dimension, userId]);

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

  const visibleItems = useMemo(
    () => items.filter((item) => !hiddenKeys.has(item.key)),
    [hiddenKeys, items],
  );
  const hiddenCount = items.length - visibleItems.length;

  const visibleDotIndexes = useMemo(() => {
    if (visibleItems.length <= MAX_VISIBLE_DOTS) {
      return visibleItems.map((_, index) => index);
    }

    const halfWindow = Math.floor(MAX_VISIBLE_DOTS / 2);
    const start = Math.min(
      Math.max(activeIndex - halfWindow, 0),
      visibleItems.length - MAX_VISIBLE_DOTS,
    );
    return Array.from({ length: MAX_VISIBLE_DOTS }, (_, index) => start + index);
  }, [activeIndex, visibleItems]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + CARD_GAP));
    setActiveIndex(Math.min(Math.max(nextIndex, 0), visibleItems.length - 1));
  };

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(visibleItems.length - 1, 0)));
  }, [visibleItems.length]);

  const hideItem = (item: PaceCollectionItem) => {
    Alert.alert(
      "Hide this chart?",
      `${item.label} will be removed from this carousel. Your transactions will not be deleted.`,
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => {
            setHiddenKeys((current) => {
              const next = new Set(current);
              next.add(item.key);
              void saveHiddenPaceKeys(userId, dimension, next).catch(() => {});
              return next;
            });
          },
          style: "destructive",
          text: "Hide",
        },
      ],
    );
  };

  const restoreHiddenItems = () => {
    setHiddenKeys(new Set());
    void saveHiddenPaceKeys(userId, dimension, new Set()).catch(() => {});
  };

  if (!preferencesReady || items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text numberOfLines={1} style={styles.title}>{title}</Text>
        </View>
        <View style={styles.headingActions}>
          {hiddenCount > 0 ? (
            <Pressable
              accessibilityLabel={`Restore ${hiddenCount} hidden charts`}
              accessibilityRole="button"
              onPress={restoreHiddenItems}
              style={({ pressed }) => [styles.restoreButton, pressed && styles.restoreButtonPressed]}
            >
              <Text style={styles.restoreButtonText}>SHOW HIDDEN ({hiddenCount})</Text>
            </Pressable>
          ) : null}
          {visibleItems.length > 0 ? (
            <Text style={styles.counter}>{activeIndex + 1} / {visibleItems.length}</Text>
          ) : null}
        </View>
      </View>

      {visibleItems.length > 0 ? (
        <>
          <FlatList
            accessibilityLabel={accessibilityLabel}
            data={visibleItems}
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
                  interactive
                  onHide={() => hideItem(item)}
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
                key={visibleItems[index].key}
                style={[styles.dot, index === activeIndex && styles.activeDot]}
              />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.allHiddenState}>
          <Text style={styles.allHiddenText}>All charts in this carousel are hidden.</Text>
        </View>
      )}
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
  headingActions: { alignItems: "flex-end", gap: 7 },
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
  restoreButton: {
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  restoreButtonPressed: { opacity: 0.65 },
  restoreButtonText: { color: colors.forest, fontSize: 8, fontWeight: "800", letterSpacing: 0.7 },
  allHiddenState: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 16,
    minHeight: 110,
    padding: 20,
  },
  allHiddenText: { color: colors.inkFaint, fontSize: 12, textAlign: "center" },
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
