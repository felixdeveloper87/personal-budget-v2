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
import { TopMerchantsCarousel } from "@/components/dashboard/TopMerchantsCarousel";
import { TransactionEntryModal } from "@/components/transactions/TransactionEntryModal";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, getMonthlySummary, listTransactions } from "@/services/api";
import { colors } from "@/theme/colors";
import type { MonthlySummary, Transaction } from "@/types/finance";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const actionIcons = {
  calendar: {
    ios: "calendar",
    android: "calendar_month",
    web: "calendar_month",
  },
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

function compactMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(date).toLocaleUpperCase();
}

function greetingLabel(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

interface ComparisonBarProps {
  label: string;
  ratio: number;
  value: number;
  tone: "income" | "expense";
}

function ComparisonBar({ label, ratio, value, tone }: ComparisonBarProps) {
  const isIncome = tone === "income";

  return (
    <View style={styles.comparisonItem}>
      <View style={styles.comparisonHeader}>
        <View style={styles.comparisonLabelRow}>
          <View style={[styles.comparisonDot, isIncome ? styles.incomeDot : styles.expenseDot]} />
          <Text style={styles.comparisonLabel}>{label}</Text>
        </View>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[styles.comparisonAmount, isIncome ? styles.incomeValue : styles.expenseValue]}
        >
          {formatCurrency(value)}
        </Text>
      </View>
      <View style={styles.comparisonTrack}>
        <View
          style={[
            styles.comparisonFill,
            isIncome ? styles.incomeFill : styles.expenseFill,
            { flex: ratio },
          ]}
        />
        <View style={{ flex: 100 - ratio }} />
      </View>
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

  const firstName = user.name.split(" ")[0];
  const positiveFlow = (summary?.balance ?? 0) >= 0;
  const comparisonMax = summary
    ? Math.max(summary.totalIncome, summary.totalExpense, 1)
    : 1;
  const incomeRatio = summary ? (summary.totalIncome / comparisonMax) * 100 : 0;
  const expenseRatio = summary ? (summary.totalExpense / comparisonMax) * 100 : 0;

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
        <View style={styles.headerCard}>
          <View pointerEvents="none" style={styles.heroDecoration}>
            <View style={styles.heroRingLarge} />
            <View style={styles.heroRingSmall} />
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroIntro}>
              <View style={styles.greetingRow}>
                <Text style={styles.greeting}>{greetingLabel(currentDate)}, {firstName}</Text>
                <View style={styles.inlineDate}>
                  <SymbolView
                    name={actionIcons.calendar}
                    size={12}
                    tintColor="#DCE9E8"
                    weight="semibold"
                  />
                  <Text style={styles.inlineDateText}>{compactMonthLabel(currentDate)}</Text>
                </View>
              </View>
              <Text style={styles.headerTitle}>Your month, in motion.</Text>
            </View>

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
            <View style={styles.comparisonPanel}>
              <ComparisonBar
                label="INCOME"
                ratio={incomeRatio}
                tone="income"
                value={summary.totalIncome}
              />
              <ComparisonBar
                label="EXPENSE"
                ratio={expenseRatio}
                tone="expense"
                value={summary.totalExpense}
              />
              <View style={styles.netRow}>
                <View>
                  <Text style={styles.balanceLabel}>NET THIS MONTH</Text>
                  <Text style={styles.netCaption}>Income minus expenses</Text>
                </View>
                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}
                  numberOfLines={1}
                  style={[styles.balanceValue, !positiveFlow && styles.negativeBalance]}
                >
                  {formatCurrency(summary.balance)}
                </Text>
              </View>
            </View>
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
        </View>

        {!loading && !error ? (
          <View style={styles.paceSection}>
            <Text style={styles.sectionEyebrow}>MONTHLY RHYTHM</Text>
            <Text style={styles.sectionTitle}>How this month is moving</Text>
            <PaceChart interactive date={currentDate} tone="income" transactions={transactions} />
            <PaceChart interactive date={currentDate} tone="expense" transactions={transactions} />
            <CategoryPaceCarousel
              date={currentDate}
              transactions={transactions}
              userId={user.id}
            />
            <DescriptionPaceCarousel
              date={currentDate}
              transactions={transactions}
              userId={user.id}
            />
            <TopMerchantsCarousel date={currentDate} transactions={transactions} />
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
  content: { padding: 18, paddingBottom: 48, paddingTop: 14 },
  headerCard: {
    backgroundColor: colors.forest,
    borderRadius: 30,
    position: "relative",
    shadowColor: colors.ink,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
  },
  heroDecoration: {
    borderRadius: 30,
    bottom: 0,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    top: 0,
  },
  heroRingLarge: {
    borderColor: "rgba(219, 235, 233, 0.10)",
    borderRadius: 150,
    borderWidth: 1,
    height: 300,
    position: "absolute",
    right: -126,
    top: -112,
    width: 300,
  },
  heroRingSmall: {
    borderColor: "rgba(219, 235, 233, 0.14)",
    borderRadius: 92,
    borderWidth: 1,
    height: 184,
    position: "absolute",
    right: -53,
    top: -52,
    width: 184,
  },
  heroContent: { padding: 20, position: "relative", zIndex: 1 },
  heroIntro: { marginTop: 2 },
  greetingRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  inlineDate: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  inlineDateText: {
    color: "#DCE9E8",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  greeting: {
    color: "#C5D7D6",
    fontSize: 14,
    fontWeight: "600",
  },
  headerTitle: {
    color: colors.white,
    fontSize: 29,
    fontWeight: "800",
    letterSpacing: -0.9,
    marginTop: 3,
  },
  comparisonPanel: {
    backgroundColor: "rgba(255,255,255,0.065)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 16,
    marginTop: 24,
    padding: 14,
  },
  comparisonItem: { gap: 8 },
  comparisonHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  comparisonLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  comparisonDot: { borderRadius: 4, height: 7, width: 7 },
  incomeDot: { backgroundColor: "#A9E5CA" },
  expenseDot: { backgroundColor: "#FFB3A9" },
  comparisonLabel: {
    color: "#C5D7D6",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.15,
  },
  comparisonAmount: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.35,
    textAlign: "right",
  },
  incomeValue: { color: "#A9E5CA" },
  expenseValue: { color: "#FFB3A9" },
  comparisonTrack: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 4,
    flexDirection: "row",
    height: 7,
    overflow: "hidden",
  },
  comparisonFill: { borderRadius: 4 },
  incomeFill: { backgroundColor: "#91D2B5" },
  expenseFill: { backgroundColor: "#EE9489" },
  netRow: {
    alignItems: "center",
    borderTopColor: "rgba(255,255,255,0.10)",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 1,
    paddingTop: 14,
  },
  balanceLabel: {
    color: "#B8CCCB",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  netCaption: {
    color: "#8FA9A7",
    fontSize: 9,
    marginTop: 3,
  },
  balanceValue: {
    color: colors.white,
    flexShrink: 1,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.7,
    textAlign: "right",
  },
  negativeBalance: { color: "#FFC0B8" },
  actionsRow: {
    backgroundColor: "rgba(255,255,255,0.055)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    marginTop: 20,
    padding: 5,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 15,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 10,
  },
  incomeButton: { backgroundColor: colors.incomeTint },
  expenseButton: { backgroundColor: colors.expenseTint },
  actionButtonPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  actionLabel: { fontSize: 12, fontWeight: "800" },
  incomeActionLabel: { color: colors.income },
  expenseActionLabel: { color: colors.expense },
  loadingSummary: { alignItems: "center", flexDirection: "row", gap: 10, minHeight: 176 },
  loadingText: { color: "#CFE0E0", fontSize: 13 },
  errorSummary: { minHeight: 176, paddingTop: 28 },
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
