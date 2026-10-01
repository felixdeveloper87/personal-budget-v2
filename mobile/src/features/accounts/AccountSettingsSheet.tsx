import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { archiveAccount, updateAccount } from "@/services/api";
import { colors } from "@/theme/colors";
import type { FinancialAccount } from "@/types/finance";

type AccountType = FinancialAccount["type"];

const typeLabels: Record<AccountType, string> = {
  CURRENT: "Corrente",
  SAVINGS: "Poupança",
  CASH: "Dinheiro",
  CREDIT_CARD: "Crédito",
};

const typeSuffix: Record<AccountType, string> = {
  CURRENT: "Current",
  SAVINGS: "Savings",
  CASH: "Cash",
  CREDIT_CARD: "Credit",
};

function generatedName(institution: string, type: AccountType) {
  const issuer = institution.trim();
  if (type === "CASH") return issuer ? `${issuer} Cash` : "Cash";
  return issuer ? `${issuer} ${typeSuffix[type]}` : "";
}

function decimalValue(value: string) {
  return Number(value.trim().replace(",", "."));
}

interface AccountSettingsSheetProps {
  account: FinancialAccount;
  onClose: () => void;
  onDeleted: () => void;
  onSaved: (account: FinancialAccount) => void;
  visible: boolean;
}

