import { setStatusBarStyle } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import { useFocusEffect, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BankLogo } from "@/components/accounts/BankLogo";
import { NU_SHEET_OVERLAP, NuHeader } from "@/components/dashboard/NuHeader";
import { nu, nuSection } from "@/components/dashboard/nuTheme";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, listAccounts } from "@/services/api";
import type { FinancialAccount } from "@/types/finance";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const icons = {
  back: { ios: "chevron.left", android: "arrow_back", web: "arrow_back" },
  chevron: { ios: "chevron.right", android: "chevron_right", web: "chevron_right" },
  hidden: { ios: "eye.slash", android: "visibility_off", web: "visibility_off" },
  visible: { ios: "eye", android: "visibility", web: "visibility" },
  wallet: { ios: "wallet.bifold.fill", android: "account_balance_wallet", web: "account_balance_wallet" },
} satisfies Record<string, SymbolName>;

const accountTypeLabels: Record<FinancialAccount["type"], string> = {
  CURRENT: "Conta corrente",
  SAVINGS: "Poupança",
  CASH: "Dinheiro",
  CREDIT_CARD: "Crédito",
};

const MASK = "••••••";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function countLabel(count: number) {
  return count === 1 ? "1 conta" : `${count} contas`;
}

function BalanceLine({
  bordered,
  count,
  hidden,
  label,
  value,
}: {
  bordered?: boolean;
  count: number;
  hidden: boolean;
  label: string;
  value: number;
}) {
  return (
    <View style={[styles.balanceLine, bordered && styles.balanceLineBordered]}>
      <Text numberOfLines={1} style={styles.balanceLineLabel}>{label}</Text>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        numberOfLines={1}
        style={[styles.balanceLineValue, !hidden && value < 0 && styles.heroNegative]}
      >
        {hidden ? MASK : formatCurrency(value)}
      </Text>
      <Text style={styles.balanceLineCount}>{countLabel(count)}</Text>
    </View>
  );
}

