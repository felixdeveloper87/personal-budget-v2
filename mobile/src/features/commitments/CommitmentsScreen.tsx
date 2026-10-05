import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import type { ComponentProps, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NuHeader, NU_SHEET_OVERLAP } from "@/components/dashboard/NuHeader";
import { nu, nuSection } from "@/components/dashboard/nuTheme";
import { MerchantLogo } from "@/components/merchant/MerchantLogo";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, listInstallmentPlans, listRecurringTransactions } from "@/services/api";
import type { InstallmentPlan, RecurringTransaction } from "@/types/finance";
import { CommitmentDetailSheet, type SelectedCommitment } from "./CommitmentDetailSheet";
import { commitmentSummary, installmentMonths, planProgress, planTitle } from "./commitmentSummary";
import { money, dateLabel } from "./format";

type SymbolName = ComponentProps<typeof SymbolView>["name"];
const repeatIcon = { ios: "repeat", android: "repeat", web: "repeat" } satisfies SymbolName;
function monthLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(`${value}-01T12:00:00`));
}

export function CommitmentsScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string; month?: string }>();
  const [tab, setTab] = useState("fixed");
  const [view, setView] = useState("plans");
  const [month, setMonth] = useState<string | null>(null);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [plans, setPlans] = useState<InstallmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedCommitment | null>(null);
  const sequence = useRef(0);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setTab(params.tab === "installments" ? "installments" : "fixed");
    if (params.month && /^\d{4}-(0[1-9]|1[0-2])$/.test(params.month)) {
      setMonth(params.month);
      setView("months");
    }
  }, [params.tab, params.month]);

  const load = useCallback(async (refresh = false) => {
    if (!user) return;
    const current = ++sequence.current;
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const [rules, installmentPlans] = await Promise.all([
        listRecurringTransactions(user.token), listInstallmentPlans(user.token),
      ]);
      if (current !== sequence.current) return;
      setRecurring(rules);
      setPlans(installmentPlans);
      setNow(new Date());
    } catch (cause) {
      if (current !== sequence.current) return;
      if (cause instanceof ApiError && cause.status === 401) { await logout(); return; }
      setError("Não foi possível carregar seus compromissos. Tente novamente.");
    } finally {
      if (current === sequence.current) { setLoading(false); setRefreshing(false); }
    }
  }, [user, logout]);

  useFocusEffect(useCallback(() => {
    setStatusBarStyle("light");
    void load();
    return () => { sequence.current += 1; setStatusBarStyle("dark"); };
  }, [load]));

  const summary = useMemo(() => commitmentSummary(recurring, plans, now), [recurring, plans, now]);
  const months = useMemo(() => installmentMonths(plans, now), [plans, now]);
  const statement = months.find((item) => item.key === month) ?? months[0];
  const openRule = (rule: RecurringTransaction) => setSelected({ kind: "fixed", rule });
  const openPlan = (plan: InstallmentPlan) => setSelected({ kind: "installments", plan });

  if (!user) return null;
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={nu.white} colors={[nu.brand]} progressViewOffset={insets.top} />
      }>
        <View style={styles.overscroll} />
        <NuHeader contentHeight={190} onBack={() => router.canGoBack() ? router.back() : router.replace("/")}>
          <View style={styles.titleRow}>
            <Text style={styles.heroTitle}>Compromissos</Text>
            <View style={styles.heroIcon}><SymbolView name={repeatIcon} size={18} tintColor={nu.white} /></View>
          </View>
          <Text style={styles.heroLabel}>Comprometido por mês</Text>
          {loading ? <ActivityIndicator color={nu.white} style={styles.heroLoading} /> :
            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.heroValue}>{error ? "—" : money(summary.total)}</Text>}
          <Text style={styles.heroCaption}>
            {loading ? "Carregando seus compromissos…" : error ? "Resumo indisponível" : `Fixos ${money(summary.fixedMonthly)} · Parcelas ${money(summary.installmentsMonthly)}`}
          </Text>
          <View style={styles.heroTabs}><Segments inverse value={tab} onChange={setTab} options={[
            { value: "fixed", label: "Pagamentos fixos" }, { value: "installments", label: "Parcelamentos" },
          ]} /></View>
        </NuHeader>

        <View style={styles.sheet}>
          {loading ? <State title="Carregando compromissos…"><ActivityIndicator color={nu.brand} /></State> : error ?
            <State title="Compromissos indisponíveis" caption={error}><Pressable accessibilityRole="button" onPress={() => void load()} style={styles.retry}><Text style={styles.retryText}>Tentar novamente</Text></Pressable></State> :
            tab === "fixed" ? <>
              <Stats items={[
                { label: "Regras ativas", value: String(summary.activeRules.length) },
                { label: "Receitas fixas", value: money(summary.fixedIncome), color: nu.positive },
                { label: "Saldo mensal", value: money(summary.fixedIncome - summary.fixedMonthly), color: summary.fixedIncome >= summary.fixedMonthly ? nu.positive : nu.negative },
              ]} />
              {summary.activeRules.length > 0 ? <Section title="Pagamentos ativos" caption="Organizados pelo dia do mês" badge={money(summary.fixedMonthly)}>
                {summary.activeRules.map((rule) => <FixedRow key={rule.id} rule={rule} onPress={() => openRule(rule)} />)}
              </Section> : <State title="Nenhum pagamento fixo ativo" caption="Seus pagamentos e receitas recorrentes aparecerão aqui." />}
              {summary.cancelledRules.length > 0 ? <Section title="Cancelados" caption="Histórico das recorrências encerradas">
                {summary.cancelledRules.map((rule) => <FixedRow key={rule.id} rule={rule} onPress={() => openRule(rule)} />)}
              </Section> : null}
            </> : <>
              <Stats items={[
                { label: "Planos ativos", value: String(summary.activePlans.length) },
                { label: "A vencer", value: money(summary.remaining) },
                { label: "Já decorridas", value: money(summary.elapsed) },
              ]} />
              <View style={styles.viewTabs}><Segments value={view} onChange={setView} options={[
                { value: "plans", label: "Planos" }, { value: "months", label: "Por mês" },
              ]} /></View>
              {view === "plans" ? <>
                {summary.activePlans.length > 0 ? <Section title="Parcelamentos ativos" caption="Acompanhe o progresso de cada plano" badge={money(summary.installmentsMonthly)}>
                  {summary.activePlans.map((plan) => <PlanRow key={plan.id} plan={plan} now={now} onPress={() => openPlan(plan)} />)}
                </Section> : <State title="Nenhum parcelamento ativo" caption="Seus planos de parcelamento aparecerão aqui." />}
                {summary.completedPlans.length > 0 ? <Section title="Concluídos" caption="Planos com todas as datas de vencimento decorridas">
                  {summary.completedPlans.map((plan) => <PlanRow key={plan.id} plan={plan} now={now} onPress={() => openPlan(plan)} />)}
                </Section> : null}
              </> : <Section title="Parcelas por mês" caption="Valores previstos no calendário">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.months}>
                  {months.map((item) => <Pressable accessibilityRole="button" accessibilityState={{ selected: statement.key === item.key }} key={item.key} onPress={() => setMonth(item.key)} style={[styles.monthChip, statement.key === item.key && styles.monthSelected]}>
                    <Text style={[styles.monthText, statement.key === item.key && styles.monthSelectedText]}>{monthLabel(item.key)}</Text>
                  </Pressable>)}
                </ScrollView>
                <View style={styles.monthSummary}><Text style={styles.monthTotal}>{money(statement.total)}</Text><Text style={styles.meta}>{statement.items.length} parcelas previstas</Text></View>
                {statement.items.length ? statement.items.map(({ plan, transaction }) => <Row key={`${plan.id}-${transaction.id}`} title={planTitle(plan)} category={transaction.category} amount={money(transaction.amount)} caption={`Parcela ${transaction.installmentNumber}/${plan.totalInstallments} · ${dateLabel(transaction.date)}`} onPress={() => openPlan(plan)} />) :
                  <State title="Nenhuma parcela neste mês" caption="Escolha outro mês para ver os próximos vencimentos." />}
              </Section>}
            </>}
        </View>
      </ScrollView>
      {selected ? <CommitmentDetailSheet selected={selected} onClose={() => setSelected(null)} onChanged={() => { setSelected(null); void load(true); }} /> : null}
    </View>
  );
}

