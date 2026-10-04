import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

import {
  DailyActivityChart,
  type DailyActivityEntry,
} from "@/components/activity/DailyActivityChart";
import { NU_SHEET_OVERLAP, NuHeader } from "@/components/dashboard/NuHeader";
import { nu, nuSection } from "@/components/dashboard/nuTheme";
import { MerchantLogo } from "@/components/merchant/MerchantLogo";
import { PeriodNavigator } from "@/components/period/PeriodNavigator";
import { useAuth } from "@/contexts/AuthContext";
import { usePeriodNavigation } from "@/hooks/usePeriodNavigation";
import { ApiError, searchTransactions } from "@/services/api";
import type { Transaction } from "@/types/finance";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const expenseTrendIcon = {
  ios: "chart.line.downtrend.xyaxis",
  android: "trending_down",
  web: "trending_down",
} satisfies SymbolName;

function ExpenseTrendIcon({ color, size }: { color: string; size: number }) {
  return (
    <SymbolView
      name={expenseTrendIcon}
      size={size}
      tintColor={color}
      weight="semibold"
    />
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function formatTransactionDate(value?: string | null) {
  if (!value) return "Data não informada";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(year, month - 1, day));
}

function transactionDate(expense: Transaction) {
  // Prefer the real purchase date; fall back to paymentDate then dateTime.
  return (expense.transactionDate ?? expense.paymentDate ?? expense.dateTime).slice(0, 10);
}

function isInstallment(expense: Transaction) {
  return expense.isInstallment === true || expense.installmentPlanId != null;
}

function formatSelectedDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const label = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

interface ExpenseDescriptionGroup {
  category: string;
  count: number;
  domain?: string | null;
  key: string;
  name: string;
  total: number;
}

function groupExpensesByDescription(expenses: Transaction[]): ExpenseDescriptionGroup[] {
  const grouped = new Map<string, ExpenseDescriptionGroup>();

  for (const expense of expenses) {
    const name = expense.merchantName?.trim()
      || expense.description.trim().replace(/\s+/g, " ")
      || expense.category;
    const key = name.toLocaleLowerCase();
    const current = grouped.get(key);

    if (current) {
      current.count += 1;
      current.total += Number(expense.amount || 0);
    } else {
      grouped.set(key, {
        category: expense.category,
        count: 1,
        domain: expense.merchantDomain,
        key,
        name,
        total: Number(expense.amount || 0),
      });
    }
  }

  return [...grouped.values()].sort(
    (first, second) => second.total - first.total || first.name.localeCompare(second.name),
  );
}

export function ExpensesScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const period = usePeriodNavigation("month");
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const requestSequence = useRef(0);

  const loadExpenses = useCallback(
    async (refresh = false) => {
      if (!user) return;
      const sequence = ++requestSequence.current;
      refresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      try {
        const result = await searchTransactions(user.token, {
          type: "expense",
        });

        if (sequence === requestSequence.current) {
          setExpenses(
            result
              .filter((expense) => {
                const date = transactionDate(expense);
                return !isInstallment(expense)
                  && date >= period.range.startDate
                  && date <= period.range.endDate;
              })
              .sort((a, b) => transactionDate(b).localeCompare(transactionDate(a))),
          );
        }


      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          await logout();
          return;
        }
        if (sequence === requestSequence.current) {
          setError("Não foi possível carregar suas despesas.");
        }
      } finally {
        if (sequence === requestSequence.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }, [logout, period.range.endDate, period.range.startDate, user]);

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    setSelectedDay(null);
  }, [period.range.endDate, period.range.startDate]);

  const totalExpense = useMemo(
    () => expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0),
    [expenses],
  );
  const chartEntries = useMemo<DailyActivityEntry[]>(
    () => expenses.map((expense) => ({ amount: Number(expense.amount), date: transactionDate(expense) })),
    [expenses],
  );
  const visibleExpenses = useMemo(
    () => selectedDay ? expenses.filter((expense) => transactionDate(expense) === selectedDay) : expenses,
    [expenses, selectedDay],
  );
  const groupedExpenses = useMemo(() => groupExpensesByDescription(expenses), [expenses]);
  const selectedDayTotal = useMemo(
    () => visibleExpenses.reduce((total, expense) => total + Number(expense.amount || 0), 0),
    [visibleExpenses],
  );

  // Light status-bar icons over the purple header, restored when leaving the tab.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, []),
  );

  if (!user) return null;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[nu.brand]}
            onRefresh={() => void loadExpenses(true)}
            progressViewOffset={insets.top}
            refreshing={refreshing}
            tintColor={nu.white}
          />
        }
      >
        {/* Brand colour also fills the iOS overscroll area above the header. */}
        <View style={styles.overscrollFill} />

        <NuHeader>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Despesas</Text>
            <View style={styles.headerIcon}>
              <ExpenseTrendIcon color={nu.white} size={17} />
            </View>
          </View>

          <Text style={styles.totalLabel}>Total no período</Text>
          {loading ? (
            <View style={styles.loadingValue}>
              <ActivityIndicator color={nu.white} />
            </View>
          ) : (
            <Text adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1} style={styles.totalValue}>
              {error ? "—" : formatCurrency(totalExpense)}
            </Text>
          )}
          <Text numberOfLines={1} style={styles.totalCaption}>
            {loading
              ? "Carregando suas saídas…"
              : error
                ? "Total indisponível no momento"
                : `${expenses.length === 1 ? "1 despesa" : `${expenses.length} despesas`} · sem parcelas`}
          </Text>

          <View style={styles.periodPanel}>
            <PeriodNavigator
              isCurrent={period.isCurrent}
              label={period.label}
              layout="inline"
              onChange={period.setSelectedPeriod}
              onGoToToday={period.goToToday}
              onNavigate={period.navigate}
              value={period.selectedPeriod}
              variant="inverse"
            />
          </View>
        </NuHeader>

        {/* White sheet: rounded top tucked over the purple header. */}
        <View style={styles.sheet}>
          {!loading && !error ? (
            <View style={styles.section}>
              <DailyActivityChart
                appearance="nu"
                endDate={period.range.end}
                entries={chartEntries}
                onSelectDay={(day) => setSelectedDay((current) => current === day ? null : day)}
                period={period.selectedPeriod}
                selectedDay={selectedDay}
                startDate={period.range.start}
                title={`Intensidade por dia · ${period.label}`}
                tone="expense"
              />
            </View>
          ) : null}

          <View style={[styles.section, styles.sectionDivided]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionCopy}>
                <Text style={styles.sectionTitle}>
                  {selectedDay ? formatSelectedDate(selectedDay) : "Onde você gastou"}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {selectedDay ? `Total do dia · ${formatCurrency(selectedDayTotal)}` : "Agrupadas por descrição"}
                </Text>
              </View>
              {!loading && !error ? (
                selectedDay ? (
                  <Pressable onPress={() => setSelectedDay(null)} style={({ pressed }) => [styles.pill, pressed && styles.pressed]}>
                    <Text style={styles.pillText}>Ver todas</Text>
                  </Pressable>
                ) : (
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>{groupedExpenses.length}</Text>
                  </View>
                )
              ) : null}
            </View>

            {loading ? (
              <View style={styles.stateCard}>
                <ActivityIndicator color={nu.brand} />
                <Text style={styles.stateText}>Carregando despesas…</Text>
              </View>
            ) : error ? (
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>Despesas indisponíveis</Text>
                <Text style={styles.stateText}>{error}</Text>
                <Pressable onPress={() => void loadExpenses()} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              </View>
            ) : visibleExpenses.length === 0 ? (
              <View style={styles.stateCard}>
                <View style={styles.emptyIcon}>
                  <ExpenseTrendIcon color={nu.brand} size={24} />
                </View>
                <Text style={styles.stateTitle}>Nenhuma despesa</Text>
                <Text style={styles.stateText}>
                  {selectedDay
                    ? "Não há saídas registradas no dia selecionado."
                    : "Não há saídas registradas neste período."}
                </Text>
              </View>
            ) : (
              <View>
                {selectedDay
                  ? visibleExpenses.map((expense, index) => (
                    <ExpenseRow
                      amount={Number(expense.amount)}
                      category={expense.category}
                      divided={index > 0}
                      domain={expense.merchantDomain}
                      key={expense.id}
                      logoName={expense.merchantName || expense.description || expense.category}
                      meta={`${expense.category} · ${formatTransactionDate(expense.transactionDate ?? expense.paymentDate)}`}
                      title={expense.description || expense.category}
                    />
                  ))
                  : groupedExpenses.map((group, index) => (
                    <ExpenseRow
                      amount={group.total}
                      category={group.category}
                      divided={index > 0}
                      domain={group.domain}
                      key={group.key}
                      logoName={group.name}
                      meta={`${group.count === 1 ? "1 despesa" : `${group.count} despesas`} · ${group.category}`}
                      title={group.name}
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

function ExpenseRow({
  amount,
  category,
  divided,
  domain,
  logoName,
  meta,
  title,
}: {
  amount: number;
  category: string;
  divided: boolean;
  domain?: string | null;
  logoName: string;
  meta: string;
  title: string;
}) {
  return (
    <View style={[styles.row, divided && styles.rowDivided]}>
      <View style={styles.rowLogo}>
        <MerchantLogo category={category} domain={domain} name={logoName} size={42} />
      </View>
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={styles.rowTitle}>{title}</Text>
        <Text numberOfLines={1} style={styles.rowMeta}>{meta}</Text>
      </View>
      <Text numberOfLines={1} style={styles.rowAmount}>−{formatCurrency(amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: nu.white, flex: 1 },
  content: { paddingBottom: 42 },
  overscrollFill: { backgroundColor: nu.brand, height: 1000, left: 0, position: "absolute", right: 0, top: -1000 },
  headerTitleRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  headerTitle: { color: nu.white, fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  headerIcon: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
  totalLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 10 },
  loadingValue: { alignItems: "flex-start", height: 40, justifyContent: "center" },
  totalValue: { color: nu.white, fontSize: 31, fontWeight: "700", letterSpacing: -0.9, fontVariant: ["tabular-nums"] },
  totalCaption: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  periodPanel: { marginTop: 12 },
  sheet: { backgroundColor: nu.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -NU_SHEET_OVERLAP, paddingTop: 4 },
  section: { paddingHorizontal: 20, paddingVertical: 18 },
  sectionDivided: { borderTopColor: nu.hairline, borderTopWidth: 1 },
  sectionHeader: { alignItems: "flex-start", flexDirection: "row", gap: 12, justifyContent: "space-between", marginBottom: 6 },
  sectionCopy: { flex: 1, minWidth: 0 },
  sectionTitle: nuSection.title,
  sectionSubtitle: nuSection.subtitle,
  pill: { backgroundColor: nu.brandTint, borderRadius: 999, minWidth: 30, paddingHorizontal: 11, paddingVertical: 5 },
  pillText: { color: nu.brand, fontSize: 12, fontWeight: "700", textAlign: "center" },
  row: { alignItems: "center", flexDirection: "row", minHeight: 70, paddingVertical: 12 },
  rowDivided: { borderTopColor: nu.hairline, borderTopWidth: 1 },
  rowLogo: { marginRight: 12 },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: nu.ink, fontSize: 15, fontWeight: "600" },
  rowMeta: { color: nu.inkSoft, fontSize: 12, marginTop: 3 },
  rowAmount: { color: nu.ink, fontSize: 15, fontWeight: "700", marginLeft: 8, fontVariant: ["tabular-nums"] },
  stateCard: { alignItems: "center", backgroundColor: nu.surface, borderRadius: 16, gap: 8, marginTop: 10, padding: 26 },
  stateTitle: { color: nu.ink, fontSize: 16, fontWeight: "600" },
  stateText: { color: nu.inkSoft, fontSize: 13, lineHeight: 19, textAlign: "center" },
  emptyIcon: { alignItems: "center", backgroundColor: nu.brandTint, borderRadius: 22, height: 44, justifyContent: "center", marginBottom: 4, width: 44 },
  retryButton: { backgroundColor: nu.brand, borderRadius: 999, marginTop: 6, paddingHorizontal: 20, paddingVertical: 11 },
  retryText: { color: nu.white, fontSize: 14, fontWeight: "600" },
  pressed: { opacity: 0.75 },
});
