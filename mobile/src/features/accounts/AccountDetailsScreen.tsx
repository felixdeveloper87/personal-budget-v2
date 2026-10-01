import { SymbolView } from "expo-symbols";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BankLogo } from "@/components/accounts/BankLogo";
import { useAuth } from "@/contexts/AuthContext";
import { AccountSettingsSheet } from "@/features/accounts/AccountSettingsSheet";
import { ApiError, getAccountDetails } from "@/services/api";
import { colors } from "@/theme/colors";
import type { AccountActivityItem, AccountDetails } from "@/types/finance";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const icons = {
  back: { ios: "chevron.left", android: "arrow_back", web: "arrow_back" },
  expense: { ios: "arrow.down", android: "south", web: "south" },
  income: { ios: "arrow.up", android: "north", web: "north" },
  transfer: { ios: "arrow.left.arrow.right", android: "swap_horiz", web: "swap_horiz" },
  settings: { ios: "gearshape.fill", android: "settings", web: "settings" },
} satisfies Record<string, SymbolName>;

const typeLabels: Record<AccountDetails["account"]["type"], string> = {
  CURRENT: "Conta corrente",
  SAVINGS: "Poupança",
  CASH: "Dinheiro",
  CREDIT_CARD: "Crédito",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "GBP" }).format(value);
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
    .format(new Date(year, month - 1, day));
}

function isIncoming(item: AccountActivityItem) {
  return item.kind === "INCOME" || item.kind === "TRANSFER_IN";
}

