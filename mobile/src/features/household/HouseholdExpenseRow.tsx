import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { categories, categoryIcons, categoryPalette, categoryTones } from "@/features/household/householdCategories";
import { expenseDateLabel } from "@/features/household/expenseHistory";
import { colors } from "@/theme/colors";
import type { HouseholdExpense } from "@/types/household";

export function HouseholdExpenseRow({ expense, currency }: { expense: HouseholdExpense; currency: string }) {
  const category = categories.find((item) => item.value === expense.category);
  const key = category?.value ?? "Other";
  const tone = categoryPalette[categoryTones[key]];
  const amount = new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(expense.amount);

  return (
    <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: tone.background }]}>
        <SymbolView name={categoryIcons[key]} size={19} tintColor={tone.ink} />
      </View>
      <View style={styles.copy}>
        <View style={styles.heading}>
          <Text style={styles.category}>{category?.label ?? expense.category}</Text>
          <Text style={styles.amount}>{amount}</Text>
        </View>
        {expense.description ? <Text style={styles.description}>{expense.description}</Text> : null}
        <Text style={styles.payer}>Pago por <Text style={styles.payerName}>{expense.payerName}</Text></Text>
        <Text style={styles.date}>{expenseDateLabel(expense.expenseDate)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", gap: 11, backgroundColor: "#FFFEFA", borderColor: "#E2E6DB", borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 8 },
  icon: { alignItems: "center", justifyContent: "center", height: 38, width: 38, borderRadius: 13 },
  copy: { flex: 1, minWidth: 0 },
  heading: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", columnGap: 10, rowGap: 3 },
  category: { color: colors.ink, fontSize: 13, fontWeight: "700", flexShrink: 1 },
  amount: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  description: { color: colors.inkSoft, fontSize: 12, lineHeight: 17, marginTop: 4 },
  payer: { color: colors.inkSoft, fontSize: 11, lineHeight: 16, marginTop: 7 },
  payerName: { color: colors.ink, fontWeight: "600" },
  date: { color: colors.inkFaint, fontSize: 10, marginTop: 3 },
});
