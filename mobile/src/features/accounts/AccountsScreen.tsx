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
import { SafeAreaView } from "react-native-safe-area-context";

import { BankLogo } from "@/components/accounts/BankLogo";
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

const accountTypeLabels: Record<FinancialAccount["type"], string> = {
  CURRENT: "Conta corrente",
  SAVINGS: "Poupança",
  CASH: "Dinheiro",
  CREDIT_CARD: "Crédito",
};

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

function AccountCardBackground() {
  return (
    <View style={styles.accountCardDecoration}>
      <View style={styles.accountCardOrb} />
      <View style={[styles.accountCardBar, styles.accountCardBarShort]} />
      <View style={[styles.accountCardBar, styles.accountCardBarMedium]} />
      <View style={[styles.accountCardBar, styles.accountCardBarTall]} />
    </View>
  );
}

function AccountCard({
  account,
  hidden,
  onPress,
}: {
  account: FinancialAccount;
  hidden: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`Abrir detalhes de ${account.name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.accountCard, pressed && styles.accountCardPressed]}
    >
      <View pointerEvents="none" style={styles.accountCardBackground}>
        <AccountCardBackground />
      </View>
      <View style={styles.accountCardTop}>
        <BankLogo institution={account.institution} name={account.name} size={40} />
        <Text numberOfLines={1} style={styles.accountCurrency}>{account.currency}</Text>
      </View>

      <Text numberOfLines={1} style={styles.accountName}>{account.name}</Text>
      <Text numberOfLines={1} style={styles.accountMeta}>
        {account.institution?.trim() || accountTypeLabels[account.type]}
      </Text>

      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        numberOfLines={1}
        style={[styles.accountBalance, !hidden && account.currentBalance < 0 && styles.negativeValue]}
      >
        {hidden ? "••••••" : formatCurrency(Number(account.currentBalance || 0))}
      </Text>
      <Text style={styles.accountBalanceLabel}>Saldo atual</Text>
    </Pressable>
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

  useFocusEffect(useCallback(() => {
    void loadAccounts();
  }, [loadAccounts]));

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

        {!loading && !error ? (
          <View style={styles.accountsSection}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionEyebrow}>SUAS CONTAS</Text>
                <Text style={styles.sectionTitle}>Contas ativas</Text>
              </View>
              <Text style={styles.accountCount}>{accounts.length}</Text>
            </View>

            {accounts.length > 0 ? (
              <View style={styles.accountsGrid}>
                {accounts.map((account) => (
                  <AccountCard
                    account={account}
                    hidden={balancesHidden}
                    key={account.id}
                    onPress={() => router.push({
                      pathname: "/accounts/[id]",
                      params: { id: String(account.id) },
                    })}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyAccounts}>
                <Text style={styles.emptyAccountsTitle}>Nenhuma conta ativa</Text>
                <Text style={styles.emptyAccountsText}>Adicione uma conta para começar.</Text>
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.paper, flex: 1 },
  content: { paddingBottom: 40, paddingHorizontal: 18, paddingTop: 6 },
  pageHeader: { alignItems: "center", flexDirection: "row", minHeight: 56 },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  buttonPressed: { opacity: 0.65, transform: [{ scale: 0.97 }] },
  titleBlock: { flex: 1, marginHorizontal: 12 },
  eyebrow: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 1.55 },
  title: { color: colors.ink, fontSize: 25, fontWeight: "700", letterSpacing: -0.7, marginTop: 2 },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.forest,
    borderRadius: 14,
    flexDirection: "row",
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 12,
  },
  addButtonLabel: { color: colors.white, fontSize: 12, fontWeight: "800" },
  hero: {
    backgroundColor: "#DCE8E8",
    borderColor: "#C1D1D0",
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 12,
    overflow: "hidden",
    padding: 14,
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
    borderRadius: 13,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    marginRight: 11,
    width: 38,
  },
  heroEyebrow: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 1.45 },
  heroSubtitle: { color: colors.inkSoft, fontSize: 12, marginTop: 4 },
  visibilityButton: {
    alignItems: "center",
    backgroundColor: "rgba(251,249,244,0.7)",
    borderColor: "rgba(255,255,255,0.8)",
    borderRadius: 13,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    marginLeft: 8,
    width: 38,
  },
  divider: { backgroundColor: "rgba(48,94,101,0.14)", height: 1, marginVertical: 12 },
  totalLabel: { color: colors.inkFaint, fontSize: 9, fontWeight: "800", letterSpacing: 1.35 },
  loadingValue: { alignItems: "flex-start", height: 47, justifyContent: "center" },
  totalValue: {
    color: colors.ink,
    fontSize: 37,
    fontWeight: "800",
    letterSpacing: -1.6,
    lineHeight: 44,
    marginTop: 2,
  },
  negativeValue: { color: colors.expense },
  totalCaption: { color: colors.inkSoft, fontSize: 12, marginTop: 3 },
  balanceGrid: { flexDirection: "row", gap: 9, marginTop: 14 },
  balanceCard: {
    backgroundColor: "rgba(251,249,244,0.66)",
    borderColor: "rgba(255,255,255,0.8)",
    borderRadius: 17,
    borderWidth: 1,
    flex: 1,
    minHeight: 88,
    padding: 11,
  },
  balanceCardLabel: { color: colors.inkFaint, fontSize: 8, fontWeight: "800", letterSpacing: 1.05 },
  balanceCardValue: { color: colors.ink, fontSize: 18, fontWeight: "800", marginTop: 9 },
  balanceCardCount: { color: colors.inkSoft, fontSize: 10, marginTop: 6 },
  accountsSection: { marginTop: 24 },
  sectionHeading: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 3,
  },
  sectionEyebrow: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 1.5 },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: "700", marginTop: 4 },
  accountCount: {
    backgroundColor: colors.header,
    borderRadius: 12,
    color: colors.forest,
    fontSize: 12,
    fontWeight: "800",
    minWidth: 28,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
    textAlign: "center",
  },
  accountsGrid: {
    columnGap: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  accountCard: {
    backgroundColor: "#EDF3EE",
    borderColor: colors.line,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 166,
    overflow: "hidden",
    padding: 14,
    width: "48%",
  },
  accountCardBackground: { ...StyleSheet.absoluteFill },
  accountCardPressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  accountCardDecoration: { flex: 1 },
  accountCardOrb: {
    backgroundColor: "rgba(255,255,255,0.42)",
    borderRadius: 52,
    height: 104,
    position: "absolute",
    right: -42,
    top: -48,
    width: 104,
  },
  accountCardBar: {
    backgroundColor: "rgba(48,94,101,0.07)",
    borderRadius: 4,
    bottom: 0,
    position: "absolute",
    width: 18,
  },
  accountCardBarShort: { height: 24, right: 46 },
  accountCardBarMedium: { height: 38, right: 24 },
  accountCardBarTall: { height: 54, right: 2 },
  accountCardTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  accountCurrency: { color: colors.inkFaint, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  accountName: { color: colors.ink, fontSize: 15, fontWeight: "700", marginTop: 13 },
  accountMeta: { color: colors.inkSoft, fontSize: 10, marginTop: 4 },
  accountBalance: { color: colors.ink, fontSize: 19, fontWeight: "800", marginTop: 17 },
  accountBalanceLabel: { color: colors.inkFaint, fontSize: 9, marginTop: 4 },
  emptyAccounts: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
  },
  emptyAccountsTitle: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  emptyAccountsText: { color: colors.inkSoft, fontSize: 12, marginTop: 5 },
});
