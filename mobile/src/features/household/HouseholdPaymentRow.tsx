import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { expenseDateLabel } from "@/features/household/expenseHistory";
import { paymentStatuses } from "@/features/household/paymentHistory";
import { colors } from "@/theme/colors";
import type { HouseholdPayment } from "@/types/household";

export function HouseholdPaymentRow({ payment, currency }: { payment: HouseholdPayment; currency: string }) {
  const amount = new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(payment.amount);
  const date = expenseDateLabel(payment.settlementDate);
  const status = paymentStatuses[payment.status];

  return (
    <View accessible accessibilityLabel={`De ${payment.fromMemberName} para ${payment.toMemberName}. ${amount}. ${date}. ${status.label}.`} style={styles.card}>
      <View style={styles.icon}>
        <SymbolView name={{ ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" }} size={18} tintColor={colors.income} />
      </View>
      <View style={styles.people}>
        <Text numberOfLines={1} style={styles.person}>De <Text style={styles.name}>{payment.fromMemberName}</Text></Text>
        <Text numberOfLines={1} style={styles.person}>Para <Text style={styles.name}>{payment.toMemberName}</Text></Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <View style={styles.details}>
        <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.amount}>{amount}</Text>
        <View style={[styles.statusPill, { backgroundColor: status.background }]}>
          <Text style={[styles.status, { color: status.ink }]}>{status.label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", flexDirection: "row", gap: 9, backgroundColor: "#FFFEFA", borderColor: "#E2E6DB", borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 7 },
  icon: { alignItems: "center", justifyContent: "center", backgroundColor: "#E5EDDC", height: 34, width: 34, borderRadius: 11 },
  people: { flex: 1, minWidth: 0, gap: 3 },
  person: { color: colors.inkSoft, fontSize: 11, lineHeight: 16 },
  name: { color: colors.ink, fontWeight: "600" },
  date: { color: colors.inkFaint, fontSize: 10, lineHeight: 13 },
  details: { alignItems: "flex-end", flexShrink: 1, maxWidth: "40%" },
  amount: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  statusPill: { borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3, marginTop: 5 },
  status: { fontSize: 9, fontWeight: "700" },
});