export function AccountSettingsSheet({ account, onClose, onDeleted, onSaved, visible }: AccountSettingsSheetProps) {
  const { user } = useAuth();
  const [institution, setInstitution] = useState("");
  const [type, setType] = useState<AccountType>("CURRENT");
  const [balance, setBalance] = useState("0");
  const [overdraft, setOverdraft] = useState("0");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setInstitution(account.institution ?? "");
    setType(account.type);
    setBalance(String(account.currentBalance));
    setOverdraft(String(account.overdraftLimit ?? 0));
    setError(null);
  }, [account, visible]);

  const name = useMemo(() => generatedName(institution, type), [institution, type]);
  const typeOptions: AccountType[] = account.type === "CREDIT_CARD"
    ? ["CURRENT", "SAVINGS", "CASH", "CREDIT_CARD"]
    : ["CURRENT", "SAVINGS", "CASH"];
  const busy = saving || deleting;

  const save = async () => {
    if (!user || !name) {
      setError("Informe a instituição para continuar.");
      return;
    }
    const nextBalance = decimalValue(balance);
    const nextOverdraft = decimalValue(overdraft);
    if (!Number.isFinite(nextBalance)) {
      setError("Informe um saldo válido.");
      return;
    }
    if (type === "CURRENT" && (!Number.isFinite(nextOverdraft) || nextOverdraft < 0)) {
      setError("O limite deve ser igual ou maior que zero.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await updateAccount(user.token, account.id, {
        active: true,
        currency: account.currency || "GBP",
        institution: institution.trim() || null,
        name,
        openingBalance: nextBalance,
        overdraftLimit: type === "CURRENT" ? nextOverdraft : 0,
        type,
      });
      onSaved(updated);
      onClose();
    } catch {
      setError("Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!user) return;
    setDeleting(true);
    setError(null);
    try {
      await archiveAccount(user.token, account.id);
      onClose();
      onDeleted();
    } catch {
      setError("Não foi possível excluir esta conta.");
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Excluir conta?",
      `A conta “${account.name}” será removida da sua lista. O histórico financeiro será preservado.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => void remove() },
      ],
    );
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
        <Pressable accessibilityLabel="Fechar configurações" accessibilityRole="button" onPress={onClose} style={styles.backdrop} />
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>CONFIGURAÇÕES</Text>
              <Text style={styles.title}>Editar conta</Text>
              <Text numberOfLines={1} style={styles.caption}>{account.name}</Text>
            </View>
            <Pressable accessibilityLabel="Fechar" accessibilityRole="button" disabled={busy} onPress={onClose} style={styles.closeButton}>
              <SymbolView name={{ ios: "xmark", android: "close", web: "close" }} size={18} tintColor={colors.ink} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <View style={styles.notice}>
              <Text style={styles.noticeTitle}>Ajuste de saldo</Text>
              <Text style={styles.noticeText}>Alterar o saldo redefine a posição atual da conta sem criar uma transação.</Text>
            </View>

            <Text style={styles.label}>INSTITUIÇÃO</Text>
            <View style={styles.institutionField}>
              <BankLogo institution={institution} name={name || institution || "Conta"} size={38} />
              <TextInput
                autoCapitalize="words"
                editable={!busy}
                maxLength={120}
                onChangeText={setInstitution}
                placeholder={type === "CASH" ? "Opcional para dinheiro" : "Ex.: Monzo"}
                placeholderTextColor={colors.inkFaint}
                style={styles.institutionInput}
                value={institution}
              />
            </View>

            <Text style={styles.label}>TIPO DA CONTA</Text>
            <View style={styles.typeGrid}>
              {typeOptions.map((option) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: type === option }}
                  disabled={busy}
                  key={option}
                  onPress={() => {
                    setType(option);
                    if (option !== "CURRENT") setOverdraft("0");
                  }}
                  style={[styles.typeButton, type === option && styles.typeButtonSelected]}
                >
                  <Text style={[styles.typeButtonText, type === option && styles.typeButtonTextSelected]}>{typeLabels[option]}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>NOME DA CONTA</Text>
            <View style={styles.readonlyField}><Text numberOfLines={1} style={styles.readonlyText}>{name || "Selecione uma instituição"}</Text></View>

            <View style={styles.moneyRow}>
              <View style={styles.moneyField}>
                <Text style={styles.label}>SALDO ATUAL</Text>
                <View style={styles.inputShell}><Text style={styles.currency}>£</Text><TextInput editable={!busy} inputMode="decimal" onChangeText={setBalance} placeholder="0.00" placeholderTextColor={colors.inkFaint} style={styles.moneyInput} value={balance} /></View>
              </View>
              {type === "CURRENT" ? (
                <View style={styles.moneyField}>
                  <Text style={styles.label}>LIMITE</Text>
                  <View style={styles.inputShell}><Text style={styles.currency}>£</Text><TextInput editable={!busy} inputMode="decimal" onChangeText={setOverdraft} placeholder="0.00" placeholderTextColor={colors.inkFaint} style={styles.moneyInput} value={overdraft} /></View>
                </View>
              ) : null}
            </View>

            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

            <Pressable accessibilityRole="button" disabled={busy || !name} onPress={() => void save()} style={({ pressed }) => [styles.saveButton, (busy || !name) && styles.disabledButton, pressed && styles.pressed]}>
              {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>Salvar alterações</Text>}
            </Pressable>

            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Excluir conta</Text>
              <Text style={styles.dangerText}>Remove a conta das suas contas ativas. O histórico associado continuará preservado.</Text>
              <Pressable accessibilityRole="button" disabled={busy} onPress={confirmDelete} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
                {deleting ? <ActivityIndicator color={colors.danger} /> : <Text style={styles.deleteButtonText}>Excluir esta conta</Text>}
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(24,40,39,0.48)" },
  sheet: { alignSelf: "center", backgroundColor: colors.paper, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "92%", overflow: "hidden", width: "100%" },
  handle: { alignSelf: "center", backgroundColor: colors.line, borderRadius: 3, height: 5, marginTop: 9, width: 38 },
  header: { alignItems: "center", borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", padding: 17 },
  headerCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 21, fontWeight: "700", marginTop: 4 },
  caption: { color: colors.inkSoft, fontSize: 11, marginTop: 4 },
  closeButton: { alignItems: "center", backgroundColor: colors.paperMuted, borderRadius: 20, height: 40, justifyContent: "center", marginLeft: 12, width: 40 },
  form: { padding: 17, paddingBottom: 34 },
  notice: { backgroundColor: colors.header, borderLeftColor: colors.forest, borderLeftWidth: 3, borderRadius: 14, padding: 13 },
  noticeTitle: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  noticeText: { color: colors.inkSoft, fontSize: 11, lineHeight: 16, marginTop: 4 },
  label: { color: colors.inkFaint, fontSize: 9, fontWeight: "800", letterSpacing: 1.15, marginBottom: 7, marginTop: 16 },
  institutionField: { alignItems: "center", backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 10, minHeight: 54, paddingHorizontal: 9 },
  institutionInput: { color: colors.ink, flex: 1, fontSize: 14, minHeight: 50 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeButton: { alignItems: "center", backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 13, borderWidth: 1, justifyContent: "center", minHeight: 42, paddingHorizontal: 13 },
  typeButtonSelected: { backgroundColor: colors.header, borderColor: colors.forest },
  typeButtonText: { color: colors.inkSoft, fontSize: 11, fontWeight: "700" },
  typeButtonTextSelected: { color: colors.forest },
  readonlyField: { backgroundColor: colors.paperMuted, borderRadius: 14, minHeight: 50, justifyContent: "center", paddingHorizontal: 14 },
  readonlyText: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  moneyRow: { flexDirection: "row", gap: 10 },
  moneyField: { flex: 1 },
  inputShell: { alignItems: "center", backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexDirection: "row", minHeight: 50, paddingHorizontal: 12 },
  currency: { color: colors.inkSoft, fontSize: 14, fontWeight: "800", marginRight: 7 },
  moneyInput: { color: colors.ink, flex: 1, fontSize: 14, minHeight: 48 },
  error: { color: colors.danger, fontSize: 12, lineHeight: 17, marginTop: 14 },
  saveButton: { alignItems: "center", backgroundColor: colors.forest, borderRadius: 15, justifyContent: "center", marginTop: 19, minHeight: 50 },
  saveButtonText: { color: colors.white, fontSize: 13, fontWeight: "800" },
  disabledButton: { opacity: 0.45 },
  pressed: { opacity: 0.65 },
  dangerZone: { borderTopColor: colors.line, borderTopWidth: 1, marginTop: 24, paddingTop: 20 },
  dangerTitle: { color: colors.danger, fontSize: 15, fontWeight: "800" },
  dangerText: { color: colors.inkSoft, fontSize: 11, lineHeight: 17, marginTop: 5 },
  deleteButton: { alignItems: "center", borderColor: colors.danger, borderRadius: 14, borderWidth: 1, justifyContent: "center", marginTop: 13, minHeight: 48 },
  deleteButtonText: { color: colors.danger, fontSize: 12, fontWeight: "800" },
});
