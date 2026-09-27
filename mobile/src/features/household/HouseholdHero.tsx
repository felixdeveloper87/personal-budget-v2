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
  calendar: { ios: "calendar", android: "calendar_month", web: "calendar_month" },
  receive: { ios: "arrow.up", android: "arrow_upward", web: "arrow_upward" },
  pay: { ios: "arrow.down", android: "arrow_downward", web: "arrow_downward" },
} satisfies Record<string, SymbolName>;

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(date: Date) {
  const month = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(date);
  return month.charAt(0).toUpperCase() + month.slice(1);
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
  const heroWidth = width - 32;
  const heroHeight = isWide ? 460 : Math.min(520, heroWidth * 1.3);
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
        <SymbolView name={icons.previous} size={13} tintColor={colors.inkSoft} weight="bold" />
      </Pressable>
      <SymbolView name={icons.calendar} size={13} tintColor={colors.inkSoft} weight="semibold" />
      <Text style={styles.monthLabel}>{formatMonth(selectedMonth)}</Text>
      <Pressable
        accessibilityLabel="Próximo mês"
        accessibilityRole="button"
        disabled={isCurrentMonth}
        hitSlop={8}
        onPress={() => shiftMonth(1)}
        style={[styles.monthButton, isCurrentMonth && styles.monthButtonDisabled]}
      >
        <SymbolView name={icons.next} size={13} tintColor={colors.inkSoft} weight="bold" />
      </Pressable>
    </View>
  );

  const balanceInfo = () => (
    <View style={styles.balanceInfo}>
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
            tintColor={net > 0 ? "#A8E8BD" : "#FFC0AA"}
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
    <View style={[styles.card, { height: heroHeight }]}>
      <View style={styles.landscape}>
        <View pointerEvents="none" style={styles.landscapeArt}>
          <HouseholdLandscape height={heroHeight} width={heroWidth} />
        </View>
        <View style={styles.identityContainer}>
          <View style={styles.memberCountRow}>
            <View accessibilityLabel={`${household.members.length} integrantes`} style={styles.memberCount}>
              <SymbolView name={icons.members} size={16} tintColor={colors.ink} weight="semibold" />
              <Text style={styles.memberCountText}>{household.members.length}</Text>
            </View>
          </View>
          <View style={styles.identityMonthRow}>
            <View style={styles.householdCopy}>
              <Text style={styles.eyebrow}>Nosso lar</Text>
              <Text numberOfLines={1} style={styles.householdName}>{household.name}</Text>
            </View>
            {monthNavigation}
          </View>
        </View>
      </View>

      <View style={styles.summaryLayer}>
        <View style={styles.summaryBar}>
          <View style={styles.summaryTopRow}>
            <View style={styles.spendingSummary}>
              <Text numberOfLines={1} style={styles.sectionTitle}>Gastos do mês</Text>
              <View style={styles.spendingValueRow}>
                <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.spendingAmount}>
                  {formatCurrency(spending, household.currency)}
                </Text>
                <View accessibilityLabel={`${expenseCount} despesas compartilhadas`} style={styles.expenseCountPill}>
                  <Text style={styles.expenseCountText}>+{expenseCount}</Text>
                </View>
              </View>
            </View>

            <View style={styles.balanceSummary}>{balanceInfo()}</View>
          </View>
          <View style={styles.summaryBottomColumn}>
            {addExpenseButton}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#194C3F",
    borderRadius: 27,
    overflow: "hidden",
    position: "relative",
  },
  landscape: {
    backgroundColor: "#6CB6D5",
    height: "100%",
    overflow: "hidden",
    position: "relative",
  },
  landscapeArt: {
    ...StyleSheet.absoluteFillObject,
    position: "absolute",
    zIndex: 0,
  },
  identityContainer: { left: 0, paddingHorizontal: 19, paddingTop: 18, position: "absolute", right: 0, top: 0, zIndex: 1 },
  memberCountRow: { alignItems: "center", flexDirection: "row", justifyContent: "flex-end" },
  identityMonthRow: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 8 },
  householdCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "500" },
  householdName: { color: "#FFFFFF", fontSize: 20, fontWeight: "800", letterSpacing: -0.4, marginTop: 3 },
  memberCount: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 20,
    flexDirection: "row",
    gap: 7,
    height: 38,
    justifyContent: "center",
    marginLeft: 9,
    paddingHorizontal: 12,
  },
  memberCountText: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  summaryLayer: { bottom: 15, left: 15, position: "absolute", right: 15, zIndex: 2 },
  summaryBar: {
    backgroundColor: "rgba(17, 67, 55, 0.70)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 23,
    borderWidth: 1,
    gap: 10,
    padding: 10,
  },
  summaryTopRow: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between", minHeight: 48 },
  summaryBottomColumn: { alignItems: "center", flexDirection: "column", gap: 8, justifyContent: "center", position: "relative", zIndex: 1 },
  spendingSummary: { flex: 1, minWidth: 0 },
  spendingValueRow: { alignItems: "center", flexDirection: "row", gap: 7, marginTop: 4 },
  balanceSummary: { alignItems: "flex-start", flex: 1, minWidth: 0 },
  balanceInfo: { alignItems: "flex-start", gap: 4, minWidth: 0 },
  balanceTitle: { color: "rgba(255,255,255,0.9)", flexShrink: 1, fontSize: 11, fontWeight: "600" },
  balanceAmountRow: { alignItems: "center", flexDirection: "row", flexShrink: 0, gap: 4 },
  balanceAmount: { color: "#FFFFFF", fontSize: 21, fontWeight: "800" },
  sectionTitle: { color: "rgba(255,255,255,0.92)", fontSize: 12, fontWeight: "500" },
  spendingAmount: { color: "#FFFFFF", flexShrink: 1, fontSize: 21, fontWeight: "800", letterSpacing: -0.35 },
  expenseCountPill: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.17)", borderRadius: 9, justifyContent: "center", minWidth: 26, paddingHorizontal: 6, paddingVertical: 5 },
  expenseCountText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  monthControl: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderColor: "rgba(255,255,255,0.75)",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    flexShrink: 0,
    gap: 4,
    height: 36,
    paddingHorizontal: 5,
    width: 158,
  },
  monthButton: { alignItems: "center", backgroundColor: "rgba(220,232,232,0.8)", borderRadius: 8, height: 26, justifyContent: "center", width: 22 },
  monthButtonDisabled: { opacity: 0.45 },
  monthLabel: { color: colors.inkSoft, flexShrink: 1, fontSize: 9, fontWeight: "600", minWidth: 68, textAlign: "center" },
  receiveText: { color: "#A8E8BD" },
  payText: { color: "#FFC0AA" },
  addExpenseButton: { alignItems: "center", backgroundColor: "#FBFAF4", borderRadius: 17, flexDirection: "row", gap: 9, height: 44, justifyContent: "center", width: "100%" },
  addExpenseLabel: { color: colors.forest, fontSize: 13, fontWeight: "700" },
  addExpensePressed: { backgroundColor: "#E6EEE7", transform: [{ scale: 0.98 }] },
});