function ActivityRow({ item, first }: { item: AccountActivityItem; first: boolean }) {
  const incoming = isIncoming(item);
  const transfer = item.kind === "TRANSFER_IN" || item.kind === "TRANSFER_OUT";

  return (
    <View style={[styles.activityRow, !first && styles.activityRowBorder]}>
      <View style={[styles.activityIcon, incoming ? styles.incomeIcon : styles.expenseIcon]}>
        <SymbolView
          name={transfer ? icons.transfer : incoming ? icons.income : icons.expense}
          size={17}
          tintColor={incoming ? colors.income : colors.expense}
          weight="semibold"
        />
      </View>
      <View style={styles.activityCopy}>
        <Text numberOfLines={1} style={styles.activityTitle}>
          {item.description?.trim() || item.category || "Movimento"}
        </Text>
        <Text style={styles.activityMeta}>{formatDate(item.date)} · {transfer ? "Transferência" : item.category || "Transação"}</Text>
      </View>
      <Text style={[styles.activityAmount, incoming ? styles.incomeAmount : styles.expenseAmount]}>
        {incoming ? "+" : "−"}{formatCurrency(Math.abs(Number(item.amount || 0)))}
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (!user || !Number.isFinite(accountId)) return;
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      setDetails(await getAccountDetails(user.token, accountId));
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 401) {
        await logout();
        return;
      }
      setError("Não foi possível carregar os detalhes desta conta.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accountId, logout, user]);

  useEffect(() => { void load(); }, [load]);

  if (!user) return null;

  if (loading && !details) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.loading}><ActivityIndicator color={colors.forest} /></View></SafeAreaView>;
  }

  const account = details?.account;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.forest} />}
      >
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Voltar" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <SymbolView name={icons.back} size={21} tintColor={colors.ink} weight="semibold" />
          </Pressable>
          <Text style={styles.pageTitle}>Detalhes da conta</Text>
          {account ? (
            <Pressable accessibilityLabel="Configurações da conta" accessibilityRole="button" onPress={() => setSettingsVisible(true)} style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}>
              <SymbolView name={icons.settings} size={20} tintColor={colors.inkSoft} weight="semibold" />
            </Pressable>
          ) : null}
        </View>

        {error || !account ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Conta indisponível</Text>
            <Text style={styles.errorText}>{error || "Esta conta não foi encontrada."}</Text>
            <Pressable onPress={() => void load()}><Text style={styles.retryText}>Tentar novamente</Text></Pressable>
          </View>
        ) : (
          <>
            <View style={styles.hero}>
              <View style={styles.accountHeading}>
                <BankLogo institution={account.institution} name={account.name} size={48} />
                <View style={styles.accountCopy}>
                  <Text numberOfLines={1} style={styles.institution}>{account.institution || typeLabels[account.type]}</Text>
                  <Text numberOfLines={1} style={styles.accountName}>{account.name}</Text>
                </View>
              </View>

              <View style={styles.heroDivider} />
              <Text style={styles.balanceLabel}>SALDO ATUAL</Text>
              <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.balance, account.currentBalance < 0 && styles.negativeBalance]}>
                {formatCurrency(Number(account.currentBalance || 0))}
              </Text>
              <Text style={styles.balanceCaption}>{account.currency} · Conta ativa</Text>

              <View style={styles.metrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>{account.type === "CURRENT" ? "LIMITE DISPONÍVEL" : "SALDO INICIAL"}</Text>
                  <Text numberOfLines={1} style={styles.metricValue}>
                    {formatCurrency(Number(account.type === "CURRENT" ? account.overdraftAvailable : account.openingBalance) || 0)}
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>TIPO DE CONTA</Text>
                  <Text numberOfLines={2} style={styles.metricValue}>{typeLabels[account.type]}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEyebrow}>MOVIMENTOS</Text>
              <Text style={styles.sectionTitle}>Atividade recente</Text>
            </View>
            <View style={styles.activityCard}>
              {details.recentActivity.length > 0 ? details.recentActivity.map((item, index) => (
                <ActivityRow first={index === 0} item={item} key={`${item.kind}-${item.id}`} />
              )) : (
                <Text style={styles.emptyText}>Nenhum movimento recente nesta conta.</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
      {account ? (
        <AccountSettingsSheet
          account={account}
          onClose={() => setSettingsVisible(false)}
          onDeleted={() => router.back()}
          onSaved={(updated) => setDetails((current) => current ? { ...current, account: updated } : current)}
          visible={settingsVisible}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.paper, flex: 1 },
  content: { padding: 18, paddingBottom: 42, paddingTop: 8 },
  loading: { alignItems: "center", flex: 1, justifyContent: "center" },
  topBar: { alignItems: "center", flexDirection: "row", minHeight: 52 },
  backButton: { alignItems: "center", backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 14, borderWidth: 1, height: 40, justifyContent: "center", width: 40 },
  pressed: { opacity: 0.65 },
  pageTitle: { color: colors.ink, flex: 1, fontSize: 19, fontWeight: "700", marginLeft: 12 },
  settingsButton: { alignItems: "center", backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 14, borderWidth: 1, height: 40, justifyContent: "center", width: 40 },
  hero: { backgroundColor: colors.header, borderColor: "#C1D1D0", borderRadius: 26, borderWidth: 1, marginTop: 12, overflow: "hidden", padding: 17 },
  accountHeading: { alignItems: "center", flexDirection: "row" },
  accountCopy: { flex: 1, marginLeft: 12 },
  institution: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" },
  accountName: { color: colors.ink, fontSize: 19, fontWeight: "700", marginTop: 4 },
  heroDivider: { backgroundColor: "rgba(48,94,101,0.15)", height: 1, marginVertical: 15 },
  balanceLabel: { color: colors.inkFaint, fontSize: 9, fontWeight: "800", letterSpacing: 1.3 },
  balance: { color: colors.ink, fontSize: 38, fontWeight: "800", letterSpacing: -1.2, marginTop: 4 },
  negativeBalance: { color: colors.expense },
  balanceCaption: { color: colors.inkSoft, fontSize: 10, marginTop: 4 },
  metrics: { flexDirection: "row", gap: 9, marginTop: 17 },
  metric: { backgroundColor: "rgba(251,249,244,0.68)", borderColor: "rgba(255,255,255,0.8)", borderRadius: 16, borderWidth: 1, flex: 1, minHeight: 83, padding: 12 },
  metricLabel: { color: colors.inkFaint, fontSize: 8, fontWeight: "800", letterSpacing: 0.9 },
  metricValue: { color: colors.ink, fontSize: 15, fontWeight: "800", marginTop: 10 },
  sectionHeader: { marginBottom: 11, marginTop: 25, paddingHorizontal: 3 },
  sectionEyebrow: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 1.5 },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: "700", marginTop: 4 },
  activityCard: { backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 20, borderWidth: 1, overflow: "hidden", paddingHorizontal: 14 },
  activityRow: { alignItems: "center", flexDirection: "row", minHeight: 72, paddingVertical: 11 },
  activityRowBorder: { borderColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth },
  activityIcon: { alignItems: "center", borderRadius: 12, height: 38, justifyContent: "center", marginRight: 10, width: 38 },
  incomeIcon: { backgroundColor: colors.incomeTint },
  expenseIcon: { backgroundColor: colors.expenseTint },
  activityCopy: { flex: 1, minWidth: 0 },
  activityTitle: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  activityMeta: { color: colors.inkFaint, fontSize: 9, marginTop: 5 },
  activityAmount: { fontSize: 12, fontWeight: "800", marginLeft: 7 },
  incomeAmount: { color: colors.income },
  expenseAmount: { color: colors.expense },
  emptyText: { color: colors.inkSoft, fontSize: 12, padding: 24, textAlign: "center" },
  errorCard: { alignItems: "center", backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 20, borderWidth: 1, marginTop: 14, padding: 28 },
  errorTitle: { color: colors.ink, fontSize: 17, fontWeight: "700" },
  errorText: { color: colors.inkSoft, fontSize: 12, marginTop: 7, textAlign: "center" },
  retryText: { color: colors.forest, fontSize: 13, fontWeight: "800", marginTop: 16 },
});
