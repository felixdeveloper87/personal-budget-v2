import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { CategoryPaceCarousel } from "@/components/dashboard/CategoryPaceCarousel";
import { DescriptionPaceCarousel } from "@/components/dashboard/DescriptionPaceCarousel";
import { InstallmentCarousel } from "@/components/dashboard/InstallmentCarousel";
import { PaceChart } from "@/components/dashboard/PaceChart";
import { TopMerchantsCarousel } from "@/components/dashboard/TopMerchantsCarousel";
import { TransactionEntryModal } from "@/components/transactions/TransactionEntryModal";
import { useAuth } from "@/contexts/AuthContext";
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

interface SummaryMetricProps {
  icon: SymbolName;
  label: string;
  value: number;
  tone: "income" | "expense" | "net";
}

function SummaryMetric({ icon, label, value, tone }: SummaryMetricProps) {
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
      </View>
    </View>
  );
}

interface FlowDonutProps {
  expense: number;
  income: number;
  size: number;
}

function FlowDonut({ expense, income, size }: FlowDonutProps) {
  const strokeWidth = Math.max(18, Math.round(size * 0.15));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = income + expense;
  const incomeShare = total > 0 ? income / total : 0;
  const expenseShare = total > 0 ? expense / total : 0;
  const expensePercentage = total > 0 ? Math.round(expenseShare * 100) : 0;

  return (
    <View style={styles.flowCard}>
      <View style={[styles.donutWrap, { height: size, width: size }]}>
        <Svg accessibilityLabel="Income versus expense chart" height={size} width={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke={colors.paperMuted}
            strokeWidth={strokeWidth}
          />
          {total > 0 ? (
            <>
              <Circle
                cx={size / 2}
                cy={size / 2}
                fill="none"
                originX={size / 2}
                originY={size / 2}
                r={radius}
                rotation={-90}
                stroke="#3E9870"
                strokeDasharray={`${circumference * incomeShare} ${circumference}`}
                strokeLinecap="butt"
                strokeWidth={strokeWidth}
              />
              <Circle
                cx={size / 2}
                cy={size / 2}
                fill="none"
                originX={size / 2}
                originY={size / 2}
                r={radius}
                rotation={-90}
                stroke="#D05F5B"
                strokeDasharray={`${circumference * expenseShare} ${circumference}`}
                strokeDashoffset={-(circumference * incomeShare)}
                strokeLinecap="butt"
                strokeWidth={strokeWidth}
              />
            </>
          ) : null}
        </Svg>
        <View pointerEvents="none" style={styles.donutCenter}>
          <Text style={styles.donutPercentage}>{expensePercentage}%</Text>
          <Text style={styles.donutLabel}>outflow</Text>
        </View>
      </View>

      <Text style={styles.flowTitle}>Income vs expense</Text>
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, styles.incomeLegendDot]} />
          <Text style={styles.legendLabel}>Income</Text>
          <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.legendIncomeValue}>
            {formatCurrency(income)}
          </Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, styles.expenseLegendDot]} />
          <Text style={styles.legendLabel}>Expense</Text>
          <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.legendExpenseValue}>
            {formatCurrency(expense)}
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
  const { width } = useWindowDimensions();
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
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
        const [nextSummary, nextTransactions, nextInstallmentPlans] = await Promise.all([
          getMonthlySummary(user.token, currentDate),
          listTransactions(user.token),
          listInstallmentPlans(user.token),
        ]);
        setSummary(nextSummary);
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
  const columnWidth = (width - 32 - 10) / 2;
  const donutSize = Math.min(columnWidth - 18, 136);
  const heroHeight = Math.max(540, Math.min(680, (width - 32) * 1.55));

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
        <ImageBackground
          resizeMode="cover"
          source={require("../../../assets/images/dashboard-hero-background.png")}
          style={styles.homeHeader}
        >
          <View pointerEvents="none" style={styles.heroScrim} />
          <View style={[styles.heroContent, { minHeight: heroHeight }]}>
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
                      tone="income"
                      value={summary.totalIncome}
                    />
                    <SummaryMetric
                      icon={actionIcons.expense}
                      label="Expense"
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
                  <FlowDonut
                    expense={summary.totalExpense}
                    income={summary.totalIncome}
                    size={donutSize}
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
        </ImageBackground>

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
    paddingBottom: 28,
    paddingHorizontal: 16,
    paddingTop: 19,
  },
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
  summarySection: { gap: 10, marginTop: "auto", paddingTop: 48 },
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
  donutWrap: { alignItems: "center", justifyContent: "center" },
  donutCenter: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  donutPercentage: { color: colors.ink, fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  donutLabel: { color: colors.inkSoft, fontSize: 11, fontWeight: "600", marginTop: 1 },
  flowTitle: { color: colors.ink, fontSize: 13, fontWeight: "700", marginTop: 10 },
  legend: { gap: 7, marginTop: 11, width: "100%" },
  legendRow: { alignItems: "center", flexDirection: "row", minWidth: 0 },
  legendDot: { borderRadius: 5, height: 10, marginRight: 6, width: 10 },
  incomeLegendDot: { backgroundColor: "#3E9870" },
  expenseLegendDot: { backgroundColor: "#D05F5B" },
  legendLabel: { color: colors.inkSoft, fontSize: 10, marginRight: 5 },
  legendIncomeValue: {
    color: colors.income,
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
  },
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
