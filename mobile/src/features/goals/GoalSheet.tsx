import DateTimePicker from "@expo/ui/community/datetime-picker";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { nu } from "@/components/dashboard/nuTheme";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, archiveSavingsGoal, contributeToSavingsGoal, createSavingsGoal, updateSavingsGoal } from "@/services/api";
import type { SavingsGoal, SavingsGoalRequest } from "@/types/goals";
import { toLocalIsoDate } from "@/utils/period";
import { goalIcons } from "./GoalCard";
import { GOAL_COLORS, GOAL_COLOR_NAMES, goalDateInput, money, parseGoalAmount, parseGoalDate } from "./goalUtils";

export type GoalAction = { kind: "form"; goal: SavingsGoal | null } | { kind: "contribute" | "archive"; goal: SavingsGoal };

export function GoalSheet({ action, onClose, onSaved }: { action: GoalAction; onClose: () => void; onSaved: (goal: SavingsGoal | null, message: string) => void }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const goal = action.goal;
  const [name, setName] = useState(goal?.name ?? "");
  const [target, setTarget] = useState(goal ? String(goal.targetAmount) : "");
  const [current, setCurrent] = useState(goal ? String(goal.currentAmount) : "");
  const [date, setDate] = useState(goal?.targetDate ? goal.targetDate.split("-").reverse().join("/") : "");
  const [color, setColor] = useState(goal?.color || GOAL_COLORS[0]);
  const [mode, setMode] = useState<"in" | "out">("in");
  const [amount, setAmount] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const title = action.kind === "form" ? goal ? "Editar meta" : "Nova meta" : action.kind === "archive" ? "Arquivar meta" : goal!.name;
  const caption = action.kind === "form" ? "Dê um nome, um valor e uma data" : action.kind === "archive" ? goal!.name : `Economizado ${money(goal!.currentAmount)} · Faltam ${money(goal!.remainingAmount)}`;
  const parsedDate = parseGoalDate(date);
  const pickerDate = parsedDate ? new Date(`${parsedDate}T12:00:00`) : new Date();
  const close = () => { if (!busy.current) onClose(); };

  async function submit() {
    if (!user || busy.current) return;
    let payload: SavingsGoalRequest | null = null;
    let contribution = 0;
    setError(null);
    if (action.kind === "form") {
      const targetAmount = parseGoalAmount(target);
      const currentAmount = current.trim() ? parseGoalAmount(current) : 0;
      if (!name.trim() || !Number.isFinite(targetAmount) || targetAmount <= 0 || !Number.isFinite(currentAmount) || currentAmount < 0) {
        setError("Informe um nome, uma meta maior que zero e um valor guardado válido."); return;
      }
      if (date && !parsedDate) { setError("Informe uma data válida no formato DD/MM/AAAA ou deixe o prazo em branco."); return; }
      payload = { name: name.trim(), targetAmount, currentAmount, targetDate: parsedDate, color };
    } else if (action.kind === "contribute") {
      contribution = parseGoalAmount(amount);
      if (!Number.isFinite(contribution) || contribution <= 0) { setError("Informe um valor maior que zero."); return; }
      if (mode === "out" && Math.round(contribution * 100) > Math.round(goal!.currentAmount * 100)) { setError("A retirada não pode ser maior que o valor guardado."); return; }
    }
    busy.current = true;
    setSaving(true);
    Keyboard.dismiss();
    try {
      if (action.kind === "form") {
        const saved = goal ? await updateSavingsGoal(user.token, goal.id, payload!) : await createSavingsGoal(user.token, payload!);
        onSaved(saved, goal ? "Meta atualizada." : "Meta criada.");
      } else if (action.kind === "contribute") {
        const saved = await contributeToSavingsGoal(user.token, goal!.id, mode === "in" ? contribution : -contribution);
        onSaved(saved, mode === "in" ? "Contribuição adicionada." : "Retirada registrada.");
      } else {
        await archiveSavingsGoal(user.token, goal!.id);
        onSaved(null, "Meta arquivada.");
      }
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) { await logout(); return; }
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar. Tente novamente.");
    } finally { busy.current = false; setSaving(false); }
  }

  function chooseDate(value: Date) {
    setDate(toLocalIsoDate(value).split("-").reverse().join("/"));
    if (Platform.OS !== "ios") setPickerOpen(false);
  }
  return <Modal transparent visible animationType="slide" onRequestClose={close}>
    <View style={styles.overlay}>
      <Pressable accessibilityLabel="Fechar" onPress={close} disabled={saving} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.sheet, { marginTop: insets.top + 16 }]}>
        <View style={styles.grabber} />
        <View style={styles.header}><View style={styles.copy}><Text style={styles.title}>{title}</Text><Text style={styles.caption}>{caption}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={close} disabled={saving} style={styles.close}><SymbolView name={goalIcons.close} size={16} tintColor={nu.inkSoft} /></Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          {action.kind === "form" ? <>
            <Field label="Nome" value={name} onChange={setName} placeholder="Viagem, reserva de emergência…" maxLength={80} disabled={saving} />
            <View style={styles.amountFields}><View style={styles.copy}><Field label="Meta (£)" value={target} onChange={setTarget} numeric disabled={saving} /></View><View style={styles.copy}><Field label="Já guardado (£)" value={current} onChange={setCurrent} numeric disabled={saving || Boolean(goal)} /></View></View>
            {goal ? <Text style={styles.caption}>Use Guardar ou Retirar para alterar o valor economizado.</Text> : null}
            <View>
              <Text style={styles.label}>Data-alvo (opcional)</Text>
              {Platform.OS === "web" ? <TextInput accessibilityLabel="Data-alvo" value={date} onChangeText={(value) => setDate(goalDateInput(value))} editable={!saving} placeholder="DD/MM/AAAA" placeholderTextColor={nu.inkFaint} keyboardType="number-pad" maxLength={10} style={styles.input} /> : <>
                <Pressable accessibilityRole="button" accessibilityLabel="Escolher data-alvo" disabled={saving} onPress={() => { Keyboard.dismiss(); setPickerOpen((value) => !value); }} style={styles.dateButton}><Text style={[styles.dateText, !date && { color: nu.inkFaint }]}>{date || "Escolher data"}</Text><SymbolView name={goalIcons.calendar} size={18} tintColor={nu.brand} /></Pressable>
                {pickerOpen && Platform.OS === "ios" ? <View style={styles.calendar}>
                  <DateTimePicker accentColor={nu.brand} disabled={saving} display="inline" locale="pt_BR" mode="date" onValueChange={(_event, value) => chooseDate(value)} themeVariant="light" value={pickerDate} style={{ height: 350, width: "100%" }} />
                  <Pressable accessibilityRole="button" onPress={() => setPickerOpen(false)} style={styles.calendarClose}><Text style={styles.link}>Concluir</Text></Pressable>
                </View> : pickerOpen ? <DateTimePicker mode="date" negativeButton={{ label: "Cancelar" }} positiveButton={{ label: "Escolher" }} onDismiss={() => setPickerOpen(false)} onValueChange={(_event, value) => chooseDate(value)} presentation="dialog" value={pickerDate} style={{ height: 0 }} /> : null}
              </>}
              {date ? <Pressable accessibilityRole="button" disabled={saving} onPress={() => { setDate(""); setPickerOpen(false); }} style={styles.clearDate}><Text style={styles.link}>Remover prazo</Text></Pressable> : null}
            </View>
            <View><Text style={styles.label}>Cor</Text><View style={styles.colors}>
              {GOAL_COLORS.map((option, index) => <Pressable accessibilityRole="radio" accessibilityLabel={GOAL_COLOR_NAMES[index]} accessibilityState={{ checked: color.toLowerCase() === option }} key={option} disabled={saving} onPress={() => setColor(option)} style={[styles.colorChoice, color.toLowerCase() === option && { borderColor: option }]}>
                <View style={[styles.colorSwatch, { backgroundColor: option }]}>{color.toLowerCase() === option ? <SymbolView name={goalIcons.check} size={16} tintColor={nu.white} weight="bold" /> : null}</View>
              </Pressable>)}
            </View></View>
            <PrimaryButton label={goal ? "Salvar alterações" : "Criar meta"} onPress={() => void submit()} saving={saving} />
          </> : action.kind === "contribute" ? <>
            <View style={styles.segments}>{(["in", "out"] as const).map((option) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: mode === option }} disabled={saving} key={option} onPress={() => { setMode(option); setError(null); }} style={[styles.segment, mode === option && styles.selectedSegment]}><Text style={[styles.segmentText, mode === option && styles.selectedSegmentText]}>{option === "in" ? "Guardar" : "Retirar"}</Text></Pressable>)}</View>
            <Field label="Valor (£)" value={amount} onChange={setAmount} numeric disabled={saving} large />
            <PrimaryButton label="Aplicar" onPress={() => void submit()} saving={saving} />
          </> : <>
            <View style={styles.archiveInfo}><SymbolView name={goalIcons.archive} size={30} tintColor={nu.brand} /><Text style={styles.archiveTitle}>Arquivar {goal!.name}?</Text><Text style={styles.archiveCaption}>A meta deixará de aparecer na lista e no resumo. Os valores e o histórico serão preservados.</Text></View>
            <PrimaryButton label="Arquivar meta" onPress={() => void submit()} saving={saving} />
            <Pressable accessibilityRole="button" disabled={saving} onPress={close} style={styles.cancel}><Text style={styles.link}>Voltar</Text></Pressable>
          </>}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  </Modal>;
}

