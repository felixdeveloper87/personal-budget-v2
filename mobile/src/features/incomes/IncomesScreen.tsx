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
import { usePeriodNavigation } from "@/hooks/usePeriodNavigation";
import { ApiError, searchTransactions } from "@/services/api";
import { colors } from "@/theme/colors";
import type { Transaction } from "@/types/finance";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const incomeTrendIcon = {
  ios: "chart.line.uptrend.xyaxis",
  android: "trending_up",
  web: "trending_up",
} satisfies SymbolName;

function IncomeTrendIcon({ color, size }: { color: string; size: number }) {
  return (
    <SymbolView
      name={incomeTrendIcon}
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

function transactionDate(income: Transaction) {
  return (income.paymentDate ?? income.transactionDate ?? income.dateTime).slice(0, 10);
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

export function IncomesScreen() {
  const { user, logout } = useAuth();
  const period = usePeriodNavigation("month");
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const requestSequence = useRef(0);

  const loadIncomes = useCallback(
    async (refresh = false) => {
      if (!user) return;
      const sequence = ++requestSequence.current;
      refresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      try {
        const result = await searchTransactions(user.token, {
          type: "income",
          startDate: period.range.startDate,
          endDate: period.range.endDate,
        });

        if (sequence === requestSequence.current) {
          setIncomes(
            [...result].sort((a, b) =>
              (b.paymentDate ?? b.dateTime).localeCompare(a.paymentDate ?? a.dateTime),
            ),
          );
        }
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          await logout();
          return;
        }
        if (sequence === requestSequence.current) {
          setError("Não foi possível carregar suas receitas.");
        }
      } finally {
        if (sequence === requestSequence.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }, [logout, period.range.endDate, period.range.startDate, user]);

  useEffect(() => {
    void loadIncomes();
  }, [loadIncomes]);

  useEffect(() => {
    setSelectedDay(null);
  }, [period.range.endDate, period.range.startDate]);

  const totalIncome = useMemo(
    () => incomes.reduce((total, income) => total + Number(income.amount || 0), 0),
    [incomes],
  );
  const chartEntries = useMemo<DailyActivityEntry[]>(
    () => incomes.map((income) => ({ amount: Number(income.amount), date: transactionDate(income) })),
    [incomes],
  );
  const visibleIncomes = useMemo(
    () => selectedDay ? incomes.filter((income) => transactionDate(income) === selectedDay) : incomes,
    [incomes, selectedDay],
  );
  const selectedDayTotal = useMemo(
    () => visibleIncomes.reduce((total, income) => total + Number(income.amount || 0), 0),
    [visibleIncomes],
  );

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => void loadIncomes(true)}
            refreshing={refreshing}
            tintColor={colors.forest}
          />
        }
      >
        <View style={styles.hero}>
          <View>
            <Text style={styles.eyebrow}>INCOMES</Text>
            <Text style={styles.heroLabel}>Total income</Text>
          </View>

          {loading ? (
            <View style={styles.loadingValue}>
              <ActivityIndicator color={colors.white} />
            </View>
          ) : (
            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.totalValue}>
              {formatCurrency(totalIncome)}
            </Text>
          )}

          <Text style={styles.totalCaption}>
            {incomes.length === 1 ? "1 receita no período" : `${incomes.length} receitas no período`}
          </Text>

          <View style={styles.heroDivider} />
          <PeriodNavigator
            isCurrent={period.isCurrent}
            label={period.label}
            onChange={period.setSelectedPeriod}
            onGoToToday={period.goToToday}
            onNavigate={period.navigate}
            value={period.selectedPeriod}
            variant="inverse"
          />
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
            tone="income"
          />
        ) : null}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>{selectedDay ? "DIA SELECIONADO" : "TRANSAÇÕES"}</Text>
            <Text style={styles.sectionTitle}>
              {selectedDay ? formatSelectedDate(selectedDay) : "Receitas do período"}
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
              <Text style={styles.countBadge}>{visibleIncomes.length}</Text>
            )
          ) : null}
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.forest} />
            <Text style={styles.stateText}>Carregando receitas…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.errorTitle}>Receitas indisponíveis</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable onPress={() => void loadIncomes()} style={styles.retryButton}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : visibleIncomes.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <IncomeTrendIcon color={colors.income} size={25} />
            </View>
            <Text style={styles.emptyTitle}>Nenhuma receita</Text>
            <Text style={styles.emptyText}>
              {selectedDay
                ? "Não há entradas registradas no dia selecionado."
                : "Não há entradas registradas neste período."}
            </Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {visibleIncomes.map((income, index) => (
              <View
                key={income.id}
                style={[styles.incomeRow, index > 0 && styles.incomeRowBorder]}
              >
                <View style={styles.rowLogo}>
                  <MerchantLogo name={income.description || income.category} size={42} />
                </View>
                <View style={styles.rowCopy}>
                  <Text numberOfLines={1} style={styles.rowTitle}>
                    {income.description || income.category}
                  </Text>
                  <Text numberOfLines={1} style={styles.rowMeta}>
                    {income.category} · {formatTransactionDate(income.paymentDate ?? income.transactionDate)}
                  </Text>
                </View>
                <Text numberOfLines={1} style={styles.rowAmount}>
                  +{formatCurrency(Number(income.amount))}
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
    backgroundColor: colors.forest,
    borderRadius: 24,
    padding: 16,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  eyebrow: { color: "#BFD3D3", fontSize: 10, fontWeight: "800", letterSpacing: 1.8 },
  heroLabel: { color: colors.white, fontSize: 16, fontWeight: "600", marginTop: 3 },
  loadingValue: { alignItems: "flex-start", height: 50, justifyContent: "center" },
  totalValue: {
    color: colors.white,
    fontSize: 39,
    fontWeight: "700",
    letterSpacing: -1.5,
    marginTop: 10,
  },
  totalCaption: { color: "#CFE0E0", fontSize: 11, marginTop: 3 },
  heroDivider: { backgroundColor: "rgba(255,255,255,0.16)", height: 1, marginVertical: 12 },
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 28,
    paddingHorizontal: 3,
  },
  sectionEyebrow: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 1.6 },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: "700", marginTop: 5 },
  selectedDayTotal: { color: colors.income, fontSize: 14, fontWeight: "800", marginTop: 7 },
  countBadge: {
    backgroundColor: colors.incomeTint,
    borderRadius: 12,
    color: colors.income,
    fontSize: 12,
    fontWeight: "800",
    minWidth: 28,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
    textAlign: "center",
  },
  clearButton: {
    backgroundColor: colors.incomeTint,
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  clearButtonText: { color: colors.income, fontSize: 11, fontWeight: "800" },
  listCard: {
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  incomeRow: { alignItems: "center", flexDirection: "row", minHeight: 76, paddingVertical: 12 },
  incomeRowBorder: { borderColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth },
  rowLogo: { marginRight: 12 },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  rowMeta: { color: colors.inkFaint, fontSize: 11, marginTop: 5 },
  rowAmount: { color: colors.income, fontSize: 14, fontWeight: "800", marginLeft: 8 },
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
  retryText: { color: colors.forest, fontSize: 14, fontWeight: "800" },
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
    backgroundColor: colors.incomeTint,
    borderRadius: 22,
    height: 46,
    justifyContent: "center",
    marginBottom: 13,
    width: 46,
  },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: "700" },
  emptyText: { color: colors.inkSoft, fontSize: 13, marginTop: 6, textAlign: "center" },
});
