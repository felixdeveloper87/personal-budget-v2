import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HouseholdPaymentHistorySheet } from "@/features/household/HouseholdPaymentHistorySheet";
import { HouseholdPaymentRow } from "@/features/household/HouseholdPaymentRow";
import { sortHouseholdPayments } from "@/features/household/paymentHistory";
import { colors } from "@/theme/colors";
import type { HouseholdHeroData } from "@/types/household";

export function HouseholdPayments({ household }: { household: HouseholdHeroData }) {
  const [historyVisible, setHistoryVisible] = useState(false);
  const recentPayments = useMemo(() => sortHouseholdPayments(household.settlements).slice(0, 5), [household.settlements]);

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>ACERTOS DA CASA</Text>
          <Text style={styles.title}>Pagamentos</Text>
        </View>
        {recentPayments.length > 0 ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Ver todos os pagamentos da casa" onPress={() => setHistoryVisible(true)} style={styles.seeAll}>
            <Text style={styles.seeAllText}>Ver tudo</Text>
          </Pressable>
        ) : null}
      </View>
      {recentPayments.length > 0 ? recentPayments.map((payment) => (
        <HouseholdPaymentRow key={payment.id} payment={payment} currency={household.currency} />
      )) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Ainda sem pagamentos</Text>
          <Text style={styles.emptyText}>Os pagamentos entre integrantes vão aparecer aqui.</Text>
        </View>
      )}
      {historyVisible ? (
        <HouseholdPaymentHistorySheet householdId={household.id} currency={household.currency} onClose={() => setHistoryVisible(false)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 26 },
  heading: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  headingCopy: { flex: 1 },
  eyebrow: { color: colors.income, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 20, fontWeight: "700", letterSpacing: -0.4, marginTop: 5 },
  seeAll: { alignItems: "center", justifyContent: "center", backgroundColor: "#E5EDDC", borderRadius: 13, minHeight: 44, paddingHorizontal: 12 },
  seeAllText: { color: colors.income, fontSize: 11, fontWeight: "700" },
  empty: { backgroundColor: "#FFFEFA", borderColor: "#E2E6DB", borderWidth: 1, borderRadius: 18, padding: 20 },
  emptyTitle: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  emptyText: { color: colors.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 5 },
});
