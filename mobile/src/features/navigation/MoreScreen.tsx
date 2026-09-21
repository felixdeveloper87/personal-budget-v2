import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/theme/colors";

export function MoreScreen() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>CONTA E RECURSOS</Text>
        <Text style={styles.title}>Mais</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || "PB"}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planText}>{user.plan}</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuCard}>
          {["Cartões", "Compromissos", "Metas", "Planejamento", "Relatórios"].map(
            (item, index) => (
              <View key={item} style={[styles.menuRow, index > 0 && styles.menuRowBorder]}>
                <Text style={styles.menuLabel}>{item}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            ),
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => void logout()}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutPressed]}
        >
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
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
  profileCard: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 28,
    padding: 18,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.forest,
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    marginRight: 14,
    width: 52,
  },
  avatarText: { color: colors.white, fontSize: 16, fontWeight: "700" },
  profileCopy: { flex: 1 },
  name: { color: colors.ink, fontSize: 17, fontWeight: "700" },
  email: { color: colors.inkSoft, fontSize: 12, marginTop: 3 },
  planBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.header,
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  planText: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  menuCard: {
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 17,
    overflow: "hidden",
    paddingHorizontal: 18,
  },
  menuRow: { alignItems: "center", flexDirection: "row", minHeight: 56 },
  menuRowBorder: { borderColor: colors.line, borderTopWidth: 1 },
  menuLabel: { color: colors.ink, flex: 1, fontSize: 15, fontWeight: "600" },
  chevron: { color: colors.inkFaint, fontSize: 25, fontWeight: "300" },
  logoutButton: {
    alignItems: "center",
    borderColor: colors.expense,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 22,
    minHeight: 52,
  },
  logoutPressed: { backgroundColor: colors.expenseTint },
  logoutText: { color: colors.expense, fontSize: 14, fontWeight: "700" },
});
