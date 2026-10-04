import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { expenseDateLabel } from "@/features/household/expenseHistory";
import { paymentStatuses } from "@/features/household/paymentHistory";
import { nu } from "@/components/dashboard/nuTheme";
import type { HouseholdPayment } from "@/types/household";

export function HouseholdPaymentRow({ payment, currency, variant = "row" }: { payment: HouseholdPayment; currency: string; variant?: "row" | "carousel" }) {
  const amount = new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(payment.amount);
  const date = expenseDateLabel(payment.settlementDate);
  const status = paymentStatuses[payment.status];
  const isCarousel = variant === "carousel";

  return (
    <View accessible accessibilityLabel={`De ${payment.fromMemberName} para ${payment.toMemberName}. ${amount}. ${date}. ${status.label}.`} style={[styles.card, isCarousel && styles.carouselCard]}>
      <View style={[styles.header, isCarousel && styles.carouselHeader]}>
        <View style={[styles.icon, isCarousel && styles.carouselIcon]}>
          <SymbolView name={{ ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" }} size={isCarousel ? 15 : 18} tintColor={nu.brand} />
        </View>
        <View style={styles.people}>
          <Text numberOfLines={1} style={styles.person}>De <Text style={styles.name}>{payment.fromMemberName}</Text></Text>
          <Text numberOfLines={1} style={styles.person}>Para <Text style={styles.name}>{payment.toMemberName}</Text></Text>
          {!isCarousel ? <Text style={styles.date}>{date}</Text> : null}
        </View>
      </View>
      <View style={[styles.details, isCarousel && styles.carouselDetails]}>
        <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={[styles.amount, isCarousel && styles.carouselAmount]}>{amount}</Text>
        <View style={[styles.statusPill, isCarousel && styles.carouselStatus, { backgroundColor: status.background }]}>
          <Text style={[styles.status, { color: status.ink }]}>{status.label}</Text>
        </View>
      </View>
      {isCarousel ? <Text style={styles.date}>{date}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", flexDirection: "row", gap: 10, backgroundColor: nu.surface, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 8 },
  header: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 9 },
  carouselCard: { width: 192, flexDirection: "column", alignItems: "stretch", padding: 12, gap: 8, marginBottom: 0 },
  carouselHeader: { flex: 0, gap: 7 },
  carouselIcon: { height: 30, width: 30, borderRadius: 15 },
  carouselDetails: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", maxWidth: "100%", gap: 6 },
  carouselAmount: { flex: 1, fontSize: 17, letterSpacing: -0.4 },
  carouselStatus: { marginTop: 0, paddingHorizontal: 5 },
  icon: { alignItems: "center", justifyContent: "center", backgroundColor: nu.brandTint, height: 36, width: 36, borderRadius: 18 },
  people: { flex: 1, minWidth: 0, gap: 3 },
  person: { color: nu.inkSoft, fontSize: 12, lineHeight: 16 },
  name: { color: nu.ink, fontWeight: "600" },
  date: { color: nu.inkFaint, fontSize: 11, lineHeight: 14 },
  details: { alignItems: "flex-end", flexShrink: 1, maxWidth: "40%" },
  amount: { color: nu.ink, fontSize: 15, fontWeight: "700" },
  statusPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginTop: 5 },
  status: { fontSize: 10, fontWeight: "600" },
});
