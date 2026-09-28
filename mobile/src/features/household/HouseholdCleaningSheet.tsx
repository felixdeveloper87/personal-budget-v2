import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cleaningDutyCopy } from "@/features/household/cleaningDuties";
import { HouseholdCleaningProgress } from "@/features/household/HouseholdCleaningProgress";
import { colors } from "@/theme/colors";
import type { HouseholdCleaningDuty } from "@/types/household";

interface Props {
  duties: HouseholdCleaningDuty[];
  guidance: string;
  canEdit: boolean;
  busyKey: string | null;
  error: string | null;
  onToggle: (duty: HouseholdCleaningDuty) => void;
  onRefresh: () => void;
  onClose: () => void;
}

export function HouseholdCleaningSheet({ duties, guidance, canEdit, busyKey, error, onToggle, onRefresh, onClose }: Props) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  return (
    <Modal animationType="slide" transparent visible statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar tarefas de limpeza" onPress={onClose} style={styles.backdrop} />
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.copy}>
              <Text style={styles.eyebrow}>CUIDADOS DA CASA</Text>
              <Text style={styles.title}>Checklist da semana</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar tarefas de limpeza" onPress={onClose} style={styles.close}>
              <SymbolView name={{ ios: "xmark", android: "close", web: "close" }} size={18} tintColor={colors.ink} />
            </Pressable>
          </View>
          <View style={styles.summary}>
            <Text style={styles.guidance}>{guidance}</Text>
            <HouseholdCleaningProgress duties={duties} />
          </View>
          {error ? (
            <View style={styles.errorBox}>
              <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
              <Pressable accessibilityRole="button" disabled={busyKey !== null} onPress={onRefresh} style={styles.refresh}>
                {busyKey === "refresh" ? <ActivityIndicator color={colors.income} /> : <Text style={styles.refreshText}>Atualizar checklist</Text>}
              </Pressable>
            </View>
          ) : null}
          <ScrollView contentContainerStyle={styles.list}>
            {duties.map((duty) => {
              const copy = cleaningDutyCopy(duty);
              const allowed = canEdit && duty.canToggle;
              const expanded = expandedKey === duty.key;
              const saving = busyKey === duty.key;
              return (
                <View key={duty.key} style={[styles.duty, duty.completed && styles.completedDuty]}>
                  <View style={styles.dutyRow}>
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityLabel={copy.label}
                      accessibilityState={{ checked: duty.completed, disabled: !allowed || busyKey !== null, busy: saving }}
                      disabled={!allowed || busyKey !== null}
                      onPress={() => onToggle(duty)}
                      style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
                    >
                      <View style={[styles.checkbox, duty.completed && styles.checked, !allowed && !duty.completed && styles.readonlyCheckbox]}>
                        {saving ? <ActivityIndicator size="small" color={duty.completed ? "#FFFFFF" : colors.income} /> : duty.completed ? (
                          <SymbolView name={{ ios: "checkmark", android: "check", web: "check" }} size={15} tintColor="#FFFFFF" />
                        ) : null}
                      </View>
                      <View style={styles.copy}>
                        <Text style={[styles.dutyLabel, duty.completed && styles.completedLabel]}>{copy.label}</Text>
                        {copy.schedule ? <Text style={styles.schedule}>{copy.schedule}</Text> : null}
                      </View>
                    </Pressable>
                    {copy.instruction ? (
                      <Pressable accessibilityRole="button" accessibilityLabel={`Instruções: ${copy.label}`} accessibilityState={{ expanded }} onPress={() => setExpandedKey(expanded ? null : duty.key)} style={styles.info}>
                        <SymbolView name={{ ios: expanded ? "chevron.up" : "info.circle", android: expanded ? "expand_less" : "info", web: expanded ? "expand_less" : "info" }} size={18} tintColor={colors.inkSoft} />
                      </Pressable>
                    ) : null}
                  </View>
                  {expanded ? <Text style={styles.instruction}>{copy.instruction}</Text> : null}
                </View>
              );
            })}
          </ScrollView>
          <View style={styles.footer}>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.done}>
              <Text style={styles.doneText}>Fechar checklist</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(19,36,28,0.48)" },
  sheet: { height: "80%", width: "100%", maxWidth: 640, alignSelf: "center", backgroundColor: "#F6F5EF", borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: "hidden" },
  handle: { alignSelf: "center", backgroundColor: "#C6D1C1", borderRadius: 3, height: 5, width: 36, marginTop: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, padding: 18 },
  copy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.income, fontSize: 9, letterSpacing: 1.2, fontWeight: "800" },
  title: { color: colors.ink, fontSize: 20, fontWeight: "700", marginTop: 5 },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#EAEDE4", alignItems: "center", justifyContent: "center" },
  summary: { backgroundColor: "#EAF0E3", borderRadius: 16, padding: 14, marginHorizontal: 16, marginBottom: 12, gap: 12 },
  guidance: { color: colors.inkSoft, fontSize: 12, lineHeight: 18 },
  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  duty: { backgroundColor: "#FFFEFA", borderWidth: 1, borderColor: "#E2E6DB", borderRadius: 14, overflow: "hidden" },
  completedDuty: { backgroundColor: "#EFF4E9" },
  dutyRow: { flexDirection: "row", alignItems: "center" },
  toggle: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, padding: 12, minHeight: 56 },
  pressed: { opacity: 0.65 },
  checkbox: { height: 24, width: 24, borderRadius: 8, borderWidth: 1.5, borderColor: "#8AA07C", alignItems: "center", justifyContent: "center" },
  checked: { backgroundColor: "#618258", borderColor: "#618258" },
  readonlyCheckbox: { borderColor: "#C6D1C1" },
  dutyLabel: { color: colors.ink, fontSize: 12, fontWeight: "600", lineHeight: 17 },
  completedLabel: { color: colors.income },
  schedule: { color: "#80652D", fontSize: 10, fontWeight: "600", marginTop: 4 },
  info: { width: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  instruction: { color: colors.inkSoft, fontSize: 12, lineHeight: 18, paddingHorizontal: 14, paddingBottom: 14 },
  errorBox: { marginHorizontal: 16, marginBottom: 12 },
  error: { color: colors.danger, fontSize: 12, lineHeight: 18 },
  refresh: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center" },
  refreshText: { color: colors.income, fontSize: 12, fontWeight: "700" },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: "#E2E6DB" },
  done: { minHeight: 46, backgroundColor: "#E0EAD6", borderRadius: 14, alignItems: "center", justifyContent: "center" },
  doneText: { color: colors.income, fontSize: 13, fontWeight: "700" },
});
