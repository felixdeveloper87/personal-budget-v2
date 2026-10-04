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
import { nu, nuSection } from "@/components/dashboard/nuTheme";
import { MerchantLogo } from "@/components/merchant/MerchantLogo";
import { PeriodNavigator } from "@/components/period/PeriodNavigator";
import { useAuth } from "@/contexts/AuthContext";
import { CategoryDonutChart } from "@/components/category/CategoryDonutChart";
import { NU_SHEET_OVERLAP, NuHeader } from "@/components/dashboard/NuHeader";
import { usePeriodNavigation } from "@/hooks/usePeriodNavigation";
import { ApiError, searchTransactions } from "@/services/api";
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

interface IncomeDescriptionGroup {
  category: string;
  count: number;
  domain?: string | null;
  key: string;
  name: string;
  total: number;
}

function groupIncomesByDescription(incomes: Transaction[]): IncomeDescriptionGroup[] {
  const grouped = new Map<string, IncomeDescriptionGroup>();

  for (const income of incomes) {
    const name = income.merchantName?.trim()
      || income.description.trim().replace(/\s+/g, " ")
      || income.category;
    const key = name.toLocaleLowerCase();
    const current = grouped.get(key);

    if (current) {
      current.count += 1;
      current.total += Number(income.amount || 0);
    } else {
      grouped.set(key, {
        category: income.category,
        count: 1,
        domain: income.merchantDomain,
        key,
        name,
        total: Number(income.amount || 0),
      });
    }
  }

  return [...grouped.values()].sort(
    (first, second) => second.total - first.total || first.name.localeCompare(second.name),
  );
}

export function IncomesScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
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
  const groupedIncomes = useMemo(() => groupIncomesByDescription(incomes), [incomes]);
  const selectedDayTotal = useMemo(
    () => visibleIncomes.reduce((total, income) => total + Number(income.amount || 0), 0),
    [visibleIncomes],
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
            onRefresh={() => void loadIncomes(true)}
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
            <Text style={styles.headerTitle}>Receitas</Text>
            <View style={styles.headerIcon}>
              <IncomeTrendIcon color={nu.white} size={17} />
            </View>
          </View>

          <Text style={styles.totalLabel}>Total no período</Text>
          {loading ? (
            <View style={styles.loadingValue}>
              <ActivityIndicator color={nu.white} />
            </View>
          ) : (
            <Text adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1} style={styles.totalValue}>
              {error ? "—" : formatCurrency(totalIncome)}
            </Text>
          )}
          <Text style={styles.totalCaption}>
            {loading ? "Carregando suas entradas…" : error ? "Total indisponível no momento" : incomes.length === 1 ? "1 receita no período" : `${incomes.length} receitas no período`}
          </Text>

          <View style={styles.periodPanel}>
            <PeriodNavigator
              isCurrent={period.isCurrent}
              label={period.label}
              onChange={period.setSelectedPeriod}
              onGoToToday={period.goToToday}
              onNavigate={period.navigate}
              layout="inline"
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
                tone="income"
              />
            </View>
          ) : null}

          {!loading && !error && incomes.length > 0 ? (
            <View style={[styles.section, styles.sectionDivided]}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionCopy}>
                  <Text style={styles.sectionTitle}>Por categoria</Text>
                  <Text style={styles.sectionSubtitle}>Distribuição das receitas no período</Text>
                </View>
              </View>
              <View style={styles.donutSpacer} />
              <CategoryDonutChart entries={incomes} totalLabel="Total recebido" />
            </View>
          ) : null}

          <View style={[styles.section, styles.sectionDivided]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionCopy}>
                <Text style={styles.sectionTitle}>
                  {selectedDay ? formatSelectedDate(selectedDay) : "Fontes de receita"}
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
                    <Text style={styles.pillText}>{groupedIncomes.length}</Text>
                  </View>
                )
              ) : null}
            </View>

            {loading ? (
              <View style={styles.stateCard}>
                <ActivityIndicator color={nu.brand} />
                <Text style={styles.stateText}>Carregando receitas…</Text>
              </View>
            ) : error ? (
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>Receitas indisponíveis</Text>
                <Text style={styles.stateText}>{error}</Text>
                <Pressable onPress={() => void loadIncomes()} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              </View>
            ) : visibleIncomes.length === 0 ? (
              <View style={styles.stateCard}>
                <View style={styles.emptyIcon}>
                  <IncomeTrendIcon color={nu.brand} size={24} />
                </View>
                <Text style={styles.stateTitle}>Nenhuma receita</Text>
                <Text style={styles.stateText}>
                  {selectedDay
                    ? "Não há entradas registradas no dia selecionado."
                    : "Não há entradas registradas neste período."}
                </Text>
              </View>
            ) : (
              <View>
                {selectedDay
                  ? visibleIncomes.map((income, index) => (
                    <IncomeRow
                      amount={Number(income.amount)}
                      category={income.category}
                      divided={index > 0}
                      domain={income.merchantDomain}
                      key={income.id}
                      logoName={income.merchantName || income.description || income.category}
                      meta={`${income.category} · ${formatTransactionDate(income.paymentDate ?? income.transactionDate)}`}
                      title={income.description || income.category}
                    />
                  ))
                  : groupedIncomes.map((group, index) => (
                    <IncomeRow
                      amount={group.total}
                      category={group.category}
                      divided={index > 0}
                      domain={group.domain}
                      key={group.key}
                      logoName={group.name}
                      meta={`${group.count === 1 ? "1 receita" : `${group.count} receitas`} · ${group.category}`}
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

function IncomeRow({
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
      <Text numberOfLines={1} style={styles.rowAmount}>+{formatCurrency(amount)}</Text>
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
  donutSpacer: { height: 8 },
  pill: { backgroundColor: nu.brandTint, borderRadius: 999, minWidth: 30, paddingHorizontal: 11, paddingVertical: 5 },
  pillText: { color: nu.brand, fontSize: 12, fontWeight: "700", textAlign: "center" },
  row: { alignItems: "center", flexDirection: "row", minHeight: 70, paddingVertical: 12 },
  rowDivided: { borderTopColor: nu.hairline, borderTopWidth: 1 },
  rowLogo: { marginRight: 12 },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: nu.ink, fontSize: 15, fontWeight: "600" },
  rowMeta: { color: nu.inkSoft, fontSize: 12, marginTop: 3 },
  rowAmount: { color: nu.positive, fontSize: 15, fontWeight: "700", marginLeft: 8, fontVariant: ["tabular-nums"] },
  stateCard: { alignItems: "center", backgroundColor: nu.surface, borderRadius: 16, gap: 8, marginTop: 10, padding: 26 },
  stateTitle: { color: nu.ink, fontSize: 16, fontWeight: "600" },
  stateText: { color: nu.inkSoft, fontSize: 13, lineHeight: 19, textAlign: "center" },
  emptyIcon: { alignItems: "center", backgroundColor: nu.brandTint, borderRadius: 22, height: 44, justifyContent: "center", marginBottom: 4, width: 44 },
  retryButton: { backgroundColor: nu.brand, borderRadius: 999, marginTop: 6, paddingHorizontal: 20, paddingVertical: 11 },
  retryText: { color: nu.white, fontSize: 14, fontWeight: "600" },
  pressed: { opacity: 0.75 },
});
