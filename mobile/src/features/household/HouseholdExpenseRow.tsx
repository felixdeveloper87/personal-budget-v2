import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { categories, categoryIcons, categoryPalette, categoryTones } from "@/features/household/householdCategories";
import { expenseDateLabel, getExpenseShare } from "@/features/household/expenseHistory";
import { colors } from "@/theme/colors";
import type { HouseholdExpense } from "@/types/household";

export function HouseholdExpenseRow({ expense, currency, currentMemberId }: {
  expense: HouseholdExpense;
  currency: string;
  currentMemberId: number;
}) {
  const category = categories.find((item) => item.value === expense.category);
  const key = category?.value ?? "Other";
  const tone = categoryPalette[categoryTones[key]];
  const currencyFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency });
  const amount = currencyFormat.format(expense.amount);
  const share = getExpenseShare(expense, currentMemberId);
  const shareLabel = share === undefined ? "Parte indisponível" : share === null ? "Não participa" : `Sua parte: ${currencyFormat.format(share)}`;
  const date = expenseDateLabel(expense.expenseDate);

  return (
    <View
      accessible
      accessibilityLabel={`${category?.label ?? expense.category}. ${expense.description}. Total: ${amount}. ${shareLabel}. Pago por ${expense.payerName}. ${date}.`}
      style={styles.card}
    >
      <View style={[styles.icon, { backgroundColor: tone.background }]}>
        <SymbolView name={categoryIcons[key]} size={19} tintColor={tone.ink} />
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.category}>{category?.label ?? expense.category}</Text>
        {expense.description ? <Text numberOfLines={1} style={styles.description}>{expense.description}</Text> : null}
        <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.share}>{shareLabel}</Text>
      </View>
      <View style={styles.details}>
        <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.amount}>{amount}</Text>
        <Text numberOfLines={1} style={styles.payer}>Pago por <Text style={styles.payerName}>{expense.payerName}</Text></Text>
        <Text numberOfLines={1} style={styles.date}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", flexDirection: "row", gap: 9, backgroundColor: "#FFFEFA", borderColor: "#E2E6DB", borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 7 },
  icon: { alignItems: "center", justifyContent: "center", flexShrink: 0, height: 34, width: 34, borderRadius: 11 },
  copy: { flex: 1, minWidth: 0 },
  details: { flex: 1.1, minWidth: 0 },
  category: { color: colors.ink, fontSize: 13, fontWeight: "700", flexShrink: 1 },
  amount: { color: colors.ink, fontSize: 14, fontWeight: "800", textAlign: "right" },
  description: { color: colors.inkSoft, fontSize: 11, lineHeight: 15, marginTop: 3 },
  share: { color: colors.income, fontSize: 10, fontWeight: "600", lineHeight: 14, marginTop: 3 },
  payer: { color: colors.inkSoft, fontSize: 10, lineHeight: 14, marginTop: 2, textAlign: "right" },
  payerName: { color: colors.ink, fontWeight: "600" },
  date: { color: colors.inkFaint, fontSize: 10, lineHeight: 13, marginTop: 1, textAlign: "right" },
});
