import { useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NuHeader, NU_SHEET_OVERLAP } from "@/components/dashboard/NuHeader";
import { nu, nuSection } from "@/components/dashboard/nuTheme";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, listCategoryBudgets, listTransactions } from "@/services/api";
import type { Transaction } from "@/types/finance";
import type { CategoryBudget } from "@/types/planning";
import { money } from "../goals/goalUtils";
import { BudgetSheet } from "./BudgetSheet";

const icons = {
  plus: { ios: "plus", android: "add", web: "add" },
  target: { ios: "chart.pie.fill", android: "pie_chart", web: "pie_chart" },
  prev: { ios: "chevron.left", android: "chevron_left", web: "chevron_left" },
  next: { ios: "chevron.right", android: "chevron_right", web: "chevron_right" },
} as const;
const AMBER = "#D97706";
const AMBER_TINT = "#FDF1DD";

function tone(budget: CategoryBudget) {
  if (budget.exceeded || budget.percentageUsed >= 100) return { color: nu.negative, tint: nu.negativeTint };
  if (budget.percentageUsed >= 80) return { color: AMBER, tint: AMBER_TINT };
  return { color: nu.brand, tint: nu.brandTint };
}

function sameMonth(source: string | null | undefined, month: Date) {
  if (!source) return false;
  const date = new Date(source.length === 10 ? `${source}T00:00:00` : source);
  return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
}

