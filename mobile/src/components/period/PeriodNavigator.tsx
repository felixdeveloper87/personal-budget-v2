import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import type { PeriodUnit } from "@/utils/period";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

interface PeriodNavigatorProps {
  value: PeriodUnit;
  label: string;
  isCurrent: boolean;
  onChange: (period: PeriodUnit) => void;
  onNavigate: (direction: "previous" | "next") => void;
  onGoToToday: () => void;
  variant?: "default" | "inverse";
}

const options: Array<{ label: string; value: PeriodUnit }> = [
  { label: "Semana", value: "week" },
  { label: "Mês", value: "month" },
];

const chevrons = {
  previous: { ios: "chevron.left", android: "chevron_left", web: "chevron_left" },
  next: { ios: "chevron.right", android: "chevron_right", web: "chevron_right" },
} satisfies Record<string, SymbolName>;

export function PeriodNavigator({
  value,
  label,
  isCurrent,
  onChange,
  onNavigate,
  onGoToToday,
  variant = "default",
}: PeriodNavigatorProps) {
  const inverse = variant === "inverse";

  return (
    <View>
      <View
        accessibilityLabel="Selecionar período"
        accessibilityRole="tablist"
        style={[styles.segmented, inverse && styles.segmentedInverse]}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.segment,
                selected && styles.segmentSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  inverse && styles.segmentTextInverse,
                  selected && styles.segmentTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.navigationRow}>
        <NavigationButton
          direction="previous"
          inverse={inverse}
          onPress={() => onNavigate("previous")}
        />

        <View style={styles.periodCopy}>
          <Text numberOfLines={1} style={[styles.periodLabel, inverse && styles.periodLabelInverse]}>
            {label}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={isCurrent}
            onPress={onGoToToday}
            style={[styles.todayBadge, inverse && styles.todayBadgeInverse]}
          >
            <Text style={[styles.todayText, inverse && styles.todayTextInverse]}>
              {isCurrent ? "Atual" : "Hoje"}
            </Text>
          </Pressable>
        </View>

        <NavigationButton
          direction="next"
          inverse={inverse}
          onPress={() => onNavigate("next")}
        />
      </View>
    </View>
  );
}

function NavigationButton({
  direction,
  inverse,
  onPress,
}: {
  direction: "previous" | "next";
  inverse: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={direction === "previous" ? "Período anterior" : "Próximo período"}
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navigationButton,
        inverse && styles.navigationButtonInverse,
        pressed && styles.pressed,
      ]}
    >
      <SymbolView
        name={chevrons[direction]}
        size={18}
        tintColor={inverse ? colors.white : colors.ink}
        weight="semibold"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  segmented: {
    backgroundColor: colors.paperMuted,
    borderRadius: 15,
    flexDirection: "row",
    padding: 4,
  },
  segmentedInverse: { backgroundColor: "rgba(255,255,255,0.10)" },
  segment: {
    alignItems: "center",
    borderRadius: 11,
    flex: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 8,
  },
  segmentSelected: {
    backgroundColor: colors.white,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  segmentText: { color: colors.inkSoft, fontSize: 13, fontWeight: "600" },
  segmentTextInverse: { color: "#D8E7E7" },
  segmentTextSelected: { color: colors.forest, fontWeight: "700" },
  navigationRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 13,
  },
  navigationButton: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  navigationButtonInverse: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.18)",
  },
  periodCopy: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  periodLabel: { color: colors.ink, fontSize: 13, fontWeight: "700", textAlign: "center" },
  periodLabelInverse: { color: colors.white },
  todayBadge: {
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  todayBadgeInverse: { borderColor: "rgba(255,255,255,0.18)" },
  todayText: {
    color: colors.inkFaint,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  todayTextInverse: { color: "#D8E7E7" },
  pressed: { opacity: 0.7 },
});
