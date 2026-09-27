import { SymbolView } from "expo-symbols";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";
import type { HouseholdHeroData } from "@/types/household";

export function HouseholdDebtsSheet({ household, onClose }: { household: HouseholdHeroData; onClose: () => void }) {
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: household.currency });

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
              <SymbolView name={{ ios: "xmark", android: "close", web: "close" }} size={18} tintColor={colors.ink} />
            </Pressable>
          </View>
          <FlatList
            data={household.debts}
            keyExtractor={(item) => `${item.fromMemberId}-${item.toMemberId}`}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View
                accessible
                accessibilityLabel={`${item.fromMemberName} deve ${currency.format(item.amount)} a ${item.toMemberName}`}
                style={styles.debtCard}
              >
                <View style={styles.parties}>
                  <View style={styles.person}>
                    <Text style={styles.partyLabel}>Quem paga</Text>
                    <Text style={styles.personName}>{item.fromMemberName}</Text>
                    {item.fromMemberId === household.currentMemberId ? <Text style={styles.you}>Você</Text> : null}
                  </View>
                  <View style={styles.arrow}>
                    <SymbolView name={{ ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" }} size={18} tintColor={colors.income} />
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
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <SymbolView name={{ ios: "checkmark", android: "check", web: "check" }} size={25} tintColor={colors.income} weight="bold" />
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
  sheet: { alignSelf: "center", backgroundColor: "#F6F5EF", height: "85%", maxWidth: 640, width: "100%", borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: "hidden" },
  handle: { alignSelf: "center", backgroundColor: "#C6D1C1", borderRadius: 3, height: 5, width: 36, marginTop: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, padding: 20, borderBottomWidth: 1, borderBottomColor: "#E2E6DB" },
  headerCopy: { flex: 1 },
  title: { color: colors.ink, fontSize: 21, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { color: colors.inkSoft, fontSize: 12, lineHeight: 17, marginTop: 5 },
  close: { alignItems: "center", justifyContent: "center", backgroundColor: "#EAEDE4", borderRadius: 22, width: 44, height: 44 },
  list: { padding: 16, paddingBottom: 24 },
  debtCard: { backgroundColor: "#FFFEFA", borderColor: "#E2E6DB", borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 10 },
  parties: { flexDirection: "row", alignItems: "center", gap: 12 },
  person: { flex: 1, minWidth: 0 },
  partyLabel: { color: colors.inkSoft, fontSize: 10 },
  personName: { color: colors.ink, fontSize: 14, fontWeight: "700", marginTop: 5 },
  you: { color: colors.income, fontSize: 10, fontWeight: "600", marginTop: 3 },
  arrow: { alignItems: "center", justifyContent: "center", backgroundColor: "#E8EFDF", width: 32, height: 32, borderRadius: 16 },
  amountRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, borderTopColor: "#E8EBE1", borderTopWidth: 1, marginTop: 14, paddingTop: 12 },
  amountLabel: { color: colors.inkSoft, fontSize: 11 },
  amount: { color: colors.ink, fontSize: 19, fontWeight: "800" },
  empty: { alignItems: "center", paddingHorizontal: 20, paddingVertical: 40 },
  emptyIcon: { alignItems: "center", justifyContent: "center", backgroundColor: "#E5EDDC", borderRadius: 28, width: 56, height: 56 },
  emptyTitle: { color: colors.ink, fontSize: 19, fontWeight: "700", marginTop: 16 },
  emptyText: { color: colors.inkSoft, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 8 },
});
