import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { HouseholdExpenseRow } from "@/features/household/HouseholdExpenseRow";
import { HouseholdProofViewer } from "@/features/household/HouseholdProofViewer";
import { expenseMonthLabel, groupHouseholdExpenses, mergeHouseholdExpenses } from "@/features/household/expenseHistory";
import { ApiError, getHouseholdExpenseHistory } from "@/services/api";
import { colors } from "@/theme/colors";
import type { HouseholdExpense } from "@/types/household";

export function HouseholdExpenseHistorySheet({ householdId, currency, currentMemberId, onClose }: {
  householdId: number;
  currency: string;
  currentMemberId: number;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState<HouseholdExpense[]>([]);
  const [proofExpense, setProofExpense] = useState<HouseholdExpense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const generation = useRef(0);
  const inFlight = useRef(false);
  const sections = useMemo(() => groupHouseholdExpenses(expenses), [expenses]);

  const load = useCallback(async (pageNumber: number) => {
    if (!user || inFlight.current) return;
    const requestGeneration = generation.current;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const result = await getHouseholdExpenseHistory(user.token, householdId, pageNumber);
      if (generation.current !== requestGeneration) return;
      setExpenses((current) => mergeHouseholdExpenses(pageNumber === 0 ? [] : current, result.expenses));
      setNextPage(result.page + 1);
      setHasMore(result.hasMore);
    } catch (loadError) {
      if (generation.current !== requestGeneration) return;
      if (loadError instanceof ApiError && loadError.status === 401) {
        await logout();
        return;
      }
      setError("Não foi possível carregar as despesas. Tente novamente.");
    } finally {
      if (generation.current === requestGeneration) {
        inFlight.current = false;
        setLoading(false);
      }
    }
  }, [householdId, logout, user]);

  useEffect(() => {
    generation.current += 1;
    inFlight.current = false;
    setExpenses([]);
    setNextPage(0);
    setHasMore(true);
    void load(0);
    return () => { generation.current += 1; };
  }, [load]);

  return (
    <Modal animationType="slide" transparent visible statusBarTranslucent onRequestClose={() => proofExpense ? setProofExpense(null) : onClose()}>
      <View style={[styles.overlay, proofExpense !== null && styles.hidden]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar histórico" onPress={onClose} style={styles.backdrop} />
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Todas as despesas</Text>
              <Text style={styles.subtitle}>O histórico da casa, mês a mês.</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar histórico" onPress={onClose} style={styles.close}>
              <SymbolView name={{ ios: "xmark", android: "close", web: "close" }} size={18} tintColor={colors.ink} />
            </Pressable>
          </View>
          <SectionList
            sections={sections}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => <Text style={styles.month}>{expenseMonthLabel(section.month)}</Text>}
            renderItem={({ item }) => <HouseholdExpenseRow expense={item} currency={currency} currentMemberId={currentMemberId} onOpenAttachments={setProofExpense} />}
            ListEmptyComponent={!loading && !error ? <Text style={styles.message}>Nenhuma despesa registrada ainda.</Text> : null}
            ListFooterComponent={
              <View style={styles.footer}>
                {loading ? <ActivityIndicator accessibilityLabel="Carregando despesas" color={colors.income} /> : null}
                {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
                {!loading && (hasMore || error) ? (
                  <Pressable accessibilityRole="button" onPress={() => void load(nextPage)} style={styles.loadMore}>
                    <Text style={styles.loadMoreText}>{error ? "Tentar novamente" : "Carregar mais despesas"}</Text>
                  </Pressable>
                ) : null}
                {!loading && !error && !hasMore && expenses.length > 0 ? (
                  <Text style={styles.message}>Você viu todas as despesas.</Text>
                ) : null}
              </View>
            }
          />
        </SafeAreaView>
      </View>
      {proofExpense ? <HouseholdProofViewer key={proofExpense.id} expense={proofExpense} householdId={householdId} onClose={() => setProofExpense(null)} /> : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  hidden: { display: "none" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(19,36,28,0.48)" },
  sheet: { alignSelf: "center", backgroundColor: "#F6F5EF", height: "90%", maxWidth: 640, width: "100%", borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: "hidden" },
  handle: { alignSelf: "center", backgroundColor: "#C6D1C1", borderRadius: 3, height: 5, width: 36, marginTop: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, padding: 20, borderBottomWidth: 1, borderBottomColor: "#E2E6DB" },
  headerCopy: { flex: 1 },
  title: { color: colors.ink, fontSize: 21, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { color: colors.inkSoft, fontSize: 12, marginTop: 5 },
  close: { alignItems: "center", justifyContent: "center", backgroundColor: "#EAEDE4", borderRadius: 22, width: 44, height: 44 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  month: { color: colors.income, fontSize: 15, fontWeight: "700", marginTop: 22, marginBottom: 12 },
  footer: { alignItems: "center", gap: 12, paddingTop: 18 },
  message: { color: colors.inkSoft, fontSize: 12, textAlign: "center", paddingVertical: 18 },
  error: { color: colors.danger, fontSize: 12, lineHeight: 18, textAlign: "center" },
  loadMore: { alignItems: "center", justifyContent: "center", backgroundColor: "#E5EDDC", borderRadius: 14, minHeight: 46, paddingHorizontal: 20 },
  loadMoreText: { color: colors.income, fontSize: 12, fontWeight: "700" },
});
