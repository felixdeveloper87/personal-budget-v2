import { useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import type { ReactNode } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { NuHeader, NU_SHEET_OVERLAP } from "@/components/dashboard/NuHeader";
import { nu, nuSection } from "@/components/dashboard/nuTheme";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, listSavingsGoals, listTransactions } from "@/services/api";
import type { SavingsGoal } from "@/types/goals";
import { GoalCard, goalIcons } from "./GoalCard";
import { GoalSheet, type GoalAction } from "./GoalSheet";
import { breakEven, goalsSummary, money, monthlyBalance } from "./goalUtils";

export function GoalsScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [balance, setBalance] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [action, setAction] = useState<GoalAction | null>(null);
  const sequence = useRef(0);
  const goalRevision = useRef(0);
  const summary = useMemo(() => goalsSummary(goals), [goals]);

  const load = useCallback(async (refresh = false) => {
    if (!user) return;
    const current = ++sequence.current;
    const revision = goalRevision.current;
    const date = new Date();
    setNow(date);
    if (refresh) setRefreshing(true);
    else { setLoading(true); setBalanceLoading(true); }
    setError(null);
    setBalanceError(false);
    const [goalResult, transactionResult] = await Promise.allSettled([listSavingsGoals(user.token), listTransactions(user.token)]);
    if (current !== sequence.current) return;
    for (const result of [goalResult, transactionResult]) {
      if (result.status === "rejected" && result.reason instanceof ApiError && result.reason.status === 401) {
        await logout(); return;
      }
    }
    if (revision === goalRevision.current) {
      if (goalResult.status === "fulfilled") setGoals(goalResult.value);
      else setError("Não foi possível carregar suas metas. Tente novamente.");
    }
    if (transactionResult.status === "fulfilled") setBalance(monthlyBalance(transactionResult.value, date));
    else setBalanceError(true);
    setLoading(false);
    setBalanceLoading(false);
    setRefreshing(false);
  }, [user, logout]);

  useFocusEffect(useCallback(() => {
    setStatusBarStyle("light");
    void load();
    return () => { sequence.current += 1; setStatusBarStyle("dark"); };
  }, [load]));

  function saved(goal: SavingsGoal | null, message: string) {
    // Invalidate an older refresh so it cannot overwrite a successful mutation.
    goalRevision.current += 1;
    setLoading(false);
    setError(null);
    if (goal) setGoals((previous) => [goal, ...previous.filter((item) => item.id !== goal.id)]);
    else if (action?.kind === "archive") setGoals((previous) => previous.filter((item) => item.id !== action.goal.id));
    setAction(null);
    setNotice(message);
  }
  const newGoal = () => { setNotice(null); setAction({ kind: "form", goal: null }); };

  if (!user) return null;
  return <View style={styles.screen}>
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} colors={[nu.brand]} tintColor={nu.white} progressViewOffset={insets.top} />}>
      <View style={styles.overscroll} />
      <NuHeader contentHeight={232} onBack={() => router.canGoBack() ? router.back() : router.replace("/")}>
        <View style={styles.titleRow}><Text style={styles.heroTitle}>Metas</Text><View style={styles.heroActions}>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: loading }} disabled={loading} onPress={newGoal} style={({ pressed }) => [styles.newGoal, (pressed || loading) && styles.pressed]}><SymbolView name={goalIcons.plus} size={15} tintColor={nu.brand} weight="semibold" /><Text style={styles.newGoalText}>Nova meta</Text></Pressable>
          <View style={styles.heroIcon}><SymbolView name={goalIcons.target} size={18} tintColor={nu.white} /></View>
        </View></View>
        <Text style={styles.heroLabel}>Economizado</Text>
        {loading ? <View style={styles.heroLoading}><ActivityIndicator color={nu.white} /></View> : <Text adjustsFontSizeToFit numberOfLines={1} style={styles.heroValue}>{error ? "—" : money(summary.saved)}</Text>}
        <Text style={styles.heroCaption}>{loading ? "Carregando suas metas…" : error ? "Resumo indisponível" : `Meta ${money(summary.target)} · Faltam ${money(summary.remaining)}`}</Text>
        <View accessibilityRole="progressbar" accessibilityLabel="Progresso total das metas" accessibilityValue={loading || error ? undefined : { min: 0, max: 100, now: summary.progress }} style={styles.heroProgress}>
          <View style={[styles.heroProgressFill, { width: `${loading || error ? 0 : summary.progress}%` }]} />
        </View>
        <View style={styles.heroFooter}><View><Text style={styles.heroSmall}>Suas metas</Text><Text style={styles.heroCount}>{loading || error ? "—" : `${summary.active.length} ${summary.active.length === 1 ? "meta ativa" : "metas ativas"}`}</Text></View>
          <Text style={styles.heroPercent}>{loading || error ? "—" : `${Math.round(summary.progress)}%`}</Text>
        </View>
      </NuHeader>
      <View style={styles.sheet}>
        {notice ? <View accessibilityRole="alert" style={styles.notice}><Text style={styles.noticeText}>{notice}</Text><Pressable accessibilityRole="button" accessibilityLabel="Dispensar mensagem" hitSlop={8} onPress={() => setNotice(null)}><SymbolView name={goalIcons.close} size={14} tintColor={nu.positive} /></Pressable></View> : null}
        <Section title="Suas metas" caption="Progresso, objetivos e sua próxima contribuição">
          {loading ? <State title="Carregando metas…"><ActivityIndicator color={nu.brand} /></State> : error ? <State title="Metas indisponíveis" caption={error}><Button label="Tentar novamente" onPress={() => void load()} /></State> : summary.open.length > 0 ?
            <View style={styles.cards}>{summary.open.map((goal) => <GoalCard key={goal.id} goal={goal} now={now} onContribute={() => setAction({ kind: "contribute", goal })} onEdit={() => setAction({ kind: "form", goal })} onArchive={() => setAction({ kind: "archive", goal })} />)}</View> :
            summary.completed.length === 0 ? <State title="Nenhuma meta ainda" caption="Suas metas de economia ativas aparecerão aqui."><Button label="Criar sua primeira meta" onPress={newGoal} /></State> : <Text style={styles.caption}>Você alcançou todas as suas metas. Crie um novo objetivo para continuar.</Text>}
        </Section>
        {!loading && !error && summary.completed.length > 0 ? <Section title="Concluídas" caption="Metas que você já alcançou"><View style={styles.cards}>
          {summary.completed.map((goal) => <GoalCard key={goal.id} goal={goal} now={now} onContribute={() => setAction({ kind: "contribute", goal })} onEdit={() => setAction({ kind: "form", goal })} onArchive={() => setAction({ kind: "archive", goal })} />)}
        </View></Section> : null}
        <Section title="Este mês" caption="Um caminho prático do saldo de hoje até o próximo marco">
          {balanceLoading ? <State title="Carregando saldo…"><ActivityIndicator color={nu.brand} /></State> : balanceError ? <State title="Saldo indisponível" caption="Não foi possível carregar o saldo deste mês."><Button label="Tentar novamente" onPress={() => void load(true)} /></State> : <MonthlyGoal balance={balance} now={now} />}
        </Section>
      </View>
    </ScrollView>
    {action ? <GoalSheet key={`${action.kind}-${action.goal?.id ?? "new"}`} action={action} onClose={() => setAction(null)} onSaved={saved} /> : null}
  </View>;
}

