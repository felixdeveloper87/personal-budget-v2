import { setStatusBarStyle } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import { useFocusEffect, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BankLogo } from "@/components/accounts/BankLogo";
import { NU_SHEET_OVERLAP, NuHeader } from "@/components/dashboard/NuHeader";
import { nu, nuSection } from "@/components/dashboard/nuTheme";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, listPaymentMethods, listTransactions, type CreditCardPaymentMethod } from "@/services/api";
import type { Transaction } from "@/types/finance";

import { StatementsSection } from "./StatementsSection";
import { buildCardsOverview, focusStatementFor, type CardView, type StatementView } from "./cardViews";

type SymbolName = ComponentProps<typeof SymbolView>["name"];
type Tab = "cards" | "statements";

const icons = {
  calendar: { ios: "calendar", android: "calendar_today", web: "calendar_today" },
  card: { ios: "creditcard.fill", android: "credit_card", web: "credit_card" },
  chevron: { ios: "chevron.right", android: "chevron_right", web: "chevron_right" },
  hidden: { ios: "eye.slash", android: "visibility_off", web: "visibility_off" },
  visible: { ios: "eye", android: "visibility", web: "visibility" },
} satisfies Record<string, SymbolName>;

const TABS: Array<{ value: Tab; label: string }> = [
  { value: "cards", label: "Cartões" },
  { value: "statements", label: "Faturas" },
];

/** Title row + total + caption + tab switch: a little taller than the default header. */
const HEADER_CONTENT_HEIGHT = 166;
const MASK = "••••••";
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "GBP" });
const money = (value: number, hidden: boolean) => hidden ? MASK : currency.format(value);

