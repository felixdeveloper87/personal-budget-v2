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

import { getMonthToDateComparison } from "@/utils/monthToDate";
import { getVariableSpending } from "@/utils/variableSpending";

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
    amount,
    label: `${amount} ${difference > 0 ? "higher" : "lower"}`,
    direction: difference > 0 ? 1 : -1,
  };
}

const heroAccent = { positive: "#D6EF9B", negative: "#F1B9A4" } as const;

interface SummaryMetricProps {
  icon: SymbolName;
  label: string;
  value: number;
  /** Values to compare; may differ from `value` (e.g. month-to-date slices). */
  current: number;
  previous: number | null;
  comparisonCaption: string;
  tone: "income" | "expense";
}

function SummaryMetric({ icon, label, value, current, previous, comparisonCaption, tone }: SummaryMetricProps) {
  const change = getMetricChange(current, previous);
  const favorable = tone === "income" ? change.direction > 0 : change.direction < 0;
  const accent = tone === "income" ? heroAccent.positive : heroAccent.negative;

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${formatCurrency(value)}. ${change.label} ${comparisonCaption}.`}
      style={styles.metricCard}
    >
      <View style={styles.metricHeading}>
        <View style={[styles.metricIcon, { backgroundColor: `${accent}26` }]}>
          <SymbolView name={icon} size={11} tintColor={accent} weight="semibold" />
        </View>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1} style={styles.metricValue}>
        {formatCurrency(value)}
      </Text>
      <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.metricChange}>
        {change.direction !== 0 && "amount" in change ? (
          <Text style={{ color: favorable ? heroAccent.positive : heroAccent.negative, fontWeight: "600" }}>
            {change.direction > 0 ? "↑ " : "↓ "}{change.amount}
          </Text>
        ) : change.label}
        {` ${comparisonCaption}`}
      </Text>
    </View>
  );
}

function VariableSpendingBar({ date, transactions }: { date: Date; transactions: Transaction[] }) {
  const spending = useMemo(() => getVariableSpending(transactions, date), [transactions, date]);

  return (
    <View
      accessible
      accessibilityLabel={
        formatCurrency(spending.spent) + " everyday spending this month, excluding installments and fixed payments. " +
        formatCurrency(spending.dailyAverage) + " per calendar day. " +
        (spending.projection > 0 ? "Projected month total at this pace: " + formatCurrency(spending.projection) + "." : "No spending projection yet.")
      }
      style={styles.spendingPanel}
    >
      <View style={styles.spendingRow}>
        <View style={styles.spendingAmountCopy}>
          <Text style={styles.spendingEyebrow}>EVERYDAY SPENDING</Text>
          <Text adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1} style={styles.spendingAmount}>
            {formatCurrency(spending.spent)}
          </Text>
        </View>
        <View style={styles.dailyAverageBadge}>
          <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.dailyAverageAmount}>
            {formatCurrency(spending.dailyAverage)}
            <Text style={styles.dailyAverageUnit}> / day</Text>
          </Text>
        </View>
      </View>
      <View style={styles.spendingTrack}>
        <View style={[styles.spendingFill, { width: `${spending.share * 100}%` }]} />
        <View style={[styles.spendingKnob, { left: `${spending.share * 100}%` }]} />
      </View>
      <View style={styles.spendingRow}>
        <Text numberOfLines={1} style={styles.spendingCaption}>Month-end at this pace</Text>
        <Text style={styles.spendingProjection}>{spending.projection > 0 ? formatCurrency(spending.projection) : "—"}</Text>
      </View>
      <Text style={styles.spendingExclusion}>Excludes installments & fixed payments</Text>
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
      <View style={styles.actionIcon}>
        <SymbolView
          name={isIncome ? actionIcons.income : actionIcons.expense}
          size={14}
          tintColor={colors.white}
          weight="bold"
        />
      </View>
      <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.actionLabel}>
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

    // The summary sums by payment date: a card purchase billed next month must not move this month's totals.
    const paidOn = (transaction.paymentDate ?? transaction.transactionDate ?? transaction.dateTime).slice(0, 7);
    const thisMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    if (paidOn !== thisMonth) return;

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
  }, [currentDate]);

  const incomeComparison = useMemo(
    () => getMonthToDateComparison(transactions, "INCOME", currentDate),
    [transactions, currentDate],
  );

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
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <DashboardHeroArtwork />
          </View>
          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || "PB"}</Text>
              </View>
              <Text numberOfLines={1} style={styles.greeting}>
                {greetingLabel(currentDate)}, <Text style={styles.userName}>{firstName}</Text>
              </Text>
              <Pressable
                accessibilityLabel="Open settings"
                accessibilityRole="button"
                hitSlop={6}
                onPress={() => router.navigate("/more")}
                style={({ pressed }) => [styles.headerAction, pressed && styles.headerActionPressed]}
              >
                <SymbolView name={actionIcons.settings} size={18} tintColor="#E6F0DA" weight="regular" />
              </Pressable>
            </View>
            {loading ? (
              <View style={styles.loadingSummary}>
                <ActivityIndicator color={heroAccent.positive} />
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
                  <View style={styles.balanceLabelRow}>
                    <View style={styles.monthPill}>
                      <View style={styles.monthPillDot} />
                      <Text style={styles.monthTitle}>Net · {monthLabel(currentDate)}</Text>
                    </View>
                    <Text style={styles.heroDay}>
                      Day {currentDate.getDate()} of {new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()}
                    </Text>
                  </View>
                  <Text adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1} style={styles.balanceValue}>
                    {formatCurrency(summary.balance)}
                  </Text>
                  <View style={styles.balanceCaptionRow}>
                    <View
                      style={[
                        styles.balanceCaptionDot,
                        { backgroundColor: summary.balance < 0 ? heroAccent.negative : heroAccent.positive },
                      ]}
                    />
                    <Text style={styles.balanceCaption}>
                      {summary.totalIncome === 0 && summary.totalExpense === 0
                        ? "No transactions recorded yet"
                        : summary.balance > 0
                          ? "Income exceeds spending so far"
                          : summary.balance < 0
                            ? "Spending exceeds income so far"
                            : "Income and spending are balanced"}
                    </Text>
                  </View>
                </View>
                <View style={styles.summaryGrid}>
                  <SummaryMetric
                    comparisonCaption="vs same day last month"
                    current={incomeComparison.current}
                    icon={actionIcons.income}
                    label="Income"
                    previous={incomeComparison.previous}
                    tone="income"
                    value={summary.totalIncome}
                  />
                  <View style={styles.metricDivider} />
                  <SummaryMetric
                    comparisonCaption="vs last month"
                    current={summary.totalExpense}
                    icon={actionIcons.expense}
                    label="Payments"
                    previous={previousSummary?.totalExpense ?? null}
                    tone="expense"
                    value={summary.totalExpense}
                  />
                </View>
                <VariableSpendingBar date={currentDate} transactions={transactions} />
              </>
            ) : null}
          </View>
        </View>

        <View style={styles.belowHero}>
          <View style={styles.actionsRow}>
            <ActionButton label="Add income" onPress={() => setEntryType("INCOME")} tone="income" />
            <ActionButton label="Add expense" onPress={() => setEntryType("EXPENSE")} tone="expense" />
          </View>
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
  content: { paddingBottom: 48, paddingTop: 12 },
  avatar: { alignItems: "center", backgroundColor: "rgba(214,239,155,0.16)", borderColor: "rgba(214,239,155,0.3)", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, height: 32, justifyContent: "center", width: 32 },
  avatarText: { color: "#D6EF9B", fontSize: 11, fontWeight: "700" },
  greeting: { color: "rgba(230,240,218,0.7)", flex: 1, fontSize: 13, minWidth: 0 },
  userName: { color: "#F6F8F0", fontSize: 15, fontWeight: "600", letterSpacing: -0.2 },
  headerAction: { alignItems: "center", backgroundColor: "rgba(246,248,240,0.1)", borderRadius: 16, height: 32, justifyContent: "center", width: 32 },
  headerActionPressed: { backgroundColor: "rgba(246,248,240,0.2)", transform: [{ scale: 0.94 }] },
  homeHeader: {
    backgroundColor: "#1C4049",
    borderRadius: 24,
    elevation: 6,
    marginHorizontal: 16,
    overflow: "hidden",
    shadowColor: "#0E2229",
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  heroContent: { paddingHorizontal: 18, paddingVertical: 16 },
  heroTopRow: { alignItems: "center", flexDirection: "row", gap: 10 },
  monthPill: { alignItems: "center", backgroundColor: "rgba(214,239,155,0.12)", borderRadius: 999, flexDirection: "row", gap: 6, paddingHorizontal: 9, paddingVertical: 4 },
  monthPillDot: { backgroundColor: "#D6EF9B", borderRadius: 3, height: 6, width: 6 },
  monthTitle: { color: "#E6F0DA", fontSize: 11, fontWeight: "600" },
  heroDay: { color: "rgba(230,240,218,0.62)", fontSize: 11, fontVariant: ["tabular-nums"] },
  balanceBlock: { marginTop: 14 },
  balanceLabelRow: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between", marginBottom: 4 },
  balanceValue: { color: "#F6F8F0", fontSize: 36, fontWeight: "700", letterSpacing: -1.4, marginTop: 2, fontVariant: ["tabular-nums"] },
  balanceCaptionRow: { alignItems: "center", flexDirection: "row", gap: 6, marginTop: 2 },
  balanceCaptionDot: { borderRadius: 3, height: 6, width: 6 },
  balanceCaption: { color: "rgba(230,240,218,0.7)", flexShrink: 1, fontSize: 12, lineHeight: 17 },
  summaryGrid: { flexDirection: "row", gap: 14, marginTop: 16 },
  metricCard: { flex: 1, minWidth: 0 },
  metricDivider: { backgroundColor: "rgba(230,240,218,0.14)", width: StyleSheet.hairlineWidth },
  metricHeading: { alignItems: "center", flexDirection: "row", gap: 6 },
  metricIcon: { alignItems: "center", borderRadius: 9, height: 18, justifyContent: "center", width: 18 },
  metricLabel: { color: "rgba(230,240,218,0.72)", fontSize: 12 },
  metricValue: { color: "#F6F8F0", fontSize: 19, fontWeight: "600", letterSpacing: -0.5, marginTop: 6, fontVariant: ["tabular-nums"] },
  metricChange: { color: "rgba(230,240,218,0.55)", fontSize: 11, marginTop: 3 },
  belowHero: { gap: 20, marginTop: 12, paddingHorizontal: 16 },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionButton: { alignItems: "center", borderRadius: 16, flex: 1, flexDirection: "row", gap: 10, justifyContent: "center", minHeight: 52, minWidth: 0, paddingHorizontal: 12, paddingVertical: 10 },
  incomeButton: { backgroundColor: "#2B6A4E", elevation: 3, shadowColor: "#1E5640", shadowOffset: { height: 6, width: 0 }, shadowOpacity: 0.2, shadowRadius: 10 },
  expenseButton: { backgroundColor: "#A94E3C", elevation: 3, shadowColor: "#7E3528", shadowOffset: { height: 6, width: 0 }, shadowOpacity: 0.2, shadowRadius: 10 },
  actionButtonPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  actionIcon: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 999, height: 26, justifyContent: "center", overflow: "hidden", width: 26 },
  actionLabel: { color: colors.white, flexShrink: 1, fontSize: 14, fontWeight: "600", letterSpacing: -0.1 },
  spendingPanel: {
    backgroundColor: "rgba(246,248,240,0.07)",
    borderColor: "rgba(214,239,155,0.14)",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  spendingRow: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "space-between" },
  spendingEyebrow: { color: "#D6EF9B", fontSize: 9, fontWeight: "700", letterSpacing: 1.3 },
  spendingAmountCopy: { flexShrink: 1, minWidth: 0 },
  spendingAmount: { color: "#F6F8F0", fontSize: 22, fontWeight: "600", letterSpacing: -0.6, marginTop: 3, fontVariant: ["tabular-nums"] },
  spendingCaption: { color: "rgba(230,240,218,0.62)", flexShrink: 1, fontSize: 11 },
  dailyAverageBadge: { backgroundColor: "rgba(214,239,155,0.14)", borderRadius: 999, flexShrink: 0, paddingHorizontal: 10, paddingVertical: 5 },
  dailyAverageAmount: { color: "#E6F4C4", fontSize: 12, fontWeight: "700", fontVariant: ["tabular-nums"] },
  dailyAverageUnit: { color: "rgba(230,244,196,0.7)", fontWeight: "500" },
  spendingTrack: { backgroundColor: "rgba(230,240,218,0.14)", borderRadius: 3, height: 6, justifyContent: "center" },
  spendingFill: { backgroundColor: "#D6EF9B", borderRadius: 3, height: "100%" },
  spendingKnob: {
    backgroundColor: "#F6F8F0",
    borderColor: "#D6EF9B",
    borderRadius: 6,
    borderWidth: 2,
    height: 12,
    marginLeft: -6,
    position: "absolute",
    width: 12,
  },
  spendingProjection: { color: "#F6F8F0", fontSize: 12, fontWeight: "600", fontVariant: ["tabular-nums"] },
  spendingExclusion: { color: "rgba(230,240,218,0.45)", fontSize: 10 },
  loadingSummary: { alignItems: "center", gap: 12, justifyContent: "center", minHeight: 200 },
  loadingText: { color: "rgba(230,240,218,0.72)", fontSize: 13 },
  errorSummary: { justifyContent: "center", minHeight: 200 },
  errorTitle: { color: "#F6F8F0", fontSize: 18, fontWeight: "600" },
  errorText: { color: "rgba(230,240,218,0.72)", fontSize: 12, lineHeight: 18, marginTop: 8 },
  retryButton: { alignSelf: "flex-start", backgroundColor: "#D6EF9B", borderRadius: 12, marginTop: 16, paddingHorizontal: 18, paddingVertical: 12 },
  retryText: { color: "#1C4049", fontSize: 13, fontWeight: "600" },
  paceSection: { marginTop: 30, paddingHorizontal: 16 },
  sectionEyebrow: { color: colors.forest, fontSize: 9, fontWeight: "700", letterSpacing: 2, paddingHorizontal: 3 },
  sectionTitle: { color: colors.ink, fontSize: 26, fontWeight: "600", letterSpacing: -0.8, marginTop: 6, marginBottom: 8, paddingHorizontal: 3 },
});
