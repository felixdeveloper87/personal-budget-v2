import { useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import type { ReactNode } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NuHeader, NU_SHEET_OVERLAP } from "@/components/dashboard/NuHeader";
import { nu, nuSection } from "@/components/dashboard/nuTheme";
import { PeriodNavigator } from "@/components/period/PeriodNavigator";
import { useAuth } from "@/contexts/AuthContext";
import { usePeriodNavigation } from "@/hooks/usePeriodNavigation";
import { ApiError, getReport } from "@/services/api";
import type { Report, ReportCategoryBreakdown, ReportPaymentMethodBreakdown, ReportTransactionItem } from "@/types/reports";
import { dateLabel, money } from "../goals/goalUtils";

const docIcon = { ios: "doc.text.fill", android: "description", web: "description" } as const;
const bulbIcon = { ios: "lightbulb.fill", android: "lightbulb", web: "lightbulb" } as const;
const pct = (value: number) => `${Math.round(value)}%`;

function insightsOf(report: Report): string[] {
  if (report.transactionCount === 0) return ["Nenhuma movimentação neste período."];
  const result = [report.balance >= 0
    ? `Você fechou o período com ${money(report.balance)} de saldo positivo.`
    : `Você gastou ${money(Math.abs(report.balance))} a mais do que recebeu.`];
  const category = report.expenseCategories[0];
  if (category) result.push(`${category.category} foi a maior categoria de gasto: ${money(category.amount)} (${pct(category.percentage)}).`);
  const method = report.paymentMethods[0];
  if (method) result.push(`${method.name} concentrou ${money(method.amount)} (${pct(method.percentage)}) dos pagamentos.`);
  if (report.installmentExpenseTotal > 0 || report.recurringExpenseTotal > 0) {
    result.push(`Compromissos: ${money(report.installmentExpenseTotal)} em parcelas e ${money(report.recurringExpenseTotal)} em recorrentes.`);
  }
  return result;
}

export function ReportsScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const period = usePeriodNavigation("month");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sequence = useRef(0);
  const insights = useMemo(() => (report ? insightsOf(report) : []), [report]);

  const load = useCallback(async (refresh = false) => {
    if (!user) return;
    const current = ++sequence.current;
    if (refresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const data = await getReport(user.token, period.selectedPeriod, period.selectedDate);
      if (current === sequence.current) setReport(data);
    } catch (cause) {
      if (current !== sequence.current) return;
      if (cause instanceof ApiError && cause.status === 401) { await logout(); return; }
      setReport(null);
      setError("Não foi possível carregar o relatório. Tente novamente.");
    } finally {
      if (current === sequence.current) { setLoading(false); setRefreshing(false); }
    }
  }, [user, logout, period.selectedPeriod, period.selectedDate]);

  useFocusEffect(useCallback(() => {
    setStatusBarStyle("light");
    void load();
    return () => { sequence.current += 1; setStatusBarStyle("dark"); };
  }, [load]));

  if (!user) return null;
  const balance = report?.balance ?? 0;
  return <View style={styles.screen}>
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} colors={[nu.brand]} tintColor={nu.white} progressViewOffset={insets.top} />}>
      <View style={styles.overscroll} />
      <NuHeader contentHeight={232} onBack={() => router.canGoBack() ? router.back() : router.replace("/")}>
        <View style={styles.titleRow}><Text style={styles.heroTitle}>Relatórios</Text><View style={styles.heroIcon}><SymbolView name={docIcon} size={18} tintColor={nu.white} /></View></View>
        <Text style={styles.heroLabel}>Saldo do período</Text>
        {loading ? <View style={styles.heroLoading}><ActivityIndicator color={nu.white} /></View> : <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.heroValue, balance < 0 && { color: "#FFC2B8" }]}>{report ? money(balance) : "—"}</Text>}
        <Text numberOfLines={1} style={styles.heroCaption}>{loading ? "Carregando relatório…" : report ? `Receitas ${money(report.totalIncome)} · Despesas ${money(report.totalExpense)}` : "Relatório indisponível"}</Text>
        <View style={styles.periodPanel}>
          <PeriodNavigator isCurrent={period.isCurrent} label={period.label} layout="inline" onChange={period.setSelectedPeriod} onGoToToday={period.goToToday} onNavigate={period.navigate} value={period.selectedPeriod} variant="inverse" />
        </View>
      </NuHeader>
      <View style={styles.sheet}>
        {loading && !report ? <View style={styles.pad}><State title="Carregando relatório…"><ActivityIndicator color={nu.brand} /></State></View>
          : !report ? <View style={styles.pad}><State title="Sem dados" caption={error ?? "Tente novamente em instantes."}><Pressable accessibilityRole="button" onPress={() => void load()} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>Tentar novamente</Text></Pressable></State></View>
          : <View style={loading && styles.dim}>
            <View style={styles.stats}>
              <Stat label="Receitas" value={money(report.totalIncome)} color={report.totalIncome > 0 ? nu.positive : nu.ink} />
              <Stat label="Despesas" value={money(report.totalExpense)} />
              <Stat label="Média" value={money(report.averageExpense)} />
            </View>
            <Text style={styles.statsCaption}>{report.incomeCount} {report.incomeCount === 1 ? "entrada" : "entradas"} · {report.expenseCount} {report.expenseCount === 1 ? "saída" : "saídas"} · {dateLabel(report.startDate)} — {dateLabel(report.endDate)}</Text>

            <Section title="Resumo executivo" subtitle="O que mais importa neste período">
              {insights.map((text) => <View key={text} style={styles.insight}><View style={styles.bulb}><SymbolView name={bulbIcon} size={15} tintColor={nu.brand} /></View><Text style={styles.insightText}>{text}</Text></View>)}
            </Section>
            <Section title="Compromissos" subtitle="Parcelas e pagamentos recorrentes" badge={money(report.installmentExpenseTotal + report.recurringExpenseTotal)}>
              <View style={styles.stats}><Stat label="Parcelas" value={money(report.installmentExpenseTotal)} /><Stat label="Recorrentes" value={money(report.recurringExpenseTotal)} /></View>
            </Section>
            <Section title="Categorias de despesa"><Bars items={report.expenseCategories.map(categoryRow)} color={nu.brand} /></Section>
            <Section title="Categorias de receita"><Bars items={report.incomeCategories.map(categoryRow)} color={nu.positive} /></Section>
            {report.paymentMethods.length > 0 ? <Section title="Formas de pagamento" subtitle="Distribuição dos pagamentos"><Bars items={report.paymentMethods.map(methodRow)} color={nu.brand} /></Section> : null}
            <Section title="Maiores despesas"><Transactions items={report.topExpenses} income={false} /></Section>
            <Section title="Maiores receitas"><Transactions items={report.topIncome} income /></Section>
          </View>}
      </View>
    </ScrollView>
  </View>;
}

