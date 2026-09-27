import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { HouseholdLandscape } from "@/features/household/HouseholdLandscape";
import type { HouseholdHeroData } from "@/types/household";
import { colors } from "@/theme/colors";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const icons = {
  members: { ios: "person.2.fill", android: "groups", web: "groups" },
  previous: { ios: "chevron.left", android: "chevron_left", web: "chevron_left" },
  next: { ios: "chevron.right", android: "chevron_right", web: "chevron_right" },
  add: { ios: "plus", android: "add", web: "add" },
  receive: { ios: "arrow.up", android: "arrow_upward", web: "arrow_upward" },
  pay: { ios: "arrow.down", android: "arrow_downward", web: "arrow_downward" },
} satisfies Record<string, SymbolName>;

const SUMMARY_CONTROL_WIDTH = 146;

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "GBP",
    maximumFractionDigits: 2,
  }).format(amount);
}

interface HouseholdHeroProps {
  household: HouseholdHeroData;
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
  onAddExpense: () => void;
}

export function HouseholdHero({
  household,
  selectedMonth,
  onMonthChange,
  onAddExpense,
}: HouseholdHeroProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const today = new Date();
  const isCurrentMonth = monthKey(selectedMonth) === monthKey(today);
  const summary = household.monthSummaries.find(
    (item) => item.month === monthKey(selectedMonth),
  );
  const spending = summary?.spend ?? (isCurrentMonth ? household.monthSpend : 0);
  const expenseCount = summary?.expenseCount ?? 0;
  const net = household.currentUserBalance;

  const shiftMonth = (amount: number) => {
    onMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + amount, 1));
  };

  const monthNavigation = (
    <View style={styles.monthControl}>
      <Pressable
        accessibilityLabel="Mês anterior"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => shiftMonth(-1)}
        style={styles.monthButton}
      >
        <SymbolView name={icons.previous} size={14} tintColor={colors.inkSoft} weight="bold" />
      </Pressable>
      <Text style={styles.monthLabel}>{formatMonth(selectedMonth)}</Text>
      <Pressable
        accessibilityLabel="Próximo mês"
        accessibilityRole="button"
        disabled={isCurrentMonth}
        hitSlop={8}
        onPress={() => shiftMonth(1)}
        style={[styles.monthButton, isCurrentMonth && styles.monthButtonDisabled]}
      >
        <SymbolView name={icons.next} size={14} tintColor={colors.inkSoft} weight="bold" />
      </Pressable>
    </View>
  );

  const balanceInfo = () => (
    <View style={styles.balanceLine}>
      <Text numberOfLines={1} style={[styles.balanceTitle, net > 0 ? styles.receiveText : net < 0 ? styles.payText : null]}>
        {net > 0 ? "Te devem" : net < 0 ? "Você tem que pagar" : "Tudo certo por aqui"}
      </Text>
      {net !== 0 ? (
        <View style={styles.balanceAmountRow}>
          <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={[styles.balanceAmount, net < 0 && styles.payText]}>
            {formatCurrency(Math.abs(net), household.currency)}
          </Text>
          <SymbolView
            name={net > 0 ? icons.receive : icons.pay}
            size={12}
            tintColor={net > 0 ? colors.income : colors.expense}
            weight="bold"
          />
        </View>
      ) : null}
    </View>
  );

  const addExpenseButton = (
    <Pressable
      accessibilityLabel="Adicionar despesa compartilhada"
      accessibilityRole="button"
      onPress={onAddExpense}
      style={({ pressed }) => [styles.addExpenseButton, pressed && styles.addExpensePressed]}
    >
      <SymbolView name={icons.add} size={16} tintColor={colors.forest} weight="semibold" />
      <Text style={styles.addExpenseLabel}>Add despesa</Text>
    </Pressable>
  );

  return (
    <View style={styles.card}>
      <View style={styles.landscape}>
        <View pointerEvents="none" style={styles.landscapeArt}>
          <HouseholdLandscape />
        </View>
        <View style={styles.identityRow}>
          <View style={styles.householdCopy}>
            <Text style={styles.eyebrow}>Nosso lar</Text>
            <Text numberOfLines={1} style={styles.householdName}>{household.name}</Text>
          </View>
          <View accessibilityLabel={`${household.members.length} integrantes`} style={styles.memberCount}>
            <SymbolView name={icons.members} size={16} tintColor={colors.ink} weight="semibold" />
            <Text style={styles.memberCountText}>{household.members.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryLayer}>
        <View style={styles.summaryBar}>
          <View style={styles.summaryTopRow}>
            <View style={[styles.spendingSummary, isWide && styles.spendingSummaryWide]}>
              <Text numberOfLines={1} style={styles.sectionTitle}>Gastos do mês</Text>
              <View style={[styles.spendingValueRow, isWide && styles.spendingValueRowWide]}>
                <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.spendingAmount}>
                  {formatCurrency(spending, household.currency)}
                </Text>
                <View accessibilityLabel={`${expenseCount} despesas compartilhadas`} style={styles.expenseCountPill}>
                  <Text style={styles.expenseCountText}>+{expenseCount}</Text>
                </View>
              </View>
            </View>

            {monthNavigation}
          </View>
          <View style={styles.balanceRowBackground}>
            <View pointerEvents="none" style={styles.balanceRowStripes}>
              {[0, 1, 2, 3, 4].map((line) => (
                <View key={"horizontal-" + line} style={[styles.balanceRowHorizontalStripe, { top: 5 + line * 8 }]} />
              ))}
              {[
                { key: "left-1", position: "16.67%" },
                { key: "left-2", position: "33.33%" },
                { key: "left-3", position: "50%" },
                { key: "left-4", position: "66.67%" },
                { key: "left-5", position: "83.33%" },
              ].map((line) => (
                <View key={line.key} style={[styles.balanceRowVerticalStripe, { left: line.position }]} />
              ))}
            </View>
            <View style={styles.summaryBottomRow}>
              <View style={[styles.balanceSummary, isWide && styles.balanceSummaryWide]}>{balanceInfo()}</View>
              {addExpenseButton}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paperRaised,
    borderColor: "rgba(36, 56, 60, 0.08)",
    borderRadius: 27,
    borderWidth: 1,
    overflow: "hidden",
  },
  landscape: {
    backgroundColor: "#DDEEF1",
    height: 238,
    overflow: "hidden",
    position: "relative",
  },
  landscapeArt: {
    bottom: 0,
    height: 138,
    left: 0,
    position: "absolute",
    right: 0,
  },
  identityRow: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 19,
    paddingTop: 20,
    position: "relative",
    zIndex: 1,
  },
  householdCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: "#52656A", fontSize: 11, fontWeight: "500" },
  householdName: { color: "#172A2D", fontSize: 19, fontWeight: "800", letterSpacing: -0.4, marginTop: 2 },
  memberCount: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.67)",
    borderColor: "rgba(255,255,255,0.68)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    height: 36,
    justifyContent: "center",
    marginLeft: 9,
    paddingHorizontal: 11,
  },
  memberCountText: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  summaryLayer: { marginTop: -8, position: "relative", zIndex: 2 },
  summaryBar: {
    backgroundColor: colors.paperRaised,
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 12,
    paddingTop: 10,
  },
  summaryTopRow: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between", minHeight: 36 },
  balanceRowBackground: { backgroundColor: "#F3F8F3", borderRadius: 13, overflow: "hidden", position: "relative" },
  balanceRowStripes: { ...StyleSheet.absoluteFillObject },
  balanceRowHorizontalStripe: { backgroundColor: "#DCEBDD", height: StyleSheet.hairlineWidth, left: 0, opacity: 0.8, position: "absolute", right: 0 },
  balanceRowVerticalStripe: { backgroundColor: "#DCEBDD", bottom: 0, opacity: 0.8, position: "absolute", top: 0, width: StyleSheet.hairlineWidth },
  summaryBottomRow: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between", minHeight: 46, paddingHorizontal: 9, position: "relative", zIndex: 1 },
  spendingSummary: { alignItems: "center", flex: 1, flexDirection: "row", gap: 4, minWidth: 0 },
  spendingSummaryWide: { gap: 5 },
  spendingValueRow: { alignItems: "center", flexDirection: "row", flexShrink: 1, gap: 4 },
  spendingValueRowWide: { marginTop: 0 },
  balanceSummary: { alignItems: "center", flex: 1, minWidth: 0 },
  balanceSummaryWide: { flex: 1.1 },
  balanceLine: { alignItems: "center", flexDirection: "row", gap: 5, minWidth: 0 },
  balanceTitle: { color: colors.inkSoft, flexShrink: 1, fontSize: 10, fontWeight: "600" },
  balanceAmountRow: { alignItems: "center", flexDirection: "row", flexShrink: 0, gap: 4 },
  balanceAmount: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  sectionTitle: { color: colors.inkFaint, flexShrink: 1, fontSize: 8, fontWeight: "600", letterSpacing: 0.05 },
  spendingAmount: { color: "#172A2D", flexShrink: 1, fontSize: 16, fontWeight: "800", letterSpacing: -0.35 },
  expenseCountPill: { alignItems: "center", backgroundColor: colors.incomeTint, borderRadius: 8, justifyContent: "center", minWidth: 21, paddingHorizontal: 4, paddingVertical: 4 },
  expenseCountText: { color: colors.forest, fontSize: 8, fontWeight: "800" },
  monthControl: {
    alignItems: "center",
    backgroundColor: colors.paper,
    borderColor: "rgba(36,56,60,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    flexShrink: 0,
    gap: 4,
    height: 36,
    width: SUMMARY_CONTROL_WIDTH,
    paddingHorizontal: 5,
  },
  monthButton: { alignItems: "center", backgroundColor: "#E8F0E8", borderRadius: 9, height: 28, justifyContent: "center", width: 28 },
  monthButtonDisabled: { opacity: 0.45 },
  monthLabel: { color: colors.inkSoft, flexShrink: 1, fontSize: 9, fontWeight: "600", minWidth: 70, textAlign: "center" },
  receiveText: { color: colors.income },
  payText: { color: colors.expense },
  addExpenseButton: { alignItems: "center", backgroundColor: colors.header, borderColor: "rgba(48,94,101,0.10)", borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 6, justifyContent: "center", minHeight: 36, paddingHorizontal: 10, width: SUMMARY_CONTROL_WIDTH },
  addExpenseLabel: { color: colors.forest, fontSize: 11, fontWeight: "700" },
  addExpensePressed: { backgroundColor: "#D2E1E2", transform: [{ scale: 0.98 }] },
});
