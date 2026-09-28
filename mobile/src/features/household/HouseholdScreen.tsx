import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HouseholdHero } from "@/features/household/HouseholdHero";
import { HouseholdExpenseSheet } from "@/features/household/HouseholdExpenseSheet";
import { HouseholdRecentActivity } from "@/features/household/HouseholdRecentActivity";
import { HouseholdMembers } from "@/features/household/HouseholdMembers";
import { HouseholdPayments } from "@/features/household/HouseholdPayments";
import { HouseholdCleaning } from "@/features/household/HouseholdCleaning";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, getHouseholdPage } from "@/services/api";
import { colors } from "@/theme/colors";
import type { HouseholdPageResponse } from "@/types/household";

export function HouseholdScreen() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState<HouseholdPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expenseSheetVisible, setExpenseSheetVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const loadPage = useCallback(async (refresh = false) => {
    if (!user) return;
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      setPage(await getHouseholdPage(user.token));
    } catch (pageError) {
      if (pageError instanceof ApiError && pageError.status === 401) {
        await logout();
        return;
      }
      setError("Não foi possível carregar os dados da casa.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout, user]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => void loadPage(true)}
            refreshing={refreshing}
            tintColor={colors.forest}
          />
        }
      >
        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.forest} />
            <Text style={styles.stateText}>Carregando sua casa…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <View style={styles.stateIcon}>
              <Text style={styles.stateIconText}>!</Text>
            </View>
            <Text style={styles.stateTitle}>A casa não carregou</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadPage()}
              style={({ pressed }) => [styles.retryButton, pressed && styles.retryPressed]}
            >
              <Text style={styles.retryLabel}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : page?.household ? (
          <>
            <HouseholdHero
              household={page.household}
              onMonthChange={setSelectedMonth}
              onAddExpense={() => setExpenseSheetVisible(true)}
              selectedMonth={selectedMonth}
            />
            <HouseholdMembers key={`members-${page.household.id}`} household={page.household} />
            <HouseholdCleaning
              key={`cleaning-${page.household.id}`}
              household={page.household}
              onUpdated={(updated) => setPage((current) => {
                if (!updated.household) return updated;
                if (!current?.household || current.household.id !== updated.household.id) return current;
                return { ...current, household: { ...current.household, cleaningRotation: updated.household.cleaningRotation } };
              })}
            />
            <HouseholdRecentActivity key={page.household.id} household={page.household} />
            <HouseholdPayments key={`payments-${page.household.id}`} household={page.household} />
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyMark}>
              <Text style={styles.emptyMarkText}>⌂</Text>
            </View>
            <Text style={styles.emptyEyebrow}>CASA COMPARTILHADA</Text>
            <Text style={styles.emptyTitle}>A vida da casa, em conjunto.</Text>
            <Text style={styles.emptyText}>
              Quando você criar ou aceitar um convite para uma casa, os gastos e saldos compartilhados vão aparecer aqui.
            </Text>
            {page && page.pendingInvitations.length > 0 ? (
              <View style={styles.invitationHint}>
                <Text style={styles.invitationHintTitle}>
                  {page.pendingInvitations.length === 1 ? "Você tem um convite" : `Você tem ${page.pendingInvitations.length} convites`}
                </Text>
                <Text style={styles.invitationHintText}>
                  Abra a versão web para aceitar ou recusar um convite por enquanto.
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
      {page?.household ? (
        <HouseholdExpenseSheet
          household={page.household}
          onClose={() => setExpenseSheetVisible(false)}
          onSaved={(nextPage) => {
            setPage(nextPage);
            const now = new Date();
            setSelectedMonth(new Date(now.getFullYear(), now.getMonth(), 1));
          }}
          onComplete={() => Alert.alert("Despesa adicionada", "A divisão já entrou nas contas da casa.")}
          visible={expenseSheetVisible}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.paper, flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 },
  stateCard: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 4,
    minHeight: 220,
    padding: 24,
  },
  stateIcon: {
    alignItems: "center",
    backgroundColor: colors.expenseTint,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    marginBottom: 10,
    width: 40,
  },
  stateIconText: { color: colors.expense, fontSize: 19, fontWeight: "800" },
  stateTitle: { color: colors.ink, fontSize: 17, fontWeight: "700" },
  stateText: { color: colors.inkSoft, fontSize: 13, lineHeight: 19, marginTop: 7, textAlign: "center" },
  retryButton: { backgroundColor: colors.forest, borderRadius: 13, marginTop: 17, paddingHorizontal: 18, paddingVertical: 12 },
  retryPressed: { backgroundColor: colors.forestPressed, transform: [{ scale: 0.98 }] },
  retryLabel: { color: colors.white, fontSize: 13, fontWeight: "700" },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 4,
    paddingHorizontal: 25,
    paddingVertical: 32,
  },
  emptyMark: { alignItems: "center", backgroundColor: colors.header, borderRadius: 24, height: 58, justifyContent: "center", width: 58 },
  emptyMarkText: { color: colors.forest, fontSize: 32, fontWeight: "700", marginTop: -3 },
  emptyEyebrow: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 1.55, marginTop: 19 },
  emptyTitle: { color: colors.ink, fontSize: 24, fontWeight: "700", letterSpacing: -0.6, marginTop: 8, textAlign: "center" },
  emptyText: { color: colors.inkSoft, fontSize: 14, lineHeight: 21, marginTop: 9, maxWidth: 300, textAlign: "center" },
  invitationHint: { alignSelf: "stretch", backgroundColor: colors.header, borderRadius: 16, marginTop: 22, padding: 15 },
  invitationHintTitle: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  invitationHintText: { color: colors.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 4 },
});
