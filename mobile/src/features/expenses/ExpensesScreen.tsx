import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

import {
  DailyActivityChart,
  type DailyActivityEntry,
} from "@/components/activity/DailyActivityChart";
import { MerchantLogo } from "@/components/merchant/MerchantLogo";
import { PeriodNavigator } from "@/components/period/PeriodNavigator";
import { useAuth } from "@/contexts/AuthContext";
import { ExpenseHeroArtwork } from "@/features/expenses/ExpenseHeroArtwork";
import { usePeriodNavigation } from "@/hooks/usePeriodNavigation";
import { ApiError, searchTransactions } from "@/services/api";
import { colors } from "@/theme/colors";
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
  key: string;
  name: string;
  total: number;
}

function groupExpensesByDescription(expenses: Transaction[]): ExpenseDescriptionGroup[] {
  const grouped = new Map<string, ExpenseDescriptionGroup>();

  for (const expense of expenses) {
    const name = expense.description.trim().replace(/\s+/g, " ") || expense.category;
    const key = name.toLocaleLowerCase();
    const current = grouped.get(key);

    if (current) {
      current.count += 1;
      current.total += Number(expense.amount || 0);
    } else {
      grouped.set(key, {
        category: expense.category,
        count: 1,
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

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => void loadExpenses(true)}
            refreshing={refreshing}
            tintColor={colors.expense}
          />
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroImage}>
            <View pointerEvents="none" style={styles.heroArtwork}>
              <ExpenseHeroArtwork />
            </View>
            <View pointerEvents="none" style={styles.heroVeil} />
            <View style={styles.heroContent}>
              <View style={styles.heroHeading}>
                <View style={styles.heroCopy}>
                  <Text style={styles.eyebrow}>SUAS SAÍDAS</Text>
                  <Text style={styles.heroLabel}>Despesas</Text>
                </View>
                <View style={styles.heroIcon}>
                  <ExpenseTrendIcon color={colors.expense} size={23} />
                </View>
              </View>

              <View style={styles.totalBlock}>
                <Text style={styles.totalLabel}>Total no período</Text>
                {loading ? (
                  <View style={styles.loadingValue}>
                    <ActivityIndicator color={colors.expense} />
                  </View>
                ) : (
                  <Text adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1} style={styles.totalValue}>
                    {error ? "—" : formatCurrency(totalExpense)}
                  </Text>
                )}
                <Text style={styles.totalCaption}>
                  {loading
                    ? "Carregando suas saídas…"
                    : error
                      ? "Total indisponível no momento"
                      : expenses.length === 1
                        ? "1 despesa no período"
                        : `${expenses.length} despesas no período`}
                </Text>
              </View>

              <View style={styles.periodPanel}>
                <PeriodNavigator
                  isCurrent={period.isCurrent}
                  label={period.label}
                  onChange={period.setSelectedPeriod}
                  onGoToToday={period.goToToday}
                  onNavigate={period.navigate}
                  value={period.selectedPeriod}
                />
              </View>
            </View>
          </View>
        </View>

        {!loading && !error ? (
          <DailyActivityChart
            endDate={period.range.end}
            entries={chartEntries}
            onSelectDay={(day) => setSelectedDay((current) => current === day ? null : day)}
            period={period.selectedPeriod}
            selectedDay={selectedDay}
            startDate={period.range.start}
            title={`Intensidade diária · ${period.label}`}
            tone="expense"
          />
        ) : null}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>{selectedDay ? "DIA SELECIONADO" : "CATEGORIAS DE GASTO"}</Text>
            <Text style={styles.sectionTitle}>
              {selectedDay ? formatSelectedDate(selectedDay) : "Despesas por descrição"}
            </Text>
            {selectedDay ? (
              <Text style={styles.selectedDayTotal}>
                Total do dia · {formatCurrency(selectedDayTotal)}
              </Text>
            ) : null}
          </View>
          {!loading && !error ? (
            selectedDay ? (
              <Pressable onPress={() => setSelectedDay(null)} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Ver todas</Text>
              </Pressable>
            ) : (
              <Text style={styles.countBadge}>{groupedExpenses.length}</Text>
            )
          ) : null}
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.expense} />
            <Text style={styles.stateText}>Carregando despesas…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.errorTitle}>Despesas indisponíveis</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable onPress={() => void loadExpenses()} style={styles.retryButton}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : visibleExpenses.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <ExpenseTrendIcon color={colors.expense} size={25} />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma despesa</Text>
            <Text style={styles.emptyText}>
              {selectedDay
                ? "Não há saídas registradas no dia selecionado."
                : "Não há saídas registradas neste período."}
            </Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {selectedDay
              ? visibleExpenses.map((expense, index) => (
                <View
                  key={expense.id}
                  style={[styles.expenseRow, index > 0 && styles.expenseRowBorder]}
                >
                  <View style={styles.rowLogo}>
                    <MerchantLogo
                      category={expense.category}
                      lookupByName={Boolean(expense.description.trim())}
                      name={expense.description || expense.category}
                      size={42}
                    />
                  </View>
                  <View style={styles.rowCopy}>
                    <Text numberOfLines={1} style={styles.rowTitle}>
                      {expense.description || expense.category}
                    </Text>
                    <Text numberOfLines={1} style={styles.rowMeta}>
                      {expense.category} · {formatTransactionDate(expense.transactionDate ?? expense.paymentDate)}
                    </Text>

                  </View>
                  <Text numberOfLines={1} style={styles.rowAmount}>
                    -{formatCurrency(Number(expense.amount))}
                  </Text>
                </View>
              ))
              : groupedExpenses.map((group, index) => (
                <View
                  key={group.key}
                  style={[styles.expenseRow, index > 0 && styles.expenseRowBorder]}
                >
                  <View style={styles.rowLogo}>
                    <MerchantLogo
                      category={group.category}
                      lookupByName={group.name !== group.category}
                      name={group.name}
                      size={42}
                    />
                  </View>
                  <View style={styles.rowCopy}>
                    <Text numberOfLines={1} style={styles.rowTitle}>{group.name}</Text>
                    <Text numberOfLines={1} style={styles.rowMeta}>
                      {group.count === 1 ? "1 despesa" : `${group.count} despesas`} · {group.category}
                    </Text>
                  </View>
                  <Text numberOfLines={1} style={styles.rowAmount}>
                    -{formatCurrency(group.total)}
                  </Text>
                </View>
              ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.paper, flex: 1 },
  content: { padding: 18, paddingBottom: 42 },
  hero: {
    backgroundColor: "#EDE9DF",
    borderRadius: 28,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
  },
  heroImage: { borderRadius: 28, overflow: "hidden" },
  heroArtwork: { ...StyleSheet.absoluteFill },
  heroVeil: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(251,249,244,0.42)" },
  heroContent: { padding: 16 },
  heroHeading: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroCopy: { flex: 1 },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(251,249,244,0.75)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: { color: colors.expense, fontSize: 9, fontWeight: "800", letterSpacing: 1.7 },
  heroLabel: { color: colors.ink, fontSize: 27, fontWeight: "700", letterSpacing: -0.7, marginTop: 4 },
  totalBlock: { marginTop: 18 },
  totalLabel: { color: colors.inkSoft, fontSize: 12, fontWeight: "500" },
  loadingValue: { alignItems: "flex-start", height: 53, justifyContent: "center" },
  totalValue: {
    color: "#7A2020",
    fontSize: 43,
    fontWeight: "800",
    letterSpacing: -1.5,
    marginTop: 4,
  },
  totalCaption: { color: colors.inkSoft, fontSize: 11, marginTop: 3 },
  periodPanel: {
    backgroundColor: "rgba(251,249,244,0.9)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    padding: 11,
    marginTop: 18,
  },
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 28,
    paddingHorizontal: 3,
  },
  sectionEyebrow: { color: colors.expense, fontSize: 9, fontWeight: "800", letterSpacing: 1.6 },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: "700", marginTop: 5 },
  selectedDayTotal: { color: colors.expense, fontSize: 14, fontWeight: "800", marginTop: 7 },
  countBadge: {
    backgroundColor: colors.expenseTint,
    borderRadius: 12,
    color: colors.expense,
    fontSize: 12,
    fontWeight: "800",
    minWidth: 28,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
    textAlign: "center",
  },
  clearButton: {
    backgroundColor: colors.expenseTint,
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  clearButtonText: { color: colors.expense, fontSize: 11, fontWeight: "800" },
  listCard: {
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  expenseRow: { alignItems: "center", flexDirection: "row", minHeight: 76, paddingVertical: 12 },
  expenseRowBorder: { borderColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth },
  rowLogo: { marginRight: 12 },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  rowMeta: { color: colors.inkFaint, fontSize: 11, marginTop: 5 },
  rowAmount: { color: colors.expense, fontSize: 14, fontWeight: "800", marginLeft: 8 },
  stateCard: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    gap: 11,
    padding: 28,
  },
  stateText: { color: colors.inkSoft, fontSize: 14, lineHeight: 20, textAlign: "center" },
  errorTitle: { color: colors.ink, fontSize: 17, fontWeight: "700" },
  retryButton: { paddingHorizontal: 16, paddingVertical: 9 },
  retryText: { color: colors.expense, fontSize: 14, fontWeight: "800" },
  emptyCard: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    padding: 30,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: colors.expenseTint,
    borderRadius: 22,
    height: 46,
    justifyContent: "center",
    marginBottom: 13,
    width: 46,
  },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: "700" },
  emptyText: { color: colors.inkSoft, fontSize: 13, marginTop: 6, textAlign: "center" },
});