function MonthlyGoal({ balance, now }: { balance: number; now: Date }) {
  const target = breakEven(balance, now);
  const inRed = target.gap > 0;
  return <View style={[styles.monthPanel, { backgroundColor: inRed ? nu.brand : nu.positive }]}>
    <View pointerEvents="none" style={StyleSheet.absoluteFill}><Svg width="100%" height="100%">
      <Defs><LinearGradient id="monthlyGoal" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={inRed ? nu.brand : nu.positive} /><Stop offset="1" stopColor={inRed ? nu.brandDeep : "#166b46"} /></LinearGradient></Defs>
      <Rect width="100%" height="100%" fill="url(#monthlyGoal)" /><Circle cx="95%" cy="0" r={85} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={28} /><Circle cx="75%" cy="110%" r={70} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={20} />
    </Svg></View>
    <View style={styles.monthBadge}><Text style={styles.monthBadgeText}>Meta para chegar ao equilíbrio</Text></View>
    {inRed ? <>
      <View style={styles.dailyRow}><Text adjustsFontSizeToFit numberOfLines={1} style={styles.dailyValue}>{money(target.dailyTarget)}</Text>{target.earningDays > 0 ? <Text style={styles.dailyUnit}>/ dia</Text> : null}</View>
      <Text style={styles.monthCaption}>{target.earningDays > 0 ? `para ganhar por dia e cobrir os ${money(target.gap)} que faltam` : `Faltam ${money(target.gap)} para equilibrar o mês.`}</Text>
    </> : <><Text style={styles.reached}>Você está no azul</Text><Text style={styles.monthCaption}>Seu saldo já está em zero ou acima.</Text></>}
    <View style={styles.balanceRow}><Text style={styles.monthCaption}>Saldo atual</Text><Text style={styles.balanceValue}>{money(balance)}</Text></View>
  </View>;
}
function Section({ title, caption, children }: { title: string; caption: string; children: ReactNode }) {
  return <View style={styles.section}><Text style={nuSection.title}>{title}</Text><Text style={nuSection.subtitle}>{caption}</Text><View style={styles.sectionBody}>{children}</View></View>;
}
function State({ title, caption, children }: { title: string; caption?: string; children?: ReactNode }) {
  return <View style={styles.state}><SymbolView name={goalIcons.target} size={30} tintColor={nu.brand} /><Text style={styles.stateTitle}>{title}</Text>{caption ? <Text style={styles.caption}>{caption}</Text> : null}{children}</View>;
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
  newGoal: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: nu.white, borderRadius: 999, paddingHorizontal: 14, minHeight: 44 },
  newGoalText: { color: nu.brand, fontWeight: "700", fontSize: 13 },
  heroIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "rgba(255,255,255,0.16)" },
  heroLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 12 },
  heroLoading: { alignItems: "flex-start", justifyContent: "center", height: 43 },
  heroValue: { color: nu.white, fontSize: 32, fontWeight: "700", letterSpacing: -0.9, fontVariant: ["tabular-nums"] },
  heroCaption: { color: "rgba(255,255,255,0.75)", fontSize: 12, lineHeight: 18, marginTop: 3 },
  heroProgress: { height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, overflow: "hidden", marginTop: 14 },
  heroProgressFill: { height: 4, backgroundColor: nu.white, borderRadius: 2 },
  heroFooter: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.18)", paddingTop: 12, marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroSmall: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  heroCount: { fontSize: 17, color: nu.white, fontWeight: "600", marginTop: 3 },
  heroPercent: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  sheet: { marginTop: -NU_SHEET_OVERLAP, backgroundColor: nu.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 5 },
  section: nuSection.container,
  sectionBody: { marginTop: 16 },
  cards: { gap: 16 },
  caption: { fontSize: 13, color: nu.inkSoft, lineHeight: 20 },
  state: { backgroundColor: nu.surface, borderRadius: 20, alignItems: "center", padding: 24, gap: 12 },
  stateTitle: { color: nu.ink, fontSize: 16, fontWeight: "700" },
  button: { minHeight: 44, backgroundColor: nu.brand, borderRadius: 999, paddingHorizontal: 20, alignItems: "center", justifyContent: "center", marginTop: 4 },
  buttonText: { color: nu.white, fontSize: 14, fontWeight: "600" },
  notice: { marginHorizontal: 20, marginTop: 16, borderRadius: 12, backgroundColor: nu.positiveTint, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  noticeText: { color: nu.positive, fontSize: 13, flex: 1 },
  monthPanel: { padding: 20, borderRadius: 24, overflow: "hidden" },
  monthBadge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: "rgba(255,255,255,0.18)" },
  monthBadgeText: { fontSize: 11, fontWeight: "600", color: nu.white },
  dailyRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 20 },
  dailyValue: { flexShrink: 1, color: nu.white, fontSize: 38, fontWeight: "700", letterSpacing: -1, fontVariant: ["tabular-nums"] },
  dailyUnit: { fontSize: 15, color: "rgba(255,255,255,0.85)" },
  monthCaption: { fontSize: 13, lineHeight: 20, color: "rgba(255,255,255,0.85)", marginTop: 6 },
  reached: { color: nu.white, fontSize: 27, fontWeight: "700", marginTop: 20, letterSpacing: -0.5 },
  balanceRow: { flexDirection: "row", gap: 12, alignItems: "center", justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)" },
  balanceValue: { color: nu.white, fontSize: 17, fontWeight: "700", fontVariant: ["tabular-nums"] },
  pressed: { opacity: 0.65 },
});
