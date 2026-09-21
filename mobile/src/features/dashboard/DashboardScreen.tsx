import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CategoryPaceCarousel } from "@/components/dashboard/CategoryPaceCarousel";
import { DescriptionPaceCarousel } from "@/components/dashboard/DescriptionPaceCarousel";
import { PaceChart } from "@/components/dashboard/PaceChart";
import { TransactionEntryModal } from "@/components/transactions/TransactionEntryModal";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, getMonthlySummary, listTransactions } from "@/services/api";
import { colors } from "@/theme/colors";
import type { MonthlySummary, Transaction } from "@/types/finance";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const actionIcons = {
  income: {
    ios: "plus.circle.fill",
    android: "add_circle",
    web: "add_circle",
  },
  expense: {
    ios: "minus.circle.fill",
    android: "remove_circle",
    web: "remove_circle",
  },
} satisfies Record<string, SymbolName>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function monthLabel(date: Date) {
  const value = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface MetricProps {
  label: string;
  value: number;
  tone: "income" | "expense";
}

function Metric({ label, value, tone }: MetricProps) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[styles.metricValue, tone === "income" ? styles.incomeValue : styles.expenseValue]}
      >
        {formatCurrency(value)}
      </Text>
    </View>
  );
}

interface ActionButtonProps {
  icon: SymbolName;
  label: string;
  onPress: () => void;
  tone: "income" | "expense";
}

