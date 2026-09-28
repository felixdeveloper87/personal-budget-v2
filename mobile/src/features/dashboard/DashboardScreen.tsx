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

import { CategoryPaceCarousel } from "@/components/dashboard/CategoryPaceCarousel";
import { DescriptionPaceCarousel } from "@/components/dashboard/DescriptionPaceCarousel";
import { InstallmentCarousel } from "@/components/dashboard/InstallmentCarousel";
import { PaceChart } from "@/components/dashboard/PaceChart";
import { TopMerchantsCarousel } from "@/components/dashboard/TopMerchantsCarousel";
import { TransactionEntryModal } from "@/components/transactions/TransactionEntryModal";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeroArtwork } from "@/features/dashboard/DashboardHeroArtwork";
import { ApiError, getMonthlySummary, listInstallmentPlans, listTransactions } from "@/services/api";
import { colors } from "@/theme/colors";
import type { InstallmentPlan, MonthlySummary, Transaction } from "@/types/finance";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const actionIcons = {
  notifications: {
    ios: "bell.fill",
    android: "notifications",
    web: "notifications",
  },
  settings: {
    ios: "gearshape.fill",
    android: "settings",
    web: "settings",
  },
  income: {
    ios: "arrow.up",
    android: "arrow_upward",
    web: "arrow_upward",
  },
  expense: {
    ios: "arrow.down",
    android: "arrow_downward",
    web: "arrow_downward",
  },
  net: {
    ios: "chart.bar.fill",
    android: "bar_chart",
    web: "bar_chart",
  },
  plus: {
    ios: "plus",
    android: "add",
    web: "add",
  },
} satisfies Record<string, SymbolName>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function greetingLabel(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getMetricChange(value: number, previousValue: number | null) {
  if (previousValue === null) return { label: "Unavailable", direction: 0 };

  const difference = Math.round((value - previousValue) * 100) / 100;
  if (difference === 0) return { label: "No change", direction: 0 };

  const percentage = previousValue === 0 ? null : Math.abs(difference / previousValue) * 100;
  const amount = percentage === null
    ? formatCurrency(Math.abs(difference))
    : percentage < 0.1
      ? "<0.1%"
      : `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(percentage)}%`;

  return {
    label: `${amount} ${difference > 0 ? "higher" : "lower"}`,
    direction: difference > 0 ? 1 : -1,
  };
}

interface SummaryMetricProps {
  icon: SymbolName;
  label: string;
  value: number;
  previousValue?: number | null;
  tone: "income" | "expense" | "net";
}

function SummaryMetric({ icon, label, value, previousValue, tone }: SummaryMetricProps) {
  const change = previousValue === undefined ? null : getMetricChange(value, previousValue);
  const changeColor = !change || change.direction === 0
    ? colors.inkSoft
    : (tone === "income" ? change.direction > 0 : change.direction < 0)
      ? colors.income
      : colors.expense;
  const toneStyles = {
    income: {
      card: styles.incomeMetric,
      icon: styles.incomeMetricIcon,
      value: styles.incomeMetricValue,
    },
    expense: {
      card: styles.expenseMetric,
      icon: styles.expenseMetricIcon,
      value: styles.expenseMetricValue,
    },
    net: {
      card: styles.netMetric,
      icon: styles.netMetricIcon,
      value: value < 0 ? styles.expenseMetricValue : styles.netMetricValue,
    },
  }[tone];

  return (
    <View style={[styles.metricCard, toneStyles.card]}>
      <View style={[styles.metricIcon, toneStyles.icon]}>
        <SymbolView name={icon} size={25} tintColor={toneStyles.value.color} weight="bold" />
      </View>
      <View style={styles.metricCopy}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.62}
          numberOfLines={1}
          style={[styles.metricValue, toneStyles.value]}
        >
          {formatCurrency(value)}
        </Text>
        {change ? (
          <View style={styles.metricComparison}>
            <Text style={[styles.metricChange, { color: changeColor }]}>
              {change.direction > 0 ? "\u2191 " : change.direction < 0 ? "\u2193 " : ""}
              {change.label}
            </Text>
            <Text style={styles.metricComparisonCaption}>vs last month</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

interface IncomeUsageChartProps {
  elapsedDays: number;
  expense: number;
  income: number;
}

function IncomeUsageChart({ elapsedDays, expense, income }: IncomeUsageChartProps) {
  const isOverIncome = expense > income;
  const usage = income > 0 ? expense / income : null;
  const spentShare = usage === null ? (expense > 0 ? 1 : 0) : Math.min(1, Math.max(0, usage));
  const remainingShare = income > 0 ? 1 - spentShare : 0;
  const usageLabel = usage === null ? "No income yet" : "of income spent";
  const dailyAverage = expense / Math.max(1, elapsedDays);

  return (
    <View style={styles.flowCard}>
      <Text style={styles.flowTitle}>Income used</Text>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[styles.usagePercentage, isOverIncome && styles.expenseMetricValue]}
      >
        {usage === null ? "\u2014" : `${Math.round(usage * 100)}%`}
      </Text>
      <Text style={styles.usageLabel}>{usageLabel}</Text>

      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Income usage: ${formatCurrency(expense)} spent. ${usage === null ? "No income recorded." : `${Math.round(usage * 100)} percent of income spent.`}`}
        style={styles.usageTrack}
      >
        <View style={[styles.spentSegment, { width: `${spentShare * 100}%` }]} />
        <View style={[styles.remainingSegment, { width: `${remainingShare * 100}%` }]} />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, styles.expenseLegendDot]} />
          <Text style={styles.legendLabel}>Spent</Text>
          <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.legendExpenseValue}>
            {formatCurrency(expense)}
          </Text>
        </View>
        <View style={styles.dailyAverageSummary}>
          <Text style={styles.usageLabel}>Daily average</Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            numberOfLines={1}
            style={styles.dailyAverageValue}
          >
            {formatCurrency(dailyAverage)}
          </Text>
          <Text style={styles.dailyAverageCaption}>
            {elapsedDays} {elapsedDays === 1 ? "day" : "days"} this month
          </Text>
        </View>
      </View>
    </View>
  );
}

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  tone: "income" | "expense";
}

function ActionButton({ label, onPress, tone }: ActionButtonProps) {
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
        name={actionIcons.plus}
        size={25}
        tintColor={colors.white}
        weight="bold"
      />
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        numberOfLines={1}
        style={styles.actionLabel}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [previousSummary, setPreviousSummary] = useState<MonthlySummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([]);
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
        const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const [nextSummary, nextTransactions, nextInstallmentPlans, nextPreviousSummary] = await Promise.all([
          getMonthlySummary(user.token, currentDate),
          listTransactions(user.token),
          listInstallmentPlans(user.token),
          getMonthlySummary(user.token, previousMonth).catch((comparisonError: unknown) => {
            if (comparisonError instanceof ApiError && comparisonError.status === 401) throw comparisonError;
            return null;
          }),
        ]);
        setSummary(nextSummary);
        setPreviousSummary(nextPreviousSummary);
        setTransactions(nextTransactions);
        setInstallmentPlans(nextInstallmentPlans);
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
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
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
        <View style={styles.homeHeader}>
          <View pointerEvents="none" style={styles.heroArtwork}>
            <DashboardHeroArtwork />
          </View>
          <View pointerEvents="none" style={styles.heroScrim} />
          <View style={styles.heroContent}>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || "PB"}</Text>
              </View>
              <View style={styles.greetingCopy}>
                <Text style={styles.greeting}>{greetingLabel(currentDate)},</Text>
                <Text adjustsFontSizeToFit numberOfLines={1} style={styles.userName}>
                  {firstName}
                </Text>
              </View>
              <View style={styles.headerActions}>
                <View
                  accessibilityLabel="Notifications"
                  accessibilityRole="image"
                  style={styles.headerAction}
                >
                  <SymbolView
                    name={actionIcons.notifications}
                    size={23}
                    tintColor={colors.inkSoft}
                    weight="semibold"
                  />
                </View>
                <Pressable
                  accessibilityLabel="Open settings"
                  accessibilityRole="button"
                  onPress={() => router.navigate("/more")}
                  style={({ pressed }) => [styles.headerAction, pressed && styles.headerActionPressed]}
                >
                  <SymbolView
                    name={actionIcons.settings}
                    size={24}
                    tintColor={colors.inkSoft}
                    weight="semibold"
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.monthBlock}>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.76}
                numberOfLines={1}
                style={styles.monthTitle}
              >
                {monthLabel(currentDate)}
              </Text>
              <Text style={styles.monthSubtitle}>Monthly budget snapshot</Text>
            </View>

            <View style={styles.summarySection}>
              {loading ? (
                <View style={styles.loadingSummary}>
                  <ActivityIndicator color={colors.forest} />
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
                <View style={styles.summaryGrid}>
                  <View style={styles.metricColumn}>
                    <SummaryMetric
                      icon={actionIcons.income}
                      label="Income"
                      previousValue={previousSummary?.totalIncome ?? null}
                      tone="income"
                      value={summary.totalIncome}
                    />
                    <SummaryMetric
                      icon={actionIcons.expense}
                      label="Expense"
                      previousValue={previousSummary?.totalExpense ?? null}
                      tone="expense"
                      value={summary.totalExpense}
                    />
                    <SummaryMetric
                      icon={actionIcons.net}
                      label="Net this month"
                      tone="net"
                      value={summary.balance}
                    />
                  </View>
                  <IncomeUsageChart
                    elapsedDays={currentDate.getDate()}
                    expense={summary.totalExpense}
                    income={summary.totalIncome}
                  />
                </View>
              ) : null}

              <View style={styles.actionsRow}>
                <ActionButton
                  label="Add income"
                  onPress={() => setEntryType("INCOME")}
                  tone="income"
                />
                <ActionButton
                  label="Add expense"
                  onPress={() => setEntryType("EXPENSE")}
                  tone="expense"
                />
              </View>
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
            <InstallmentCarousel date={currentDate} plans={installmentPlans} />
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
  safeArea: { backgroundColor: "#EAD9BD", flex: 1 },
  content: { alignItems: "stretch", paddingBottom: 48, paddingTop: 0 },
  homeHeader: {
    alignSelf: "stretch",
    backgroundColor: "#E9D3B0",
    borderRadius: 28,
    overflow: "hidden",
  },
  heroContent: {
    paddingBottom: 10,
    paddingHorizontal: 16,
    paddingTop: 19,
  },
  heroArtwork: { ...StyleSheet.absoluteFill },
  heroScrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(255,247,230,0.07)" },
  userRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 60,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.forest,
    borderColor: colors.forestPressed,
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    marginRight: 12,
    width: 56,
  },
  avatarText: { color: colors.white, fontSize: 17, fontWeight: "800", letterSpacing: 0.4 },
  greetingCopy: { flex: 1, minWidth: 0 },
  greeting: {
    color: colors.inkSoft,
    fontSize: 14,
    fontWeight: "600",
  },
  userName: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.6,
    marginTop: 1,
  },
  headerActions: { flexDirection: "row", gap: 7, marginLeft: 7 },
  headerAction: {
    alignItems: "center",
    backgroundColor: colors.paperMuted,
    borderColor: "rgba(36, 56, 60, 0.08)",
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerActionPressed: { backgroundColor: colors.header, transform: [{ scale: 0.96 }] },
  monthBlock: {
    marginTop: 20,
  },
  monthTitle: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  monthSubtitle: { color: colors.inkSoft, fontSize: 14, lineHeight: 17, marginTop: -1 },
  summarySection: { gap: 10, marginTop: 20 },
  summaryGrid: {
    alignItems: "stretch",
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  metricColumn: { flex: 1, gap: 9, minWidth: 0 },
  metricCard: {
    alignItems: "center",
    borderColor: "rgba(36, 56, 60, 0.07)",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    flex: 1,
    minHeight: 70,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  incomeMetric: { backgroundColor: "rgba(242,249,233,0.85)", borderColor: "rgba(255,255,255,0.6)" },
  expenseMetric: { backgroundColor: "rgba(255,239,229,0.86)", borderColor: "rgba(255,255,255,0.6)" },
  netMetric: { backgroundColor: "rgba(250,240,211,0.86)", borderColor: "rgba(255,255,255,0.6)" },
  metricIcon: {
    alignItems: "center",
    borderRadius: 22,
    height: 36,
    justifyContent: "center",
    marginRight: 8,
    flexShrink: 0,
    width: 36,
  },
  incomeMetricIcon: { backgroundColor: "#C9E6D4" },
  expenseMetricIcon: { backgroundColor: "#F0D1CA" },
  netMetricIcon: { backgroundColor: "#E4DAB8" },
  metricCopy: { flex: 1, minWidth: 0 },
  metricLabel: { color: colors.inkSoft, fontSize: 11, fontWeight: "600" },
  metricValue: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.65,
    marginTop: 3,
  },
  incomeMetricValue: { color: colors.income },
  metricComparison: { marginTop: 4 },
  metricChange: { fontSize: 10, fontWeight: "700" },
  metricComparisonCaption: { color: colors.inkSoft, fontSize: 9, marginTop: 1 },
  expenseMetricValue: { color: colors.expense },
  netMetricValue: { color: colors.gold },
  flowCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,248,237,0.86)",
    borderColor: "rgba(255,255,255,0.68)",
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 9,
  },
  flowTitle: { color: colors.ink, fontSize: 13, fontWeight: "700", alignSelf: "flex-start" },
  usagePercentage: { color: colors.ink, fontSize: 38, fontWeight: "800", letterSpacing: -1.5, marginTop: 8 },
  usageLabel: { color: colors.inkSoft, fontSize: 11, fontWeight: "600" },
  usageTrack: {
    backgroundColor: "#E4DCCF",
    borderRadius: 7,
    flexDirection: "row",
    height: 14,
    marginTop: 16,
    overflow: "hidden",
    width: "100%",
  },
  spentSegment: { backgroundColor: "#D05F5B", height: "100%" },
  remainingSegment: { backgroundColor: "#3E9870", height: "100%" },
  dailyAverageSummary: {
    borderTopColor: "rgba(36,56,60,0.12)",
    borderTopWidth: 1,
    marginTop: 3,
    paddingTop: 9,
  },
  dailyAverageValue: { color: colors.ink, fontSize: 21, fontWeight: "800", marginTop: 2 },
  dailyAverageCaption: { color: colors.inkSoft, fontSize: 10, marginTop: 2 },
  legend: { gap: 7, marginTop: 11, width: "100%" },
  legendRow: { alignItems: "center", flexDirection: "row", minWidth: 0 },
  legendDot: { borderRadius: 5, height: 10, marginRight: 6, width: 10 },
  expenseLegendDot: { backgroundColor: "#D05F5B" },
  legendLabel: { color: colors.inkSoft, fontSize: 10, marginRight: 5 },
  legendExpenseValue: {
    color: colors.expense,
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 20,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 52,
    minWidth: 0,
    paddingHorizontal: 10,
    shadowColor: colors.ink,
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
  },
  incomeButton: { backgroundColor: colors.forest },
  expenseButton: { backgroundColor: colors.expense },
  actionButtonPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  actionLabel: { color: colors.white, flexShrink: 1, fontSize: 13, fontWeight: "800" },
  loadingSummary: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 252,
  },
  loadingText: { color: colors.inkSoft, fontSize: 13 },
  errorSummary: {
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 160,
    padding: 20,
  },
  errorTitle: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  errorText: { color: colors.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 5 },
  retryButton: { alignSelf: "flex-start", marginTop: 8, paddingVertical: 8 },
  retryText: { color: colors.forest, fontSize: 13, fontWeight: "800" },
  paceSection: { marginTop: 28, paddingHorizontal: 16 },
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
