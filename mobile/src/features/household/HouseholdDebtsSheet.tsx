import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { ApiError, createHouseholdSettlement } from "@/services/api";
import { nu } from "@/components/dashboard/nuTheme";
import type { HouseholdDebt, HouseholdHeroData, HouseholdPageResponse } from "@/types/household";

function localDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function HouseholdDebtsSheet({ household, onUpdated, onClose }: {
  household: HouseholdHeroData;
  onUpdated: (page: HouseholdPageResponse) => void;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [holdKey, setHoldKey] = useState<string | null>(null);
  const longPressCompletedRef = useRef(false);
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: household.currency });

  async function submitPayment(debt: HouseholdDebt) {
    if (!user || busyKey) return;
    const key = `${debt.fromMemberId}-${debt.toMemberId}`;
    setBusyKey(key);
    try {
      const created = await createHouseholdSettlement(user.token, household.id, {
        toMemberId: debt.toMemberId,
        amount: debt.amount,
        settlementDate: localDate(),
      });
      onUpdated(created.page);
      Alert.alert("Pagamento registrado", `O pagamento de ${currency.format(debt.amount)} para ${debt.toMemberName} foi marcado como pago.`);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        await logout();
        return;
      }
      Alert.alert(
        "Não foi possível registrar",
        requestError instanceof ApiError && [403, 404, 409].includes(requestError.status)
          ? "A dívida mudou ou não está mais disponível. Atualize os dados da casa e tente novamente."
          : "Confira sua conexão e tente novamente.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <Modal animationType="slide" transparent visible statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar dívidas da casa" onPress={onClose} style={styles.backdrop} />
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Quem deve a quem</Text>
              <Text style={styles.subtitle}>Valores pendentes entre integrantes.</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar dívidas da casa" onPress={onClose} style={styles.close}>
              <SymbolView name={{ ios: "xmark", android: "close", web: "close" }} size={18} tintColor={nu.ink} />
            </Pressable>
          </View>
          <FlatList
            data={household.debts}
            keyExtractor={(item) => `${item.fromMemberId}-${item.toMemberId}`}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View
                style={styles.debtCard}
              >
                <View style={styles.parties}>
                  <View style={styles.person}>
                    <Text style={styles.partyLabel}>Quem paga</Text>
                    <Text style={styles.personName}>{item.fromMemberName}</Text>
                    {item.fromMemberId === household.currentMemberId ? <Text style={styles.you}>Você</Text> : null}
                  </View>
                  <View style={styles.arrow}>
                    <SymbolView name={{ ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" }} size={18} tintColor={nu.brand} />
                  </View>
                  <View style={styles.person}>
                    <Text style={styles.partyLabel}>Quem recebe</Text>
                    <Text style={styles.personName}>{item.toMemberName}</Text>
                    {item.toMemberId === household.currentMemberId ? <Text style={styles.you}>Você</Text> : null}
                  </View>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Valor a acertar</Text>
                  <Text style={styles.amount}>{currency.format(item.amount)}</Text>
                </View>
                {item.fromMemberId === household.currentMemberId ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Marcar pagamento de ${currency.format(item.amount)} para ${item.toMemberName} como pago`}
                    accessibilityHint="Pressione e segure por 3 segundos"
                    delayLongPress={3000}
                    disabled={busyKey !== null}
                    onLongPress={() => {
                      longPressCompletedRef.current = true;
                      setHoldKey(null);
                      void submitPayment(item);
                    }}
                    onPress={() => {
                      if (longPressCompletedRef.current) {
                        longPressCompletedRef.current = false;
                        return;
                      }
                      Alert.alert("Segure por 3 segundos", "Mantenha o botão pressionado até o pagamento começar a ser registrado.");
                    }}
                    onPressIn={() => {
                      longPressCompletedRef.current = false;
                      setHoldKey(`${item.fromMemberId}-${item.toMemberId}`);
                    }}
                    onPressOut={() => setHoldKey((current) => current === `${item.fromMemberId}-${item.toMemberId}` ? null : current)}
                    style={({ pressed }) => [styles.paymentButton, (pressed || holdKey === `${item.fromMemberId}-${item.toMemberId}`) && styles.paymentButtonPressed, busyKey !== null && styles.paymentButtonDisabled]}
                  >
                    <Text style={styles.paymentButtonText}>
                      {busyKey === `${item.fromMemberId}-${item.toMemberId}`
                        ? "Registrando…"
                        : holdKey === `${item.fromMemberId}-${item.toMemberId}`
                          ? "Continue segurando…"
                          : "Segure 3s para marcar como pago"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <SymbolView name={{ ios: "checkmark", android: "check", web: "check" }} size={25} tintColor={nu.brand} weight="bold" />
                </View>
                <Text style={styles.emptyTitle}>Tudo acertado!</Text>
                <Text style={styles.emptyText}>Não há dívidas pendentes entre os integrantes da casa.</Text>
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
  sheet: { alignSelf: "center", backgroundColor: nu.surface, height: "85%", maxWidth: 640, width: "100%", borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: "hidden" },
  handle: { alignSelf: "center", backgroundColor: nu.track, borderRadius: 3, height: 5, width: 36, marginTop: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, padding: 20, borderBottomWidth: 1, borderBottomColor: nu.hairline },
  headerCopy: { flex: 1 },
  title: { color: nu.ink, fontSize: 21, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { color: nu.inkSoft, fontSize: 12, lineHeight: 17, marginTop: 5 },
  close: { alignItems: "center", justifyContent: "center", backgroundColor: nu.hairline, borderRadius: 22, width: 44, height: 44 },
  list: { padding: 16, paddingBottom: 24 },
  debtCard: { backgroundColor: nu.surface, borderColor: nu.hairline, borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 10 },
  parties: { flexDirection: "row", alignItems: "center", gap: 12 },
  person: { flex: 1, minWidth: 0 },
  partyLabel: { color: nu.inkSoft, fontSize: 10 },
  personName: { color: nu.ink, fontSize: 14, fontWeight: "700", marginTop: 5 },
  you: { color: nu.brand, fontSize: 10, fontWeight: "600", marginTop: 3 },
  arrow: { alignItems: "center", justifyContent: "center", backgroundColor: nu.brandTint, width: 32, height: 32, borderRadius: 16 },
  amountRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, borderTopColor: nu.hairline, borderTopWidth: 1, marginTop: 14, paddingTop: 12 },
  amountLabel: { color: nu.inkSoft, fontSize: 11 },
  amount: { color: nu.ink, fontSize: 19, fontWeight: "800" },
  paymentButton: { alignItems: "center", justifyContent: "center", minHeight: 44, marginTop: 12, paddingHorizontal: 14, backgroundColor: nu.brand, borderRadius: 12 },
  paymentButtonPressed: { backgroundColor: nu.brandDeep, transform: [{ scale: 0.99 }] },
  paymentButtonDisabled: { opacity: 0.62 },
  paymentButtonText: { color: nu.white, fontSize: 12, fontWeight: "800" },
  empty: { alignItems: "center", paddingHorizontal: 20, paddingVertical: 40 },
  emptyIcon: { alignItems: "center", justifyContent: "center", backgroundColor: nu.brandTint, borderRadius: 28, width: 56, height: 56 },
  emptyTitle: { color: nu.ink, fontSize: 19, fontWeight: "700", marginTop: 16 },
  emptyText: { color: nu.inkSoft, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 8 },
});
