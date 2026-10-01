import { SymbolView } from "expo-symbols";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BankLogo } from "@/components/accounts/BankLogo";
import { useAuth } from "@/contexts/AuthContext";
import { AccountSettingsSheet } from "@/features/accounts/AccountSettingsSheet";
import { AccountTransferSheet } from "@/features/accounts/AccountTransferSheet";
import { ApiError, getAccountActivityPage, getAccountDetails } from "@/services/api";
import { colors } from "@/theme/colors";
import type { AccountActivityItem, AccountActivityPage, AccountDetails } from "@/types/finance";

type SymbolName = ComponentProps<typeof SymbolView>["name"];
type ActivityTab = "recent" | "upcoming";
type ActivityFilter = "ALL" | "INCOME" | "EXPENSE" | "TRANSFER";

const icons = {
  back: { ios: "chevron.left", android: "arrow_back", web: "arrow_back" },
  expense: { ios: "arrow.down", android: "south", web: "south" },
  hidden: { ios: "eye.slash", android: "visibility_off", web: "visibility_off" },
  income: { ios: "arrow.up", android: "north", web: "north" },
  next: { ios: "chevron.right", android: "chevron_right", web: "chevron_right" },
  previous: { ios: "chevron.left", android: "chevron_left", web: "chevron_left" },
  settings: { ios: "gearshape.fill", android: "settings", web: "settings" },
  transfer: { ios: "arrow.left.arrow.right", android: "swap_horiz", web: "swap_horiz" },
  visible: { ios: "eye", android: "visibility", web: "visibility" },
  warning: { ios: "exclamationmark.triangle.fill", android: "warning", web: "warning" },
} satisfies Record<string, SymbolName>;

const typeLabels: Record<AccountDetails["account"]["type"], string> = {
  CURRENT: "Conta corrente", SAVINGS: "Poupança", CASH: "Dinheiro", CREDIT_CARD: "Crédito",
};
const statusLabels: Record<string, string> = {
  PLANNED: "Planejada", PENDING: "Pendente", CLEARED: "Compensada", RECONCILED: "Reconciliada",
};
const filterLabels: Record<ActivityFilter, string> = {
  ALL: "Todos", INCOME: "Entradas", EXPENSE: "Saídas", TRANSFER: "Transferências",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "GBP" }).format(value);
}

function formatDate(value: string, full = false) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) return "Data indisponível";
  return new Intl.DateTimeFormat("pt-BR", full
    ? { day: "2-digit", month: "long", year: "numeric" }
    : { day: "2-digit", month: "short" }).format(new Date(year, month - 1, day));
}

function isIncoming(item: AccountActivityItem) {
  return item.kind === "INCOME" || item.kind === "TRANSFER_IN";
}

function matchesFilter(item: AccountActivityItem, filter: ActivityFilter) {
  if (filter === "ALL") return true;
  if (filter === "TRANSFER") return item.kind === "TRANSFER_IN" || item.kind === "TRANSFER_OUT";
  return item.kind === filter;
}

function ActivityRow({ hidden, item, first }: { hidden: boolean; item: AccountActivityItem; first: boolean }) {
  const incoming = isIncoming(item);
  const transfer = item.kind === "TRANSFER_IN" || item.kind === "TRANSFER_OUT";
  const status = item.status ? statusLabels[item.status] ?? item.status : null;
  const metadata = [formatDate(item.date), transfer ? "Transferência" : item.category || "Transação", item.paymentMethodName]
    .filter(Boolean).join(" · ");
  return (
    <View style={[styles.activityRow, !first && styles.activityRowBorder]}>
      <View style={[styles.activityIcon, incoming ? styles.incomeIcon : styles.expenseIcon]}>
        <SymbolView name={transfer ? icons.transfer : incoming ? icons.income : icons.expense} size={17} tintColor={incoming ? colors.income : colors.expense} weight="semibold" />
      </View>
      <View style={styles.activityCopy}>
        <View style={styles.activityTitleRow}>
          <Text numberOfLines={1} style={styles.activityTitle}>{item.description?.trim() || item.category || "Movimento"}</Text>
          {status ? <Text style={styles.statusBadge}>{status}</Text> : null}
        </View>
        <Text numberOfLines={1} style={styles.activityMeta}>{metadata}</Text>
      </View>
      <Text numberOfLines={1} style={[styles.activityAmount, incoming ? styles.incomeAmount : styles.expenseAmount]}>
        {hidden ? "••••" : `${incoming ? "+" : "−"}${formatCurrency(Math.abs(Number(item.amount || 0)))}`}
      </Text>
    </View>
  );
}

