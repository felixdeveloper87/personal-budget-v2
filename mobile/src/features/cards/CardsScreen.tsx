import { SymbolView } from "expo-symbols";
import { useFocusEffect, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BankLogo } from "@/components/accounts/BankLogo";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, listPaymentMethods, listTransactions, type CreditCardPaymentMethod } from "@/services/api";
import type { Transaction } from "@/types/finance";
import { CardsHero } from "./CardsHero";
import { StatementsSection } from "./StatementsSection";
import { buildCardStatements } from "./cardStatements";
import { colors } from "@/theme/colors";

type SymbolName = ComponentProps<typeof SymbolView>["name"];
type Section = "overview" | "cards" | "statements";

export interface CardView {
  id: number;
  name: string;
  issuer: string;
  currentStatement: number;
  outstanding: number;
  limit: number;
  closingDay: number | string;
  paymentDay: number | string;
  nextPayment: number;
  nextPaymentDate: string;
  settlementAccount: string;
  accent: string;
}

export interface StatementView {
  id: string;
  cardId: number;
  label: string;
  period: string;
  dueDate: string;
  paymentTimestamp: number;
  closingTimestamp: number;
  status: "Aberta" | "Fechada" | "Próxima";
  total: number;
  transactions: Array<{ id: number; description: string; category: string; date: string; amount: number; merchantName?: string | null; merchantDomain?: string | null }>;
}

const icons = {
  back: { ios: "chevron.left", android: "arrow_back", web: "arrow_back" },
  chevronDown: { ios: "chevron.down", android: "keyboard_arrow_down", web: "keyboard_arrow_down" },
  chevronRight: { ios: "chevron.right", android: "chevron_right", web: "chevron_right" },
  hidden: { ios: "eye.slash", android: "visibility_off", web: "visibility_off" },
  home: { ios: "chart.pie.fill", android: "donut_small", web: "donut_small" },
  receipt: { ios: "doc.text.fill", android: "receipt_long", web: "receipt_long" },
  visible: { ios: "eye", android: "visibility", web: "visibility" },
  card: { ios: "creditcard.fill", android: "credit_card", web: "credit_card" },
  cards: { ios: "rectangle.stack.fill", android: "style", web: "style" },
} satisfies Record<string, SymbolName>;

const shortDate = (date: Date) => new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(date);
function buildViews(methods: CreditCardPaymentMethod[], transactions: Transaction[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const statements: StatementView[] = [];
  const cards: CardView[] = methods.filter((method) => method.type === "CREDIT_CARD").map((method) => {
    const cycles = buildCardStatements(method, transactions);
    const upcoming = cycles.filter((cycle) => cycle.paymentDate >= today).sort((a,b) => a.paymentDate.getTime() - b.paymentDate.getTime());
    for (const cycle of cycles) {
      statements.push({
        id: method.id + "-" + cycle.key,
        cardId: method.id,
        label: "Fatura de " + new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(cycle.closingDate),
        period: shortDate(cycle.periodStart) + " – " + shortDate(cycle.closingDate),
        dueDate: shortDate(cycle.paymentDate),
        paymentTimestamp: cycle.paymentDate.getTime(),
        closingTimestamp: cycle.closingDate.getTime(),
        status: cycle.status === "open" ? "Aberta" : cycle.status === "closed" ? "Fechada" : "Próxima",
        total: cycle.total,
        transactions: cycle.transactions.map((transaction) => {
          const raw = transaction.transactionDate ?? transaction.paymentDate ?? transaction.dateTime;
          const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw ?? "");
          return { id: transaction.id, description: transaction.description || "Compra", category: transaction.category, date: match ? shortDate(new Date(Number(match[1]), Number(match[2])-1, Number(match[3]))) : "—", amount: Number(transaction.amount), merchantName: transaction.merchantName, merchantDomain: transaction.merchantDomain };
        }),
      });
    }
    return { id: method.id, name: method.name, issuer: method.issuer || "Cartão de crédito", currentStatement: cycles.find((cycle) => cycle.status === "open")?.total ?? 0, outstanding: upcoming.reduce((sum,cycle) => sum + cycle.total,0), limit: Math.max(Number(method.creditLimit || 0),0), closingDay: method.statementClosingDay ?? "—", paymentDay: method.paymentDay ?? "—", nextPayment: upcoming[0]?.total ?? 0, nextPaymentDate: upcoming[0] ? shortDate(upcoming[0].paymentDate) : "", settlementAccount: method.settlementAccountName || "", accent: colors.forest };
  });
  const next = methods.filter((method) => method.type === "CREDIT_CARD").flatMap((method) => buildCardStatements(method, transactions).filter((cycle) => cycle.paymentDate >= today).map((cycle) => ({ cardId: method.id, date: cycle.paymentDate, total: cycle.total, count: cycle.transactions.length, status: cycle.status }))).sort((a,b) => a.date.getTime()-b.date.getTime())[0] ?? null;
  return { cards, statements, next };
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "GBP" });
const money = (value: number, hidden: boolean) => hidden ? "••••••" : currency.format(value);

