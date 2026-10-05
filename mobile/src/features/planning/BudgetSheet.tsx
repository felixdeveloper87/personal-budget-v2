import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { nu } from "@/components/dashboard/nuTheme";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, deleteCategoryBudget, upsertCategoryBudget } from "@/services/api";
import type { CategoryBudget } from "@/types/planning";
import { parseGoalAmount } from "../goals/goalUtils";

const close = { ios: "xmark", android: "close", web: "close" } as const;

/** Create (budget == null) or edit a category limit for the given month. */
export function BudgetSheet({ budget, month, suggestions, onClose, onSaved }: {
  budget: CategoryBudget | null;
  month: Date;
  suggestions: string[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState(budget?.category ?? "");
  const [limit, setLimit] = useState(budget ? String(budget.limitAmount) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(month);
  const shown = suggestions.filter((item) => !category.trim() || item.toLowerCase().includes(category.trim().toLowerCase())).slice(0, 6);

  async function submit() {
    if (!user || busy.current) return;
    const limitAmount = parseGoalAmount(limit);
    if (!category.trim() || !Number.isFinite(limitAmount) || limitAmount <= 0) {
      setError("Informe uma categoria e um limite maior que zero."); return;
    }
    busy.current = true; setSaving(true); setError(null); Keyboard.dismiss();
    try {
      await upsertCategoryBudget(user.token, { category: category.trim(), limitAmount, year: month.getFullYear(), month: month.getMonth() + 1 });
      onSaved("Limite salvo.");
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) { await logout(); return; }
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar. Tente novamente.");
    } finally { busy.current = false; setSaving(false); }
  }

  async function remove() {
    if (!user || !budget || busy.current) return;
    busy.current = true; setSaving(true); setError(null);
    try {
      await deleteCategoryBudget(user.token, budget.id);
      onSaved("Limite removido.");
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) { await logout(); return; }
      setError(cause instanceof Error ? cause.message : "Não foi possível remover. Tente novamente.");
    } finally { busy.current = false; setSaving(false); }
  }

  const dismiss = () => { if (!busy.current) onClose(); };
  return <Modal transparent visible animationType="slide" onRequestClose={dismiss}>
    <View style={styles.overlay}>
      <Pressable accessibilityLabel="Fechar" onPress={dismiss} disabled={saving} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.sheet, { marginTop: insets.top + 16 }]}>
        <View style={styles.grabber} />
        <View style={styles.header}>
          <View style={styles.copy}><Text style={styles.title}>{budget ? "Editar limite" : "Novo limite"}</Text><Text style={styles.caption}>{monthLabel}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={dismiss} disabled={saving} style={styles.close}><SymbolView name={close} size={16} tintColor={nu.inkSoft} /></Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <View>
            <Text style={styles.label}>Categoria</Text>
            <TextInput accessibilityLabel="Categoria" value={category} onChangeText={setCategory} editable={!saving && !budget} maxLength={60} placeholder="Ex.: Supermercado" placeholderTextColor={nu.inkFaint} style={[styles.input, budget && { opacity: 0.6 }]} />
            {!budget && shown.length > 0 ? <View style={styles.chips}>{shown.map((item) => <Pressable key={item} accessibilityRole="button" onPress={() => setCategory(item)} style={styles.chip}><Text style={styles.chipText}>{item}</Text></Pressable>)}</View> : null}
          </View>
          <View>
            <Text style={styles.label}>Limite mensal (£)</Text>
            <TextInput accessibilityLabel="Limite mensal" value={limit} onChangeText={setLimit} editable={!saving} keyboardType="decimal-pad" placeholder="0,00" placeholderTextColor={nu.inkFaint} style={styles.input} />
          </View>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving, busy: saving }} disabled={saving} onPress={() => void submit()} style={({ pressed }) => [styles.button, (pressed || saving) && { opacity: 0.6 }]}>
            {saving ? <ActivityIndicator color={nu.white} /> : <Text style={styles.buttonText}>Salvar limite</Text>}
          </Pressable>
          {budget ? <Pressable accessibilityRole="button" disabled={saving} onPress={() => void remove()} style={styles.remove}><Text style={styles.removeText}>Remover limite</Text></Pressable> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(20,20,26,0.45)" },
  sheet: { maxHeight: "94%", backgroundColor: nu.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8 },
  grabber: { width: 40, height: 5, borderRadius: 3, alignSelf: "center", backgroundColor: nu.track, marginBottom: 14 },
  header: { paddingHorizontal: 20, paddingBottom: 18, flexDirection: "row", alignItems: "center", gap: 12 },
  copy: { flex: 1, minWidth: 0 },
  title: { color: nu.ink, fontSize: 20, fontWeight: "700" },
  caption: { color: nu.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 4, textTransform: "capitalize" },
  close: { width: 44, height: 44, backgroundColor: nu.surface, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 20, gap: 18 },
  label: { color: nu.inkSoft, fontSize: 13, marginBottom: 8 },
  input: { minHeight: 48, backgroundColor: nu.surface, borderRadius: 14, paddingHorizontal: 14, color: nu.ink, fontSize: 16 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { minHeight: 36, justifyContent: "center", paddingHorizontal: 14, borderRadius: 999, backgroundColor: nu.brandTint },
  chipText: { color: nu.brand, fontSize: 13, fontWeight: "600" },
  button: { minHeight: 48, borderRadius: 999, backgroundColor: nu.brand, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, marginTop: 4 },
  buttonText: { color: nu.white, fontSize: 14, fontWeight: "600" },
  remove: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  removeText: { color: nu.negative, fontSize: 14, fontWeight: "600" },
  error: { color: nu.negative, backgroundColor: nu.negativeTint, padding: 14, borderRadius: 12, fontSize: 13, lineHeight: 20 },
});