export function PlanningScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ budget: CategoryBudget | null } | null>(null);
  const sequence = useRef(0);
  const monthRef = useRef(month);
  monthRef.current = month;

  const load = useCallback(async (target: Date, refresh = false) => {
    if (!user) return;
    const current = ++sequence.current;
    if (refresh) setRefreshing(true); else setLoading(true);
    setError(null);
    const [budgetResult, txResult] = await Promise.allSettled([listCategoryBudgets(user.token, target), listTransactions(user.token)]);
    if (current !== sequence.current) return;
    for (const result of [budgetResult, txResult]) {
      if (result.status === "rejected" && result.reason instanceof ApiError && result.reason.status === 401) { await logout(); return; }
    }
    if (budgetResult.status === "fulfilled") setBudgets(budgetResult.value);
    else setError("Não foi possível carregar seus orçamentos. Tente novamente.");
    if (txResult.status === "fulfilled") setTransactions(txResult.value);
    setLoading(false);
    setRefreshing(false);
  }, [user, logout]);

  useFocusEffect(useCallback(() => {
    setStatusBarStyle("light");
    void load(monthRef.current);
    return () => { sequence.current += 1; setStatusBarStyle("dark"); };
  }, [load]));

  function shift(delta: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1);
    setMonth(next);
    setNotice(null);
    void load(next);
  }

  const totals = useMemo(() => {
    const limit = budgets.reduce((sum, item) => sum + item.limitAmount, 0);
    const spent = budgets.reduce((sum, item) => sum + item.spentAmount, 0);
    return { limit, spent, progress: limit > 0 ? Math.min(100, (spent / limit) * 100) : 0, attention: budgets.filter((item) => item.exceeded || item.percentageUsed >= 80).length };
  }, [budgets]);

  const suggestions = useMemo(() => {
    const used = new Set(budgets.map((item) => item.category.toLowerCase()));
    const found = new Set<string>();
    for (const tx of transactions) {
      if (tx.type === "EXPENSE" && tx.category && !used.has(tx.category.toLowerCase()) && sameMonth(tx.paymentDate || tx.transactionDate || tx.dateTime, month)) found.add(tx.category);
    }
    return [...found].sort();
  }, [transactions, budgets, month]);

  const monthLabel = useMemo(() => new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(month), [month]);
  const subtitle = budgets.length === 0 ? "Adicione limites por categoria para acompanhar os gastos aqui."
    : totals.attention > 0 ? `${totals.attention} ${totals.attention === 1 ? "categoria precisa" : "categorias precisam"} de atenção` : "Todas as categorias estão dentro do limite.";

  if (!user) return null;
  return <View style={styles.screen}>
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(month, true)} colors={[nu.brand]} tintColor={nu.white} progressViewOffset={insets.top} />}>
      <View style={styles.overscroll} />
      <NuHeader contentHeight={232} onBack={() => router.canGoBack() ? router.back() : router.replace("/")}>
        <View style={styles.titleRow}>
          <Text style={styles.heroTitle}>Planejamento</Text>
          <View style={styles.heroActions}>
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: loading }} disabled={loading} onPress={() => { setNotice(null); setEditing({ budget: null }); }} style={({ pressed }) => [styles.newLimit, (pressed || loading) && styles.pressed]}>
              <SymbolView name={icons.plus} size={15} tintColor={nu.brand} weight="semibold" /><Text style={styles.newLimitText}>Novo limite</Text>
            </Pressable>
            <View style={styles.heroIcon}><SymbolView name={icons.target} size={18} tintColor={nu.white} /></View>
          </View>
        </View>
        <View style={styles.monthRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" hitSlop={8} onPress={() => shift(-1)} style={styles.monthButton}><SymbolView name={icons.prev} size={16} tintColor={nu.white} weight="semibold" /></Pressable>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Próximo mês" hitSlop={8} onPress={() => shift(1)} style={styles.monthButton}><SymbolView name={icons.next} size={16} tintColor={nu.white} weight="semibold" /></Pressable>
        </View>
        <Text style={styles.heroLabel}>Gasto no mês</Text>
        {loading ? <View style={styles.heroLoading}><ActivityIndicator color={nu.white} /></View> : <Text adjustsFontSizeToFit numberOfLines={1} style={styles.heroValue}>{error ? "—" : money(totals.spent)}</Text>}
        <Text style={styles.heroCaption}>{loading ? "Carregando…" : error ? "Resumo indisponível" : `de ${money(totals.limit)} em limites`}</Text>
        <View accessibilityRole="progressbar" accessibilityLabel="Uso total dos limites" accessibilityValue={loading || error ? undefined : { min: 0, max: 100, now: Math.round(totals.progress) }} style={styles.heroProgress}>
          <View style={[styles.heroProgressFill, { width: `${loading || error ? 0 : totals.progress}%` }]} />
        </View>
      </NuHeader>
      <View style={styles.sheet}>
        {notice ? <View accessibilityRole="alert" style={styles.notice}><Text style={styles.noticeText}>{notice}</Text></View> : null}
        <View style={nuSection.container}>
          <Text style={nuSection.title}>Seus orçamentos</Text>
          <Text style={nuSection.subtitle}>{loading || error ? "Limites mensais por categoria" : subtitle}</Text>
          <View style={styles.body}>
            {loading ? <State title="Carregando orçamentos…"><ActivityIndicator color={nu.brand} /></State>
              : error ? <State title="Orçamentos indisponíveis" caption={error}><Button label="Tentar novamente" onPress={() => void load(month)} /></State>
              : budgets.length === 0 ? <State title="Nenhum orçamento por categoria" caption="Adicione um limite mensal para começar a acompanhar uma categoria."><Button label="Adicionar primeiro limite" onPress={() => setEditing({ budget: null })} /></State>
              : <View style={styles.cards}>{budgets.map((item) => <BudgetCard key={item.id} budget={item} onEdit={() => { setNotice(null); setEditing({ budget: item }); }} />)}</View>}
          </View>
        </View>
      </View>
    </ScrollView>
    {editing ? <BudgetSheet key={editing.budget?.id ?? "new"} budget={editing.budget} month={month} suggestions={suggestions} onClose={() => setEditing(null)} onSaved={(message) => { setEditing(null); setNotice(message); void load(month, true); }} /> : null}
  </View>;
}