function SegmentedNavigation({ active, onChange, cardCount, statementCount }: { active: Section; onChange: (section: Section) => void; cardCount: number; statementCount: number }) {
  const items: Array<{ id: Section; label: string; icon: SymbolName; badge?: number }> = [
    { id: "overview", label: "Resumo", icon: icons.home },
    { id: "cards", label: "Cartões", icon: icons.cards, badge: cardCount },
    { id: "statements", label: "Faturas", icon: icons.receipt, badge: statementCount },
  ];
  return (
    <View accessibilityRole="tablist" style={styles.segmentedNav}>
      {items.map((item) => {
        const selected = active === item.id;
        return (
          <Pressable accessibilityRole="tab" accessibilityState={{ selected }} key={item.id} onPress={() => onChange(item.id)} style={({ pressed }) => [styles.navItem, selected && styles.navItemActive, pressed && styles.pressed]}>
            <SymbolView name={item.icon} size={16} tintColor={selected ? colors.white : colors.inkFaint} weight="semibold" />
            <Text style={[styles.navLabel, selected && styles.navLabelActive]}>{item.label}</Text>
            {item.badge ? <Text style={[styles.navBadge, selected && styles.navBadgeActive]}>{item.badge}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function OverviewSection({ cards, statements, next, hidden, onNavigate, onToggleHidden, onOpenCard }: { onOpenCard: (id: number) => void; cards: CardView[]; statements: StatementView[]; next: ReturnType<typeof buildViews>["next"]; hidden: boolean; onNavigate: (section: Section) => void; onToggleHidden: () => void }) {
  const used = cards.reduce((total, card) => total + card.outstanding, 0);
  const limit = cards.reduce((total, card) => total + card.limit, 0);
  const nextCard = cards.find((card) => card.id === next?.cardId);
  return (
    <>
      <CardsHero
        cardCount={cards.length}
        hidden={hidden}
        limit={limit}
        used={used}
        next={next && nextCard ? { name: nextCard.name, date: shortDate(next.date), amount: next.total } : null}
        onToggleHidden={onToggleHidden}
        onOpenPayment={() => nextCard && onOpenCard(nextCard.id)}
      />

      <View style={styles.sectionHeader}><View><Text style={styles.sectionEyebrow}>ATALHOS</Text><Text style={styles.sectionTitle}>Acesse rapidamente</Text></View></View>
      <View style={styles.shortcutGrid}>
        <Pressable accessibilityRole="button" onPress={() => onNavigate("cards")} style={({ pressed }) => [styles.shortcut, pressed && styles.cardPressed]}><View style={[styles.shortcutIcon, { backgroundColor: colors.header }]}><SymbolView name={icons.cards} size={22} tintColor={colors.forest} weight="semibold" /></View><Text style={styles.shortcutTitle}>Meus cartões</Text><Text style={styles.shortcutText}>Limites e datas de ciclo</Text><View style={styles.shortcutFooter}><Text style={styles.shortcutLink}>Ver {cards.length} cartões</Text><SymbolView name={icons.chevronRight} size={15} tintColor={colors.forest} weight="semibold" /></View></Pressable>
        <Pressable accessibilityRole="button" onPress={() => onNavigate("statements")} style={({ pressed }) => [styles.shortcut, pressed && styles.cardPressed]}><View style={[styles.shortcutIcon, { backgroundColor: "#EFE9D8" }]}><SymbolView name={icons.receipt} size={22} tintColor={colors.gold} weight="semibold" /></View><Text style={styles.shortcutTitle}>Faturas</Text><Text style={styles.shortcutText}>Compras e vencimentos</Text><View style={styles.shortcutFooter}><Text style={styles.shortcutLink}>Ver {statements.length} faturas</Text><SymbolView name={icons.chevronRight} size={15} tintColor={colors.forest} weight="semibold" /></View></Pressable>
      </View>

    </>
  );
}

function CardTile({ card, hidden, onViewStatements }: { card: CardView; hidden: boolean; onViewStatements: () => void }) {
  const used = card.limit > 0 ? Math.min(100, Math.round((card.outstanding / card.limit) * 100)) : 0;
  return (
    <Pressable accessibilityLabel={`Ver faturas de ${card.name}`} accessibilityRole="button" onPress={onViewStatements} style={({ pressed }) => [styles.cardTile, pressed && styles.cardPressed]}>
      <View style={[styles.cardAccent, { backgroundColor: card.accent }]} />
      <View style={styles.cardTop}><View style={styles.cardIdentity}><BankLogo institution={card.issuer} name={card.name} size={44} /><View style={styles.cardNameBlock}><Text numberOfLines={1} style={styles.cardName}>{card.name}</Text><Text style={styles.cardIssuer}>{card.issuer.toLocaleUpperCase()}</Text></View></View><View style={styles.chevronBubble}><SymbolView name={icons.chevronRight} size={17} tintColor={colors.inkFaint} weight="semibold" /></View></View>
      <Text style={styles.cardValueLabel}>FATURA ATUAL</Text><Text style={styles.cardValue}>{money(card.currentStatement, hidden)}</Text><View style={styles.cardDivider} />
      <View style={styles.cardCycleRow}><View><Text style={styles.cardMetaLabel}>CICLO DA FATURA</Text><Text style={styles.cardMeta}>Fecha dia {card.closingDay} · vence dia {card.paymentDay}</Text></View><View style={styles.cardCycleAmount}><Text style={styles.cardMetaLabel}>PRÓXIMO PAGAMENTO</Text><Text style={styles.cardMetaStrong}>{money(card.nextPayment, hidden)}</Text></View></View>
      <View style={styles.creditRow}><Text style={styles.creditLabel}>{hidden ? "••••" : card.limit > 0 ? `${used}% do limite` : "Limite não cadastrado"}</Text><Text style={styles.creditAvailable}>{hidden ? "••••••" : card.limit > 0 ? `${money(Math.max(card.limit - card.outstanding, 0), false)} disponíveis` : "—"}</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${used}%` }]} /></View>{card.settlementAccount ? <Text style={styles.settlement}>Pago pela conta {card.settlementAccount}</Text> : null}
    </Pressable>
  );
}

function CardsSection({ cards, hidden, onCardPress }: { cards: CardView[]; hidden: boolean; onCardPress: (id: number) => void }) {
  return <><View style={styles.sectionIntro}><View style={styles.introIcon}><SymbolView name={icons.cards} size={22} tintColor={colors.forest} weight="semibold" /></View><View style={styles.introCopy}><Text style={styles.introTitle}>Sua carteira</Text><Text style={styles.introText}>Toque em um cartão para abrir as faturas.</Text></View><Text style={styles.countBadge}>{cards.length}</Text></View><View style={styles.cardsList}>{cards.map((card) => <CardTile card={card} hidden={hidden} key={card.id} onViewStatements={() => onCardPress(card.id)} />)}</View></>;
}

export function CardsScreen() {
  const router = useRouter();
  const [section, setSection] = useState<Section>("overview");
  const [hidden, setHidden] = useState(false);
  const [cardFilter, setCardFilter] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const [methods, setMethods] = useState<CreditCardPaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cards, statements, next } = useMemo(() => buildViews(methods, transactions), [methods, transactions]);
  const load = useCallback(async (refresh = false) => {
    if (!user) return;
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const [loadedMethods, loadedTransactions] = await Promise.all([listPaymentMethods(user.token), listTransactions(user.token)]);
      setMethods(loadedMethods); setTransactions(loadedTransactions);
      setCardFilter((current) => loadedMethods.some((method) => method.id === current) ? current : null);
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) { await logout(); return; }
      setError("Não foi possível carregar seus cartões. Tente novamente.");
    } finally { setLoading(false); setRefreshing(false); }
  }, [user, logout]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const subtitle = useMemo(() => ({ overview: "Acompanhe seu crédito", cards: "Limites e ciclos", statements: "Compras e vencimentos" })[section], [section]);
  const openCardStatements = (id: number) => { setCardFilter(id); setExpanded(statements.find((statement) => statement.cardId === id)?.id ?? null); setSection("statements"); };
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.pageHeader}>
        <Pressable accessibilityLabel="Voltar" accessibilityRole="button" hitSlop={8} onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <SymbolView name={icons.back} size={20} tintColor={colors.ink} weight="semibold" />
        </Pressable>
        <View style={styles.headerBrand}><View style={styles.brandDot} /><Text style={styles.headerBrandText}>PERSONAL BUDGET</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={hidden ? "Mostrar valores" : "Ocultar valores"} onPress={() => setHidden((value) => !value)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <SymbolView name={hidden ? icons.visible : icons.hidden} size={19} tintColor={colors.ink} />
        </Pressable>
      </View>
      <View style={styles.pageTitleRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.pageEyebrow}>CRÉDITO & FATURAS</Text>
          <Text style={styles.pageTitle}>Seus cartões.</Text>
          <Text style={styles.pageSubtitle}>{subtitle}</Text>
        </View>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.headerEmblem}>
          <SymbolView name={icons.card} size={28} tintColor={colors.forest} weight="regular" />
        </View>
      </View>
      <SegmentedNavigation active={section} onChange={setSection} cardCount={cards.length} statementCount={statements.length} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.forest} />}>
        {loading ? <ActivityIndicator color={colors.forest} style={{ marginVertical: 40 }} /> : error ? <Pressable accessibilityRole="button" onPress={() => void load()}><Text style={styles.introText}>{error}</Text><Text style={styles.shortcutLink}>Tentar novamente</Text></Pressable> : cards.length === 0 ? <Text style={styles.introTitle}>Nenhum cartão de crédito cadastrado.</Text> : <>
        {section === "overview" ? <OverviewSection cards={cards} statements={statements} next={next} hidden={hidden} onNavigate={setSection} onToggleHidden={() => setHidden((value) => !value)} onOpenCard={openCardStatements} /> : null}
        {section === "cards" ? <CardsSection cards={cards} hidden={hidden} onCardPress={openCardStatements} /> : null}
        {section === "statements" ? <StatementsSection cards={cards} allStatements={statements} cardFilter={cardFilter} expanded={expanded} hidden={hidden} onFilter={setCardFilter} onToggle={(id) => setExpanded((current) => current === id ? null : id)} /> : null}
        </>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.paper, flex: 1 },
  pageHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 7, paddingBottom: 7 },
  headerBrand: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandDot: { height: 5, width: 5, borderRadius: 3, backgroundColor: colors.forest },
  headerBrandText: { color: colors.inkFaint, fontSize: 8, fontWeight: "800", letterSpacing: 1.6 },
  pageTitleRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 23, paddingTop: 11, paddingBottom: 14 },
  pageSubtitle: { color: colors.inkSoft, fontSize: 12, marginTop: 5 },
  headerEmblem: { width: 53, height: 60, borderRadius: 18, borderWidth: 1, borderColor: "#CED7CB", backgroundColor: "#E7EBDD", alignItems: "center", justifyContent: "center", transform: [{ rotate: "8deg" }] },
  iconButton: { alignItems: "center", backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 14, borderWidth: 1, height: 40, justifyContent: "center", width: 40 },
  titleBlock: { flex: 1, marginRight: 10 },
  pageEyebrow: { color: colors.forest, fontSize: 8, fontWeight: "800", letterSpacing: 1.35 },
  pageTitle: { color: colors.ink, fontSize: 35, fontWeight: "700", letterSpacing: -1.5, marginTop: 4 },
  segmentedNav: { backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 17, borderWidth: 1, flexDirection: "row", gap: 3, marginHorizontal: 18, marginTop: 8, padding: 4 },
  navItem: { alignItems: "center", borderRadius: 13, flex: 1, flexDirection: "row", gap: 5, justifyContent: "center", minHeight: 42, paddingHorizontal: 5 },
  navItemActive: { backgroundColor: colors.forest, shadowColor: colors.forest, shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.18, shadowRadius: 5 },
  navLabel: { color: colors.inkSoft, fontSize: 10, fontWeight: "700" },
  navLabelActive: { color: colors.white },
  navBadge: { backgroundColor: colors.paperMuted, borderRadius: 8, color: colors.inkFaint, fontSize: 8, fontWeight: "900", minWidth: 16, overflow: "hidden", paddingHorizontal: 4, paddingVertical: 2, textAlign: "center" },
  navBadgeActive: { backgroundColor: "rgba(255,255,255,0.16)", color: colors.white },
  content: { paddingBottom: 44, paddingHorizontal: 18, paddingTop: 14 },
  pressed: { opacity: 0.67, transform: [{ scale: 0.98 }] },
  cardPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  sectionHeader: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between", marginBottom: 11, marginTop: 24, paddingHorizontal: 3 },
  sectionEyebrow: { color: colors.forest, fontSize: 9, fontWeight: "800", letterSpacing: 1.45 },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: "700", marginTop: 4 },
  shortcutGrid: { flexDirection: "row", gap: 9 },
  shortcut: { backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 19, borderWidth: 1, flex: 1, minHeight: 160, padding: 13 },
  shortcutIcon: { alignItems: "center", borderRadius: 13, height: 40, justifyContent: "center", width: 40 },
  shortcutTitle: { color: colors.ink, fontSize: 14, fontWeight: "800", marginTop: 13 },
  shortcutText: { color: colors.inkSoft, fontSize: 10, lineHeight: 14, marginTop: 4 },
  shortcutFooter: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: "auto", paddingTop: 12 },
  shortcutLink: { color: colors.forest, fontSize: 10, fontWeight: "800" },
  sectionIntro: { alignItems: "center", backgroundColor: colors.header, borderColor: colors.line, borderRadius: 18, borderWidth: 1, flexDirection: "row", marginBottom: 12, padding: 13 },
  introIcon: { alignItems: "center", backgroundColor: "rgba(251,249,244,0.72)", borderRadius: 13, height: 42, justifyContent: "center", width: 42 },
  introCopy: { flex: 1, marginLeft: 11 },
  introTitle: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  introText: { color: colors.inkSoft, fontSize: 10, marginTop: 4 },
  countBadge: { backgroundColor: colors.paperRaised, borderRadius: 11, color: colors.forest, fontSize: 11, fontWeight: "900", minWidth: 28, overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5, textAlign: "center" },
  cardsList: { gap: 11 },
  cardTile: { backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 22, borderWidth: 1, overflow: "hidden", padding: 15, paddingTop: 19, shadowColor: colors.ink, shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.06, shadowRadius: 10 },
  cardAccent: { height: 4, left: 0, position: "absolute", right: 0, top: 0 },
  cardTop: { alignItems: "center", flexDirection: "row" },
  cardIdentity: { alignItems: "center", flex: 1, flexDirection: "row", minWidth: 0 },
  cardNameBlock: { flex: 1, marginLeft: 11 },
  cardName: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  cardIssuer: { color: colors.inkFaint, fontSize: 9, fontWeight: "700", letterSpacing: 0.8, marginTop: 3 },
  chevronBubble: { alignItems: "center", backgroundColor: colors.paperMuted, borderRadius: 11, height: 34, justifyContent: "center", width: 34 },
  cardValueLabel: { color: colors.inkFaint, fontSize: 9, fontWeight: "800", letterSpacing: 1.25, marginTop: 20 },
  cardValue: { color: colors.ink, fontSize: 30, fontWeight: "800", letterSpacing: -1, marginTop: 5 },
  cardDivider: { backgroundColor: colors.line, height: StyleSheet.hairlineWidth, marginVertical: 14 },
  cardCycleRow: { flexDirection: "row", justifyContent: "space-between" },
  cardCycleAmount: { alignItems: "flex-end" },
  cardMetaLabel: { color: colors.inkFaint, fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  cardMeta: { color: colors.inkSoft, fontSize: 10, marginTop: 4 },
  cardMetaStrong: { color: colors.ink, fontSize: 11, fontWeight: "800", marginTop: 4 },
  creditRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  creditLabel: { color: colors.inkFaint, fontSize: 8, fontWeight: "800", letterSpacing: 0.7 },
  creditAvailable: { color: colors.inkSoft, fontSize: 9 },
  progressTrack: { backgroundColor: colors.paperMuted, borderRadius: 4, height: 6, marginTop: 7, overflow: "hidden" },
  progressFill: { backgroundColor: colors.income, borderRadius: 4, height: 6 },
  settlement: { color: colors.inkFaint, fontSize: 9, marginTop: 11 },
});