function AccountRow({
  account,
  first,
  hidden,
  onPress,
}: {
  account: FinancialAccount;
  first: boolean;
  hidden: boolean;
  onPress: () => void;
}) {
  const balance = Number(account.currentBalance || 0);
  return (
    <Pressable
      accessibilityLabel={`Abrir detalhes de ${account.name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, !first && styles.rowDivided, pressed && styles.rowPressed]}
    >
      <View style={styles.rowLogo}>
        <BankLogo institution={account.institution} name={account.name} size={42} />
      </View>
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={styles.rowTitle}>{account.name}</Text>
        <Text numberOfLines={1} style={styles.rowMeta}>
          {account.institution?.trim() || accountTypeLabels[account.type]} · {account.currency}
        </Text>
      </View>
      <View style={styles.rowTrailing}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          numberOfLines={1}
          style={[styles.rowAmount, !hidden && balance < 0 && styles.negativeValue]}
        >
          {hidden ? MASK : formatCurrency(balance)}
        </Text>
        <Text style={styles.rowAmountLabel}>Saldo</Text>
      </View>
      <SymbolView name={icons.chevron} size={14} tintColor={nu.brand} weight="semibold" />
    </Pressable>
  );
}

export function AccountsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [balancesHidden, setBalancesHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async (refresh = false) => {
    if (!user) return;
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const result = await listAccounts(user.token);
      setAccounts(
        result
          .filter((account) => account.active)
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
      );
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 401) {
        await logout();
        return;
      }
      setError("Não foi possível carregar os saldos das suas contas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout, user]);

  useFocusEffect(useCallback(() => {
    void loadAccounts();
  }, [loadAccounts]));

  // Light status-bar icons over the purple header, restored when leaving.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, []),
  );

  const summary = useMemo(() => {
    const current = accounts.filter((account) => account.type === "CURRENT");
    const savings = accounts.filter((account) => account.type === "SAVINGS");
    const sum = (list: FinancialAccount[]) =>
      list.reduce((total, account) => total + Number(account.currentBalance || 0), 0);
    return {
      current,
      currentBalance: sum(current),
      savings,
      savingsBalance: sum(savings),
      total: sum(accounts),
    };
  }, [accounts]);

  if (!user) return null;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[nu.brand]}
            onRefresh={() => void loadAccounts(true)}
            progressViewOffset={insets.top}
            refreshing={refreshing}
            tintColor={nu.white}
          />
        }
      >
        {/* Brand colour also fills the iOS overscroll area above the header. */}
        <View style={styles.overscrollFill} />

        <NuHeader onBack={() => router.back()}>
          <View style={styles.headerTitleRow}>
            <Text numberOfLines={1} style={styles.headerTitle}>Contas</Text>
            <Pressable
              accessibilityLabel={balancesHidden ? "Mostrar saldos" : "Ocultar saldos"}
              accessibilityRole="button"
              accessibilityState={{ checked: balancesHidden }}
              hitSlop={8}
              onPress={() => setBalancesHidden((current) => !current)}
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            >
              <SymbolView
                name={balancesHidden ? icons.visible : icons.hidden}
                size={17}
                tintColor={nu.white}
                weight="semibold"
              />
            </Pressable>
          </View>

          <Text style={styles.totalLabel}>Saldo total</Text>
          {loading ? (
            <View style={styles.loadingValue}>
              <ActivityIndicator color={nu.white} />
            </View>
          ) : (
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.6}
              numberOfLines={1}
              style={[styles.totalValue, !balancesHidden && summary.total < 0 && styles.heroNegative]}
            >
              {error ? "—" : balancesHidden ? MASK : formatCurrency(summary.total)}
            </Text>
          )}
          <Text numberOfLines={1} style={styles.totalCaption}>
            {loading
              ? "Carregando suas contas…"
              : error
                ? "Saldo indisponível no momento"
                : accounts.length === 1 ? "Posição de 1 conta ativa" : `Posição de ${accounts.length} contas ativas`}
          </Text>

          {!loading && !error ? (
            <View style={styles.balanceGrid}>
              <BalanceLine
                count={summary.current.length}
                hidden={balancesHidden}
                label="Contas correntes"
                value={summary.currentBalance}
              />
              <BalanceLine
                bordered
                count={summary.savings.length}
                hidden={balancesHidden}
                label="Poupanças"
                value={summary.savingsBalance}
              />
            </View>
          ) : null}
        </NuHeader>

        {/* White sheet: rounded top tucked over the purple header. */}
        <View style={styles.sheet}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionCopy}>
                <Text style={styles.sectionTitle}>Contas ativas</Text>
                <Text style={styles.sectionSubtitle}>
                  {loading ? "Carregando…" : error ? "Indisponível" : countLabel(accounts.length)}
                </Text>
              </View>
              {!loading && !error ? (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{accounts.length}</Text>
                </View>
              ) : null}
            </View>

            {loading ? (
              <View style={styles.stateCard}>
                <ActivityIndicator color={nu.brand} />
                <Text style={styles.stateText}>Carregando contas…</Text>
              </View>
            ) : error ? (
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>Contas indisponíveis</Text>
                <Text style={styles.stateText}>{error}</Text>
                <Pressable
                  onPress={() => void loadAccounts()}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              </View>
            ) : accounts.length === 0 ? (
              <View style={styles.stateCard}>
                <View style={styles.emptyIcon}>
                  <SymbolView name={icons.wallet} size={22} tintColor={nu.brand} weight="semibold" />
                </View>
                <Text style={styles.stateTitle}>Nenhuma conta ativa</Text>
                <Text style={styles.stateText}>Adicione uma conta na versão web para começar.</Text>
              </View>
            ) : (
              <View style={styles.list}>
                {accounts.map((account, index) => (
                  <AccountRow
                    account={account}
                    first={index === 0}
                    hidden={balancesHidden}
                    key={account.id}
                    onPress={() => router.push({
                      pathname: "/accounts/[id]",
                      params: { id: String(account.id) },
                    })}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: nu.white, flex: 1 },
  content: { paddingBottom: 42 },
  overscrollFill: { backgroundColor: nu.brand, height: 1000, left: 0, position: "absolute", right: 0, top: -1000 },
  pressed: { opacity: 0.7 },

  headerTitleRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  headerButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  headerTitle: { color: nu.white, flex: 1, fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  totalLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 6 },
  loadingValue: { alignItems: "flex-start", height: 40, justifyContent: "center" },
  totalValue: { color: nu.white, fontSize: 31, fontWeight: "700", letterSpacing: -0.9, fontVariant: ["tabular-nums"] },
  heroNegative: { color: "#FFC2B8" },
  totalCaption: { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  balanceGrid: {
    borderTopColor: "rgba(255,255,255,0.18)",
    borderTopWidth: 1,
    flexDirection: "row",
    marginTop: 8,
    paddingTop: 8,
  },
  balanceLine: { flex: 1, minWidth: 0 },
  balanceLineBordered: { borderLeftColor: "rgba(255,255,255,0.18)", borderLeftWidth: 1, marginLeft: 14, paddingLeft: 14 },
  balanceLineLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
  balanceLineValue: { color: nu.white, fontSize: 16, fontWeight: "700", marginTop: 2, fontVariant: ["tabular-nums"] },
  balanceLineCount: { color: "rgba(255,255,255,0.62)", fontSize: 10, marginTop: 1 },

  sheet: { backgroundColor: nu.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -NU_SHEET_OVERLAP, paddingTop: 4 },
  section: { paddingHorizontal: 20, paddingVertical: 18 },
  sectionHeader: { alignItems: "flex-start", flexDirection: "row", gap: 12, justifyContent: "space-between", marginBottom: 6 },
  sectionCopy: { flex: 1, minWidth: 0 },
  sectionTitle: nuSection.title,
  sectionSubtitle: nuSection.subtitle,
  pill: { backgroundColor: nu.brandTint, borderRadius: 999, minWidth: 30, paddingHorizontal: 11, paddingVertical: 5 },
  pillText: { color: nu.brand, fontSize: 12, fontWeight: "700", textAlign: "center" },

  list: { borderBottomColor: nu.hairline, borderBottomWidth: 1, borderTopColor: nu.hairline, borderTopWidth: 1, marginTop: 8 },
  row: { alignItems: "center", flexDirection: "row", gap: 12, minHeight: 74, paddingVertical: 12 },
  rowDivided: { borderTopColor: nu.hairline, borderTopWidth: 1 },
  rowPressed: { backgroundColor: "rgba(130,10,209,0.04)" },
  rowLogo: { flexShrink: 0 },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: nu.ink, fontSize: 15, fontWeight: "700" },
  rowMeta: { color: nu.inkSoft, fontSize: 11, marginTop: 2 },
  rowTrailing: { alignItems: "flex-end", maxWidth: 140 },
  rowAmount: { color: nu.ink, fontSize: 15, fontWeight: "700", fontVariant: ["tabular-nums"] },
  rowAmountLabel: { color: nu.inkFaint, fontSize: 10, marginTop: 2 },
  negativeValue: { color: nu.negative },

  stateCard: { alignItems: "center", backgroundColor: nu.surface, borderRadius: 16, gap: 8, marginTop: 10, padding: 26 },
  stateTitle: { color: nu.ink, fontSize: 16, fontWeight: "600" },
  stateText: { color: nu.inkSoft, fontSize: 13, lineHeight: 19, textAlign: "center" },
  emptyIcon: { alignItems: "center", backgroundColor: nu.brandTint, borderRadius: 22, height: 44, justifyContent: "center", marginBottom: 4, width: 44 },
  retryButton: { backgroundColor: nu.brand, borderRadius: 999, marginTop: 6, paddingHorizontal: 20, paddingVertical: 11 },
  retryText: { color: nu.white, fontSize: 14, fontWeight: "600" },
});