/** Two-option switch on the purple header, same look as the commitments page. */
function TabSwitch({ value, onChange }: { value: Tab; onChange: (tab: Tab) => void }) {
  return (
    <View accessibilityLabel="Visualização" accessibilityRole="tablist" style={styles.tabs}>
      {TABS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [styles.tab, selected && styles.tabSelected, pressed && !selected && styles.pressed]}
          >
            <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function NextDue({ card, statement, hidden, onPress }: {
  card: CardView;
  statement: StatementView;
  hidden: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`Ver fatura de ${card.name} com vencimento em ${statement.dueDate}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.nextDue, pressed && styles.nextDuePressed]}
    >
      <View style={styles.nextDueIcon}>
        <SymbolView name={icons.calendar} size={19} tintColor={nu.brand} weight="semibold" />
      </View>
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={styles.nextDueLabel}>Próximo vencimento · {statement.dueDate}</Text>
        <Text numberOfLines={1} style={styles.nextDueName}>{card.name}</Text>
      </View>
      <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={styles.nextDueAmount}>
        {money(statement.total, hidden)}
      </Text>
      <SymbolView name={icons.chevron} size={14} tintColor={nu.brand} weight="semibold" />
    </Pressable>
  );
}

function CardRow({ card, first, hidden, onPress }: { card: CardView; first: boolean; hidden: boolean; onPress: () => void }) {
  const hasLimit = card.limit > 0;
  const usedPercent = hasLimit ? Math.min(100, Math.round((card.outstanding / card.limit) * 100)) : 0;
  const cycle = card.closingDay && card.paymentDay
    ? `Fecha dia ${card.closingDay} · vence dia ${card.paymentDay}`
    : "Ciclo não configurado";
  const nextLine = [
    card.nextPaymentDate ? `Próximo pagamento ${money(card.nextPayment, hidden)} em ${card.nextPaymentDate}` : "Sem pagamento previsto",
    card.settlementAccount ? `conta ${card.settlementAccount}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <Pressable
      accessibilityLabel={`Ver faturas de ${card.name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.cardRow, !first && styles.rowDivided, pressed && styles.rowPressed]}
    >
      <View style={styles.cardRowTop}>
        <BankLogo institution={card.issuer} name={card.name} size={42} />
        <View style={styles.rowCopy}>
          <Text numberOfLines={1} style={styles.rowTitle}>{card.name}</Text>
          <Text numberOfLines={1} style={styles.rowMeta}>{cycle}</Text>
        </View>
        <View style={styles.rowTrailing}>
          <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={styles.rowAmount}>
            {money(card.currentStatement, hidden)}
          </Text>
          <Text style={styles.rowAmountLabel}>Fatura atual</Text>
        </View>
        <SymbolView name={icons.chevron} size={14} tintColor={nu.brand} weight="semibold" />
      </View>

      <View style={styles.cardUsage}>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: hidden ? "0%" : `${usedPercent}%` },
              usedPercent >= 90 && styles.fillDanger,
            ]}
          />
        </View>
        <View style={styles.usageRow}>
          <Text style={styles.usageText}>
            {hidden ? "••" : hasLimit ? `${usedPercent}% do limite` : "Limite não cadastrado"}
          </Text>
          {hasLimit ? (
            <Text style={styles.usageText}>{money(Math.max(card.limit - card.outstanding, 0), hidden)} disponível</Text>
          ) : null}
        </View>
        <Text numberOfLines={1} style={styles.cardNext}>{nextLine}</Text>
      </View>
    </Pressable>
  );
}

export function CardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("cards");
  const [hidden, setHidden] = useState(false);
  const [cardFilter, setCardFilter] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [methods, setMethods] = useState<CreditCardPaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const overview = useMemo(() => buildCardsOverview(methods, transactions), [methods, transactions]);
  const { cards, statements, next, used, limit } = overview;
  const nextCard = cards.find((card) => card.id === next?.cardId);

  const load = useCallback(async (refresh = false) => {
    if (!user) return;
    refresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const [loadedMethods, loadedTransactions] = await Promise.all([
        listPaymentMethods(user.token),
        listTransactions(user.token),
      ]);
      setMethods(loadedMethods);
      setTransactions(loadedTransactions);
      setCardFilter((current) => loadedMethods.some((method) => method.id === current) ? current : null);
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) {
        await logout();
        return;
      }
      setError("Não foi possível carregar seus cartões. Tente novamente.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, logout]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  // Light status-bar icons over the purple header, restored when leaving.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, []),
  );

  /** Jump straight from a card (or the next due date) to its statement, already open. */
  const openStatement = (statement: StatementView | null, filter: number | null) => {
    setCardFilter(filter);
    setExpanded(statement?.id ?? null);
    setTab("statements");
    scrollRef.current?.scrollTo({ animated: false, y: 0 });
  };

  if (!user) return null;

  const hasLimit = limit > 0;
  const usedPercent = hasLimit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const caption = loading
    ? "Carregando seus cartões…"
    : error
      ? "Crédito indisponível no momento"
      : hasLimit
        ? `Em uso ${money(used, hidden)} de ${money(limit, hidden)} · ${hidden ? "••" : `${usedPercent}%`}`
        : `${cards.length === 1 ? "1 cartão" : `${cards.length} cartões`} · limites não cadastrados`;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        ref={scrollRef}
        refreshControl={
          <RefreshControl
            colors={[nu.brand]}
            onRefresh={() => void load(true)}
            progressViewOffset={insets.top}
            refreshing={refreshing}
            tintColor={nu.white}
          />
        }
      >
        {/* Brand colour also fills the iOS overscroll area above the header. */}
        <View style={styles.overscrollFill} />

        <NuHeader contentHeight={HEADER_CONTENT_HEIGHT} onBack={() => router.back()} searchTransactions={transactions}>
          <View style={styles.headerTitleRow}>
            <Text numberOfLines={1} style={styles.headerTitle}>Cartões</Text>
            <Pressable
              accessibilityLabel={hidden ? "Mostrar valores" : "Ocultar valores"}
              accessibilityRole="button"
              accessibilityState={{ checked: hidden }}
              hitSlop={8}
              onPress={() => setHidden((current) => !current)}
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            >
              <SymbolView name={hidden ? icons.visible : icons.hidden} size={17} tintColor={nu.white} weight="semibold" />
            </Pressable>
          </View>

          <Text style={styles.totalLabel}>{hasLimit || loading ? "Crédito disponível" : "Crédito em uso"}</Text>
          {loading ? (
            <View style={styles.loadingValue}>
              <ActivityIndicator color={nu.white} />
            </View>
          ) : (
            <Text adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={1} style={styles.totalValue}>
              {error ? "—" : money(hasLimit ? Math.max(limit - used, 0) : used, hidden)}
            </Text>
          )}
          <Text numberOfLines={1} style={styles.totalCaption}>{caption}</Text>

          <View style={styles.tabsPanel}>
            <TabSwitch onChange={setTab} value={tab} />
          </View>
        </NuHeader>

        {/* White sheet: rounded top tucked over the purple header. */}
        <View style={styles.sheet}>
          {loading ? (
            <View style={styles.section}>
              <View style={styles.stateCard}>
                <ActivityIndicator color={nu.brand} />
                <Text style={styles.stateText}>Carregando cartões…</Text>
              </View>
            </View>
          ) : error ? (
            <View style={styles.section}>
              <View style={styles.stateCard}>
                <Text style={styles.stateTitle}>Cartões indisponíveis</Text>
                <Text style={styles.stateText}>{error}</Text>
                <Pressable onPress={() => void load()} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              </View>
            </View>
          ) : cards.length === 0 ? (
            <View style={styles.section}>
              <View style={styles.stateCard}>
                <View style={styles.emptyIcon}>
                  <SymbolView name={icons.card} size={22} tintColor={nu.brand} weight="semibold" />
                </View>
                <Text style={styles.stateTitle}>Nenhum cartão de crédito</Text>
                <Text style={styles.stateText}>Cadastre um cartão na versão web para acompanhar limites e faturas.</Text>
              </View>
            </View>
          ) : tab === "cards" ? (
            <View style={styles.section}>
              {next && nextCard ? (
                <NextDue card={nextCard} hidden={hidden} onPress={() => openStatement(next, null)} statement={next} />
              ) : null}

              <View style={[styles.sectionHeader, next && nextCard ? styles.sectionHeaderSpaced : null]}>
                <View style={styles.sectionCopy}>
                  <Text style={styles.sectionTitle}>Seus cartões</Text>
                  <Text style={styles.sectionSubtitle}>Toque em um cartão para abrir as faturas</Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{cards.length}</Text>
                </View>
              </View>

              <View style={styles.list}>
                {cards.map((card, index) => (
                  <CardRow
                    card={card}
                    first={index === 0}
                    hidden={hidden}
                    key={card.id}
                    onPress={() => openStatement(focusStatementFor(card.id, statements), card.id)}
                  />
                ))}
              </View>
            </View>
          ) : (
            <StatementsSection
              cardFilter={cardFilter}
              cards={cards}
              expanded={expanded}
              hidden={hidden}
              onFilter={setCardFilter}
              onToggle={(id) => setExpanded((current) => current === id ? null : id)}
              statements={statements}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: nu.white, flex: 1 },
  content: { paddingBottom: 42 },
  overscrollFill: { backgroundColor: nu.brand, height: 1000, left: 0, position: "absolute", right: 0, top: -1000 },
  pressed: { opacity: 0.7 },

  headerTitleRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  headerTitle: { color: nu.white, flex: 1, fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  headerButton: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
  totalLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 6 },
  loadingValue: { alignItems: "flex-start", height: 37, justifyContent: "center" },
  totalValue: { color: nu.white, fontSize: 31, fontWeight: "700", letterSpacing: -0.9, fontVariant: ["tabular-nums"] },
  totalCaption: { color: "rgba(255,255,255,0.75)", fontSize: 12 },

  tabsPanel: { marginTop: 12 },
  tabs: { backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 999, flexDirection: "row", padding: 3 },
  tab: { alignItems: "center", borderRadius: 999, flex: 1, justifyContent: "center", minHeight: 36, paddingHorizontal: 8 },
  tabSelected: { backgroundColor: nu.white, shadowColor: nu.ink, shadowOffset: { height: 1, width: 0 }, shadowOpacity: 0.12, shadowRadius: 4 },
  tabText: { color: "rgba(255,255,255,0.82)", fontSize: 13, fontWeight: "600" },
  tabTextSelected: { color: nu.brand, fontWeight: "700" },

  sheet: { backgroundColor: nu.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -NU_SHEET_OVERLAP, paddingTop: 4 },
  section: { paddingHorizontal: 20, paddingVertical: 18 },
  sectionHeader: { alignItems: "flex-start", flexDirection: "row", gap: 12, justifyContent: "space-between", marginBottom: 6 },
  sectionHeaderSpaced: { marginTop: 22 },
  sectionCopy: { flex: 1, minWidth: 0 },
  sectionTitle: nuSection.title,
  sectionSubtitle: nuSection.subtitle,
  pill: { backgroundColor: nu.brandTint, borderRadius: 999, minWidth: 30, paddingHorizontal: 11, paddingVertical: 5 },
  pillText: { color: nu.brand, fontSize: 12, fontWeight: "700", textAlign: "center" },

  nextDue: { alignItems: "center", backgroundColor: nu.surface, borderRadius: 16, flexDirection: "row", gap: 12, padding: 14 },
  nextDuePressed: { backgroundColor: nu.surfacePressed },
  nextDueIcon: { alignItems: "center", backgroundColor: nu.brandTint, borderRadius: 20, height: 40, justifyContent: "center", width: 40 },
  nextDueLabel: { color: nu.inkSoft, fontSize: 12 },
  nextDueName: { color: nu.ink, fontSize: 15, fontWeight: "700", marginTop: 2 },
  nextDueAmount: { color: nu.ink, fontSize: 16, fontWeight: "700", maxWidth: 130, fontVariant: ["tabular-nums"] },

  list: { borderBottomColor: nu.hairline, borderBottomWidth: 1, borderTopColor: nu.hairline, borderTopWidth: 1, marginTop: 8 },
  rowDivided: { borderTopColor: nu.hairline, borderTopWidth: 1 },
  rowPressed: { backgroundColor: "rgba(130,10,209,0.04)" },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: nu.ink, fontSize: 15, fontWeight: "700" },
  rowMeta: { color: nu.inkSoft, fontSize: 12, marginTop: 2 },
  rowTrailing: { alignItems: "flex-end", maxWidth: 130 },
  rowAmount: { color: nu.ink, fontSize: 15, fontWeight: "700", fontVariant: ["tabular-nums"] },
  rowAmountLabel: { color: nu.inkFaint, fontSize: 10, marginTop: 2 },

  cardRow: { paddingVertical: 14 },
  cardRowTop: { alignItems: "center", flexDirection: "row", gap: 12 },
  cardUsage: { marginLeft: 54, marginTop: 10 },
  track: { backgroundColor: nu.track, borderRadius: 3, height: 5, overflow: "hidden" },
  fill: { backgroundColor: nu.brand, borderRadius: 3, height: 5 },
  fillDanger: { backgroundColor: nu.negative },
  usageRow: { flexDirection: "row", gap: 8, justifyContent: "space-between", marginTop: 6 },
  usageText: { color: nu.inkSoft, fontSize: 11, fontVariant: ["tabular-nums"] },
  cardNext: { color: nu.inkFaint, fontSize: 11, marginTop: 4 },

  stateCard: { alignItems: "center", backgroundColor: nu.surface, borderRadius: 16, gap: 8, padding: 26 },
  stateTitle: { color: nu.ink, fontSize: 16, fontWeight: "600" },
  stateText: { color: nu.inkSoft, fontSize: 13, lineHeight: 19, textAlign: "center" },
  emptyIcon: { alignItems: "center", backgroundColor: nu.brandTint, borderRadius: 22, height: 44, justifyContent: "center", marginBottom: 4, width: 44 },
  retryButton: { backgroundColor: nu.brand, borderRadius: 999, marginTop: 6, paddingHorizontal: 20, paddingVertical: 11 },
  retryText: { color: nu.white, fontSize: 14, fontWeight: "600" },
});