export function AccountDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { user, logout } = useAuth();
  const accountId = Number(params.id);
  const [details, setDetails] = useState<AccountDetails | null>(null);
  const [activity, setActivity] = useState<AccountActivityPage | null>(null);
  const [activityPage, setActivityPage] = useState(0);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balancesHidden, setBalancesHidden] = useState(false);
  const [selectedTab, setSelectedTab] = useState<ActivityTab>("recent");
  const [selectedFilter, setSelectedFilter] = useState<ActivityFilter>("ALL");
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [transferVisible, setTransferVisible] = useState(false);

  const loadDetails = useCallback(async () => {
    if (!user || !Number.isFinite(accountId)) return;
    try { setDetails(await getAccountDetails(user.token, accountId)); }
    catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 401) { await logout(); return; }
      throw loadError;
    }
  }, [accountId, logout, user]);

  const loadActivity = useCallback(async (page: number) => {
    if (!user || !Number.isFinite(accountId)) return;
    setActivityLoading(true); setActivityError(null);
    try { setActivity(await getAccountActivityPage(user.token, accountId, page, 10)); }
    catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 401) { await logout(); return; }
      setActivityError("Não foi possível carregar o histórico.");
    } finally { setActivityLoading(false); }
  }, [accountId, logout, user]);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true); setError(null);
    try { await Promise.all([loadDetails(), loadActivity(activityPage)]); }
    catch { setError("Não foi possível carregar os detalhes desta conta."); }
    finally { setLoading(false); setRefreshing(false); }
  }, [activityPage, loadActivity, loadDetails]);

  useEffect(() => { void load(); }, [load]);

  const account = details?.account;
  const displayedItems = selectedTab === "recent" ? activity?.items ?? details?.recentActivity ?? [] : details?.upcomingActivity ?? [];
  const filteredItems = displayedItems.filter((item) => matchesFilter(item, selectedFilter));
  const overdraftUsed = Number(account?.overdraftUsed || 0);
  const overdraftLimit = Number(account?.overdraftLimit || 0);
  const overdraftPercentage = Math.max(0, Math.min(100, Number(account?.overdraftPercentageUsed || 0)));
  const needsWarning = Boolean(account && (account.currentBalance < 0 || overdraftPercentage >= 75));
  const displayMoney = (value: number) => balancesHidden ? "••••••" : formatCurrency(value);

  if (!user) return null;
  if (loading && !details) return <SafeAreaView style={styles.safeArea}><View style={styles.loading}><ActivityIndicator color={colors.forest} /></View></SafeAreaView>;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.forest} />}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Voltar" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <SymbolView name={icons.back} size={21} tintColor={colors.ink} weight="semibold" />
          </Pressable>
          <Text style={styles.pageTitle}>Detalhes da conta</Text>
        </View>

        {error || !account ? (
          <View style={styles.errorCard}><Text style={styles.errorTitle}>Conta indisponível</Text><Text style={styles.errorText}>{error || "Esta conta não foi encontrada."}</Text><Pressable onPress={() => void load()}><Text style={styles.retryText}>Tentar novamente</Text></Pressable></View>
        ) : (
          <>
            <View style={styles.hero}>
              <View style={styles.accountHeading}>
                <BankLogo institution={account.institution} name={account.name} size={48} />
                <View style={styles.accountCopy}><Text numberOfLines={1} style={styles.institution}>{account.institution || typeLabels[account.type]}</Text><Text numberOfLines={1} style={styles.accountName}>{account.name}</Text></View>
                <Pressable accessibilityLabel={balancesHidden ? "Mostrar valores" : "Ocultar valores"} accessibilityRole="button" onPress={() => setBalancesHidden((current) => !current)} style={({ pressed }) => [styles.heroIconButton, pressed && styles.pressed]}>
                  <SymbolView name={balancesHidden ? icons.visible : icons.hidden} size={19} tintColor={colors.inkSoft} weight="semibold" />
                </Pressable>
                <Pressable accessibilityLabel="Configurações da conta" accessibilityRole="button" onPress={() => setSettingsVisible(true)} style={({ pressed }) => [styles.heroIconButton, pressed && styles.pressed]}>
                  <SymbolView name={icons.settings} size={19} tintColor={colors.inkSoft} weight="semibold" />
                </Pressable>
              </View>
              <View style={styles.heroDivider} />
              <Text style={styles.balanceLabel}>SALDO ATUAL</Text>
              <View style={styles.balanceRow}>
                <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.balance, !balancesHidden && account.currentBalance < 0 && styles.negativeBalance]}>{displayMoney(Number(account.currentBalance || 0))}</Text>
                <View style={styles.balanceSideActions}>
                  {needsWarning ? (
                    <View style={styles.balanceWarningBadge}>
                      <SymbolView name={icons.warning} size={14} tintColor={colors.expense} weight="semibold" />
                      <Text numberOfLines={2} style={styles.balanceWarningText}>{overdraftPercentage >= 75 ? "Limite próximo" : "Saldo negativo"}</Text>
                    </View>
                  ) : null}
                  <Pressable accessibilityRole="button" onPress={() => setTransferVisible(true)} style={({ pressed }) => [styles.transferButton, pressed && styles.pressed]}>
                    <SymbolView name={icons.transfer} size={15} tintColor={colors.white} weight="semibold" />
                    <Text style={styles.transferButtonText}>Transferir</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={styles.balanceCaption}>{account.currency} · Conta ativa</Text>

              {account.type === "CURRENT" && overdraftLimit > 0 ? (
                <View style={styles.overdraftBlock}>
                  <View style={styles.overdraftHeading}><Text style={styles.overdraftLabel}>Cheque especial utilizado</Text><Text style={styles.overdraftValue}>{balancesHidden ? "••••" : `${Math.round(overdraftPercentage)}%`}</Text></View>
                  <View style={styles.overdraftTrack}><View style={[styles.overdraftProgress, { width: `${overdraftPercentage}%` }, overdraftPercentage >= 75 && styles.overdraftDanger]} /></View>
                  <View style={styles.overdraftMeta}><Text style={styles.overdraftMetaText}>Usado: {displayMoney(overdraftUsed)}</Text><Text style={styles.overdraftMetaText}>Disponível: {displayMoney(Number(account.overdraftAvailable || 0))}</Text></View>
                </View>
              ) : null}
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>INSTITUIÇÃO</Text><Text numberOfLines={1} style={styles.infoValue}>{account.institution || "Conta pessoal"}</Text></View>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>TIPO</Text><Text style={styles.infoValue}>{typeLabels[account.type]}</Text></View>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>MOEDA</Text><Text style={styles.infoValue}>{account.currency}</Text></View>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>DATA-BASE</Text><Text style={styles.infoValue}>{formatDate(account.balanceAnchorAt, true)}</Text></View>
              {account.createdAt ? <View style={styles.infoItem}><Text style={styles.infoLabel}>CRIADA EM</Text><Text style={styles.infoValue}>{formatDate(account.createdAt, true)}</Text></View> : null}
            </View>

            <View style={styles.sectionHeader}><View><Text style={styles.sectionEyebrow}>MOVIMENTOS</Text><Text style={styles.sectionTitle}>Atividade da conta</Text></View><Text style={styles.activityCount}>{filteredItems.length}</Text></View>
            <View style={styles.tabs}>
              {(["recent", "upcoming"] as ActivityTab[]).map((tab) => <Pressable accessibilityRole="tab" accessibilityState={{ selected: selectedTab === tab }} key={tab} onPress={() => { setSelectedTab(tab); setSelectedFilter("ALL"); }} style={[styles.tab, selectedTab === tab && styles.tabSelected]}><Text style={[styles.tabText, selectedTab === tab && styles.tabTextSelected]}>{tab === "recent" ? "Recentes" : "Próximos"}</Text></Pressable>)}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {(Object.keys(filterLabels) as ActivityFilter[]).map((filter) => <Pressable accessibilityRole="button" key={filter} onPress={() => setSelectedFilter(filter)} style={[styles.filter, selectedFilter === filter && styles.filterSelected]}><Text style={[styles.filterText, selectedFilter === filter && styles.filterTextSelected]}>{filterLabels[filter]}</Text></Pressable>)}
            </ScrollView>
            <View style={styles.activityCard}>
              {activityLoading && selectedTab === "recent" ? <ActivityIndicator color={colors.forest} style={styles.activityLoader} /> : null}
              {activityError && selectedTab === "recent" ? <Text style={styles.emptyText}>{activityError}</Text> : filteredItems.length > 0 ? filteredItems.map((item, index) => <ActivityRow first={index === 0} hidden={balancesHidden} item={item} key={`${item.kind}-${item.id}`} />) : <Text style={styles.emptyText}>{selectedTab === "upcoming" ? "Nenhum movimento futuro nesta conta." : selectedFilter === "ALL" ? "Nenhum movimento recente nesta conta." : "Nenhum movimento corresponde a este filtro."}</Text>}
            </View>
            {selectedTab === "recent" ? (
              <View style={styles.pagination}>
                <Pressable accessibilityLabel="Página mais recente" accessibilityRole="button" disabled={activityPage === 0 || activityLoading} onPress={() => setActivityPage((page) => Math.max(0, page - 1))} style={[styles.pageButton, (activityPage === 0 || activityLoading) && styles.pageButtonDisabled]}><SymbolView name={icons.previous} size={18} tintColor={colors.inkSoft} /></Pressable>
                <Text style={styles.pageLabel}>Página {activityPage + 1}</Text>
                <Pressable accessibilityLabel="Página mais antiga" accessibilityRole="button" disabled={!activity?.hasMore || activityLoading} onPress={() => setActivityPage((page) => page + 1)} style={[styles.pageButton, (!activity?.hasMore || activityLoading) && styles.pageButtonDisabled]}><SymbolView name={icons.next} size={18} tintColor={colors.inkSoft} /></Pressable>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
      {account ? <><AccountSettingsSheet account={account} onClose={() => setSettingsVisible(false)} onDeleted={() => router.back()} onSaved={(updated) => setDetails((current) => current ? { ...current, account: updated } : current)} visible={settingsVisible} /><AccountTransferSheet account={account} onClose={() => setTransferVisible(false)} onTransferred={() => void load(true)} visible={transferVisible} /></> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.paper, flex: 1 }, content: { padding: 18, paddingBottom: 42, paddingTop: 8 }, loading: { alignItems: "center", flex: 1, justifyContent: "center" },
  topBar: { alignItems: "center", flexDirection: "row", minHeight: 52 }, backButton: { alignItems: "center", backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 14, borderWidth: 1, height: 40, justifyContent: "center", width: 40 }, pressed: { opacity: 0.65 }, pageTitle: { color: colors.ink, flex: 1, fontSize: 19, fontWeight: "700", marginLeft: 12 },
  hero: { backgroundColor: colors.header, borderColor: "#C1D1D0", borderRadius: 26, borderWidth: 1, marginTop: 12, overflow: "hidden", padding: 17 }, accountHeading: { alignItems: "center", flexDirection: "row" }, accountCopy: { flex: 1, marginLeft: 12, minWidth: 0 }, institution: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" }, accountName: { color: colors.ink, fontSize: 18, fontWeight: "700", marginTop: 4 }, heroIconButton: { alignItems: "center", backgroundColor: "rgba(251,249,244,0.72)", borderColor: "rgba(255,255,255,0.82)", borderRadius: 13, borderWidth: 1, height: 38, justifyContent: "center", marginLeft: 7, width: 38 }, heroDivider: { backgroundColor: "rgba(48,94,101,0.15)", height: 1, marginVertical: 15 }, balanceLabel: { color: colors.inkFaint, fontSize: 9, fontWeight: "800", letterSpacing: 1.3 }, balanceRow: { alignItems: "center", flexDirection: "row", gap: 10 }, balance: { color: colors.ink, flex: 1, fontSize: 38, fontWeight: "800", letterSpacing: -1.2, marginTop: 4 }, balanceSideActions: { alignItems: "stretch", gap: 6 }, balanceWarningBadge: { alignItems: "center", backgroundColor: "rgba(242,230,227,0.9)", borderRadius: 11, flexDirection: "row", gap: 5, maxWidth: 96, paddingHorizontal: 8, paddingVertical: 6 }, balanceWarningText: { color: colors.expense, flexShrink: 1, fontSize: 8, fontWeight: "800", lineHeight: 10 }, negativeBalance: { color: colors.expense }, balanceCaption: { color: colors.inkSoft, fontSize: 10, marginTop: 4 },
  overdraftBlock: { backgroundColor: "rgba(251,249,244,0.56)", borderRadius: 15, marginTop: 15, padding: 12 }, overdraftHeading: { flexDirection: "row", justifyContent: "space-between" }, overdraftLabel: { color: colors.inkSoft, fontSize: 10, fontWeight: "700" }, overdraftValue: { color: colors.ink, fontSize: 10, fontWeight: "800" }, overdraftTrack: { backgroundColor: "rgba(48,94,101,0.13)", borderRadius: 4, height: 7, marginTop: 9, overflow: "hidden" }, overdraftProgress: { backgroundColor: colors.forest, borderRadius: 4, height: 7 }, overdraftDanger: { backgroundColor: colors.expense }, overdraftMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 7 }, overdraftMetaText: { color: colors.inkFaint, fontSize: 9 }, transferButton: { alignItems: "center", backgroundColor: colors.forest, borderRadius: 11, flexDirection: "row", gap: 5, justifyContent: "center", minHeight: 32, paddingHorizontal: 9 }, transferButtonText: { color: colors.white, fontSize: 9, fontWeight: "800" },
  infoCard: { backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 18, borderWidth: 1, flexDirection: "row", flexWrap: "wrap", marginTop: 18, padding: 12, rowGap: 14 }, infoItem: { paddingHorizontal: 4, width: "50%" }, infoLabel: { color: colors.inkFaint, fontSize: 7, fontWeight: "800", letterSpacing: 0.8 }, infoValue: { color: colors.ink, fontSize: 11, fontWeight: "700", marginTop: 5 },
  sectionHeader: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between", marginBottom: 11, marginTop: 25, paddingHorizontal: 3 }, sectionEyebrow: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 1.5 }, sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: "700", marginTop: 4 }, activityCount: { backgroundColor: colors.header, borderRadius: 11, color: colors.forest, fontSize: 11, fontWeight: "800", minWidth: 27, overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5, textAlign: "center" },
  tabs: { backgroundColor: colors.paperMuted, borderRadius: 15, flexDirection: "row", padding: 4 }, tab: { alignItems: "center", borderRadius: 12, flex: 1, minHeight: 38, justifyContent: "center" }, tabSelected: { backgroundColor: colors.paperRaised }, tabText: { color: colors.inkFaint, fontSize: 11, fontWeight: "700" }, tabTextSelected: { color: colors.forest }, filters: { gap: 7, paddingVertical: 11 }, filter: { backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 12, borderWidth: 1, justifyContent: "center", minHeight: 34, paddingHorizontal: 12 }, filterSelected: { backgroundColor: colors.header, borderColor: colors.forest }, filterText: { color: colors.inkSoft, fontSize: 10, fontWeight: "700" }, filterTextSelected: { color: colors.forest },
  activityCard: { backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 20, borderWidth: 1, overflow: "hidden", paddingHorizontal: 14 }, activityLoader: { paddingVertical: 18 }, activityRow: { alignItems: "center", flexDirection: "row", minHeight: 74, paddingVertical: 11 }, activityRowBorder: { borderColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth }, activityIcon: { alignItems: "center", borderRadius: 12, height: 38, justifyContent: "center", marginRight: 10, width: 38 }, incomeIcon: { backgroundColor: colors.incomeTint }, expenseIcon: { backgroundColor: colors.expenseTint }, activityCopy: { flex: 1, minWidth: 0 }, activityTitleRow: { alignItems: "center", flexDirection: "row", gap: 5 }, activityTitle: { color: colors.ink, flexShrink: 1, fontSize: 12, fontWeight: "700" }, statusBadge: { backgroundColor: colors.paperMuted, borderRadius: 6, color: colors.inkSoft, fontSize: 7, fontWeight: "800", overflow: "hidden", paddingHorizontal: 5, paddingVertical: 3 }, activityMeta: { color: colors.inkFaint, fontSize: 8, marginTop: 5 }, activityAmount: { fontSize: 11, fontWeight: "800", marginLeft: 7, maxWidth: 84 }, incomeAmount: { color: colors.income }, expenseAmount: { color: colors.expense }, emptyText: { color: colors.inkSoft, fontSize: 12, lineHeight: 18, padding: 24, textAlign: "center" },
  pagination: { alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: 12 }, pageButton: { alignItems: "center", backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 12, borderWidth: 1, height: 38, justifyContent: "center", width: 42 }, pageButtonDisabled: { opacity: 0.35 }, pageLabel: { color: colors.inkSoft, fontSize: 10, fontWeight: "700", marginHorizontal: 14 }, errorCard: { alignItems: "center", backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 20, borderWidth: 1, marginTop: 14, padding: 28 }, errorTitle: { color: colors.ink, fontSize: 17, fontWeight: "700" }, errorText: { color: colors.inkSoft, fontSize: 12, marginTop: 7, textAlign: "center" }, retryText: { color: colors.forest, fontSize: 13, fontWeight: "800", marginTop: 16 },
});
