import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
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

import { useAuth } from "@/contexts/AuthContext";
import { AccountsHeroArtwork } from "@/features/accounts/AccountsHeroArtwork";
import { ApiError, listAccounts } from "@/services/api";
import { colors } from "@/theme/colors";
import type { FinancialAccount } from "@/types/finance";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const icons = {
  back: { ios: "chevron.left", android: "arrow_back", web: "arrow_back" },
  add: { ios: "plus", android: "add", web: "add" },
  hidden: { ios: "eye.slash", android: "visibility_off", web: "visibility_off" },
  visible: { ios: "eye", android: "visibility", web: "visibility" },
  wallet: { ios: "wallet.bifold.fill", android: "account_balance_wallet", web: "account_balance_wallet" },
} satisfies Record<string, SymbolName>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function accountCountLabel(count: number) {
  return count === 1 ? "1 conta ativa" : `${count} contas ativas`;
}

interface BalanceCardProps {
  count: number;
  hidden: boolean;
  label: string;
  value: number;
}

function BalanceCard({ count, hidden, label, value }: BalanceCardProps) {
  return (
    <View style={styles.balanceCard}>
      <Text numberOfLines={1} style={styles.balanceCardLabel}>{label}</Text>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        numberOfLines={1}
        style={[styles.balanceCardValue, !hidden && value < 0 && styles.negativeValue]}
      >
        {hidden ? "••••••" : formatCurrency(value)}
      </Text>
      <Text style={styles.balanceCardCount}>
        {count === 1 ? "1 conta" : `${count} contas`}
      </Text>
    </View>
  );
}