function ActionButton({ icon, label, onPress, tone }: ActionButtonProps) {
  const isIncome = tone === "income";

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        isIncome ? styles.incomeButton : styles.expenseButton,
        pressed && styles.actionButtonPressed,
      ]}
    >
      <SymbolView
        name={icon}
        size={18}
        tintColor={isIncome ? colors.income : colors.expense}
        weight="semibold"
      />
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        numberOfLines={1}
        style={[styles.actionLabel, isIncome ? styles.incomeActionLabel : styles.expenseActionLabel]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function DashboardScreen() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entryType, setEntryType] = useState<"INCOME" | "EXPENSE" | null>(null);
  const currentDate = useMemo(() => new Date(), []);

  const loadSummary = useCallback(
    async (refresh = false) => {
      if (!user) return;
      refresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      try {
        const [nextSummary, nextTransactions] = await Promise.all([
          getMonthlySummary(user.token, currentDate),
          listTransactions(user.token),
        ]);
        setSummary(nextSummary);
        setTransactions(nextTransactions);
      } catch (summaryError) {
        if (summaryError instanceof ApiError && summaryError.status === 401) {
          await logout();
          return;
        }
        setError("Não foi possível carregar o resumo financeiro.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentDate, logout, user],
  );

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const handleTransactionCreated = useCallback((transaction: Transaction) => {
    const amount = Number(transaction.amount);

    setTransactions((current) => [...current, transaction]);

    setSummary((current) => {
      if (!current || !Number.isFinite(amount)) return current;
      if (transaction.type === "INCOME") {
        return {
          ...current,
          balance: current.balance + amount,
          totalIncome: current.totalIncome + amount,
        };
      }
      return {
        ...current,
        balance: current.balance - amount,
        totalExpense: current.totalExpense + amount,
      };
    });
  }, []);

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => void loadSummary(true)}
            refreshing={refreshing}
            tintColor={colors.forest}
          />
        }
      >
        <View style={styles.pageHeading}>
          <Text style={styles.eyebrow}>DASHBOARD</Text>
          <Text style={styles.greeting}>Hello, {user.name.split(" ")[0]}</Text>
          <Text style={styles.period}>{monthLabel(currentDate)}</Text>
        </View>

        <View style={styles.headerCard}>
          <Text style={styles.headerEyebrow}>MONTH TO DATE</Text>
          <Text style={styles.headerTitle}>Your money so far</Text>

          {loading ? (
            <View style={styles.loadingSummary}>
              <ActivityIndicator color={colors.white} />
              <Text style={styles.loadingText}>Loading your totals…</Text>
            </View>
          ) : error ? (
            <View style={styles.errorSummary}>
              <Text style={styles.errorTitle}>Summary unavailable</Text>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={() => void loadSummary()} style={styles.retryButton}>
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </View>
          ) : summary ? (
            <>
              <View style={styles.metricsRow}>
                <Metric label="TOTAL EARNED" tone="income" value={summary.totalIncome} />
                <View style={styles.metricDivider} />
                <Metric label="EXPENSES SO FAR" tone="expense" value={summary.totalExpense} />
              </View>

              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Current balance</Text>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[styles.balanceValue, summary.balance < 0 && styles.negativeBalance]}
                >
                  {formatCurrency(summary.balance)}
                </Text>
              </View>
            </>
          ) : null}

          <View style={styles.actionsRow}>
            <ActionButton
              icon={actionIcons.income}
              label="Add income"
              onPress={() => setEntryType("INCOME")}
              tone="income"
            />
            <ActionButton
              icon={actionIcons.expense}
              label="Add expense"
              onPress={() => setEntryType("EXPENSE")}
              tone="expense"
            />
          </View>
        </View>

        {!loading && !error ? (
          <View style={styles.paceSection}>
            <Text style={styles.sectionEyebrow}>MONTHLY RHYTHM</Text>
            <Text style={styles.sectionTitle}>How this month is moving</Text>
            <PaceChart date={currentDate} tone="income" transactions={transactions} />
            <PaceChart date={currentDate} tone="expense" transactions={transactions} />
            <CategoryPaceCarousel date={currentDate} transactions={transactions} />
            <DescriptionPaceCarousel date={currentDate} transactions={transactions} />
          </View>
        ) : null}
      </ScrollView>

      {entryType ? (
        <TransactionEntryModal
          onClose={() => setEntryType(null)}
          onCreated={handleTransactionCreated}
          type={entryType}
          visible
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.paper, flex: 1 },
  content: { padding: 18, paddingBottom: 48 },
  pageHeading: { marginBottom: 20, paddingHorizontal: 3, paddingTop: 12 },
  eyebrow: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 7,
  },
  greeting: { color: colors.ink, fontSize: 30, fontWeight: "700", letterSpacing: -0.8 },
  period: { color: colors.inkSoft, fontSize: 14, marginTop: 5 },
  headerCard: {
    backgroundColor: colors.forest,
    borderRadius: 26,
    padding: 20,
    shadowColor: colors.ink,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  headerEyebrow: {
    color: "#BFD3D3",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginTop: 5,
  },
  metricsRow: { flexDirection: "row", marginTop: 26 },
  metric: { flex: 1, minWidth: 0 },
  metricDivider: {
    backgroundColor: "rgba(255,255,255,0.18)",
    marginHorizontal: 15,
    width: StyleSheet.hairlineWidth,
  },
  metricLabel: {
    color: "#CFE0E0",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.15,
    marginBottom: 8,
  },
  metricValue: { fontSize: 21, fontWeight: "800", letterSpacing: -0.6 },
  incomeValue: { color: "#A9E5CA" },
  expenseValue: { color: "#FFB3A9" },
  balanceRow: {
    alignItems: "center",
    borderTopColor: "rgba(255,255,255,0.16)",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    paddingTop: 15,
  },
  balanceLabel: { color: "#CFE0E0", fontSize: 12, fontWeight: "600" },
  balanceValue: {
    color: colors.white,
    flexShrink: 1,
    fontSize: 17,
    fontWeight: "800",
    marginLeft: 12,
  },
  negativeBalance: { color: "#FFB3A9" },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 22 },
  actionButton: {
    alignItems: "center",
    borderRadius: 15,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 10,
  },
  incomeButton: { backgroundColor: colors.incomeTint },
  expenseButton: { backgroundColor: colors.expenseTint },
  actionButtonPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  actionLabel: { fontSize: 12, fontWeight: "800" },
  incomeActionLabel: { color: colors.income },
  expenseActionLabel: { color: colors.expense },
  loadingSummary: { alignItems: "center", flexDirection: "row", gap: 10, minHeight: 110 },
  loadingText: { color: "#CFE0E0", fontSize: 13 },
  errorSummary: { minHeight: 110, paddingTop: 22 },
  errorTitle: { color: colors.white, fontSize: 16, fontWeight: "700" },
  errorText: { color: "#CFE0E0", fontSize: 12, lineHeight: 18, marginTop: 5 },
  retryButton: { alignSelf: "flex-start", marginTop: 6, paddingVertical: 8 },
  retryText: { color: colors.white, fontSize: 13, fontWeight: "800" },
  paceSection: { marginTop: 28 },
  sectionEyebrow: {
    color: colors.forest,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.6,
    paddingHorizontal: 3,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: -0.35,
    marginTop: 5,
    paddingHorizontal: 3,
  },
});
