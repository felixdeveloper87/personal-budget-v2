import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HouseholdExpenseHistorySheet } from "@/features/household/HouseholdExpenseHistorySheet";
import { HouseholdExpenseRow } from "@/features/household/HouseholdExpenseRow";
import { HouseholdProofModal } from "@/features/household/HouseholdProofViewer";
import { sortHouseholdExpenses } from "@/features/household/expenseHistory";
import { colors } from "@/theme/colors";
import type { HouseholdExpense, HouseholdHeroData } from "@/types/household";

export function HouseholdRecentActivity({ household }: { household: HouseholdHeroData }) {
  const [historyVisible, setHistoryVisible] = useState(false);
  const [proofExpense, setProofExpense] = useState<HouseholdExpense | null>(null);
  const recentExpenses = useMemo(() => sortHouseholdExpenses(household.expenses).slice(0, 5), [household.expenses]);

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>DESPESAS DA CASA</Text>
          <Text style={styles.title}>Atividades recentes</Text>
        </View>
        {recentExpenses.length > 0 ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Ver todas as despesas da casa" onPress={() => setHistoryVisible(true)} style={styles.seeAll}>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </Pressable>
        ) : null}
      </View>
      {recentExpenses.length > 0 ? recentExpenses.map((expense) => (
        <HouseholdExpenseRow key={expense.id} expense={expense} currency={household.currency} currentMemberId={household.currentMemberId} onOpenAttachments={setProofExpense} showArtwork />
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
