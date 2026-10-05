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
const chevron = { ios: "chevron.down", android: "expand_more", web: "expand_more" } as const;
const check = { ios: "checkmark", android: "check", web: "check" } as const;

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
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [limit, setLimit] = useState(budget ? String(budget.limitAmount) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(month);
  const categories = budget ? [budget.category] : suggestions;
  const valid = categories.includes(category) && Number.isFinite(parseGoalAmount(limit)) && parseGoalAmount(limit) > 0;

  async function submit() {
    if (!user || busy.current) return;
    const limitAmount = parseGoalAmount(limit);
    if (!categories.includes(category) || !Number.isFinite(limitAmount) || limitAmount <= 0) {
      setError("Selecione uma categoria e informe um limite maior que zero."); return;
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
            {budget ? <View style={styles.categoryTrigger}><Text style={styles.categoryText}>{category}</Text></View> : <>
              <Pressable accessibilityRole="combobox" accessibilityLabel="Selecionar categoria" accessibilityState={{ expanded: categoryOpen, disabled: saving }} disabled={saving} onPress={() => { Keyboard.dismiss(); setCategoryOpen((open) => !open); }} style={styles.categoryTrigger}>
                <Text style={[styles.categoryText, !category && { color: nu.inkFaint }]}>{category || "Selecione uma categoria"}</Text>
                <SymbolView name={chevron} size={17} tintColor={nu.inkSoft} style={categoryOpen ? { transform: [{ rotate: "180deg" }] } : undefined} />
              </Pressable>
              {categoryOpen ? <View style={styles.dropdown}>
                {categories.length ? <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={styles.categoryList}>
                  {categories.map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: category === item, disabled: saving }} disabled={saving} onPress={() => { setCategory(item); setCategoryOpen(false); setError(null); }} style={({ pressed }) => [styles.categoryOption, category === item && styles.selectedOption, pressed && { backgroundColor: nu.surface }]}>
                    <Text style={[styles.categoryText, category === item && { color: nu.brand, fontWeight: "600" }]}>{item}</Text>
                    {category === item ? <SymbolView name={check} size={16} tintColor={nu.brand} /> : null}
                  </Pressable>)}
                </ScrollView> : <Text style={styles.emptyCategories}>Todas as categorias já têm limite neste mês.</Text>}
              </View> : null}
            </>}
          </View>
          <View>
            <Text style={styles.label}>Limite mensal (£)</Text>
            <TextInput accessibilityLabel="Limite mensal" value={limit} onChangeText={setLimit} editable={!saving} keyboardType="decimal-pad" placeholder="0,00" placeholderTextColor={nu.inkFaint} style={styles.input} />
          </View>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: saving || !valid, busy: saving }} disabled={saving || !valid} onPress={() => void submit()} style={({ pressed }) => [styles.button, (pressed || saving || !valid) && { opacity: 0.6 }]}>
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
  categoryTrigger: { minHeight: 48, backgroundColor: nu.surface, borderRadius: 14, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  categoryText: { color: nu.ink, fontSize: 16, flex: 1 },
  dropdown: { marginTop: 6, borderRadius: 14, borderWidth: 1, borderColor: nu.track, backgroundColor: nu.white, overflow: "hidden" },
  categoryList: { maxHeight: 220 },
  categoryOption: { minHeight: 48, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  selectedOption: { backgroundColor: nu.brandTint },
  emptyCategories: { color: nu.inkSoft, fontSize: 13, lineHeight: 20, padding: 14 },
  button: { minHeight: 48, borderRadius: 999, backgroundColor: nu.brand, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, marginTop: 4 },
  buttonText: { color: nu.white, fontSize: 14, fontWeight: "600" },
  remove: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  removeText: { color: nu.negative, fontSize: 14, fontWeight: "600" },
  error: { color: nu.negative, backgroundColor: nu.negativeTint, padding: 14, borderRadius: 12, fontSize: 13, lineHeight: 20 },
});
