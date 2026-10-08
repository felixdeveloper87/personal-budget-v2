import { SymbolView } from "expo-symbols";
import { useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryPaceCarousel } from "@/components/dashboard/CategoryPaceCarousel";
import { DescriptionPaceCarousel } from "@/components/dashboard/DescriptionPaceCarousel";
import { InstallmentCarousel } from "@/components/dashboard/InstallmentCarousel";
import { nu, nuSection } from "@/components/dashboard/nuTheme";
import { PaceChart } from "@/components/dashboard/PaceChart";
import { TopMerchantsCarousel } from "@/components/dashboard/TopMerchantsCarousel";
import { TransactionEntryModal } from "@/components/transactions/TransactionEntryModal";
import { useAuth } from "@/contexts/AuthContext";
import { NU_SHEET_OVERLAP, NuHeader } from "@/components/dashboard/NuHeader";
import { ApiError, getMonthlySummary, listInstallmentPlans, listTransactions } from "@/services/api";
import { colors } from "@/theme/colors";
import type { InstallmentPlan, MonthlySummary, Transaction } from "@/types/finance";

import { getMonthToDateComparison } from "@/utils/monthToDate";
import { getVariableSpending } from "@/utils/variableSpending";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const actionIcons = {
  show: {
    ios: "eye",
    android: "visibility",
    web: "visibility",
  },
  hide: {
    ios: "eye.slash",
    android: "visibility_off",
    web: "visibility_off",
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
  cards: {
    ios: "creditcard",
    android: "credit_card",
    web: "credit_card",
  },
  accounts: {
    ios: "building.columns",
    android: "account_balance",
    web: "account_balance",
  },
  household: {
    ios: "house",
    android: "home",
    web: "home",
  },
} satisfies Record<string, SymbolName>;

/** Header colours live in DashboardHeroArtwork's gradient; `brand` is its mid-tone, reused for accents in the body. */
const brand = nu.brand;
const brandTop = nu.brandDeep;
const brandTint = nu.brandTint;
const ink = nu.ink;
const inkSoft = nu.inkSoft;
const hairline = nu.hairline;
const accent = { positive: nu.positive, negative: nu.negative } as const;
const MASK = "••••";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
  }).format(date);
}

function fullDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
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

interface SummaryMetricProps {
  label: string;
  value: number;
  /** Values to compare; may differ from `value` (e.g. month-to-date slices). */
  current: number;
  previous: number | null;
  comparisonCaption: string;
  tone: "income" | "expense";
  hidden: boolean;
}

function SummaryMetric({ label, value, current, previous, comparisonCaption, tone, hidden }: SummaryMetricProps) {
  const change = getMetricChange(current, previous);
  const favorable = tone === "income" ? change.direction > 0 : change.direction < 0;

  return (
    <View
      accessible
      accessibilityLabel={hidden ? `${label}: hidden` : `${label}: ${formatCurrency(value)}. ${change.label} ${comparisonCaption}.`}
      style={styles.metricCard}
    >
      <Text style={styles.metricLabel}>{label}</Text>
      <Text adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1} style={styles.metricValue}>
        {hidden ? MASK : formatCurrency(value)}
      </Text>
      <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.metricChange}>
        {change.direction !== 0 && "amount" in change ? (
          <Text style={{ color: favorable ? accent.positive : accent.negative, fontWeight: "600" }}>
            {change.direction > 0 ? "↑ " : "↓ "}{change.amount}
          </Text>
        ) : change.label}
        {` ${comparisonCaption}`}
      </Text>
    </View>
  );
}

function VariableSpendingSection({ date, transactions, hidden }: { date: Date; transactions: Transaction[]; hidden: boolean }) {
  const spending = useMemo(() => getVariableSpending(transactions, date), [transactions, date]);

  return (
    <View
      accessible
      accessibilityLabel={
        hidden
          ? "Everyday spending: hidden"
          : formatCurrency(spending.spent) + " everyday spending this month, excluding installments and fixed payments. " +
            formatCurrency(spending.dailyAverage) + " per calendar day. " +
            (spending.projection > 0 ? "Projected month total at this pace: " + formatCurrency(spending.projection) + "." : "No spending projection yet.")
      }
      style={styles.section}
    >
      <View style={styles.sectionHeadingRow}>
        <Text style={styles.sectionHeading}>Everyday spending</Text>
        <View style={styles.dailyAverageBadge}>
          <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.dailyAverageAmount}>
            {hidden ? MASK : formatCurrency(spending.dailyAverage)}
            <Text style={styles.dailyAverageUnit}> / day</Text>
          </Text>
        </View>
      </View>
      <Text adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1} style={styles.spendingAmount}>
        {hidden ? MASK : formatCurrency(spending.spent)}
      </Text>
      <View style={styles.spendingTrack}>
        <View style={[styles.spendingFill, { width: `${spending.share * 100}%` }]} />
      </View>
      <View style={styles.spendingRow}>
        <Text numberOfLines={1} style={styles.spendingCaption}>Month-end at this pace</Text>
        <Text style={styles.spendingProjection}>
          {hidden ? MASK : spending.projection > 0 ? formatCurrency(spending.projection) : "—"}
        </Text>
      </View>
      <Text style={styles.spendingExclusion}>Excludes installments & fixed payments</Text>
    </View>
  );
}

