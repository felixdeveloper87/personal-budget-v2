import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { ExpenseHeroArtwork } from "@/features/expenses/ExpenseHeroArtwork";
import { colors } from "@/theme/colors";

export default function ExpensesTab() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroImage}>
            <View pointerEvents="none" style={styles.heroArtwork}>
              <ExpenseHeroArtwork />
            </View>
            <View pointerEvents="none" style={styles.heroVeil} />
            <View style={styles.heroContent}>
              <Text style={styles.eyebrow}>SUAS SAÍDAS</Text>
              <Text style={styles.heroLabel}>Despesas</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardKicker}>PRÓXIMAS ETAPAS</Text>
          {["Despesas recentes", "Categorias e filtros", "Nova despesa"].map((item, index) => (
            <View key={item} style={[styles.row, index > 0 && styles.rowBorder]}>
              <View style={styles.numberBadge}>
                <Text style={styles.number}>{index + 1}</Text>
              </View>
              <Text style={styles.rowLabel}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Navegação pronta</Text>
          <Text style={styles.noticeText}>
            Esta aba já faz parte da estrutura do aplicativo. Construiremos seu conteúdo em etapas.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.paper, flex: 1 },
  content: { padding: 18, paddingBottom: 48 },
  hero: {
    backgroundColor: "#EDE9DF",
    borderRadius: 28,
    marginBottom: 20,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
  },
  heroImage: { borderRadius: 28, overflow: "hidden" },
  heroArtwork: { ...StyleSheet.absoluteFill },
  heroVeil: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(251,249,244,0.38)" },
  heroContent: { padding: 22, paddingBottom: 26, paddingTop: 20 },
  eyebrow: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 1.7 },
  heroLabel: { color: colors.ink, fontSize: 34, fontWeight: "700", letterSpacing: -1, marginTop: 6 },
  card: {
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 12,
    padding: 19,
  },
  cardKicker: {
    color: colors.inkFaint,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 7,
  },
  row: { alignItems: "center", flexDirection: "row", minHeight: 60 },
  rowBorder: { borderColor: colors.line, borderTopWidth: 1 },
  numberBadge: {
    alignItems: "center",
    backgroundColor: colors.header,
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    marginRight: 13,
    width: 32,
  },
  number: { color: colors.forest, fontSize: 12, fontWeight: "700" },
  rowLabel: { color: colors.ink, flex: 1, fontSize: 15, fontWeight: "600" },
  notice: { backgroundColor: colors.header, borderRadius: 19, padding: 18 },
  noticeTitle: { color: colors.ink, fontSize: 14, fontWeight: "700", marginBottom: 6 },
  noticeText: { color: colors.inkSoft, fontSize: 13, lineHeight: 20 },
});
