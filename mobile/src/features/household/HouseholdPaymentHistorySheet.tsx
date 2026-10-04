import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { HouseholdPaymentRow } from "@/features/household/HouseholdPaymentRow";
import { expenseMonthLabel } from "@/features/household/expenseHistory";
import { groupHouseholdPayments, mergeHouseholdPayments } from "@/features/household/paymentHistory";
import { ApiError, getHouseholdPaymentHistory } from "@/services/api";
import { nu } from "@/components/dashboard/nuTheme";
import type { HouseholdPayment } from "@/types/household";

export function HouseholdPaymentHistorySheet({ householdId, currency, onClose }: {
  householdId: number;
  currency: string;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const [payments, setPayments] = useState<HouseholdPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const generation = useRef(0);
  const inFlight = useRef(false);
  const sections = useMemo(() => groupHouseholdPayments(payments), [payments]);

  const load = useCallback(async (pageNumber: number) => {
    if (!user || inFlight.current) return;
    const requestGeneration = generation.current;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const result = await getHouseholdPaymentHistory(user.token, householdId, pageNumber);
      if (generation.current !== requestGeneration) return;
      setPayments((current) => mergeHouseholdPayments(pageNumber === 0 ? [] : current, result.payments));
      setNextPage(result.page + 1);
      setHasMore(result.hasMore);
    } catch (loadError) {
      if (generation.current !== requestGeneration) return;
      if (loadError instanceof ApiError && loadError.status === 401) {
        await logout();
        return;
      }
      setError("Não foi possível carregar os pagamentos. Tente novamente.");
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
    setPayments([]);
    setNextPage(0);
    setHasMore(true);
    void load(0);
    return () => { generation.current += 1; };
  }, [load]);

  return (
    <Modal animationType="slide" transparent visible statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar histórico" onPress={onClose} style={styles.backdrop} />
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Todos os pagamentos</Text>
              <Text style={styles.subtitle}>O histórico da casa, mês a mês.</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar histórico" onPress={onClose} style={styles.close}>
              <SymbolView name={{ ios: "xmark", android: "close", web: "close" }} size={18} tintColor={nu.ink} />
            </Pressable>
          </View>
          <SectionList
            sections={sections}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => <Text style={styles.month}>{expenseMonthLabel(section.month)}</Text>}
            renderItem={({ item }) => <HouseholdPaymentRow payment={item} currency={currency} />}
            ListEmptyComponent={!loading && !error ? <Text style={styles.message}>Nenhum pagamento registrado ainda.</Text> : null}
            ListFooterComponent={
              <View style={styles.footer}>
                {loading ? <ActivityIndicator accessibilityLabel="Carregando pagamentos" color={nu.brand} /> : null}
                {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
                {!loading && (hasMore || error) ? (
                  <Pressable accessibilityRole="button" onPress={() => void load(nextPage)} style={styles.loadMore}>
                    <Text style={styles.loadMoreText}>{error ? "Tentar novamente" : "Carregar mais pagamentos"}</Text>
                  </Pressable>
                ) : null}
                {!loading && !error && !hasMore && payments.length > 0 ? (
                  <Text style={styles.message}>Você viu todos os pagamentos.</Text>
                ) : null}
              </View>
            }
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(19,36,28,0.48)" },
  sheet: { alignSelf: "center", backgroundColor: nu.surface, height: "90%", maxWidth: 640, width: "100%", borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: "hidden" },
  handle: { alignSelf: "center", backgroundColor: nu.track, borderRadius: 3, height: 5, width: 36, marginTop: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, padding: 20, borderBottomWidth: 1, borderBottomColor: nu.hairline },
  headerCopy: { flex: 1 },
  title: { color: nu.ink, fontSize: 21, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { color: nu.inkSoft, fontSize: 12, marginTop: 5 },
  close: { alignItems: "center", justifyContent: "center", backgroundColor: nu.hairline, borderRadius: 22, width: 44, height: 44 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  month: { color: nu.brand, fontSize: 15, fontWeight: "700", marginTop: 22, marginBottom: 12 },
  footer: { alignItems: "center", gap: 12, paddingTop: 18 },
  message: { color: nu.inkSoft, fontSize: 12, textAlign: "center", paddingVertical: 18 },
  error: { color: nu.negative, fontSize: 12, lineHeight: 18, textAlign: "center" },
  loadMore: { alignItems: "center", justifyContent: "center", backgroundColor: nu.brandTint, borderRadius: 14, minHeight: 46, paddingHorizontal: 20 },
  loadMoreText: { color: nu.brand, fontSize: 12, fontWeight: "700" },
});
