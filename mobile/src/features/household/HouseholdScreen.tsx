import { useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NU_SHEET_OVERLAP, NuHeader } from "@/components/dashboard/NuHeader";
import { nu, nuSection } from "@/components/dashboard/nuTheme";
import { HouseLineArt } from "@/features/household/HouseLineArt";

import { HouseholdHero } from "@/features/household/HouseholdHero";
import { HouseholdExpenseSheet } from "@/features/household/HouseholdExpenseSheet";
import { HouseholdRecentActivity } from "@/features/household/HouseholdRecentActivity";
import { HouseholdMembers } from "@/features/household/HouseholdMembers";
import { HouseholdPayments } from "@/features/household/HouseholdPayments";
import { HouseholdCleaning } from "@/features/household/HouseholdCleaning";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, getHouseholdPage } from "@/services/api";
import type { HouseholdPageResponse } from "@/types/household";

export function HouseholdScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
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

  // Light status-bar icons over the purple header, restored when leaving the tab.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, []),
  );

  const household = page?.household;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[nu.brand]}
            onRefresh={() => void loadPage(true)}
            progressViewOffset={insets.top}
            refreshing={refreshing}
            tintColor={nu.white}
          />
        }
      >
        {/* Brand colour also fills the iOS overscroll area above the header. */}
        <View style={styles.overscrollFill} />

        {household && !loading && !error ? (
          <HouseholdHero
            household={household}
            onMonthChange={setSelectedMonth}
            onAddExpense={() => setExpenseSheetVisible(true)}
            selectedMonth={selectedMonth}
          />
        ) : (
          <NuHeader decoration={<HouseLineArt />}>
            <Text style={styles.headerEyebrow}>Nosso lar</Text>
            <Text style={styles.headerTitle}>Casa</Text>
          </NuHeader>
        )}

        {/* White sheet: rounded top tucked over the purple header. */}
        <View style={styles.sheet}>
          {loading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator color={nu.brand} />
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
                style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
              >
                <Text style={styles.retryLabel}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : household ? (
            <>
              <HouseholdMembers key={`members-${household.id}`} household={household} onUpdated={setPage} />
              <HouseholdCleaning
                key={`cleaning-${household.id}`}
                household={household}
                onUpdated={(updated) => setPage((current) => {
                  if (!updated.household) return updated;
                  if (!current?.household || current.household.id !== updated.household.id) return current;
                  return { ...current, household: { ...current.household, cleaningRotation: updated.household.cleaningRotation } };
                })}
              />
              <HouseholdRecentActivity key={household.id} household={household} />
              <HouseholdPayments key={`payments-${household.id}`} household={household} />
            </>
          ) : (
            <View style={styles.stateCard}>
              <View style={styles.emptyMark}>
                <Text style={styles.emptyMarkText}>⌂</Text>
              </View>
              <Text style={styles.stateTitle}>A vida da casa, em conjunto</Text>
              <Text style={styles.stateText}>
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
        </View>
      </ScrollView>
      {household ? (
        <HouseholdExpenseSheet
          household={household}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: nu.white, flex: 1 },
  content: { flexGrow: 1, paddingBottom: 28 },
  overscrollFill: { backgroundColor: nu.brand, height: 1000, left: 0, position: "absolute", right: 0, top: -1000 },
  headerEyebrow: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  headerTitle: { color: nu.white, fontSize: 20, fontWeight: "700", letterSpacing: -0.3, marginTop: 1 },
  sheet: { backgroundColor: nu.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, flexGrow: 1, marginTop: -NU_SHEET_OVERLAP, paddingTop: 4 },
  stateCard: { alignItems: "center", backgroundColor: nu.surface, borderRadius: 16, gap: 8, marginHorizontal: 20, marginTop: 18, padding: 26 },
  stateIcon: { alignItems: "center", backgroundColor: nu.negativeTint, borderRadius: 20, height: 40, justifyContent: "center", width: 40 },
  stateIconText: { color: nu.negative, fontSize: 19, fontWeight: "800" },
  stateTitle: { ...nuSection.title, textAlign: "center" },
  stateText: { color: nu.inkSoft, fontSize: 13, lineHeight: 19, textAlign: "center" },
  retryButton: { backgroundColor: nu.brand, borderRadius: 999, marginTop: 6, paddingHorizontal: 20, paddingVertical: 11 },
  retryLabel: { color: nu.white, fontSize: 14, fontWeight: "600" },
  pressed: { opacity: 0.75 },
  emptyMark: { alignItems: "center", backgroundColor: nu.brandTint, borderRadius: 26, height: 52, justifyContent: "center", width: 52 },
  emptyMarkText: { color: nu.brand, fontSize: 28, fontWeight: "700", marginTop: -3 },
  invitationHint: { alignSelf: "stretch", backgroundColor: nu.white, borderRadius: 12, marginTop: 10, padding: 14 },
  invitationHintTitle: { color: nu.ink, fontSize: 14, fontWeight: "600" },
  invitationHintText: { color: nu.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 4 },
});