interface ShortcutProps {
  icon: SymbolName;
  label: string;
  onPress: () => void;
  tint?: string;
}

function Shortcut({ icon, label, onPress, tint = ink }: ShortcutProps) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={styles.shortcut}>
      {({ pressed }) => (
        <>
          <View style={[styles.shortcutCircle, pressed && styles.shortcutCirclePressed]}>
            <SymbolView name={icon} size={22} tintColor={tint} weight="medium" />
          </View>
          <Text numberOfLines={2} style={styles.shortcutLabel}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [previousSummary, setPreviousSummary] = useState<MonthlySummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entryType, setEntryType] = useState<"INCOME" | "EXPENSE" | null>(null);
  const [hidden, setHidden] = useState(false);
  const currentDate = useMemo(() => new Date(), []);

  // Light status-bar icons over the coloured header, restored when leaving the tab.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, []),
  );

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
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[brand]}
            onRefresh={() => void loadSummary(true)}
            progressViewOffset={insets.top}
            refreshing={refreshing}
            tintColor={colors.white}
          />
        }
      >
        {/* Brand colour also fills the iOS overscroll area above the header. */}
        <View style={styles.overscrollFill} />

        <NuHeader searchTransactions={transactions}>
          <View style={styles.headerInner}>
            <View>
              <Text numberOfLines={1} style={styles.greeting}>
                {greetingLabel(currentDate)}, {firstName}
              </Text>
              <Text numberOfLines={1} style={styles.headerDate}>{fullDateLabel(currentDate)}</Text>
            </View>
          </View>
        </NuHeader>

        <View style={styles.body}>
          {loading ? (
            <View style={styles.loadingSummary}>
              <ActivityIndicator color={brand} />
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
          ) : summary ? (°
            <View style={styles.section}>
              <View style={styles.sectionHeadingRow}>
                <Text style={styles.sectionHeading}>Net this month</Text>
                <View style={styles.sectionMetaRow}>
                  <Text numberOfLines={1} style={styles.sectionMeta}>
                    {monthLabel(currentDate)} · Day {currentDate.getDate()} of {daysInMonth}
                  </Text>
                  <Pressable
                    accessibilityLabel={hidden ? "Show values" : "Hide values"}
                    accessibilityRole="button"
                    accessibilityState={{ selected: hidden }}
                    hitSlop={8}
                    onPress={() => setHidden((value) => !value)}
                    style={({ pressed }) => [styles.eyeButton, pressed && styles.eyeButtonPressed]}
                  >
                    <SymbolView name={hidden ? actionIcons.hide : actionIcons.show} size={18} tintColor={inkSoft} />
                  </Pressable>
                </View>
              </View>
              <Text adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1} style={styles.balanceValue}>
                {hidden ? MASK : formatCurrency(summary.balance)}
              </Text>
              <View style={styles.balanceCaptionRow}>
                <View
                  style={[
                    styles.balanceCaptionDot,
                    { backgroundColor: summary.balance < 0 ? accent.negative : accent.positive },
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
          ) : null}

          <ScrollView
            horizontal
            contentContainerStyle={styles.shortcutsRow}
            showsHorizontalScrollIndicator={false}
          >
            <Shortcut icon={actionIcons.income} label="Add income" onPress={() => setEntryType("INCOME")} tint={accent.positive} />
            <Shortcut icon={actionIcons.expense} label="Add expense" onPress={() => setEntryType("EXPENSE")} tint={accent.negative} />
            <Shortcut icon={actionIcons.cards} label="Cards" onPress={() => router.navigate("/cards")} />
            <Shortcut icon={actionIcons.accounts} label="Accounts" onPress={() => router.navigate("/accounts")} />
            <Shortcut icon={actionIcons.household} label="Household" onPress={() => router.navigate("/household")} />
          </ScrollView>

          {!loading && !error && summary ? (
            <>
              <View style={styles.divider} />
              <View style={[styles.section, styles.summaryGrid]}>
                <SummaryMetric
                  comparisonCaption="vs same day last month"
                  current={incomeComparison.current}
                  hidden={hidden}
                  label="Income"
                  previous={incomeComparison.previous}
                  tone="income"
                  value={summary.totalIncome}
                />
                <View style={styles.metricDivider} />
                <SummaryMetric
                  comparisonCaption="vs last month"
                  current={summary.totalExpense}
                  hidden={hidden}
                  label="Payments"
                  previous={previousSummary?.totalExpense ?? null}
                  tone="expense"
                  value={summary.totalExpense}
                />
              </View>
              <View style={styles.divider} />
              <VariableSpendingSection date={currentDate} hidden={hidden} transactions={transactions} />
            </>
          ) : null}
        </View>

        {!loading && !error ? (
          <>
            <View style={styles.paceSection}>
              <Text style={styles.sectionTitle}>Monthly rhythm</Text>
              <Text style={styles.sectionSubtitle}>This month vs last, day by day</Text>
              <PaceChart interactive date={currentDate} tone="income" transactions={transactions} />
              <PaceChart interactive date={currentDate} tone="expense" transactions={transactions} />
            </View>
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
          </>
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white, flex: 1 },
  content: { paddingBottom: 48 },
  overscrollFill: { backgroundColor: brandTop, height: 1000, left: 0, position: "absolute", right: 0, top: -1000 },
  headerInner: { flex: 1, justifyContent: "flex-end" },
  headerDate: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 },
  sectionMetaRow: { alignItems: "center", flexDirection: "row", flexShrink: 1, gap: 4 },
  eyeButton: { alignItems: "center", borderRadius: 16, height: 32, justifyContent: "center", width: 32 },
  eyeButtonPressed: { backgroundColor: nu.surface },
  greeting: { color: colors.white, fontSize: 24, fontWeight: "700", letterSpacing: -0.5 },
  body: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -NU_SHEET_OVERLAP,
    paddingBottom: 8,
    paddingTop: 4,
  },
  section: { paddingHorizontal: 20, paddingVertical: 18 },
  sectionHeadingRow: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between" },
  sectionHeading: { color: ink, fontSize: 17, fontWeight: "600", letterSpacing: -0.2 },
  sectionMeta: { color: inkSoft, flexShrink: 1, fontSize: 12, fontVariant: ["tabular-nums"] },
  balanceValue: { color: ink, fontSize: 28, fontWeight: "700", letterSpacing: -0.8, marginTop: 10, fontVariant: ["tabular-nums"] },
  balanceCaptionRow: { alignItems: "center", flexDirection: "row", gap: 6, marginTop: 4 },
  balanceCaptionDot: { borderRadius: 3, height: 6, width: 6 },
  balanceCaption: { color: inkSoft, flexShrink: 1, fontSize: 13, lineHeight: 18 },
  shortcutsRow: { gap: 12, paddingBottom: 20, paddingHorizontal: 20 },
  shortcut: { alignItems: "center", width: 68 },
  shortcutCircle: { alignItems: "center", backgroundColor: "#F0F0F5", borderRadius: 32, height: 64, justifyContent: "center", width: 64 },
  shortcutCirclePressed: { backgroundColor: "#E2E2EA" },
  shortcutLabel: { color: ink, fontSize: 12, fontWeight: "500", lineHeight: 15, marginTop: 8, textAlign: "center" },
  divider: { backgroundColor: hairline, height: 1 },
  summaryGrid: { flexDirection: "row", gap: 16 },
  metricCard: { flex: 1, minWidth: 0 },
  metricDivider: { backgroundColor: hairline, width: 1 },
  metricLabel: { color: inkSoft, fontSize: 13 },
  metricValue: { color: ink, fontSize: 20, fontWeight: "700", letterSpacing: -0.5, marginTop: 6, fontVariant: ["tabular-nums"] },
  metricChange: { color: inkSoft, fontSize: 11, marginTop: 4 },
  dailyAverageBadge: { backgroundColor: brandTint, borderRadius: 999, flexShrink: 0, paddingHorizontal: 10, paddingVertical: 5 },
  dailyAverageAmount: { color: brand, fontSize: 12, fontWeight: "700", fontVariant: ["tabular-nums"] },
  dailyAverageUnit: { fontWeight: "500" },
  spendingAmount: { color: ink, fontSize: 24, fontWeight: "700", letterSpacing: -0.6, marginTop: 10, fontVariant: ["tabular-nums"] },
  spendingTrack: { backgroundColor: "#EDEDF2", borderRadius: 3, height: 6, marginTop: 14, overflow: "hidden" },
  spendingFill: { backgroundColor: brand, borderRadius: 3, height: "100%" },
  spendingRow: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "space-between", marginTop: 10 },
  spendingCaption: { color: inkSoft, flexShrink: 1, fontSize: 12 },
  spendingProjection: { color: ink, fontSize: 13, fontWeight: "600", fontVariant: ["tabular-nums"] },
  spendingExclusion: { color: "#9A9AA5", fontSize: 11, marginTop: 6 },
  loadingSummary: { alignItems: "center", gap: 12, justifyContent: "center", minHeight: 140 },
  loadingText: { color: inkSoft, fontSize: 13 },
  errorSummary: { justifyContent: "center", minHeight: 140, paddingHorizontal: 20, paddingVertical: 18 },
  errorTitle: { color: ink, fontSize: 18, fontWeight: "600" },
  errorText: { color: inkSoft, fontSize: 12, lineHeight: 18, marginTop: 8 },
  retryButton: { alignSelf: "flex-start", backgroundColor: brand, borderRadius: 999, marginTop: 16, paddingHorizontal: 20, paddingVertical: 12 },
  retryText: { color: colors.white, fontSize: 13, fontWeight: "600" },
  paceSection: nuSection.container,
  sectionTitle: nuSection.title,
  sectionSubtitle: nuSection.subtitle,
});
