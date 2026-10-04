import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { HouseholdDebtsSheet } from "@/features/household/HouseholdDebtsSheet";
import { nu, nuSection } from "@/components/dashboard/nuTheme";
import type { HouseholdHeroData, HouseholdPageResponse } from "@/types/household";

export function HouseholdMembers({ household, onUpdated }: { household: HouseholdHeroData; onUpdated: (page: HouseholdPageResponse) => void }) {
  const [debtsVisible, setDebtsVisible] = useState(false);
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: household.currency });
  const debtsYouOwe = household.debts.filter((debt) => debt.fromMemberId === household.currentMemberId);
  const totalYouOwe = debtsYouOwe.reduce((total, debt) => total + debt.amount, 0);

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
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
        style={styles.carouselScroll}
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
      {debtsYouOwe.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Transferência pendente. Você deve ${currency.format(totalYouOwe)}. Revisar transferências.`}
          onPress={() => setDebtsVisible(true)}
          style={({ pressed }) => [styles.paymentAlert, pressed && styles.paymentAlertPressed]}
        >
          <View style={styles.paymentAlertIcon}>
            <Text style={styles.paymentAlertMark}>!</Text>
          </View>
          <View style={styles.paymentAlertCopy}>
            <Text style={styles.paymentAlertTitle}>{debtsYouOwe.length === 1 ? "Transferência pendente" : "Transferências pendentes"}</Text>
            <Text style={styles.paymentAlertText} numberOfLines={2}>
              {debtsYouOwe.length === 1
                ? `Você deve ${currency.format(totalYouOwe)} a ${debtsYouOwe[0].toMemberName}.`
                : `Você tem ${debtsYouOwe.length} transferências a fazer, totalizando ${currency.format(totalYouOwe)}.`}
            </Text>
          </View>
          <Text style={styles.paymentAlertAction}>Revisar</Text>
        </Pressable>
      ) : null}
      {debtsVisible ? <HouseholdDebtsSheet household={household} onUpdated={onUpdated} onClose={() => setDebtsVisible(false)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, paddingVertical: 20 },
  heading: { flexDirection: "row", alignItems: "center", gap: 10 },
  headingCopy: { flex: 1 },
  title: nuSection.title,
  subtitle: { ...nuSection.subtitle, marginBottom: 14 },
  seeAll: { alignItems: "center", justifyContent: "center", backgroundColor: nu.brandTint, borderRadius: 999, minHeight: 34, paddingHorizontal: 14 },
  seeAllText: { color: nu.brand, fontSize: 12, fontWeight: "600" },
  // Bleeds to the screen edges so cards scroll under the gutter, Nubank-style.
  carouselScroll: { marginHorizontal: -20 },
  carousel: { gap: 10, paddingBottom: 2, paddingHorizontal: 20 },
  member: { position: "relative", overflow: "hidden", width: 160, minHeight: 128, backgroundColor: nu.surface, borderRadius: 16, padding: 12 },
  memberHeader: { minHeight: 38, flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: { alignItems: "center", justifyContent: "center", height: 32, width: 32, borderRadius: 16 },
  initials: { fontSize: 11, fontWeight: "800" },
  memberCopy: { flex: 1, minWidth: 0 },
  name: { color: nu.ink, fontSize: 13, lineHeight: 17, fontWeight: "600" },
  you: { color: nu.brand, fontSize: 10, lineHeight: 13, fontWeight: "600" },
  balance: { alignItems: "flex-start", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: nu.track },
  amount: { fontSize: 18, lineHeight: 22, fontWeight: "700", letterSpacing: -0.4 },
  statusPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  status: { fontSize: 10, fontWeight: "600" },
  receiving: { color: nu.positive },
  paying: { color: nu.negative },
  neutral: { color: nu.inkSoft },
  receivingTint: { backgroundColor: nu.positiveTint },
  payingTint: { backgroundColor: nu.negativeTint },
  neutralTint: { backgroundColor: nu.white },
  paymentAlert: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 68, marginTop: 12, padding: 14, backgroundColor: nu.negativeTint, borderRadius: 16 },
  paymentAlertPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  paymentAlertIcon: { alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 17, backgroundColor: nu.white },
  paymentAlertMark: { color: nu.negative, fontSize: 16, fontWeight: "800" },
  paymentAlertCopy: { flex: 1, minWidth: 0 },
  paymentAlertTitle: { color: nu.ink, fontSize: 14, fontWeight: "600" },
  paymentAlertText: { color: nu.inkSoft, fontSize: 12, lineHeight: 17, marginTop: 2 },
  paymentAlertAction: { color: nu.negative, fontSize: 12, fontWeight: "700" },
});
