import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";

interface SectionPlaceholderScreenProps {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
}

export function SectionPlaceholderScreen({
  eyebrow,
  title,
  description,
  items,
}: SectionPlaceholderScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.card}>
          <Text style={styles.cardKicker}>PRÓXIMAS ETAPAS</Text>
          {items.map((item, index) => (
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
  content: { padding: 24, paddingBottom: 48, paddingTop: 28 },
  eyebrow: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.7,
    marginBottom: 10,
  },
  title: { color: colors.ink, fontSize: 34, fontWeight: "700", letterSpacing: -1 },
  description: {
    color: colors.inkSoft,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
    maxWidth: 350,
  },
  card: {
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 30,
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
  notice: { backgroundColor: colors.header, borderRadius: 19, marginTop: 16, padding: 18 },
  noticeTitle: { color: colors.ink, fontSize: 14, fontWeight: "700", marginBottom: 6 },
  noticeText: { color: colors.inkSoft, fontSize: 13, lineHeight: 20 },
});
