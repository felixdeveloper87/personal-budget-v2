import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { nu } from "@/components/dashboard/nuTheme";
import type { SavingsGoal } from "@/types/goals";
import { dateLabel, GOAL_COLORS, money, monthsUntil } from "./goalUtils";

type SymbolName = ComponentProps<typeof SymbolView>["name"];
export const goalIcons = {
  target: { ios: "target", android: "track_changes", web: "track_changes" },
  plus: { ios: "plus", android: "add", web: "add" },
  edit: { ios: "pencil", android: "edit", web: "edit" },
  archive: { ios: "archivebox", android: "archive", web: "archive" },
  check: { ios: "checkmark", android: "check", web: "check" },
  close: { ios: "xmark", android: "close", web: "close" },
  calendar: { ios: "calendar", android: "calendar_month", web: "calendar_month" },
} satisfies Record<string, SymbolName>;

export function GoalCard({ goal, now, onContribute, onEdit, onArchive }: { goal: SavingsGoal; now: Date; onContribute: () => void; onEdit: () => void; onArchive: () => void }) {
  const done = goal.progressPercentage >= 100;
  const progress = Math.min(100, Math.max(0, goal.progressPercentage));
  const color = /^#[0-9a-f]{6}$/i.test(goal.color) ? goal.color : GOAL_COLORS[0];
  const months = monthsUntil(goal.targetDate, now);
  const circumference = 2 * Math.PI * 34;
  const badge = done ? "Meta atingida" : months === 0 ? "Prazo vencido" : months !== null ? `${months} ${months === 1 ? "mês" : "meses"} · ${money(goal.remainingAmount / months)}/mês` : null;
  return <View style={styles.card}>
    <View style={styles.top}>
      <View accessibilityRole="progressbar" accessibilityLabel={`Progresso de ${goal.name}`} accessibilityValue={{ min: 0, max: 100, now: progress }} style={styles.ring}>
        <Svg width={84} height={84} viewBox="0 0 84 84">
          <Circle cx={42} cy={42} r={34} fill="none" stroke={nu.track} strokeWidth={8} />
          {progress > 0 ? <Circle cx={42} cy={42} r={34} fill="none" stroke={done ? nu.positive : color} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - progress / 100)} rotation={-90} origin="42, 42" /> : null}
        </Svg>
        <View style={styles.ringLabel}>{done ? <SymbolView name={goalIcons.check} size={25} tintColor={nu.positive} weight="semibold" /> : <Text style={styles.percent}>{Math.round(progress)}%</Text>}</View>
      </View>
      <View style={styles.copy}>
        <View style={styles.nameRow}><View style={[styles.colorDot, { backgroundColor: color }]} /><Text numberOfLines={2} style={styles.name}>{goal.name}</Text></View>
        <Text adjustsFontSizeToFit minimumFontScale={0.65} numberOfLines={1} style={styles.saved}>{money(goal.currentAmount)}</Text>
        <Text style={styles.caption}>Meta {money(goal.targetAmount)}{goal.targetDate ? ` · ${dateLabel(goal.targetDate)}` : ""}</Text>
      </View>
    </View>
    {badge ? <View style={[styles.badge, done && styles.doneBadge, !done && months === 0 && styles.overdueBadge]}><Text style={[styles.badgeText, done && { color: nu.positive }, !done && months === 0 && { color: nu.negative }]}>{badge}</Text></View> : null}
    <View style={styles.actions}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Guardar ou retirar em ${goal.name}`} onPress={onContribute} style={({ pressed }) => [styles.save, pressed && styles.pressed]}><Text style={styles.saveText}>Guardar</Text></Pressable>
      <View style={styles.tools}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Editar meta ${goal.name}`} onPress={onEdit} style={({ pressed }) => [styles.tool, pressed && styles.pressed]}><SymbolView name={goalIcons.edit} size={18} tintColor={nu.inkSoft} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Arquivar meta ${goal.name}`} onPress={onArchive} style={({ pressed }) => [styles.tool, pressed && styles.pressed]}><SymbolView name={goalIcons.archive} size={18} tintColor={nu.inkFaint} /></Pressable>
      </View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: nu.surface, borderRadius: 20, padding: 16, gap: 16 },
  top: { flexDirection: "row", alignItems: "center", gap: 16 },
  ring: { width: 84, height: 84 },
  ringLabel: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  percent: { color: nu.ink, fontSize: 17, fontWeight: "700" },
  copy: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  colorDot: { width: 8, height: 8, borderRadius: 4 },
  name: { flex: 1, color: nu.ink, fontSize: 16, fontWeight: "700" },
  saved: { color: nu.ink, fontSize: 22, fontWeight: "700", letterSpacing: -0.4, marginTop: 4, fontVariant: ["tabular-nums"] },
  caption: { color: nu.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 2 },
  badge: { alignSelf: "flex-start", backgroundColor: nu.brandTint, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  doneBadge: { backgroundColor: nu.positiveTint },
  overdueBadge: { backgroundColor: nu.negativeTint },
  badgeText: { color: nu.brand, fontSize: 12, fontWeight: "600" },
  actions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  save: { minHeight: 44, paddingHorizontal: 22, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: nu.brand },
  saveText: { color: nu.white, fontSize: 14, fontWeight: "600" },
  tools: { flexDirection: "row", gap: 4 },
  tool: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.6 },
});
