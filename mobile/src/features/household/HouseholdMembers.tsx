import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { HouseholdDebtsSheet } from "@/features/household/HouseholdDebtsSheet";
import { colors } from "@/theme/colors";
import type { HouseholdHeroData } from "@/types/household";

export function HouseholdMembers({ household }: { household: HouseholdHeroData }) {
  const [debtsVisible, setDebtsVisible] = useState(false);
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: household.currency });

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>QUEM FAZ PARTE</Text>
          <Text style={styles.title}>Integrantes</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Ver quem deve a quem" onPress={() => setDebtsVisible(true)} style={styles.seeAll}>
          <Text style={styles.seeAllText}>Quem deve quem</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>Saldos atuais da casa.</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
        snapToInterval={168}
        snapToAlignment="start"
        decelerationRate="fast"
        nestedScrollEnabled
        directionalLockEnabled
      >
        {household.members.map((member) => {
          const status = member.balance > 0 ? "A receber" : member.balance < 0 ? "A pagar" : "Neutro";
          const tone = member.balance > 0 ? styles.receiving : member.balance < 0 ? styles.paying : styles.neutral;
          const tint = member.balance > 0 ? styles.receivingTint : member.balance < 0 ? styles.payingTint : styles.neutralTint;
          const amount = currency.format(Math.abs(member.balance));
          const initials = member.name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase();

          return (
            <View key={member.id} accessible accessibilityLabel={`${member.name}. ${status}: ${amount}`} style={styles.member}>
              <View pointerEvents="none" style={styles.memberAccent} />
              <View style={styles.memberHeader}>
                <View style={[styles.avatar, tint]}><Text style={[styles.initials, tone]}>{initials}</Text></View>
                <View style={styles.memberCopy}>
                  <Text numberOfLines={1} style={styles.name}>{member.name}</Text>
                  {member.id === household.currentMemberId ? <Text style={styles.you}>Você</Text> : null}
                </View>
              </View>
              <View style={styles.balance}>
                <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={[styles.amount, tone]}>{amount}</Text>
                <View style={[styles.statusPill, tint]}><Text style={[styles.status, tone]}>{status}</Text></View>
              </View>
            </View>
          );
        })}
      </ScrollView>
      {debtsVisible ? <HouseholdDebtsSheet household={household} onClose={() => setDebtsVisible(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 26 },
  heading: { flexDirection: "row", alignItems: "center", gap: 10 },
  headingCopy: { flex: 1 },
  eyebrow: { color: colors.income, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 20, fontWeight: "700", letterSpacing: -0.4, marginTop: 5 },
  subtitle: { color: colors.inkSoft, fontSize: 11, marginTop: 6, marginBottom: 14 },
  seeAll: { alignItems: "center", justifyContent: "center", backgroundColor: "#E5EDDC", borderRadius: 13, minHeight: 44, paddingHorizontal: 12 },
  seeAllText: { color: colors.income, fontSize: 11, fontWeight: "700" },
  carousel: { gap: 8, paddingBottom: 2 },
  member: { position: "relative", overflow: "hidden", width: 160, minHeight: 128, backgroundColor: "#FBF9F4", borderColor: "#DEDDD6", borderWidth: 1, borderRadius: 16, padding: 11 },
  memberAccent: { position: "absolute", top: 0, left: 12, right: 12, height: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, backgroundColor: "#3F403B" },
  memberHeader: { minHeight: 38, flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: { alignItems: "center", justifyContent: "center", height: 32, width: 32, borderRadius: 16 },
  initials: { fontSize: 11, fontWeight: "800" },
  memberCopy: { flex: 1, minWidth: 0 },
  name: { color: colors.ink, fontSize: 12, lineHeight: 16, fontWeight: "700" },
  you: { color: colors.income, fontSize: 9, lineHeight: 12, fontWeight: "700" },
  balance: { alignItems: "center", marginTop: 9, paddingTop: 9, borderTopWidth: 1, borderTopColor: "#DDE3DA" },
  amount: { fontSize: 18, lineHeight: 22, fontWeight: "800", letterSpacing: -0.4, textAlign: "center" },
  statusPill: { borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3, marginTop: 5 },
  status: { fontSize: 9, fontWeight: "700" },
  receiving: { color: "#326548" },
  paying: { color: "#A44735" },
  neutral: { color: colors.inkSoft },
  receivingTint: { backgroundColor: "#E3EDDA" },
  payingTint: { backgroundColor: "#F3E3DC" },
  neutralTint: { backgroundColor: "#EBEDE5" },
});
