import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BankLogo } from "@/components/accounts/BankLogo";
import { useAuth } from "@/contexts/AuthContext";
import { createAccountTransfer, listAccounts } from "@/services/api";
import { colors } from "@/theme/colors";
import type { FinancialAccount } from "@/types/finance";

function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

interface Props {
  account: FinancialAccount;
  onClose: () => void;
  onTransferred: () => void;
  visible: boolean;
}

export function AccountTransferSheet({ account, onClose, onTransferred, visible }: Props) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !user) return;
    setAmount("");
    setDate(today());
    setDescription("");
    setError(null);
    setLoading(true);
    void listAccounts(user.token)
      .then((items) => {
        const targets = items.filter((item) => item.active && item.id !== account.id);
        setAccounts(targets);
        setTargetId(targets[0]?.id ?? null);
      })
      .catch(() => setError("Não foi possível carregar as contas de destino."))
      .finally(() => setLoading(false));
  }, [account.id, user, visible]);

  const parsedAmount = Number(amount.replace(",", "."));
  const canSubmit = targetId !== null && parsedAmount > 0 && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const selectedTarget = useMemo(() => accounts.find((item) => item.id === targetId), [accounts, targetId]);

  const submit = async () => {
    if (!user || !canSubmit || targetId === null) return;
    setSaving(true);
    setError(null);
    try {
      await createAccountTransfer(user.token, {
        amount: parsedAmount,
        description: description.trim() || undefined,
        fromAccountId: account.id,
        toAccountId: targetId,
        transferDate: date,
      });
      onClose();
      onTransferred();
    } catch {
      setError("Não foi possível concluir a transferência.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
        <Pressable accessibilityLabel="Fechar transferência" accessibilityRole="button" onPress={onClose} style={styles.backdrop} />
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>TRANSFERÊNCIA</Text>
              <Text style={styles.title}>Mover dinheiro</Text>
              <Text numberOfLines={1} style={styles.caption}>A partir de {account.name}</Text>
            </View>
            <Pressable accessibilityLabel="Fechar" accessibilityRole="button" disabled={saving} onPress={onClose} style={styles.closeButton}>
              <SymbolView name={{ ios: "xmark", android: "close", web: "close" }} size={18} tintColor={colors.ink} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>CONTA DE DESTINO</Text>
            {loading ? <ActivityIndicator color={colors.forest} style={styles.loader} /> : accounts.length === 0 ? (
              <View style={styles.notice}><Text style={styles.noticeText}>Você precisa de outra conta ativa para fazer uma transferência.</Text></View>
            ) : (
              <View style={styles.accountGrid}>
                {accounts.map((item) => (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: targetId === item.id }}
                    key={item.id}
                    onPress={() => setTargetId(item.id)}
                    style={[styles.accountOption, targetId === item.id && styles.accountOptionSelected]}
                  >
                    <BankLogo institution={item.institution} name={item.name} size={34} />
                    <Text numberOfLines={1} style={[styles.accountName, targetId === item.id && styles.selectedText]}>{item.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <View style={styles.fieldRow}>
              <View style={styles.fieldColumn}>
                <Text style={styles.label}>VALOR</Text>
                <View style={styles.inputShell}><Text style={styles.currency}>£</Text><TextInput editable={!saving} inputMode="decimal" onChangeText={setAmount} placeholder="0.00" placeholderTextColor={colors.inkFaint} style={styles.input} value={amount} /></View>
              </View>
              <View style={styles.fieldColumn}>
                <Text style={styles.label}>DATA</Text>
                <TextInput editable={!saving} inputMode="numeric" maxLength={10} onChangeText={setDate} placeholder="AAAA-MM-DD" placeholderTextColor={colors.inkFaint} style={[styles.inputShell, styles.dateInput]} value={date} />
              </View>
            </View>

            <Text style={styles.label}>REFERÊNCIA · OPCIONAL</Text>
            <TextInput editable={!saving} maxLength={120} onChangeText={setDescription} placeholder="Ex.: Reserva mensal" placeholderTextColor={colors.inkFaint} style={[styles.inputShell, styles.descriptionInput]} value={description} />

            {selectedTarget ? <Text style={styles.summary}>Para {selectedTarget.name}{parsedAmount > 0 ? ` · £${parsedAmount.toFixed(2)}` : ""}</Text> : null}
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

            <Pressable accessibilityRole="button" disabled={!canSubmit || saving} onPress={() => void submit()} style={({ pressed }) => [styles.submit, (!canSubmit || saving) && styles.disabled, pressed && styles.pressed]}>
              {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitText}>Confirmar transferência</Text>}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(24,40,39,0.48)" },
  sheet: { alignSelf: "center", backgroundColor: colors.paper, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "90%", overflow: "hidden", width: "100%" },
  handle: { alignSelf: "center", backgroundColor: colors.line, borderRadius: 3, height: 5, marginTop: 9, width: 38 },
  header: { alignItems: "center", borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", padding: 17 },
  headerCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 21, fontWeight: "700", marginTop: 4 },
  caption: { color: colors.inkSoft, fontSize: 11, marginTop: 4 },
  closeButton: { alignItems: "center", backgroundColor: colors.paperMuted, borderRadius: 20, height: 40, justifyContent: "center", marginLeft: 12, width: 40 },
  form: { padding: 17, paddingBottom: 34 },
  label: { color: colors.inkFaint, fontSize: 9, fontWeight: "800", letterSpacing: 1.1, marginBottom: 7, marginTop: 16 },
  loader: { marginVertical: 20 },
  notice: { backgroundColor: colors.expenseTint, borderRadius: 14, padding: 14 },
  noticeText: { color: colors.inkSoft, fontSize: 12, lineHeight: 18 },
  accountGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  accountOption: { alignItems: "center", backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 9, minHeight: 52, padding: 8, width: "48%" },
  accountOptionSelected: { backgroundColor: colors.header, borderColor: colors.forest },
  accountName: { color: colors.ink, flex: 1, fontSize: 11, fontWeight: "700" },
  selectedText: { color: colors.forest },
  fieldRow: { flexDirection: "row", gap: 10 },
  fieldColumn: { flex: 1 },
  inputShell: { alignItems: "center", backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexDirection: "row", minHeight: 50, paddingHorizontal: 12 },
  currency: { color: colors.inkSoft, fontSize: 14, fontWeight: "800", marginRight: 7 },
  input: { color: colors.ink, flex: 1, fontSize: 14, minHeight: 48 },
  dateInput: { color: colors.ink, fontSize: 12 },
  descriptionInput: { color: colors.ink, fontSize: 13 },
  summary: { color: colors.forest, fontSize: 11, fontWeight: "700", marginTop: 14 },
  error: { color: colors.danger, fontSize: 12, lineHeight: 17, marginTop: 12 },
  submit: { alignItems: "center", backgroundColor: colors.forest, borderRadius: 15, justifyContent: "center", marginTop: 19, minHeight: 50 },
  submitText: { color: colors.white, fontSize: 13, fontWeight: "800" },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.65 },
});
