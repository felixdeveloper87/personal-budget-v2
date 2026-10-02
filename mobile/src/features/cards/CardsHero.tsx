import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

interface CardsHeroProps {
  cardCount: number;
  hidden: boolean;
  limit: number;
  used: number;
  next: { name: string; date: string; amount: number } | null;
  onToggleHidden: () => void;
  onOpenPayment: () => void;
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "GBP" });

function WalletArtwork() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 200 150" fill="none">
      <Defs>
        <LinearGradient id="walletBack" x1="20" y1="5" x2="170" y2="100" gradientUnits="userSpaceOnUse"><Stop stopColor="#ADC9C2" /><Stop offset="1" stopColor="#6F9991" /></LinearGradient>
        <LinearGradient id="walletFront" x1="25" y1="45" x2="175" y2="130" gradientUnits="userSpaceOnUse"><Stop stopColor="#E7DDC3" /><Stop offset="0.5" stopColor="#D4C39E" /><Stop offset="1" stopColor="#B29E75" /></LinearGradient>
      </Defs>
      <Circle cx="112" cy="75" r="67" stroke="#D5E8DF" strokeOpacity=".12" />
      <Circle cx="112" cy="75" r="52" stroke="#D5E8DF" strokeOpacity=".08" />
      <Rect x="37" y="16" width="139" height="86" rx="13" fill="url(#walletBack)" transform="rotate(13 37 16)" />
      <Path d="M55 34L138 53" stroke="#E4F0E9" strokeOpacity=".5" strokeWidth="2" />
      <Rect x="16" y="59" width="148" height="91" rx="14" fill="#102B30" fillOpacity=".3" transform="rotate(-10 16 59)" />
      <Rect x="17" y="50" width="148" height="91" rx="14" fill="url(#walletFront)" transform="rotate(-10 17 50)" />
      <Rect x="17.5" y="50.5" width="147" height="90" rx="13.5" stroke="#FFF5DD" strokeOpacity=".55" transform="rotate(-10 17 50)" />
      <Path d="M35 67L73 60" stroke="#6F6147" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" />
      <Rect x="36" y="77" width="22" height="17" rx="4" fill="#F1E3B9" stroke="#9F8C63" transform="rotate(-10 36 77)" />
      <Path d="M42 79L44 92M51 77L53 91" stroke="#9F8C63" strokeWidth=".7" />
      <Circle cx="132" cy="111" r="10" fill="#7E6A46" fillOpacity=".65" />
      <Circle cx="145" cy="109" r="10" fill="#F9EDD0" fillOpacity=".7" />
      <Path d="M183 35V45M178 40H188M18 28V34M15 31H21" stroke="#DCCBA5" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function CardsHero({ cardCount, hidden, limit, used, next, onToggleHidden, onOpenPayment }: CardsHeroProps) {
  const hasLimit = limit > 0;
  const percentage = hasLimit ? Math.min(100, Math.max(0, (used / limit) * 100)) : 0;
  const value = (amount: number) => hidden ? "••••••" : currency.format(amount);
  return (
    <View style={styles.hero}>
      <View pointerEvents="none" style={styles.halo} /><View pointerEvents="none" style={styles.haloInner} />
      <View style={styles.top}>
        <View style={styles.collection}><View style={styles.dot} /><Text style={styles.eyebrow}>SUA CARTEIRA</Text><Text style={styles.count}>{cardCount} {cardCount === 1 ? "cartão" : "cartões"}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={hidden ? "Mostrar valores" : "Ocultar valores"} accessibilityState={{ checked: hidden }} onPress={onToggleHidden} style={({ pressed }) => [styles.eye, pressed && styles.pressed]}>
          <SymbolView name={hidden ? { ios: "eye", android: "visibility", web: "visibility" } : { ios: "eye.slash", android: "visibility_off", web: "visibility_off" }} size={18} tintColor="#E9EBDD" />
        </Pressable>
      </View>
      <View style={styles.spotlight}>
        <View style={styles.headline}><Text style={styles.headlineText}>Mais clareza.</Text><Text style={styles.headlineText}>Mais controle.</Text><Text style={styles.caption}>Seu crédito, bem cuidado.</Text></View>
        <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.artwork}><WalletArtwork /></View>
      </View>
      <View style={styles.balance}>
        <Text style={styles.balanceLabel}>{hasLimit ? "CRÉDITO DISPONÍVEL" : "CRÉDITO UTILIZADO"}</Text>
        <Text adjustsFontSizeToFit minimumFontScale={0.55} numberOfLines={1} style={styles.balanceValue}>{value(hasLimit ? Math.max(limit - used, 0) : used)}</Text>
        <Text style={styles.balanceNote}>{hasLimit ? "de " + value(limit) + " em limites registrados" : "Limites de crédito ainda não cadastrados"}</Text>
      </View>
      <View style={styles.usage}>
        <View style={styles.usageHeading}><Text style={styles.usageLabel}>Em uso <Text style={styles.usageAmount}>{value(used)}</Text></Text><Text style={styles.usagePercentage}>{hidden ? "••" : hasLimit ? Math.round(percentage) + "%" : "—"}</Text></View>
        <View style={styles.track}><View style={[styles.fill, { width: hidden ? "0%" : `${percentage}%`, backgroundColor: percentage >= 90 ? "#E8A08D" : "#D8C59B" }]} /></View>
      </View>
      {next ? (
        <Pressable accessibilityRole="button" accessibilityLabel={"Ver fatura de " + next.name} onPress={onOpenPayment} style={({ pressed }) => [styles.payment, pressed && styles.pressed]}>
          <View style={styles.calendar}><SymbolView name={{ ios: "calendar", android: "calendar_today", web: "calendar_today" }} size={20} tintColor="#E0CEAB" /></View>
          <View style={styles.paymentCopy}><Text style={styles.paymentLabel}>PRÓXIMO VENCIMENTO · {next.date.toLocaleUpperCase()}</Text><Text numberOfLines={1} style={styles.paymentName}>{next.name}</Text></View>
          <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.paymentAmount}>{value(next.amount)}</Text>
          <SymbolView name={{ ios: "arrow.up.right", android: "north_east", web: "north_east" }} size={17} tintColor="#D8C59B" />
        </Pressable>
      ) : <View style={styles.payment}><Text style={styles.noPayment}>Nenhum pagamento previsto por enquanto.</Text></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: "#203F46", borderColor: "#39585C", borderWidth: 1, borderRadius: 30, overflow: "hidden", padding: 20, shadowColor: "#142C31", shadowOffset: { width: 0, height: 9 }, shadowOpacity: 0.2, shadowRadius: 20 },
  halo: { position: "absolute", width: 310, height: 310, borderRadius: 155, backgroundColor: "#294C51", top: -120, right: -145 },
  haloInner: { position: "absolute", width: 240, height: 240, borderRadius: 120, borderWidth: 1, borderColor: "rgba(217,229,216,0.08)", top: -85, right: -110 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  collection: { flexDirection: "row", alignItems: "center", flex: 1, gap: 7 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#D8C59B" },
  eyebrow: { color: "#D9E5DC", fontSize: 8, fontWeight: "800", letterSpacing: 1.5 },
  count: { color: "#C6D8D1", fontSize: 9, backgroundColor: "rgba(231,239,227,0.08)", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 9, overflow: "hidden" },
  eye: { width: 35, height: 35, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(231,239,227,0.07)", borderWidth: 1, borderColor: "rgba(231,239,227,0.12)" },
  spotlight: { minHeight: 133, justifyContent: "center", marginTop: 8, position: "relative" },
  headline: { width: "57%", zIndex: 1 },
  headlineText: { color: "#F6F2E7", fontSize: 26, lineHeight: 31, fontWeight: "600", letterSpacing: -0.9 },
  caption: { color: "#B6CCC5", fontSize: 10, lineHeight: 15, marginTop: 9 },
  artwork: { position: "absolute", right: -15, top: -1, width: "51%", height: 135 },
  balance: { marginTop: 5 },
  balanceLabel: { color: "#C7D9D0", fontSize: 8, fontWeight: "800", letterSpacing: 1.6 },
  balanceValue: { color: "#F7F3E7", fontSize: 43, fontWeight: "700", letterSpacing: -2, marginTop: 5, fontVariant: ["tabular-nums"] },
  balanceNote: { color: "#A9C1B9", fontSize: 10, marginTop: 4 },
  usage: { marginTop: 20, marginBottom: 20 },
  usageHeading: { flexDirection: "row", justifyContent: "space-between", marginBottom: 9, gap: 8 },
  usageLabel: { color: "#A9C1B9", fontSize: 10 },
  usageAmount: { color: "#E5EBDC", fontWeight: "700" },
  usagePercentage: { color: "#D8C59B", fontSize: 10, fontWeight: "800" },
  track: { height: 5, borderRadius: 3, backgroundColor: "rgba(225,237,220,0.12)", overflow: "hidden" },
  fill: { height: 5, borderRadius: 3 },
  payment: { borderTopColor: "rgba(225,237,220,0.15)", borderTopWidth: 1, paddingTop: 17, flexDirection: "row", alignItems: "center", gap: 9 },
  calendar: { width: 37, height: 40, borderRadius: 12, backgroundColor: "rgba(216,197,155,0.1)", alignItems: "center", justifyContent: "center" },
  paymentCopy: { flex: 1, minWidth: 0 },
  paymentLabel: { color: "#ACC3BB", fontSize: 7, letterSpacing: 0.7, fontWeight: "700", lineHeight: 11 },
  paymentName: { color: "#F0EFE2", fontSize: 11, fontWeight: "700", marginTop: 4 },
  paymentAmount: { color: "#F0EFE2", fontSize: 13, fontWeight: "800", maxWidth: "32%", fontVariant: ["tabular-nums"] },
  noPayment: { color: "#ACC3BB", fontSize: 11 },
  pressed: { opacity: 0.65 },
});
