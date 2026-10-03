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
  previousValue: number | null;
  tone: "income" | "expense";
}

function SummaryMetric({ icon, label, value, previousValue, tone }: SummaryMetricProps) {
  const change = getMetricChange(value, previousValue);
  const favorable = tone === "income" ? change.direction > 0 : change.direction < 0;

  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeading}>
        <SymbolView name={icon} size={14} tintColor={tone === "income" ? "#D6EF9B" : "#F1B9A4"} />
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1} style={styles.metricValue}>
        {formatCurrency(value)}
      </Text>
      <Text style={[styles.metricChange, change.direction !== 0 && { color: favorable ? "#D6EF9B" : "#F1B9A4" }]}>
        {change.direction > 0 ? "↑ " : change.direction < 0 ? "↓ " : ""}{change.label}
      </Text>
      <Text style={styles.metricComparisonCaption}>vs last month</Text>
    </View>
  );
}

function IncomeUsageChart({ elapsedDays, expense, income }: { elapsedDays: number; expense: number; income: number }) {
  const usage = income > 0 ? expense / income : null;
  const spentShare = usage === null ? (expense > 0 ? 1 : 0) : Math.min(1, Math.max(0, usage));

  return (
    <View style={styles.flowCard}>
      <View style={styles.flowHeading}>
        <View style={styles.flowCopy}>
          <Text style={styles.flowTitle}>A little perspective</Text>
          <Text style={styles.usageLabel}>{usage === null ? "Record income to see your spending share" : "Your spending, as a share of this month’s income"}</Text>
        </View>
        <Text style={[styles.usagePercentage, expense > income && { color: colors.expense }]}>
          {usage === null ? "—" : `${Math.round(usage * 100)}%`}
        </Text>
      </View>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Income usage: ${formatCurrency(expense)} spent. ${usage === null ? "No income recorded." : `${Math.round(usage * 100)} percent of income spent.`}`}
        style={styles.usageTrack}
      >
        <View style={[styles.spentSegment, { width: `${spentShare * 100}%`, backgroundColor: expense > income ? colors.expense : colors.forest }]} />
      </View>
      <View style={styles.flowFooter}>
        <Text style={styles.dailyAverageCaption}>Daily spending average</Text>
        <Text style={styles.dailyAverageValue}>{formatCurrency(expense / Math.max(1, elapsedDays))}<Text style={styles.dailyAverageCaption}> / day</Text></Text>
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
        tintColor={isIncome ? "#193D37" : colors.ink}
        weight="bold"
      />
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        numberOfLines={1}
        style={[styles.actionLabel, isIncome && { color: "#193D37" }]}
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
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || "PB"}</Text>
          </View>
          <View style={styles.greetingCopy}>
            <Text style={styles.greeting}>{greetingLabel(currentDate)},</Text>
            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.userName}>{firstName}</Text>
          </View>
          <Pressable
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            onPress={() => router.navigate("/more")}
            style={({ pressed }) => [styles.headerAction, pressed && styles.headerActionPressed]}
          >
            <SymbolView name={actionIcons.settings} size={22} tintColor={colors.ink} weight="regular" />
          </Pressable>
        </View>

        <View style={styles.homeHeader}>
          <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.heroArtwork}>
            <DashboardHeroArtwork />
          </View>
          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <Text style={styles.heroEyebrow}>YOUR MONTH, IN FOCUS</Text>
              <View style={styles.monthPill}>
                <View style={styles.liveDot} />
                <Text style={styles.monthTitle}>{monthLabel(currentDate)}</Text>
              </View>
            </View>
            {loading ? (
              <View style={styles.loadingSummary}>
                <ActivityIndicator color="#D6EF9B" />
                <Text style={styles.loadingText}>Loading your totals…</Text>
              </View>
            ) : error ? (
              <View style={styles.errorSummary}>
                <Text style={styles.errorTitle}>Summary unavailable</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable accessibilityRole="button" onPress={() => void loadSummary()} style={styles.retryButton}>
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              </View>
            ) : summary ? (
              <>
                <View style={styles.balanceBlock}>
                  <Text style={styles.balanceLabel}>Net this month</Text>
                  <Text adjustsFontSizeToFit minimumFontScale={0.45} numberOfLines={1} style={[styles.balanceValue, summary.balance < 0 && { color: "#F1B9A4" }]}>
                    {formatCurrency(summary.balance)}
                  </Text>
                  <Text style={styles.balanceCaption}>
                    {summary.totalIncome === 0 && summary.totalExpense === 0
                      ? "A fresh month. Make your first move."
                      : summary.balance > 0
                        ? "More coming in. Room to breathe."
                        : summary.balance < 0
                          ? "More going out. Time for a closer look."
                          : "Income and spending, in balance."}
                  </Text>
                </View>
                <View style={styles.monthTimeline}>
                  <View style={styles.timelineLabels}>
                    <Text style={styles.timelineLabel}>Day {currentDate.getDate()}</Text>
                    <Text style={styles.timelineLabel}>{new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() - currentDate.getDate()} days left</Text>
                  </View>
                  <View style={styles.timelineTrack}>
                    <View style={[styles.timelineFill, { width: `${currentDate.getDate() / new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() * 100}%` }]} />
                  </View>
                </View>
                <View style={styles.summaryGrid}>
                  <SummaryMetric icon={actionIcons.income} label="Income" previousValue={previousSummary?.totalIncome ?? null} tone="income" value={summary.totalIncome} />
                  <SummaryMetric icon={actionIcons.expense} label="Expenses" previousValue={previousSummary?.totalExpense ?? null} tone="expense" value={summary.totalExpense} />
                </View>
              </>
            ) : null}
          </View>
        </View>

        <View style={styles.belowHero}>
          <View style={styles.actionsRow}>
            <ActionButton label="Add income" onPress={() => setEntryType("INCOME")} tone="income" />
            <ActionButton label="Add expense" onPress={() => setEntryType("EXPENSE")} tone="expense" />
          </View>
          {!loading && !error && summary ? (
            <IncomeUsageChart elapsedDays={currentDate.getDate()} expense={summary.totalExpense} income={summary.totalIncome} />
          ) : null}
        </View>

        {!loading && !error ? (
          <View style={styles.paceSection}>
            <Text style={styles.sectionEyebrow}>MONTHLY RHYTHM</Text>
            <Text style={styles.sectionTitle}>Find your rhythm</Text>
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
  safeArea: { backgroundColor: "#F4F5EF", flex: 1 },
  content: { paddingBottom: 48, paddingTop: 8 },
  userRow: { alignItems: "center", flexDirection: "row", paddingHorizontal: 22, paddingBottom: 22, paddingTop: 8 },
  avatar: { alignItems: "center", backgroundColor: "#E2E8DA", borderRadius: 18, height: 46, justifyContent: "center", marginRight: 12, width: 46 },
  avatarText: { color: "#193D37", fontSize: 15, fontWeight: "700" },
  greetingCopy: { flex: 1, minWidth: 0 },
  greeting: { color: colors.inkSoft, fontSize: 12 },
  userName: { color: colors.ink, fontSize: 21, fontWeight: "700", letterSpacing: -0.6, marginTop: 2 },
  headerAction: { alignItems: "center", borderColor: "#DCE1D5", borderRadius: 23, borderWidth: 1, height: 46, justifyContent: "center", marginLeft: 10, width: 46 },
  headerActionPressed: { backgroundColor: "#E2E8DA", transform: [{ scale: 0.96 }] },
  homeHeader: { backgroundColor: "#193D37", borderRadius: 30, marginHorizontal: 16, overflow: "hidden" },
  heroArtwork: { position: "absolute", right: -60, top: 40, width: 240, height: 240, opacity: 0.65 },
  heroContent: { padding: 22 },
  heroTopRow: { alignItems: "flex-start", gap: 12 },
  heroEyebrow: { color: "#D6EF9B", fontSize: 10, fontWeight: "700", letterSpacing: 2 },
  monthPill: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 20, flexDirection: "row", gap: 7, paddingHorizontal: 11, paddingVertical: 7 },
  liveDot: { backgroundColor: "#D6EF9B", borderRadius: 3, height: 5, width: 5 },
  monthTitle: { color: "#EFF4E8", fontSize: 11, fontWeight: "600" },
  balanceBlock: { marginTop: 30 },
  balanceLabel: { color: "#C2D1C9", fontSize: 13, fontWeight: "500" },
  balanceValue: { color: "#F5F8EC", fontSize: 51, fontWeight: "600", letterSpacing: -2.5, marginTop: 4, fontVariant: ["tabular-nums"] },
  balanceCaption: { color: "#C2D1C9", fontSize: 12, lineHeight: 18, marginTop: 6 },
  monthTimeline: { marginTop: 26, marginBottom: 22 },
  timelineLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  timelineLabel: { color: "#C2D1C9", fontSize: 10, fontWeight: "500" },
  timelineTrack: { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 3, height: 3, overflow: "hidden" },
  timelineFill: { backgroundColor: "#D6EF9B", borderRadius: 3, height: 3 },
  summaryGrid: { flexDirection: "row", gap: 10 },
  metricCard: { backgroundColor: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.09)", borderRadius: 18, borderWidth: 1, flex: 1, minWidth: 0, padding: 13 },
  metricHeading: { alignItems: "center", flexDirection: "row", gap: 6 },
  metricLabel: { color: "#C2D1C9", fontSize: 11 },
  metricValue: { color: "#F5F8EC", fontSize: 22, fontWeight: "600", letterSpacing: -0.7, marginTop: 10, fontVariant: ["tabular-nums"] },
  metricChange: { color: "#C2D1C9", fontSize: 10, fontWeight: "600", marginTop: 8 },
  metricComparisonCaption: { color: "#C2D1C9", fontSize: 9, marginTop: 2 },
  belowHero: { gap: 16, marginTop: 16, paddingHorizontal: 16 },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionButton: { alignItems: "center", borderRadius: 18, flex: 1, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 52, minWidth: 0, paddingHorizontal: 10 },
  incomeButton: { backgroundColor: "#D6EF9B" },
  expenseButton: { backgroundColor: "#E6EADF" },
  actionButtonPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  actionLabel: { color: colors.ink, flexShrink: 1, fontSize: 12, fontWeight: "700" },
  flowCard: { backgroundColor: "#FCFDF8", borderColor: "#E2E6DB", borderRadius: 22, borderWidth: 1, padding: 18 },
  flowHeading: { alignItems: "center", flexDirection: "row", gap: 12 },
  flowCopy: { flex: 1 },
  flowTitle: { color: colors.ink, fontSize: 14, fontWeight: "600" },
  usageLabel: { color: colors.inkSoft, fontSize: 11, lineHeight: 16, marginTop: 3 },
  usagePercentage: { color: colors.forest, fontSize: 30, fontWeight: "600", letterSpacing: -1, flexShrink: 1 },
  usageTrack: { backgroundColor: "#E4EADB", borderRadius: 4, height: 7, marginTop: 16, overflow: "hidden" },
  spentSegment: { borderRadius: 4, height: "100%" },
  flowFooter: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between", marginTop: 13 },
  dailyAverageCaption: { color: colors.inkSoft, fontSize: 11, fontWeight: "400" },
  dailyAverageValue: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  loadingSummary: { alignItems: "center", gap: 12, justifyContent: "center", minHeight: 285 },
  loadingText: { color: "#C2D1C9", fontSize: 13 },
  errorSummary: { justifyContent: "center", minHeight: 285 },
  errorTitle: { color: "#F5F8EC", fontSize: 18, fontWeight: "700" },
  errorText: { color: "#C2D1C9", fontSize: 12, lineHeight: 18, marginTop: 8 },
  retryButton: { alignSelf: "flex-start", backgroundColor: "#D6EF9B", borderRadius: 14, marginTop: 16, paddingHorizontal: 18, paddingVertical: 14 },
  retryText: { color: "#193D37", fontSize: 13, fontWeight: "700" },
  paceSection: { marginTop: 30, paddingHorizontal: 16 },
  sectionEyebrow: { color: colors.forest, fontSize: 9, fontWeight: "700", letterSpacing: 2, paddingHorizontal: 3 },
  sectionTitle: { color: colors.ink, fontSize: 26, fontWeight: "600", letterSpacing: -0.8, marginTop: 6, marginBottom: 8, paddingHorizontal: 3 },
});