interface Row { key: string; name: string; caption?: string; amount: number; percentage: number }
const categoryRow = (item: ReportCategoryBreakdown): Row => ({ key: item.category, name: item.category, amount: item.amount, percentage: item.percentage });
const methodRow = (item: ReportPaymentMethodBreakdown): Row => ({ key: item.name, name: item.name, caption: `${item.transactionCount} ${item.transactionCount === 1 ? "transação" : "transações"}`, amount: item.amount, percentage: item.percentage });

function Section({ title, subtitle, badge, children }: { title: string; subtitle?: string; badge?: string; children: ReactNode }) {
  return <View style={nuSection.container}>
    <View style={styles.sectionHead}><View style={styles.flex}><Text style={nuSection.title}>{title}</Text>{subtitle ? <Text style={nuSection.subtitle}>{subtitle}</Text> : null}</View>{badge ? <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View> : null}</View>
    <View style={styles.sectionBody}>{children}</View>
  </View>;
}
function Stat({ label, value, color = nu.ink }: { label: string; value: string; color?: string }) {
  return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={[styles.statValue, { color }]}>{value}</Text></View>;
}
function Bars({ items, color }: { items: Row[]; color: string }) {
  if (items.length === 0) return <Text style={styles.empty}>Sem dados neste período.</Text>;
  return <View>{items.slice(0, 6).map((item) => <View key={item.key} style={styles.barRow}>
    <View style={styles.barTop}>
      <View style={styles.flex}><Text numberOfLines={1} style={styles.rowName}>{item.name}</Text>{item.caption ? <Text style={styles.rowCaption}>{item.caption}</Text> : null}</View>
      <View style={styles.sharePill}><Text style={styles.sharePillText}>{pct(item.percentage)}</Text></View>
      <Text style={styles.rowAmount}>{money(item.amount)}</Text>
    </View>
    <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, item.percentage)}%`, backgroundColor: color }]} /></View>
  </View>)}</View>;
}
function Transactions({ items, income }: { items: ReportTransactionItem[]; income: boolean }) {
  if (items.length === 0) return <Text style={styles.empty}>Nenhuma transação neste período.</Text>;
  return <View>{items.slice(0, 5).map((tx) => <View key={tx.id} style={styles.txRow}>
    <View style={styles.flex}><Text numberOfLines={1} style={styles.rowName}>{tx.description || tx.category}</Text><Text numberOfLines={1} style={styles.rowCaption}>{dateLabel(tx.paymentDate)} · {tx.category}</Text></View>
    <Text style={[styles.rowAmount, income && { color: nu.positive }]}>{income ? "+" : "−"}{money(tx.amount)}</Text>
  </View>)}</View>;
}
function State({ title, caption, children }: { title: string; caption?: string; children?: ReactNode }) {
  return <View style={styles.state}><SymbolView name={docIcon} size={30} tintColor={nu.brand} /><Text style={styles.stateTitle}>{title}</Text>{caption ? <Text style={styles.empty}>{caption}</Text> : null}{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: nu.white },
  overscroll: { position: "absolute", left: 0, right: 0, top: -1000, height: 1000, backgroundColor: nu.brand },
  flex: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  heroTitle: { color: nu.white, fontSize: 20, fontWeight: "700" },
  heroIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "rgba(255,255,255,0.16)" },
  heroLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 10 },
  heroLoading: { alignItems: "flex-start", justifyContent: "center", height: 43 },
  heroValue: { color: nu.white, fontSize: 32, fontWeight: "700", letterSpacing: -0.9, fontVariant: ["tabular-nums"] },
  heroCaption: { color: "rgba(255,255,255,0.75)", fontSize: 12, lineHeight: 18, marginTop: 3 },
  periodPanel: { marginTop: 12 },
  sheet: { marginTop: -NU_SHEET_OVERLAP, backgroundColor: nu.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 5 },
  pad: { padding: 20 },
  dim: { opacity: 0.55 },
  stats: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingTop: 20 },
  stat: { flex: 1, backgroundColor: nu.surface, borderRadius: 16, padding: 14, gap: 4 },
  statLabel: { color: nu.inkSoft, fontSize: 12 },
  statValue: { fontSize: 17, fontWeight: "700", fontVariant: ["tabular-nums"] },
  statsCaption: { color: nu.inkSoft, fontSize: 12, paddingHorizontal: 20, marginTop: 10, marginBottom: 6 },
  sectionHead: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  sectionBody: { marginTop: 14, marginHorizontal: -20 },
  badge: { backgroundColor: nu.brandTint, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { color: nu.brand, fontSize: 12, fontWeight: "700" },
  insight: { flexDirection: "row", gap: 12, alignItems: "flex-start", paddingHorizontal: 20, paddingVertical: 10 },
  bulb: { width: 32, height: 32, borderRadius: 16, backgroundColor: nu.brandTint, alignItems: "center", justifyContent: "center" },
  insightText: { flex: 1, color: nu.ink, fontSize: 14, lineHeight: 21, paddingTop: 4 },
  barRow: { paddingHorizontal: 20, paddingVertical: 10 },
  barTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowName: { color: nu.ink, fontSize: 15, fontWeight: "600" },
  rowCaption: { color: nu.inkSoft, fontSize: 12, marginTop: 2 },
  rowAmount: { color: nu.ink, fontSize: 15, fontWeight: "700", fontVariant: ["tabular-nums"] },
  sharePill: { backgroundColor: nu.brandTint, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  sharePillText: { color: nu.brand, fontSize: 11, fontWeight: "700" },
  track: { height: 4, borderRadius: 2, backgroundColor: nu.track, overflow: "hidden", marginTop: 8 },
  fill: { height: 4, borderRadius: 2 },
  txRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  empty: { color: nu.inkSoft, fontSize: 13, lineHeight: 20, paddingHorizontal: 20, textAlign: "center" },
  state: { backgroundColor: nu.surface, borderRadius: 20, alignItems: "center", padding: 24, gap: 12 },
  stateTitle: { color: nu.ink, fontSize: 16, fontWeight: "700" },
  button: { minHeight: 44, backgroundColor: nu.brand, borderRadius: 999, paddingHorizontal: 20, alignItems: "center", justifyContent: "center" },
  buttonText: { color: nu.white, fontSize: 14, fontWeight: "600" },
  pressed: { opacity: 0.65 },
});
