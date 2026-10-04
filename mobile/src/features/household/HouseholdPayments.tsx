import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { HouseholdPaymentHistorySheet } from "@/features/household/HouseholdPaymentHistorySheet";
import { HouseholdPaymentRow } from "@/features/household/HouseholdPaymentRow";
import { sortHouseholdPayments } from "@/features/household/paymentHistory";
import { nu, nuSection } from "@/components/dashboard/nuTheme";
import type { HouseholdHeroData } from "@/types/household";

export function HouseholdPayments({ household }: { household: HouseholdHeroData }) {
  const [historyVisible, setHistoryVisible] = useState(false);
  const recentPayments = useMemo(() => sortHouseholdPayments(household.settlements).slice(0, 5), [household.settlements]);

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>Transferências</Text>
          <Text style={styles.subtitle}>Dinheiro enviado entre moradores para acertar saldos.</Text>
        </View>
        {recentPayments.length > 0 ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Ver todas as transferências entre moradores" onPress={() => setHistoryVisible(true)} style={styles.seeAll}>
            <Text style={styles.seeAllText}>Ver tudo</Text>
          </Pressable>
        ) : null}
      </View>
      {recentPayments.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        style={styles.carouselScroll}
          snapToInterval={200}
          snapToAlignment="start"
          decelerationRate="fast"
          nestedScrollEnabled
          directionalLockEnabled
        >
          {recentPayments.map((payment) => (
            <HouseholdPaymentRow key={payment.id} payment={payment} currency={household.currency} variant="carousel" />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nenhuma transferência ainda</Text>
          <Text style={styles.emptyText}>Quando um morador enviar dinheiro para acertar um saldo, a transferência aparece aqui.</Text>
        </View>
      )}
      {historyVisible ? (
        <HouseholdPaymentHistorySheet householdId={household.id} currency={household.currency} onClose={() => setHistoryVisible(false)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderTopColor: nu.hairline, borderTopWidth: 1, paddingHorizontal: 20, paddingVertical: 20 },
  heading: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  headingCopy: { flex: 1 },
  title: nuSection.title,
  subtitle: nuSection.subtitle,
  seeAll: { alignItems: "center", justifyContent: "center", backgroundColor: nu.brandTint, borderRadius: 999, minHeight: 34, paddingHorizontal: 14 },
  seeAllText: { color: nu.brand, fontSize: 12, fontWeight: "600" },
  // Bleeds to the screen edges so cards scroll under the gutter, Nubank-style.
  carouselScroll: { marginHorizontal: -20 },
  carousel: { gap: 10, paddingBottom: 2, paddingHorizontal: 20 },
  empty: { backgroundColor: nu.surface, borderRadius: 16, padding: 20 },
  emptyTitle: { color: nu.ink, fontSize: 14, fontWeight: "700" },
  emptyText: { color: nu.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 5 },
});
