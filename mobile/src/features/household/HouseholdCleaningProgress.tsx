import { StyleSheet, Text, View } from "react-native";

import { nu } from "@/components/dashboard/nuTheme";
import type { HouseholdCleaningDuty } from "@/types/household";

export function HouseholdCleaningProgress({ duties }: { duties: HouseholdCleaningDuty[] }) {
  const completed = duties.filter((duty) => duty.completed).length;
  return (
    <View style={styles.wrapper}>
      <Text accessibilityLiveRegion="polite" style={styles.label}>{completed} de {duties.length} tarefas concluídas</Text>
      <View accessibilityRole="progressbar" accessibilityLabel="Progresso da limpeza" accessibilityValue={{ min: 0, max: duties.length, now: completed }} style={styles.track}>
        <View style={[styles.fill, { width: `${duties.length ? completed / duties.length * 100 : 0}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  label: { color: nu.inkSoft, fontSize: 12, fontWeight: "500" },
  track: { height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: nu.track },
  fill: { height: "100%", backgroundColor: nu.brand, borderRadius: 3 },
});