function Segments({ options, value, onChange, inverse = false }: { options: Array<{ value: string; label: string }>; value: string; onChange: (value: string) => void; inverse?: boolean }) {
  return <View style={[styles.segments, inverse && styles.inverseSegments]}>{options.map((option) => (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: value === option.value }} key={option.value} onPress={() => onChange(option.value)} style={({ pressed }) => [styles.segment, value === option.value && styles.segmentSelected, pressed && styles.pressed]}>
      <Text style={[styles.segmentText, inverse && styles.inverseText, value === option.value && styles.selectedText]}>{option.label}</Text>
    </Pressable>
  ))}</View>;
}
function Stats({ items }: { items: Array<{ label: string; value: string; color?: string }> }) {
  return <View style={styles.stats}>{items.map((item) => <View key={item.label} style={styles.stat}>
    <Text adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.6} style={[styles.statValue, { color: item.color ?? nu.ink }]}>{item.value}</Text>
    <Text style={styles.statLabel}>{item.label}</Text>
  </View>)}</View>;
}
function Section({ title, caption, badge, children }: { title: string; caption: string; badge?: string; children: ReactNode }) {
  return <View style={styles.section}><View style={styles.sectionHeader}><View style={styles.copy}>
    <Text style={nuSection.title}>{title}</Text><Text style={nuSection.subtitle}>{caption}</Text>
  </View>{badge ? <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View> : null}</View>{children}</View>;
}
function State({ title, caption, children }: { title: string; caption?: string; children?: ReactNode }) {
  return <View style={styles.state}><SymbolView name={repeatIcon} tintColor={nu.brand} size={25} /><Text style={styles.stateTitle}>{title}</Text>{caption ? <Text style={styles.stateCaption}>{caption}</Text> : null}{children}</View>;
}
function FixedRow({ rule, onPress }: { rule: RecurringTransaction; onPress: () => void }) {
  return <Row title={rule.description || rule.category} category={rule.category} amount={`${rule.type === "INCOME" ? "+" : ""}${money(rule.amount)}`} income={rule.type === "INCOME"} muted={!rule.active}
    caption={rule.active ? [`Dia ${rule.dayOfMonth}`, rule.category, rule.paymentMethodName ?? rule.accountName].filter(Boolean).join(" · ") : `Cancelado · ${rule.category}`}
    amountCaption={rule.active && rule.nextRunDate ? `Próximo: ${dateLabel(rule.nextRunDate)}` : "Cancelado"} onPress={onPress} />;
}
function PlanRow({ plan, now, onPress }: { plan: InstallmentPlan; now: Date; onPress: () => void }) {
  const progress = planProgress(plan, now);
  return <Row title={planTitle(plan)} category={plan.transactions[0]?.category} amount={money(plan.installmentValue)} muted={progress.completed}
    caption={`${progress.elapsed.length}/${plan.totalInstallments} decorridas · ${plan.paymentMethodName ?? plan.accountName ?? "Sem conta"}`}
    amountCaption={progress.upcoming[0] ? `Próxima: ${dateLabel(progress.upcoming[0].date)}` : progress.completed ? "Concluído" : "por mês"}
    progress={progress.completed ? undefined : progress.progress} onPress={onPress} />;
}
function Row({ title, category, caption, amount, amountCaption, income, muted, progress, onPress }: { title: string; category?: string; caption: string; amount: string; amountCaption?: string; income?: boolean; muted?: boolean; progress?: number; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver detalhes: ${title}, ${amount}, ${caption}`} onPress={onPress} style={({ pressed }) => [styles.row, muted && styles.muted, pressed && styles.pressed]}>
    <View style={styles.rowTop}><MerchantLogo name={title} category={category} size={42} /><View style={styles.copy}>
      <Text numberOfLines={1} style={styles.rowTitle}>{title}</Text><Text numberOfLines={2} style={styles.meta}>{caption}</Text>
    </View><Text style={[styles.amount, income && { color: nu.positive }]}>{amount}</Text></View>
    {amountCaption ? <Text style={styles.amountCaption}>{amountCaption}</Text> : null}
    {progress != null ? <View accessibilityLabel={`${Math.round(progress * 100)}% do calendário decorrido`} style={styles.progress}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View> : null}
  </Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: nu.white },
  overscroll: { position: "absolute", left: 0, right: 0, top: -1000, height: 1000, backgroundColor: nu.brand },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroTitle: { color: nu.white, fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  heroIcon: { backgroundColor: "rgba(255,255,255,0.16)", width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  heroLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 10 },
  heroLoading: { alignSelf: "flex-start", height: 42 },
  heroValue: { color: nu.white, fontSize: 32, fontWeight: "700", letterSpacing: -0.9, fontVariant: ["tabular-nums"] },
  heroCaption: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 3 },
  heroTabs: { marginTop: 16 },
  sheet: { marginTop: -NU_SHEET_OVERLAP, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: nu.white, paddingTop: 6 },
  segments: { backgroundColor: nu.surface, flexDirection: "row", borderRadius: 999, padding: 4 },
  inverseSegments: { backgroundColor: "rgba(255,255,255,0.18)" },
  segment: { flex: 1, minHeight: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  segmentSelected: { backgroundColor: nu.white },
  segmentText: { color: nu.inkSoft, fontSize: 12, fontWeight: "600", textAlign: "center" },
  inverseText: { color: "rgba(255,255,255,0.85)" },
  selectedText: { color: nu.brand, fontWeight: "700" },
  stats: { flexDirection: "row", gap: 10, padding: 20 },
  stat: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 19, fontWeight: "700", fontVariant: ["tabular-nums"] },
  statLabel: { color: nu.inkSoft, fontSize: 11, marginTop: 5 },
  viewTabs: { marginHorizontal: 20, marginBottom: 20 },
  section: nuSection.container,
  sectionHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  copy: { flex: 1, minWidth: 0 },
  badge: { backgroundColor: nu.brandTint, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: nu.brand, fontSize: 12, fontWeight: "700" },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: nu.hairline },
  rowTop: { flexDirection: "row", gap: 12, alignItems: "center" },
  rowTitle: { fontSize: 15, color: nu.ink, fontWeight: "600" },
  meta: { color: nu.inkSoft, fontSize: 12, marginTop: 4, lineHeight: 17 },
  amount: { color: nu.ink, fontSize: 15, fontWeight: "700", fontVariant: ["tabular-nums"], flexShrink: 1 },
  amountCaption: { color: nu.inkSoft, fontSize: 11, textAlign: "right", marginTop: 6 },
  muted: { opacity: 0.65 },
  progress: { backgroundColor: nu.track, height: 4, borderRadius: 2, marginTop: 12, overflow: "hidden" },
  progressFill: { backgroundColor: nu.brand, height: 4, borderRadius: 2 },
  months: { gap: 8, paddingVertical: 8 },
  monthChip: { paddingHorizontal: 14, minHeight: 44, justifyContent: "center", borderRadius: 999, backgroundColor: nu.surface },
  monthSelected: { backgroundColor: nu.brand },
  monthText: { color: nu.inkSoft, fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  monthSelectedText: { color: nu.white },
  monthSummary: { backgroundColor: nu.surface, borderRadius: 16, padding: 18, marginTop: 12, marginBottom: 10 },
  monthTotal: { color: nu.ink, fontSize: 28, fontWeight: "700", fontVariant: ["tabular-nums"] },
  state: { margin: 20, borderRadius: 16, backgroundColor: nu.surface, padding: 24, gap: 10, alignItems: "center" },
  stateTitle: { color: nu.ink, fontSize: 16, fontWeight: "600", textAlign: "center" },
  stateCaption: { color: nu.inkSoft, fontSize: 13, lineHeight: 20, textAlign: "center" },
  retry: { backgroundColor: nu.brand, minHeight: 44, justifyContent: "center", paddingHorizontal: 20, borderRadius: 999, marginTop: 6 },
  retryText: { color: nu.white, fontSize: 14, fontWeight: "600" },
  pressed: { opacity: 0.7 },
});