export function AccountsScreen() {
  const router = useRouter();
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
      setAccounts(result.filter((account) => account.active));
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

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const summary = useMemo(() => {
    const current = accounts.filter((account) => account.type === "CURRENT");
    const savings = accounts.filter((account) => account.type === "SAVINGS");
    return {
      current,
      currentBalance: current.reduce((total, account) => total + Number(account.currentBalance || 0), 0),
      savings,
      savingsBalance: savings.reduce((total, account) => total + Number(account.currentBalance || 0), 0),
      total: accounts.reduce((total, account) => total + Number(account.currentBalance || 0), 0),
    };
  }, [accounts]);

  if (!user) return null;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => void loadAccounts(true)}
            refreshing={refreshing}
            tintColor={colors.forest}
          />
        }
      >
        <View style={styles.pageHeader}>
          <Pressable
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.back()}
            style={({ pressed }) => [styles.iconButton, pressed && styles.buttonPressed]}
          >
            <SymbolView name={icons.back} size={21} tintColor={colors.ink} weight="semibold" />
          </Pressable>

          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>CONTAS E SALDOS</Text>
            <Text style={styles.title}>Contas</Text>
          </View>

          <Pressable
            accessibilityLabel="Adicionar conta"
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            disabled
            style={styles.addButton}
          >
            <SymbolView name={icons.add} size={19} tintColor={colors.white} weight="bold" />
            <Text style={styles.addButtonLabel}>Adicionar</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View pointerEvents="none" style={styles.heroArtwork}>
            <AccountsHeroArtwork />
          </View>
          <View pointerEvents="none" style={styles.heroVeil} />

          <View style={styles.heroTopRow}>
            <View style={styles.heroHeading}>
              <View style={styles.walletIcon}>
                <SymbolView name={icons.wallet} size={19} tintColor={colors.forest} weight="semibold" />
              </View>
              <View>
                <Text style={styles.heroEyebrow}>VISÃO GERAL</Text>
                <Text style={styles.heroSubtitle}>Seus saldos em um relance</Text>
              </View>
            </View>

            <Pressable
              accessibilityLabel={balancesHidden ? "Mostrar saldos" : "Ocultar saldos"}
              accessibilityRole="button"
              accessibilityState={{ checked: balancesHidden }}
              onPress={() => setBalancesHidden((current) => !current)}
              style={({ pressed }) => [styles.visibilityButton, pressed && styles.buttonPressed]}
            >
              <SymbolView
                name={balancesHidden ? icons.visible : icons.hidden}
                size={18}
                tintColor={colors.inkSoft}
                weight="semibold"
              />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <Text style={styles.totalLabel}>SALDO TOTAL</Text>
          {loading ? (
            <View style={styles.loadingValue}>
              <ActivityIndicator color={colors.forest} />
            </View>
          ) : (
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.62}
              numberOfLines={1}
              style={[styles.totalValue, !balancesHidden && summary.total < 0 && styles.negativeValue]}
            >
              {error ? "—" : balancesHidden ? "••••••" : formatCurrency(summary.total)}
            </Text>
          )}
          <Text style={styles.totalCaption}>
            {loading ? "Carregando suas contas…" : error ?? accountCountLabel(accounts.length)}
          </Text>

          {!loading && !error ? (
            <View style={styles.balanceGrid}>
              <BalanceCard
                count={summary.current.length}
                hidden={balancesHidden}
                label="CONTAS CORRENTES"
                value={summary.currentBalance}
              />
              <BalanceCard
                count={summary.savings.length}
                hidden={balancesHidden}
                label="POUPANÇAS"
                value={summary.savingsBalance}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.paper, flex: 1 },
  content: { paddingBottom: 40, paddingHorizontal: 18, paddingTop: 10 },
  pageHeader: { alignItems: "center", flexDirection: "row", minHeight: 64 },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 15,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  buttonPressed: { opacity: 0.65, transform: [{ scale: 0.97 }] },
  titleBlock: { flex: 1, marginHorizontal: 13 },
  eyebrow: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 1.55 },
  title: { color: colors.ink, fontSize: 27, fontWeight: "700", letterSpacing: -0.7, marginTop: 3 },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.forest,
    borderRadius: 15,
    flexDirection: "row",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 13,
  },
  addButtonLabel: { color: colors.white, fontSize: 12, fontWeight: "800" },
  hero: {
    backgroundColor: "#DCE8E8",
    borderColor: "#C1D1D0",
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 18,
    overflow: "hidden",
    padding: 18,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  heroArtwork: { ...StyleSheet.absoluteFill },
  heroVeil: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(244,249,246,0.42)" },
  heroTopRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  heroHeading: { alignItems: "center", flexDirection: "row", flex: 1 },
  walletIcon: {
    alignItems: "center",
    backgroundColor: "rgba(251,249,244,0.78)",
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: 14,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    marginRight: 11,
    width: 42,
  },
  heroEyebrow: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 1.45 },
  heroSubtitle: { color: colors.inkSoft, fontSize: 12, marginTop: 4 },
  visibilityButton: {
    alignItems: "center",
    backgroundColor: "rgba(251,249,244,0.7)",
    borderColor: "rgba(255,255,255,0.8)",
    borderRadius: 13,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    marginLeft: 8,
    width: 40,
  },
  divider: { backgroundColor: "rgba(48,94,101,0.14)", height: 1, marginVertical: 18 },
  totalLabel: { color: colors.inkFaint, fontSize: 9, fontWeight: "800", letterSpacing: 1.35 },
  loadingValue: { alignItems: "flex-start", height: 57, justifyContent: "center" },
  totalValue: {
    color: colors.ink,
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: -1.6,
    lineHeight: 51,
    marginTop: 3,
  },
  negativeValue: { color: colors.expense },
  totalCaption: { color: colors.inkSoft, fontSize: 12, marginTop: 3 },
  balanceGrid: { flexDirection: "row", gap: 10, marginTop: 20 },
  balanceCard: {
    backgroundColor: "rgba(251,249,244,0.66)",
    borderColor: "rgba(255,255,255,0.8)",
    borderRadius: 17,
    borderWidth: 1,
    flex: 1,
    minHeight: 106,
    padding: 13,
  },
  balanceCardLabel: { color: colors.inkFaint, fontSize: 8, fontWeight: "800", letterSpacing: 1.05 },
  balanceCardValue: { color: colors.ink, fontSize: 19, fontWeight: "800", marginTop: 13 },
  balanceCardCount: { color: colors.inkSoft, fontSize: 10, marginTop: 8 },
});