function BudgetCard({ budget, onEdit }: { budget: CategoryBudget; onEdit: () => void }) {
  const { color, tint } = tone(budget);
  const pct = Math.min(100, Math.max(0, budget.percentageUsed));
  return <Pressable accessibilityRole="button" accessibilityLabel={`Editar limite de ${budget.category}`} onPress={onEdit} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
    <View style={styles.cardTop}>
      <View style={styles.cardCopy}><Text numberOfLines={1} style={styles.cardName}>{budget.category}</Text><Text style={styles.cardCaption}>{money(budget.spentAmount)} gastos de {money(budget.limitAmount)}</Text></View>
      <View style={[styles.pill, { backgroundColor: tint }]}><Text style={[styles.pillText, { color }]}>{Math.round(budget.percentageUsed)}%</Text></View>
    </View>
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }} style={styles.track}><View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} /></View>
    <Text style={[styles.remaining, budget.exceeded && { color: nu.negative }]}>{budget.exceeded ? `${money(Math.abs(budget.remainingAmount))} acima do limite` : `Sobram ${money(budget.remainingAmount)}`}</Text>
  </Pressable>;
}
function State({ title, caption, children }: { title: string; caption?: string; children?: React.ReactNode }) {
  return <View style={styles.state}><SymbolView name={icons.target} size={30} tintColor={nu.brand} /><Text style={styles.stateTitle}>{title}</Text>{caption ? <Text style={styles.stateCaption}>{caption}</Text> : null}{children}</View>;
}
function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: nu.white },
  overscroll: { position: "absolute", left: 0, right: 0, top: -1000, height: 1000, backgroundColor: nu.brand },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  heroTitle: { color: nu.white, fontSize: 20, fontWeight: "700" },
  heroActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  newLimit: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: nu.white, borderRadius: 999, paddingHorizontal: 14, minHeight: 44 },
  newLimitText: { color: nu.brand, fontWeight: "700", fontSize: 13 },
  heroIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "rgba(255,255,255,0.16)" },
  monthRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  monthButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  monthLabel: { color: nu.white, fontSize: 14, fontWeight: "600", textTransform: "capitalize", minWidth: 130, textAlign: "center" },
  heroLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 },
  heroLoading: { alignItems: "flex-start", justifyContent: "center", height: 43 },
  heroValue: { color: nu.white, fontSize: 32, fontWeight: "700", letterSpacing: -0.9, fontVariant: ["tabular-nums"] },
  heroCaption: { color: "rgba(255,255,255,0.75)", fontSize: 12, lineHeight: 18, marginTop: 3 },
  heroProgress: { height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, overflow: "hidden", marginTop: 12 },
  heroProgressFill: { height: 4, backgroundColor: nu.white, borderRadius: 2 },
  sheet: { marginTop: -NU_SHEET_OVERLAP, backgroundColor: nu.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 5 },
  body: { marginTop: 16 },
  cards: { gap: 16 },
  card: { backgroundColor: nu.surface, borderRadius: 20, padding: 16, gap: 12 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardCopy: { flex: 1, minWidth: 0 },
  cardName: { color: nu.ink, fontSize: 16, fontWeight: "700" },
  cardCaption: { color: nu.inkSoft, fontSize: 12, marginTop: 3, fontVariant: ["tabular-nums"] },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  pillText: { fontSize: 12, fontWeight: "700" },
  track: { height: 8, borderRadius: 4, backgroundColor: nu.track, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
  remaining: { color: nu.ink, fontSize: 13, fontWeight: "600" },
  state: { backgroundColor: nu.surface, borderRadius: 20, alignItems: "center", padding: 24, gap: 12 },
  stateTitle: { color: nu.ink, fontSize: 16, fontWeight: "700", textAlign: "center" },
  stateCaption: { color: nu.inkSoft, fontSize: 13, lineHeight: 20, textAlign: "center" },
  button: { minHeight: 44, backgroundColor: nu.brand, borderRadius: 999, paddingHorizontal: 20, alignItems: "center", justifyContent: "center", marginTop: 4 },
  buttonText: { color: nu.white, fontSize: 14, fontWeight: "600" },
  notice: { marginHorizontal: 20, marginTop: 16, borderRadius: 12, backgroundColor: nu.positiveTint, padding: 14 },
  noticeText: { color: nu.positive, fontSize: 13 },
  pressed: { opacity: 0.65 },
});
