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

function getSpendingChange(spending: number, previousSpending: number) {
  if (previousSpending === 0) return spending === 0 ? 0 : null;
  return (Math.round((spending - previousSpending) * 100) / 100 / previousSpending) * 100;
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
  const previousMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
  const previousSpending = household.monthSummaries.find(
    (item) => item.month === monthKey(previousMonth),
  )?.spend ?? 0;
  const spendingChange = getSpendingChange(spending, previousSpending);
  const changeMagnitude = Math.abs(spendingChange ?? 0);
  const changeLabel = spendingChange === null
    ? "\u2014"
    : `${spendingChange > 0 ? "+" : spendingChange < 0 ? "-" : ""}${changeMagnitude > 0 && changeMagnitude < 0.1 ? "<0,1" : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(changeMagnitude)}%`;
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
            tintColor={net > 0 ? "#326548" : "#A44735"}
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
          <View style={styles.identityMonthRow}>
            <View style={styles.householdCopy}>
              <View style={styles.eyebrowRow}>
                <Text style={styles.eyebrow}>Nosso lar</Text>
                <View accessible accessibilityLabel={`${household.members.length} integrantes`} style={styles.memberCount}>
                  <SymbolView name={icons.members} size={11} tintColor={colors.ink} weight="medium" />
                  <Text style={styles.memberCountText}>{household.members.length}</Text>
                </View>
              </View>
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
                <View
                  accessible
                  accessibilityLabel={spendingChange === null
                    ? "Sem gastos no m\u00eas anterior para comparar"
                    : `${changeLabel} em rela\u00e7\u00e3o a ${formatMonth(previousMonth)}`}
                  style={[
                    styles.spendingChangePill,
                    spendingChange !== null && spendingChange > 0 && styles.spendingIncreasePill,
                    spendingChange !== null && spendingChange < 0 && styles.spendingDecreasePill,
                  ]}
                >
                  <Text style={[
                    styles.spendingChangeText,
                    spendingChange !== null && spendingChange > 0 && styles.payText,
                    spendingChange !== null && spendingChange < 0 && styles.receiveText,
                  ]}>{changeLabel}</Text>
                </View>
              </View>
              <Text style={styles.comparisonCaption}>
                {spendingChange === null ? "Sem gastos no m\u00eas anterior" : "vs m\u00eas anterior"}
              </Text>
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
    ...StyleSheet.absoluteFill,
    position: "absolute",
    zIndex: 0,
  },
  identityContainer: { left: 0, paddingHorizontal: 19, paddingTop: 18, position: "absolute", right: 0, top: 0, zIndex: 1 },
  identityMonthRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  householdCopy: { flex: 1, minWidth: 120 },
  eyebrowRow: { alignItems: "center", flexDirection: "row", gap: 6 },
  eyebrow: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "500" },
  householdName: { color: "#FFFFFF", fontSize: 20, fontWeight: "800", letterSpacing: -0.4, marginTop: 3 },
  memberCount: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 10,
    flexDirection: "row",
    gap: 4,
    minHeight: 20,
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  memberCountText: { color: colors.ink, fontSize: 10, fontWeight: "700" },
  summaryLayer: { bottom: 15, left: 15, position: "absolute", right: 15, zIndex: 2 },
  summaryBar: {
    backgroundColor: "rgba(228, 237, 222, 0.94)",
    borderColor: "rgba(255,255,255,0.65)",
    borderRadius: 23,
    borderWidth: 1,
    gap: 14,
    padding: 14,
  },
  summaryTopRow: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between", minHeight: 48 },
  summaryBottomColumn: { alignItems: "center", flexDirection: "column", gap: 8, justifyContent: "center", position: "relative", zIndex: 1 },
  spendingSummary: { flex: 1.3, minWidth: 0 },
  spendingValueRow: { alignItems: "center", flexDirection: "row", gap: 7, marginTop: 4 },
  balanceSummary: { alignItems: "flex-start", flex: 1, minWidth: 0 },
  balanceInfo: { alignItems: "flex-start", gap: 4, minWidth: 0 },
  balanceTitle: { color: "#526653", flexShrink: 1, fontSize: 11, fontWeight: "600" },
  balanceAmountRow: { alignItems: "center", flexDirection: "row", flexShrink: 0, gap: 4 },
  balanceAmount: { color: "#284D3C", fontSize: 21, fontWeight: "800" },
  sectionTitle: { color: "#526653", fontSize: 12, fontWeight: "500" },
  spendingAmount: { color: "#284D3C", flexShrink: 1, fontSize: 21, fontWeight: "800", letterSpacing: -0.35 },
  spendingChangePill: { alignItems: "center", backgroundColor: "rgba(75,108,76,0.10)", borderRadius: 9, justifyContent: "center", paddingHorizontal: 6, paddingVertical: 5 },
  spendingIncreasePill: { backgroundColor: "#F4DFD5" },
  spendingDecreasePill: { backgroundColor: "#D2E5CE" },
  spendingChangeText: { color: "#526653", fontSize: 10, fontWeight: "800" },
  comparisonCaption: { color: "#526653", fontSize: 9, marginTop: 4 },
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
  receiveText: { color: "#326548" },
  payText: { color: "#A44735" },
  addExpenseButton: { alignItems: "center", backgroundColor: "#FBFAF4", borderRadius: 17, flexDirection: "row", gap: 9, height: 44, justifyContent: "center", width: "100%" },
  addExpenseLabel: { color: colors.forest, fontSize: 13, fontWeight: "700" },
  addExpensePressed: { backgroundColor: "#E6EEE7", transform: [{ scale: 0.98 }] },
});
