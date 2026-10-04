import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HouseholdExpenseHistorySheet } from "@/features/household/HouseholdExpenseHistorySheet";
import { HouseholdExpenseRow } from "@/features/household/HouseholdExpenseRow";
import { HouseholdProofModal } from "@/features/household/HouseholdProofViewer";
import { sortHouseholdExpenses } from "@/features/household/expenseHistory";
import { nu, nuSection } from "@/components/dashboard/nuTheme";
import type { HouseholdExpense, HouseholdHeroData } from "@/types/household";

export function HouseholdRecentActivity({ household }: { household: HouseholdHeroData }) {
  const [historyVisible, setHistoryVisible] = useState(false);
  const [proofExpense, setProofExpense] = useState<HouseholdExpense | null>(null);
  const recentExpenses = useMemo(() => sortHouseholdExpenses(household.expenses).slice(0, 5), [household.expenses]);

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>Atividades recentes</Text>
        </View>
        {recentExpenses.length > 0 ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Ver todas as despesas da casa" onPress={() => setHistoryVisible(true)} style={styles.seeAll}>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </Pressable>
        ) : null}
      </View>
      {recentExpenses.length > 0 ? recentExpenses.map((expense) => (
        <HouseholdExpenseRow key={expense.id} expense={expense} currency={household.currency} currentMemberId={household.currentMemberId} onOpenAttachments={setProofExpense} twoTone />
      )) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Ainda sem despesas</Text>
          <Text style={styles.emptyText}>As últimas despesas da casa vão aparecer aqui.</Text>
        </View>
      )}
      {historyVisible ? (
        <HouseholdExpenseHistorySheet householdId={household.id} currency={household.currency} currentMemberId={household.currentMemberId} onClose={() => setHistoryVisible(false)} />
      ) : null}
      {proofExpense ? <HouseholdProofModal expense={proofExpense} householdId={household.id} onClose={() => setProofExpense(null)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderTopColor: nu.hairline, borderTopWidth: 1, paddingHorizontal: 20, paddingVertical: 20 },
  heading: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  headingCopy: { flex: 1 },
  title: nuSection.title,
  seeAll: { alignItems: "center", justifyContent: "center", backgroundColor: nu.brandTint, borderRadius: 999, minHeight: 34, paddingHorizontal: 14 },
  seeAllText: { color: nu.brand, fontSize: 12, fontWeight: "600" },
  empty: { backgroundColor: nu.surface, borderRadius: 16, padding: 20 },
  emptyTitle: { color: nu.ink, fontSize: 14, fontWeight: "700" },
  emptyText: { color: nu.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 5 },
});
