import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { nu } from "@/components/dashboard/nuTheme";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, cancelRecurringTransaction, deleteInstallmentPlan, listAccounts, listPaymentMethods, updateInstallmentPlan, updateRecurringTransaction, type CreditCardPaymentMethod } from "@/services/api";
import type { FinancialAccount, InstallmentPlan, RecurringTransaction } from "@/types/finance";
import { planProgress, planTitle } from "./commitmentSummary";
import { dateLabel, money, parseAmount, validDate } from "./format";

export type SelectedCommitment = { kind: "fixed"; rule: RecurringTransaction } | { kind: "installments"; plan: InstallmentPlan };

export function CommitmentDetailSheet({ selected, onClose, onChanged }: { selected: SelectedCommitment; onClose: () => void; onChanged: () => void }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const rule = selected.kind === "fixed" ? selected.rule : null;
  const plan = selected.kind === "installments" ? selected.plan : null;
  const title = rule ? rule.description : planTitle(plan!);
  const schedule = plan ? planProgress(plan) : null;
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [amount, setAmount] = useState(String(rule?.amount ?? plan?.installmentValue ?? ""));
  const [total, setTotal] = useState(String(plan?.totalAmount ?? ""));
  const [startDate, setStartDate] = useState(rule?.startDate ?? schedule?.transactions[0]?.date ?? "");
  const [day, setDay] = useState(String(rule?.dayOfMonth ?? ""));
  const [scope, setScope] = useState<"CURRENT_MONTH" | "NEXT_MONTH">("CURRENT_MONTH");
  const [accountId, setAccountId] = useState<number | null>(rule?.accountId ?? plan?.accountId ?? null);
  const [paymentId, setPaymentId] = useState<number | null>(rule?.paymentMethodId ?? plan?.paymentMethodId ?? null);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [payments, setPayments] = useState<CreditCardPaymentMethod[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [optionsRetry, setOptionsRetry] = useState(0);
  const canEdit = rule ? rule.active : !schedule?.completed;
  const originalAccountId = rule?.accountId ?? plan?.accountId;
  const originalPaymentId = rule?.paymentMethodId ?? plan?.paymentMethodId;

  useEffect(() => {
    if (!editing || !user) return;
    let active = true;
    setOptionsLoading(true);
    setOptionsError(false);
    Promise.all([listAccounts(user.token), listPaymentMethods(user.token)]).then(([accountList, paymentList]) => {
      if (!active) return;
      setAccounts(accountList.filter((item) => item.active || item.id === originalAccountId));
      setPayments(paymentList.filter((item) => item.active || item.id === originalPaymentId));
    }).catch(async (cause) => {
      if (!active) return;
      if (cause instanceof ApiError && cause.status === 401) { await logout(); return; }
      setOptionsError(true);
    }).finally(() => { if (active) setOptionsLoading(false); });
    return () => { active = false; };
  }, [editing, user, logout, optionsRetry, originalAccountId, originalPaymentId]);

  async function mutate(remove = false) {
    if (!user || busy.current) return;
    const value = parseAmount(amount);
    const totalValue = parseAmount(total);
    const dayValue = Number(day);
    if (!remove && (!Number.isFinite(value) || value <= 0 || !validDate(startDate) || !accounts.some((account) => account.id === accountId) ||
      (paymentId !== null && !payments.some((payment) => payment.id === paymentId)) ||
      (rule && (!/^\d{1,2}$/.test(day) || dayValue < 1 || dayValue > 31)) ||
      (plan && (!Number.isFinite(totalValue) || totalValue <= 0)))) {
      setError("Informe valores positivos, uma conta, uma data válida (AAAA-MM-DD) e um dia entre 1 e 31.");
      return;
    }
    busy.current = true;
    setSaving(true);
    setError(null);
    try {
      if (rule) {
        if (remove) await cancelRecurringTransaction(user.token, rule.id);
        else await updateRecurringTransaction(user.token, rule.id, { amount: value, startDate, dayOfMonth: dayValue, accountId: accountId!, paymentMethodId: paymentId, applyFrom: scope });
      } else if (plan) {
        if (remove) await deleteInstallmentPlan(user.token, plan.id);
        else await updateInstallmentPlan(user.token, plan.id, { installmentValue: value, totalAmount: totalValue, startDate, accountId: accountId!, paymentMethodId: paymentId });
      }
      onChanged();
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) { await logout(); return; }
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar. Tente novamente.");
    } finally { busy.current = false; setSaving(false); }
  }

  const close = () => { if (!busy.current) onClose(); };
  return <Modal visible transparent animationType="slide" onRequestClose={close}>
    <View style={styles.overlay}>
      <Pressable accessibilityLabel="Fechar detalhes" disabled={saving} onPress={close} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.sheet, { marginTop: insets.top + 20 }]}>
        <View style={styles.grabber} />
        <View style={styles.header}><View style={styles.copy}><Text style={styles.eyebrow}>{rule ? "PAGAMENTO FIXO" : "PARCELAMENTO"}</Text><Text style={styles.title}>{title}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" disabled={saving} onPress={close} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.value}>{money(rule?.amount ?? plan?.installmentValue ?? 0)}<Text style={styles.perMonth}> / mês</Text></Text>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          {confirmDelete ? <View style={styles.confirm}>
            <Text style={styles.sectionTitle}>{rule ? "Cancelar recorrência?" : "Excluir parcelamento?"}</Text>
            <Text style={styles.caption}>{rule ? "A regra será encerrada e os lançamentos futuros gerados por ela serão removidos. O histórico até hoje será preservado." : "O plano e seus lançamentos serão excluídos. Esta ação não pode ser desfeita."}</Text>
            <Button danger disabled={saving} onPress={() => void mutate(true)} label={saving ? "Aguarde…" : "Confirmar"} />
            <Button secondary disabled={saving} onPress={() => { setConfirmDelete(false); setError(null); }} label="Voltar" />
          </View> : editing ? <View style={styles.form}>
            <Text style={styles.sectionTitle}>Editar compromisso</Text>
            <Field label={rule ? "Valor mensal (£)" : "Valor da parcela (£)"} value={amount} onChange={(value) => {
              setAmount(value);
              const parsed = parseAmount(value);
              if (plan && Number.isFinite(parsed)) setTotal((parsed * plan.totalInstallments).toFixed(2));
            }} numeric disabled={saving} />
            {plan ? <Field label="Valor total (£)" value={total} onChange={(value) => {
              setTotal(value);
              const parsed = parseAmount(value);
              if (Number.isFinite(parsed) && plan.totalInstallments > 0) setAmount((parsed / plan.totalInstallments).toFixed(2));
            }} numeric disabled={saving} /> : null}
            <Field label="Data de início (AAAA-MM-DD)" value={startDate} onChange={setStartDate} disabled={saving} />
            {rule ? <>
              <Field label="Dia do mês (1–31)" value={day} onChange={setDay} numeric disabled={saving} />
              <Text style={styles.label}>Aplicar alterações</Text><View style={styles.choices}>
                <Choice selected={scope === "CURRENT_MONTH"} disabled={saving} label="Neste mês" onPress={() => setScope("CURRENT_MONTH")} />
                <Choice selected={scope === "NEXT_MONTH"} disabled={saving} label="Próximo mês" onPress={() => setScope("NEXT_MONTH")} />
              </View>
            </> : null}
            {optionsLoading ? <ActivityIndicator color={nu.brand} /> : optionsError ? <>
              <Text style={styles.error}>Não foi possível carregar contas e formas de pagamento.</Text>
              <Button secondary label="Tentar novamente" onPress={() => setOptionsRetry((value) => value + 1)} />
            </> : <>
              <Text style={styles.label}>Conta</Text><View style={styles.choices}>{accounts.map((account) => <Choice key={account.id} label={account.name} selected={accountId === account.id} disabled={saving} onPress={() => setAccountId(account.id)} />)}</View>
              {accounts.length === 0 ? <Text style={styles.caption}>Cadastre uma conta na página Contas para editar este compromisso.</Text> : null}
              <Text style={styles.label}>Forma de pagamento</Text><View style={styles.choices}>
                <Choice label="Sem vínculo" selected={paymentId === null} disabled={saving} onPress={() => setPaymentId(null)} />
                {payments.map((payment) => <Choice key={payment.id} label={payment.name} selected={paymentId === payment.id} disabled={saving} onPress={() => setPaymentId(payment.id)} />)}
              </View>
            </>}
            <Button disabled={saving || optionsLoading || optionsError || accounts.length === 0} label={saving ? "Salvando…" : "Salvar alterações"} onPress={() => void mutate()} />
            <Button secondary disabled={saving} label="Voltar aos detalhes" onPress={() => { setEditing(false); setError(null); }} />
          </View> : <>
            <View style={styles.details}>
              <Detail label="Status" value={rule ? rule.active ? "Ativo" : "Cancelado" : schedule?.completed ? "Concluído" : "Ativo"} />
              <Detail label="Categoria" value={rule?.category ?? plan?.transactions[0]?.category ?? "—"} />
              <Detail label="Conta" value={rule?.accountName ?? plan?.accountName ?? "Sem conta vinculada"} />
              <Detail label="Pagamento" value={rule?.paymentMethodName ?? plan?.paymentMethodName ?? "Sem vínculo"} />
              {rule ? <>
                <Detail label="Tipo" value={rule.type === "INCOME" ? "Receita" : "Despesa"} />
                <Detail label="Dia do mês" value={String(rule.dayOfMonth)} />
                <Detail label="Início" value={dateLabel(rule.startDate)} />
                {rule.endDate ? <Detail label="Fim" value={dateLabel(rule.endDate)} /> : null}
                {rule.active && rule.nextRunDate ? <Detail label="Próximo lançamento" value={dateLabel(rule.nextRunDate)} /> : null}
              </> : <>
                <Detail label="Valor total" value={money(plan!.totalAmount)} />
                <Detail label="Progresso do calendário" value={`${schedule!.elapsed.length}/${plan!.totalInstallments} parcelas`} />
                {plan?.purchaseDate ? <Detail label="Compra" value={dateLabel(plan.purchaseDate)} /> : null}
              </>}
            </View>
            {canEdit ? <Button label="Editar compromisso" onPress={() => setEditing(true)} /> : null}
            {rule?.active || plan ? <Button secondary danger label={rule ? "Cancelar recorrência" : "Excluir parcelamento"} onPress={() => setConfirmDelete(true)} /> : null}
            {plan && schedule ? <View style={styles.schedule}>
              <Text style={styles.sectionTitle}>Calendário de parcelas</Text><Text style={styles.caption}>O calendário indica os vencimentos previstos, sem confirmar a quitação.</Text>
              {schedule.transactions.map((tx) => <View key={tx.id} style={styles.transaction}>
                <View style={styles.copy}><Text style={styles.label}>Parcela {tx.installmentNumber}/{plan.totalInstallments}</Text><Text style={styles.caption}>{dateLabel(tx.date)}</Text></View>
                <Text style={styles.transactionAmount}>{money(tx.amount)}</Text>
              </View>)}
            </View> : null}
          </>}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  </Modal>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detail}><Text style={styles.caption}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>;
}
function Field({ label, value, onChange, numeric, disabled }: { label: string; value: string; onChange: (value: string) => void; numeric?: boolean; disabled?: boolean }) {
  return <View><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} editable={!disabled} keyboardType={numeric ? "decimal-pad" : "default"} autoCapitalize="none" value={value} onChangeText={onChange} style={styles.input} /></View>;
}
function Choice({ label, selected, onPress, disabled }: { label: string; selected: boolean; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected, disabled }} disabled={disabled} onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}><Text style={[styles.choiceText, selected && styles.choiceSelectedText]}>{label}</Text></Pressable>;
}
function Button({ label, onPress, secondary, danger, disabled }: { label: string; onPress: () => void; secondary?: boolean; danger?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, danger && { backgroundColor: nu.negativeTint }, (disabled || pressed) && { opacity: 0.5 }]}><Text style={[styles.buttonText, secondary && { color: nu.brand }, danger && { color: nu.negative }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(20,20,26,0.45)" },
  sheet: { backgroundColor: nu.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%", paddingTop: 8 },
  grabber: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: nu.track, marginBottom: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingBottom: 16 },
  copy: { flex: 1, minWidth: 0 },
  eyebrow: { fontSize: 10, fontWeight: "700", color: nu.brand, letterSpacing: 1 },
  title: { fontSize: 20, color: nu.ink, fontWeight: "700", marginTop: 4 },
  close: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: nu.surface },
  closeText: { fontSize: 26, color: nu.inkSoft },
  content: { paddingHorizontal: 20 },
  value: { fontSize: 30, fontWeight: "700", color: nu.ink, marginBottom: 20, fontVariant: ["tabular-nums"] },
  perMonth: { fontSize: 13, fontWeight: "400", color: nu.inkSoft },
  details: { backgroundColor: nu.surface, borderRadius: 16, padding: 16, marginBottom: 16, gap: 14 },
  detail: { flexDirection: "row", gap: 16, justifyContent: "space-between" },
  detailValue: { color: nu.ink, fontSize: 13, fontWeight: "600", flex: 1, textAlign: "right" },
  caption: { fontSize: 12, color: nu.inkSoft, lineHeight: 18 },
  sectionTitle: { fontSize: 17, fontWeight: "600", color: nu.ink },
  button: { minHeight: 48, backgroundColor: nu.brand, borderRadius: 999, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, marginTop: 10 },
  secondary: { backgroundColor: nu.brandTint },
  buttonText: { color: nu.white, fontSize: 14, fontWeight: "700" },
  error: { color: nu.negative, backgroundColor: nu.negativeTint, padding: 12, borderRadius: 12, fontSize: 13, marginBottom: 12, lineHeight: 20 },
  form: { gap: 14 },
  label: { color: nu.ink, fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: nu.track, borderRadius: 12, minHeight: 48, paddingHorizontal: 14, color: nu.ink, fontSize: 16 },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: { minHeight: 44, paddingHorizontal: 14, justifyContent: "center", backgroundColor: nu.surface, borderRadius: 999 },
  choiceSelected: { backgroundColor: nu.brandTint, borderColor: nu.brand, borderWidth: 1 },
  choiceText: { color: nu.inkSoft, fontSize: 13 },
  choiceSelectedText: { color: nu.brand, fontWeight: "600" },
  confirm: { gap: 14 },
  schedule: { marginTop: 24, gap: 10 },
  transaction: { paddingVertical: 12, borderBottomColor: nu.hairline, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  transactionAmount: { color: nu.ink, fontSize: 14, fontWeight: "600" },
});
