import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { NuHeader } from "@/components/dashboard/NuHeader";
import { nu } from "@/components/dashboard/nuTheme";
import { HouseLineArt } from "@/features/household/HouseLineArt";
import type { HouseholdHeroData } from "@/types/household";

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

  // Light-on-purple tones: soft mint = good, soft rose = bad.
  const changeColor = spendingChange === null || spendingChange === 0 ? SOFT : spendingChange > 0 ? BAD : GOOD;
  const positionColor = net > 0 ? GOOD : net < 0 ? BAD : SOFT;

  const shiftMonth = (amount: number) => {
    onMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + amount, 1));
  };

  return (
    <NuHeader decoration={<HouseLineArt />}>
      {/* Identity + add expense */}
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <View style={styles.eyebrowRow}>
            <Text style={styles.eyebrow}>Nosso lar</Text>
            <View accessible accessibilityLabel={`${household.members.length} integrantes`} style={styles.memberChip}>
              <SymbolView name={icons.members} size={10} tintColor={nu.white} weight="medium" />
              <Text style={styles.memberChipText}>{household.members.length}</Text>
            </View>
          </View>
          <Text numberOfLines={1} style={styles.name}>{household.name}</Text>
        </View>
        <Pressable
          accessibilityLabel="Adicionar despesa compartilhada"
          accessibilityRole="button"
          onPress={onAddExpense}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <SymbolView name={icons.add} size={14} tintColor={nu.brand} weight="bold" />
          <Text style={styles.addLabel}>Despesa</Text>
        </Pressable>
      </View>

      {/* Month spending · your position */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text numberOfLines={1} style={styles.statLabel}>Gastos do mês</Text>
          <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.statValue}>
            {formatCurrency(spending, household.currency)}
          </Text>
          <Text
            accessibilityLabel={spendingChange === null
              ? "Sem gastos no mês anterior para comparar"
              : `${changeLabel} em relação a ${formatMonth(previousMonth)}`}
            numberOfLines={1}
            style={styles.statCaption}
          >
            <Text style={[styles.changeText, { color: changeColor }]}>{changeLabel}</Text>
            {spendingChange === null ? " sem mês anterior" : " vs mês anterior"}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text numberOfLines={1} style={[styles.statLabel, { color: positionColor }]}>
            {net > 0 ? "Te devem" : net < 0 ? "Você tem que pagar" : "Tudo certo por aqui"}
          </Text>
          {net !== 0 ? (
            <View style={styles.positionRow}>
              <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={[styles.statValue, { color: positionColor }]}>
                {formatCurrency(Math.abs(net), household.currency)}
              </Text>
              <SymbolView name={net > 0 ? icons.receive : icons.pay} size={12} tintColor={positionColor} weight="bold" />
            </View>
          ) : (
            <Text style={[styles.statValue, { color: positionColor }]}>—</Text>
          )}
          <Text numberOfLines={1} style={styles.statCaption}>Seu saldo na casa</Text>
        </View>
      </View>

      {/* Month navigator */}
      <View style={styles.monthControl}>
        <Pressable accessibilityLabel="Mês anterior" accessibilityRole="button" hitSlop={8} onPress={() => shiftMonth(-1)} style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}>
          <SymbolView name={icons.previous} size={13} tintColor={nu.white} weight="bold" />
        </Pressable>
        <View style={styles.monthCenter}>
          <SymbolView name={icons.calendar} size={13} tintColor={SOFT} weight="semibold" />
          <Text style={styles.monthLabel}>{formatMonth(selectedMonth)}</Text>
        </View>
        <Pressable
          accessibilityLabel="Próximo mês"
          accessibilityRole="button"
          disabled={isCurrentMonth}
          hitSlop={8}
          onPress={() => shiftMonth(1)}
          style={({ pressed }) => [styles.monthButton, isCurrentMonth && styles.disabled, pressed && styles.pressed]}
        >
          <SymbolView name={icons.next} size={13} tintColor={nu.white} weight="bold" />
        </Pressable>
      </View>
    </NuHeader>
  );
}

const GOOD = "#9FF0C8";
const BAD = "#FFC2B8";
const SOFT = "rgba(255,255,255,0.8)";

const styles = StyleSheet.create({
  topRow: { alignItems: "center", flexDirection: "row", gap: 10, height: 44 },
  identity: { flex: 1, minWidth: 0 },
  eyebrowRow: { alignItems: "center", flexDirection: "row", gap: 6 },
  eyebrow: { color: SOFT, fontSize: 12 },
  memberChip: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 999, flexDirection: "row", gap: 3, paddingHorizontal: 7, paddingVertical: 2 },
  memberChipText: { color: nu.white, fontSize: 10, fontWeight: "700" },
  name: { color: nu.white, fontSize: 20, fontWeight: "700", letterSpacing: -0.3, marginTop: 1 },
  addButton: { alignItems: "center", backgroundColor: nu.white, borderRadius: 999, flexDirection: "row", gap: 5, height: 34, paddingHorizontal: 14 },
  addLabel: { color: nu.brand, fontSize: 13, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 14, marginTop: 10 },
  stat: { flex: 1, height: 64, minWidth: 0 },
  statDivider: { backgroundColor: "rgba(255,255,255,0.2)", width: 1 },
  statLabel: { color: SOFT, fontSize: 12, fontWeight: "500" },
  statValue: { color: nu.white, fontSize: 23, fontWeight: "700", letterSpacing: -0.5, marginTop: 2, fontVariant: ["tabular-nums"] },
  statCaption: { color: "rgba(255,255,255,0.72)", fontSize: 11, marginTop: 2 },
  changeText: { fontWeight: "700" },
  positionRow: { alignItems: "center", flexDirection: "row", gap: 4 },
  monthControl: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.22)", borderRadius: 999, borderWidth: 1, flexDirection: "row", height: 32, justifyContent: "space-between", marginTop: 10, paddingHorizontal: 4 },
  monthButton: { alignItems: "center", borderRadius: 13, height: 26, justifyContent: "center", width: 30 },
  monthCenter: { alignItems: "center", flexDirection: "row", gap: 6 },
  monthLabel: { color: nu.white, fontSize: 13, fontWeight: "600" },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.75 },
});
