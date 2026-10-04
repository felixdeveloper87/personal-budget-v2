import { setStatusBarStyle } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BankLogo } from "@/components/accounts/BankLogo";
import { NU_SHEET_OVERLAP, NuHeader } from "@/components/dashboard/NuHeader";
import { nu, nuSection } from "@/components/dashboard/nuTheme";
import { useAuth } from "@/contexts/AuthContext";
import { AccountSettingsSheet } from "@/features/accounts/AccountSettingsSheet";
import { AccountTransferSheet } from "@/features/accounts/AccountTransferSheet";
import { ApiError, getAccountActivityPage, getAccountDetails } from "@/services/api";
import type { AccountActivityItem, AccountActivityPage, AccountDetails } from "@/types/finance";

type SymbolName = ComponentProps<typeof SymbolView>["name"];
type ActivityTab = "recent" | "upcoming";
type ActivityFilter = "ALL" | "INCOME" | "EXPENSE" | "TRANSFER";

const icons = {
  back: { ios: "chevron.left", android: "arrow_back", web: "arrow_back" },
  expense: { ios: "arrow.up.right", android: "north_east", web: "north_east" },
  hidden: { ios: "eye.slash", android: "visibility_off", web: "visibility_off" },
  income: { ios: "arrow.down.left", android: "south_west", web: "south_west" },
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

const MASK = "••••••";

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
  const status = item.status && item.status !== "CLEARED" ? statusLabels[item.status] ?? item.status : null;
  const metadata = [formatDate(item.date), transfer ? "Transferência" : item.category || "Transação", item.paymentMethodName]
    .filter(Boolean).join(" · ");
  return (
    <View style={[styles.activityRow, !first && styles.rowDivided]}>
      <View style={[styles.activityIcon, incoming ? styles.incomeIcon : styles.expenseIcon]}>
        <SymbolView
          name={transfer ? icons.transfer : incoming ? icons.income : icons.expense}
          size={15}
          tintColor={incoming ? nu.positive : nu.negative}
          weight="semibold"
        />
      </View>
      <View style={styles.activityCopy}>
        <Text numberOfLines={1} style={styles.activityTitle}>{item.description?.trim() || item.category || "Movimento"}</Text>
        <Text numberOfLines={1} style={styles.activityMeta}>{metadata}</Text>
      </View>
      <View style={styles.activityTrailing}>
        <Text numberOfLines={1} style={[styles.activityAmount, incoming && styles.incomeAmount]}>
          {hidden ? "••••" : `${incoming ? "+" : "−"}${formatCurrency(Math.abs(Number(item.amount || 0)))}`}
        </Text>
        {status ? <Text style={styles.statusBadge}>{status}</Text> : null}
      </View>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: SymbolName; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
      <View style={styles.quickActionCircle}>
        <SymbolView name={icon} size={20} tintColor={nu.ink} weight="semibold" />
      </View>
      <Text numberOfLines={1} style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

function InfoRow({ label, value, first }: { label: string; value: string; first?: boolean }) {
  return (
    <View style={[styles.infoRow, !first && styles.rowDivided]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function AccountDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  // Light status-bar icons over the purple header, restored when leaving.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, []),
  );

  const account = details?.account;
  const displayedItems = selectedTab === "recent" ? activity?.items ?? details?.recentActivity ?? [] : details?.upcomingActivity ?? [];
  const filteredItems = displayedItems.filter((item) => matchesFilter(item, selectedFilter));
  const overdraftUsed = Number(account?.overdraftUsed || 0);
  const overdraftLimit = Number(account?.overdraftLimit || 0);
  const overdraftPercentage = Math.max(0, Math.min(100, Number(account?.overdraftPercentageUsed || 0)));
  const needsWarning = Boolean(account && (account.currentBalance < 0 || overdraftPercentage >= 75));
  const displayMoney = (value: number) => balancesHidden ? MASK : formatCurrency(value);
  const balance = Number(account?.currentBalance || 0);

  if (!user) return null;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[nu.brand]}
            onRefresh={() => void load(true)}
            progressViewOffset={insets.top}
            refreshing={refreshing}
            tintColor={nu.white}
          />
        }
      >
        {/* Brand colour also fills the iOS overscroll area above the header. */}
        <View style={styles.overscrollFill} />

        <NuHeader>
          <View style={styles.headerTitleRow}>
            <Pressable accessibilityLabel="Voltar" accessibilityRole="button" hitSlop={8} onPress={() => router.back()} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
              <SymbolView name={icons.back} size={17} tintColor={nu.white} weight="semibold" />
            </Pressable>
            <Text numberOfLines={1} style={styles.headerTitle}>{account?.name ?? "Detalhes da conta"}</Text>
            <Pressable
              accessibilityLabel={balancesHidden ? "Mostrar valores" : "Ocultar valores"}
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setBalancesHidden((current) => !current)}
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            >
              <SymbolView name={balancesHidden ? icons.visible : icons.hidden} size={17} tintColor={nu.white} weight="semibold" />
            </Pressable>
          </View>

          <Text style={styles.totalLabel}>Saldo atual</Text>
          {loading && !details ? (
            <View style={styles.loadingValue}><ActivityIndicator color={nu.white} /></View>
          ) : (
            <Text adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1} style={[styles.totalValue, !balancesHidden && balance < 0 && styles.heroNegative]}>
              {error || !account ? "—" : displayMoney(balance)}
            </Text>
          )}
          <Text numberOfLines={1} style={styles.totalCaption}>
            {account
              ? `${account.institution?.trim() || typeLabels[account.type]} · ${account.currency} · Conta ativa`
              : loading ? "Carregando conta…" : "Conta indisponível"}
          </Text>
          {account && needsWarning ? (
            <View style={styles.warningBadge}>
              <SymbolView name={icons.warning} size={12} tintColor={nu.white} weight="semibold" />
              <Text style={styles.warningText}>{overdraftPercentage >= 75 ? "Limite do cheque especial próximo" : "Saldo negativo"}</Text>
            </View>
          ) : null}
        </NuHeader>

        {/* White sheet: rounded top tucked over the purple header. */}
        <View style={styles.sheet}>
          {loading && !details ? (
            <View style={styles.section}>
              <View style={styles.stateCard}><ActivityIndicator color={nu.brand} /><Text style={styles.stateText}>Carregando detalhes…</Text></View>
            </View>
          ) : error || !account ? (
            <View style={styles.section}>
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>Conta indisponível</Text>
                <Text style={styles.stateText}>{error || "Esta conta não foi encontrada."}</Text>
                <Pressable onPress={() => void load()} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              {/* Identity + quick actions (Nubank-style round shortcuts). */}
              <View style={styles.section}>
                <View style={styles.identity}>
                  <BankLogo institution={account.institution} name={account.name} size={44} />
                  <View style={styles.identityCopy}>
                    <Text numberOfLines={1} style={styles.identityName}>{account.name}</Text>
                    <Text numberOfLines={1} style={styles.identityMeta}>{account.institution?.trim() || "Conta pessoal"} · {typeLabels[account.type]}</Text>
                  </View>
                </View>
                <View style={styles.quickActions}>
                  <QuickAction icon={icons.transfer} label="Transferir" onPress={() => setTransferVisible(true)} />
                  <QuickAction icon={icons.settings} label="Configurar" onPress={() => setSettingsVisible(true)} />
                </View>
              </View>

              {account.type === "CURRENT" && overdraftLimit > 0 ? (
                <View style={[styles.section, styles.sectionDivided]}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionCopy}>
                      <Text style={styles.sectionTitle}>Cheque especial</Text>
                      <Text style={styles.sectionSubtitle}>Limite de {displayMoney(overdraftLimit)}</Text>
                    </View>
                    <View style={[styles.pill, overdraftPercentage >= 75 && styles.pillDanger]}>
                      <Text style={[styles.pillText, overdraftPercentage >= 75 && styles.pillTextDanger]}>
                        {balancesHidden ? "••" : `${Math.round(overdraftPercentage)}%`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.trackFill, { width: `${overdraftPercentage}%` }, overdraftPercentage >= 75 && styles.trackDanger]} />
                  </View>
                  <View style={styles.trackMeta}>
                    <Text style={styles.trackMetaText}>Usado {displayMoney(overdraftUsed)}</Text>
                    <Text style={styles.trackMetaText}>Disponível {displayMoney(Number(account.overdraftAvailable || 0))}</Text>
                  </View>
                </View>
              ) : null}

              <View style={[styles.section, styles.sectionDivided]}>
                <Text style={styles.sectionTitle}>Informações</Text>
                <View style={styles.infoList}>
                  <InfoRow first label="Instituição" value={account.institution || "Conta pessoal"} />
                  <InfoRow label="Tipo" value={typeLabels[account.type]} />
                  <InfoRow label="Moeda" value={account.currency} />
                  <InfoRow label="Saldo inicial" value={displayMoney(Number(account.openingBalance || 0))} />
                  <InfoRow label="Data-base" value={formatDate(account.balanceAnchorAt, true)} />
                  {account.createdAt ? <InfoRow label="Criada em" value={formatDate(account.createdAt, true)} /> : null}
                </View>
              </View>

              <View style={[styles.section, styles.sectionDivided]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionCopy}>
                    <Text style={styles.sectionTitle}>Atividade da conta</Text>
                    <Text style={styles.sectionSubtitle}>Entradas, saídas e transferências</Text>
                  </View>
                  <View style={styles.pill}><Text style={styles.pillText}>{filteredItems.length}</Text></View>
                </View>

                <View style={styles.tabs}>
                  {(["recent", "upcoming"] as ActivityTab[]).map((tab) => (
                    <Pressable
                      accessibilityRole="tab"
                      accessibilityState={{ selected: selectedTab === tab }}
                      key={tab}
                      onPress={() => { setSelectedTab(tab); setSelectedFilter("ALL"); }}
                      style={[styles.tab, selectedTab === tab && styles.tabSelected]}
                    >
                      <Text style={[styles.tabText, selectedTab === tab && styles.tabTextSelected]}>{tab === "recent" ? "Recentes" : "Próximos"}</Text>
                    </Pressable>
                  ))}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
                  {(Object.keys(filterLabels) as ActivityFilter[]).map((filter) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedFilter === filter }}
                      key={filter}
                      onPress={() => setSelectedFilter(filter)}
                      style={[styles.filter, selectedFilter === filter && styles.filterSelected]}
                    >
                      <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextSelected]}>{filterLabels[filter]}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <View style={[styles.activityList, activityLoading && selectedTab === "recent" && activity ? styles.activityListLoading : null]}>
                  {activityLoading && selectedTab === "recent" && !activity ? <ActivityIndicator color={nu.brand} style={styles.activityLoader} /> : null}
                  {activityError && selectedTab === "recent" ? (
                    <Text style={styles.emptyText}>{activityError}</Text>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => <ActivityRow first={index === 0} hidden={balancesHidden} item={item} key={`${item.kind}-${item.id}`} />)
                  ) : (
                    <Text style={styles.emptyText}>
                      {selectedTab === "upcoming" ? "Nenhum movimento futuro nesta conta." : selectedFilter === "ALL" ? "Nenhum movimento recente nesta conta." : "Nenhum movimento corresponde a este filtro."}
                    </Text>
                  )}
                </View>

                {selectedTab === "recent" ? (
                  <View style={styles.pagination}>
                    <Pressable accessibilityLabel="Página mais recente" accessibilityRole="button" disabled={activityPage === 0 || activityLoading} onPress={() => setActivityPage((page) => Math.max(0, page - 1))} style={[styles.pageButton, (activityPage === 0 || activityLoading) && styles.pageButtonDisabled]}>
                      <SymbolView name={icons.previous} size={16} tintColor={nu.brand} weight="semibold" />
                    </Pressable>
                    <Text style={styles.pageLabel}>Página {activityPage + 1}</Text>
                    <Pressable accessibilityLabel="Página mais antiga" accessibilityRole="button" disabled={!activity?.hasMore || activityLoading} onPress={() => setActivityPage((page) => page + 1)} style={[styles.pageButton, (!activity?.hasMore || activityLoading) && styles.pageButtonDisabled]}>
                      <SymbolView name={icons.next} size={16} tintColor={nu.brand} weight="semibold" />
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </>
          )}
        </View>
      </ScrollView>
      {account ? (
        <>
          <AccountSettingsSheet account={account} onClose={() => setSettingsVisible(false)} onDeleted={() => router.back()} onSaved={(updated) => setDetails((current) => current ? { ...current, account: updated } : current)} visible={settingsVisible} />
          <AccountTransferSheet account={account} onClose={() => setTransferVisible(false)} onTransferred={() => void load(true)} visible={transferVisible} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: nu.white, flex: 1 },
  content: { paddingBottom: 42 },
  overscrollFill: { backgroundColor: nu.brand, height: 1000, left: 0, position: "absolute", right: 0, top: -1000 },
  pressed: { opacity: 0.7 },

  headerTitleRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  headerButton: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
  headerTitle: { color: nu.white, flex: 1, fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  totalLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 10 },
  loadingValue: { alignItems: "flex-start", height: 40, justifyContent: "center" },
  totalValue: { color: nu.white, fontSize: 31, fontWeight: "700", letterSpacing: -0.9, fontVariant: ["tabular-nums"] },
  heroNegative: { color: "#FFC2B8" },
  totalCaption: { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  warningBadge: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 999, flexDirection: "row", gap: 6, marginTop: 10, paddingHorizontal: 10, paddingVertical: 5 },
  warningText: { color: nu.white, fontSize: 11, fontWeight: "600" },

  sheet: { backgroundColor: nu.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -NU_SHEET_OVERLAP, paddingTop: 4 },
  section: { paddingHorizontal: 20, paddingVertical: 18 },
  sectionDivided: { borderTopColor: nu.hairline, borderTopWidth: 1 },
  sectionHeader: { alignItems: "flex-start", flexDirection: "row", gap: 12, justifyContent: "space-between", marginBottom: 6 },
  sectionCopy: { flex: 1, minWidth: 0 },
  sectionTitle: nuSection.title,
  sectionSubtitle: nuSection.subtitle,
  pill: { backgroundColor: nu.brandTint, borderRadius: 999, minWidth: 30, paddingHorizontal: 11, paddingVertical: 5 },
  pillText: { color: nu.brand, fontSize: 12, fontWeight: "700", textAlign: "center" },
  pillDanger: { backgroundColor: nu.negativeTint },
  pillTextDanger: { color: nu.negative },
  rowDivided: { borderTopColor: nu.hairline, borderTopWidth: 1 },

  identity: { alignItems: "center", flexDirection: "row", gap: 12 },
  identityCopy: { flex: 1, minWidth: 0 },
  identityName: { color: nu.ink, fontSize: 16, fontWeight: "700" },
  identityMeta: { color: nu.inkSoft, fontSize: 12, marginTop: 2 },
  quickActions: { flexDirection: "row", gap: 18, marginTop: 18 },
  quickAction: { alignItems: "center", width: 72 },
  quickActionCircle: { alignItems: "center", backgroundColor: nu.surface, borderRadius: 30, height: 60, justifyContent: "center", width: 60 },
  quickActionLabel: { color: nu.ink, fontSize: 12, fontWeight: "600", marginTop: 8 },

  track: { backgroundColor: nu.track, borderRadius: 999, height: 6, marginTop: 10, overflow: "hidden" },
  trackFill: { backgroundColor: nu.brand, borderRadius: 999, height: 6 },
  trackDanger: { backgroundColor: nu.negative },
  trackMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  trackMetaText: { color: nu.inkSoft, fontSize: 12 },

  infoList: { marginTop: 8 },
  infoRow: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between", minHeight: 48, paddingVertical: 12 },
  infoLabel: { color: nu.inkSoft, fontSize: 14 },
  infoValue: { color: nu.ink, flexShrink: 1, fontSize: 14, fontWeight: "600", textAlign: "right" },

  tabs: { backgroundColor: nu.surface, borderRadius: 999, flexDirection: "row", marginTop: 10, padding: 4 },
  tab: { alignItems: "center", borderRadius: 999, flex: 1, justifyContent: "center", minHeight: 36 },
  tabSelected: { backgroundColor: nu.white, shadowColor: nu.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
  tabText: { color: nu.inkSoft, fontSize: 13, fontWeight: "600" },
  tabTextSelected: { color: nu.ink },
  filters: { gap: 8, paddingVertical: 12 },
  filter: { backgroundColor: nu.surface, borderRadius: 999, justifyContent: "center", minHeight: 34, paddingHorizontal: 14 },
  filterSelected: { backgroundColor: nu.brand },
  filterText: { color: nu.ink, fontSize: 13, fontWeight: "500" },
  filterTextSelected: { color: nu.white, fontWeight: "700" },

  activityList: { minHeight: 80 },
  activityListLoading: { opacity: 0.45 },
  activityLoader: { paddingVertical: 18 },
  activityRow: { alignItems: "center", flexDirection: "row", gap: 12, minHeight: 68, paddingVertical: 12 },
  activityIcon: { alignItems: "center", borderRadius: 20, height: 40, justifyContent: "center", width: 40 },
  incomeIcon: { backgroundColor: nu.positiveTint },
  expenseIcon: { backgroundColor: nu.negativeTint },
  activityCopy: { flex: 1, minWidth: 0 },
  activityTitle: { color: nu.ink, fontSize: 15, fontWeight: "600" },
  activityMeta: { color: nu.inkSoft, fontSize: 12, marginTop: 3 },
  activityTrailing: { alignItems: "flex-end", gap: 4, maxWidth: 120 },
  activityAmount: { color: nu.ink, fontSize: 15, fontWeight: "700", fontVariant: ["tabular-nums"] },
  incomeAmount: { color: nu.positive },
  statusBadge: { backgroundColor: nu.surface, borderRadius: 999, color: nu.inkSoft, fontSize: 10, fontWeight: "600", overflow: "hidden", paddingHorizontal: 7, paddingVertical: 2 },
  emptyText: { backgroundColor: nu.surface, borderRadius: 16, color: nu.inkSoft, fontSize: 13, lineHeight: 19, overflow: "hidden", padding: 22, textAlign: "center" },

  pagination: { alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: 14 },
  pageButton: { alignItems: "center", backgroundColor: nu.brandTint, borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  pageButtonDisabled: { opacity: 0.35 },
  pageLabel: { color: nu.inkSoft, fontSize: 12, fontWeight: "600", marginHorizontal: 14 },

  stateCard: { alignItems: "center", backgroundColor: nu.surface, borderRadius: 16, gap: 8, marginTop: 10, padding: 26 },
  stateTitle: { color: nu.ink, fontSize: 16, fontWeight: "600" },
  stateText: { color: nu.inkSoft, fontSize: 13, lineHeight: 19, textAlign: "center" },
  retryButton: { backgroundColor: nu.brand, borderRadius: 999, marginTop: 6, paddingHorizontal: 20, paddingVertical: 11 },
  retryText: { color: nu.white, fontSize: 14, fontWeight: "600" },
});
