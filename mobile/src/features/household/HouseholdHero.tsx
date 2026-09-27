import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HouseholdLandscape } from "@/features/household/HouseholdLandscape";
import type { HouseholdHeroData } from "@/types/household";
import { colors } from "@/theme/colors";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const icons = {
  members: { ios: "person.2.fill", android: "groups", web: "groups" },
  previous: { ios: "chevron.left", android: "chevron_left", web: "chevron_left" },
  next: { ios: "chevron.right", android: "chevron_right", web: "chevron_right" },
  receive: { ios: "arrow.down.left", android: "south_west", web: "south_west" },
  pay: { ios: "arrow.up.right", android: "north_east", web: "north_east" },
  settled: { ios: "checkmark", android: "check", web: "check" },
} satisfies Record<string, SymbolName>;

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
}

export function HouseholdHero({
  household,
  selectedMonth,
  onMonthChange,
}: HouseholdHeroProps) {
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

      <View style={styles.content}>
        <View style={styles.spendingRow}>
          <Text numberOfLines={1} style={styles.sectionTitle}>Gastos do mês</Text>
          <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.spendingAmount}>
            {formatCurrency(spending, household.currency)}
          </Text>
          <View accessibilityLabel={`${expenseCount} despesas compartilhadas`} style={styles.expenseCountPill}>
            <Text style={styles.expenseCountText}>+{expenseCount}</Text>
          </View>
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
        </View>

        <View style={styles.sectionDivider} />

        <View style={[styles.positionHeader, net > 0 ? styles.positionReceive : net < 0 ? styles.positionPay : styles.positionSettled]}>
          <View style={styles.positionIcon}>
            <SymbolView
              name={net > 0 ? icons.receive : net < 0 ? icons.pay : icons.settled}
              size={16}
              tintColor={net > 0 ? colors.income : net < 0 ? colors.expense : colors.forest}
              weight="bold"
            />
          </View>
          <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={[styles.positionTitle, net > 0 ? styles.receiveText : net < 0 ? styles.payText : null]}>
            {net > 0 ? "Estão te devendo" : net < 0 ? "Você tem que pagar" : "Tudo certo por aqui"}
          </Text>
          {net !== 0 ? (
            <View style={[styles.positionAmountPill, net > 0 ? styles.positionAmountReceive : styles.positionAmountPay]}>
              <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.positionAmountText}>
                {formatCurrency(Math.abs(net), household.currency)}
              </Text>
            </View>
          ) : null}
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
    height: 193,
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
  content: {
    backgroundColor: colors.paperRaised,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
  },
  sectionTitle: { color: colors.inkFaint, flexShrink: 1, fontSize: 9, fontWeight: "600", letterSpacing: 0.1 },
  spendingRow: { alignItems: "center", flexDirection: "row", gap: 4 },
  spendingAmount: { color: "#172A2D", flexShrink: 1, fontSize: 18, fontWeight: "800", letterSpacing: -0.35, marginLeft: 2 },
  expenseCountPill: { alignItems: "center", backgroundColor: colors.incomeTint, borderRadius: 8, justifyContent: "center", minWidth: 23, marginLeft: 3, paddingHorizontal: 4, paddingVertical: 4 },
  expenseCountText: { color: colors.forest, fontSize: 8, fontWeight: "800" },
  monthControl: {
    alignItems: "center",
    backgroundColor: colors.paper,
    borderColor: "rgba(36,56,60,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    flexShrink: 1,
    gap: 3,
    height: 36,
    marginLeft: "auto",
    paddingHorizontal: 4,
  },
  monthButton: { alignItems: "center", height: 28, justifyContent: "center", width: 24 },
  monthButtonDisabled: { opacity: 0.45 },
  monthLabel: { color: colors.inkSoft, flexShrink: 1, fontSize: 10, fontWeight: "600", minWidth: 72, textAlign: "center" },
  sectionDivider: { backgroundColor: "rgba(36,56,60,0.08)", height: StyleSheet.hairlineWidth, marginTop: 10, marginBottom: 8 },
  positionHeader: { alignItems: "center", borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 9, minHeight: 46, paddingHorizontal: 10, paddingVertical: 5 },
  positionReceive: { backgroundColor: "#E7F2E8", borderColor: "#D6E9D9" },
  positionPay: { backgroundColor: "#F7EAE5", borderColor: "#EEDBD4" },
  positionSettled: { backgroundColor: "#EEF1E7", borderColor: "#E2E7D8" },
  positionIcon: { alignItems: "center", height: 30, justifyContent: "center", width: 30 },
  positionTitle: { color: colors.inkSoft, flex: 1, fontSize: 14, fontWeight: "700", letterSpacing: -0.15 },
  positionAmountPill: { borderRadius: 10, maxWidth: 105, paddingHorizontal: 10, paddingVertical: 6 },
  positionAmountReceive: { backgroundColor: colors.income },
  positionAmountPay: { backgroundColor: colors.expense },
  positionAmountText: { color: colors.white, fontSize: 14, fontWeight: "800", letterSpacing: -0.2 },
  receiveText: { color: colors.income },
  payText: { color: colors.expense },
});