function Field({ label, value, onChange, placeholder = "0,00", numeric, disabled, maxLength, large }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; numeric?: boolean; disabled?: boolean; maxLength?: number; large?: boolean }) {
  return <View><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChange} editable={!disabled} keyboardType={numeric ? "decimal-pad" : "default"} maxLength={maxLength} placeholder={placeholder} placeholderTextColor={nu.inkFaint} style={[styles.input, large && styles.largeInput, disabled && { opacity: 0.6 }]} /></View>;
}
function PrimaryButton({ label, onPress, saving }: { label: string; onPress: () => void; saving: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: saving, busy: saving }} disabled={saving} onPress={onPress} style={({ pressed }) => [styles.button, (pressed || saving) && { opacity: 0.6 }]}>{saving ? <ActivityIndicator color={nu.white} /> : <Text style={styles.buttonText}>{label}</Text>}</Pressable>;
}
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(20,20,26,0.45)" },
  sheet: { maxHeight: "94%", backgroundColor: nu.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8 },
  grabber: { width: 40, height: 5, borderRadius: 3, alignSelf: "center", backgroundColor: nu.track, marginBottom: 14 },
  header: { paddingHorizontal: 20, paddingBottom: 18, flexDirection: "row", alignItems: "center", gap: 12 },
  copy: { flex: 1, minWidth: 0 },
  title: { color: nu.ink, fontSize: 20, fontWeight: "700" },
  caption: { color: nu.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 4 },
  close: { width: 44, height: 44, backgroundColor: nu.surface, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 20, gap: 18 },
  label: { color: nu.inkSoft, fontSize: 13, marginBottom: 8 },
  input: { minHeight: 48, backgroundColor: nu.surface, borderRadius: 14, paddingHorizontal: 14, color: nu.ink, fontSize: 16 },
  largeInput: { minHeight: 60, fontSize: 24, fontWeight: "700", textAlign: "center" },
  amountFields: { flexDirection: "row", gap: 12 },
  dateButton: { minHeight: 48, backgroundColor: nu.surface, borderRadius: 14, paddingHorizontal: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateText: { fontSize: 16, color: nu.ink },
  calendar: { marginTop: 10, borderRadius: 14, backgroundColor: nu.surface, overflow: "hidden" },
  calendarClose: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  clearDate: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center" },
  link: { fontSize: 13, fontWeight: "600", color: nu.brand },
  colors: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  colorChoice: { width: 44, height: 44, borderWidth: 2, borderColor: "transparent", borderRadius: 22, alignItems: "center", justifyContent: "center" },
  colorSwatch: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  button: { minHeight: 48, borderRadius: 999, backgroundColor: nu.brand, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, marginTop: 4 },
  buttonText: { color: nu.white, fontSize: 14, fontWeight: "600" },
  error: { color: nu.negative, backgroundColor: nu.negativeTint, padding: 14, borderRadius: 12, fontSize: 13, lineHeight: 20 },
  segments: { flexDirection: "row", backgroundColor: nu.surface, borderRadius: 999, padding: 4 },
  segment: { flex: 1, borderRadius: 999, minHeight: 44, alignItems: "center", justifyContent: "center" },
  selectedSegment: { backgroundColor: nu.brand },
  segmentText: { color: nu.inkSoft, fontSize: 14, fontWeight: "600" },
  selectedSegmentText: { color: nu.white },
  archiveInfo: { backgroundColor: nu.surface, borderRadius: 20, padding: 24, alignItems: "center", gap: 12 },
  archiveTitle: { color: nu.ink, fontSize: 17, fontWeight: "700", textAlign: "center" },
  archiveCaption: { color: nu.inkSoft, fontSize: 13, lineHeight: 20, textAlign: "center" },
  cancel: { minHeight: 44, alignItems: "center", justifyContent: "center" },
});
