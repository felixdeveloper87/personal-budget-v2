import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BankLogo } from "@/components/accounts/BankLogo";
import { nu, nuSection } from "@/components/dashboard/nuTheme";
import { MerchantLogo } from "@/components/merchant/MerchantLogo";

import { startOfTodayTimestamp, type CardView, type StatementView } from "./cardViews";

interface Props {
  cards: CardView[];
  statements: StatementView[];
  cardFilter: number | null;
  expanded: string | null;
  hidden: boolean;
  onFilter: (id: number | null) => void;
  onToggle: (id: string) => void;
}

const HISTORY_PAGE = 6;
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "GBP" });
const money = (value: number, hidden: boolean) => hidden ? "••••••" : currency.format(value);
const purchaseCount = (count: number) => count === 1 ? "1 compra" : `${count} compras`;
const icons = {
  chevron: { ios: "chevron.down", android: "keyboard_arrow_down", web: "keyboard_arrow_down" },
  receipt: { ios: "doc.text", android: "receipt_long", web: "receipt_long" },
} as const;

function StatementDetails({ statement, hidden }: { statement: StatementView; hidden: boolean }) {
  const byDay = new Map<string, StatementView["purchases"]>();
  for (const purchase of statement.purchases) {
    const list = byDay.get(purchase.date) ?? [];
    list.push(purchase);
    byDay.set(purchase.date, list);
  }
  return (
    <View style={styles.details}>
      <View style={styles.detailsRow}>
        <Text style={styles.detailsLabel}>Ciclo</Text>
        <Text style={styles.detailsValue}>{statement.period}</Text>
      </View>
      {[...byDay].map(([date, purchases]) => (
        <View key={date}>
          <Text style={styles.dayLabel}>{date.toLocaleUpperCase("pt-BR")}</Text>
          {purchases.map((purchase) => (
            <View key={purchase.id} style={styles.purchase}>
              <MerchantLogo
                domain={purchase.merchantDomain}
                fallbackMode="none"
                name={purchase.merchantName || purchase.description}
                size={32}
              />
              <View style={styles.purchaseCopy}>
                <Text numberOfLines={2} style={styles.purchaseName}>{purchase.description}</Text>
                <Text numberOfLines={1} style={styles.purchaseCategory}>{purchase.category}</Text>
              </View>
              <Text style={styles.purchaseAmount}>{money(purchase.amount, hidden)}</Text>
            </View>
          ))}
        </View>
      ))}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total da fatura</Text>
        <Text style={styles.totalValue}>{money(statement.total, hidden)}</Text>
      </View>
    </View>
  );
}

function StatementRow({ card, statement, expanded, first, hidden, showCard, onToggle }: {
  card: CardView;
  statement: StatementView;
  expanded: boolean;
  first: boolean;
  hidden: boolean;
  showCard: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={!first && styles.rowDivided}>
      <Pressable
        accessibilityLabel={`Fatura de ${statement.month}, ${card.name}`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        <BankLogo institution={card.issuer} name={card.name} size={40} />
        <View style={styles.rowCopy}>
          <Text numberOfLines={1} style={styles.rowTitle}>{statement.month}</Text>
          <Text numberOfLines={1} style={styles.rowMeta}>
            {showCard ? `${card.name} · vence ${statement.dueDate}` : `Vence ${statement.dueDate}`}
          </Text>
        </View>
        <View style={styles.rowTrailing}>
          <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={styles.rowAmount}>
            {money(statement.total, hidden)}
          </Text>
          <Text style={styles.rowAmountLabel}>{purchaseCount(statement.purchases.length)}</Text>
        </View>
        <SymbolView
          name={icons.chevron}
          size={15}
          style={expanded ? styles.chevronOpen : undefined}
          tintColor={nu.brand}
          weight="semibold"
        />
      </Pressable>
      {expanded ? <StatementDetails hidden={hidden} statement={statement} /> : null}
    </View>
  );
}

export function StatementsSection({ cards, statements, cardFilter, expanded, hidden, onFilter, onToggle }: Props) {
  const [historyLimit, setHistoryLimit] = useState(HISTORY_PAGE);
  const today = startOfTodayTimestamp();
  const filtered = statements.filter((statement) => cardFilter === null || statement.cardId === cardFilter);
  const due = filtered
    .filter((statement) => statement.paymentTimestamp >= today)
    .sort((a, b) => a.paymentTimestamp - b.paymentTimestamp || a.cardId - b.cardId);
  const history = filtered
    .filter((statement) => statement.paymentTimestamp < today)
    .sort((a, b) => b.paymentTimestamp - a.paymentTimestamp || a.cardId - b.cardId);
  const next = due[0];
  const nextCard = cards.find((card) => card.id === next?.cardId);

  // One scroll, no sub-tabs: what's due comes first, history closes the list.
  const groups = [
    { key: "closed", title: "A pagar", subtitle: "Ciclo encerrado, vencimento pela frente", items: due.filter((s) => s.status === "closed") },
    { key: "open", title: "Em aberto", subtitle: "Compras do ciclo atual", items: due.filter((s) => s.status === "open") },
    { key: "upcoming", title: "Próximos ciclos", subtitle: "Parcelas já lançadas em faturas futuras", items: due.filter((s) => s.status === "upcoming") },
    { key: "history", title: "Anteriores", subtitle: "Vencimentos passados, mais recentes primeiro", items: history.slice(0, historyLimit), total: history.length },
  ].filter((group) => group.items.length > 0);

  const selectFilter = (id: number | null) => {
    onFilter(id);
    setHistoryLimit(HISTORY_PAGE);
  };

  return (
    <View>
      <View style={styles.section}>
        <View style={styles.summary}>
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryLabel}>A vencer</Text>
            <Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.summaryValue}>
              {money(due.reduce((sum, statement) => sum + statement.total, 0), hidden)}
            </Text>
            <Text style={styles.summaryNote}>{due.length === 1 ? "1 fatura" : `${due.length} faturas`}</Text>
          </View>
          <View style={[styles.summaryMetric, styles.summaryDivided]}>
            <Text style={styles.summaryLabel}>Próximo vencimento</Text>
            <Text numberOfLines={1} style={styles.summaryValue}>{next ? next.dueDate : "—"}</Text>
            <Text numberOfLines={1} style={styles.summaryNote}>
              {next && nextCard ? `${nextCard.name} · ${money(next.total, hidden)}` : "Nada programado"}
            </Text>
          </View>
        </View>

        {cards.length > 1 ? (
          <ScrollView
            contentContainerStyle={styles.filters}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: cardFilter === null }}
              onPress={() => selectFilter(null)}
              style={({ pressed }) => [styles.filter, cardFilter === null && styles.filterSelected, pressed && styles.pressed]}
            >
              <Text style={[styles.filterText, cardFilter === null && styles.filterTextSelected]}>Todos</Text>
            </Pressable>
            {cards.map((card) => {
              const selected = cardFilter === card.id;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  key={card.id}
                  onPress={() => selectFilter(card.id)}
                  style={({ pressed }) => [styles.filter, selected && styles.filterSelected, pressed && styles.pressed]}
                >
                  <BankLogo institution={card.issuer} name={card.name} size={20} />
                  <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{card.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}
      </View>

      {groups.length === 0 ? (
        <View style={styles.section}>
          <View style={styles.stateCard}>
            <View style={styles.emptyIcon}>
              <SymbolView name={icons.receipt} size={22} tintColor={nu.brand} weight="semibold" />
            </View>
            <Text style={styles.stateTitle}>Nenhuma fatura</Text>
            <Text style={styles.stateText}>As compras feitas neste cartão aparecem aqui, agrupadas por fatura.</Text>
          </View>
        </View>
      ) : null}

      {groups.map((group) => (
        <View key={group.key} style={[styles.section, styles.sectionDivided]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>{group.title}</Text>
              <Text style={styles.sectionSubtitle}>{group.subtitle}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{group.total ?? group.items.length}</Text>
            </View>
          </View>
          <View style={styles.list}>
            {group.items.map((statement, index) => {
              const card = cards.find((item) => item.id === statement.cardId);
              return card ? (
                <StatementRow
                  card={card}
                  expanded={expanded === statement.id}
                  first={index === 0}
                  hidden={hidden}
                  key={statement.id}
                  onToggle={() => onToggle(statement.id)}
                  showCard={cardFilter === null && cards.length > 1}
                  statement={statement}
                />
              ) : null;
            })}
          </View>
          {group.key === "history" && history.length > historyLimit ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setHistoryLimit((limit) => limit + HISTORY_PAGE)}
              style={({ pressed }) => [styles.loadMore, pressed && styles.pressed]}
            >
              <Text style={styles.loadMoreText}>Ver mais · {history.length - historyLimit} restantes</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, paddingVertical: 18 },
  sectionDivided: { borderTopColor: nu.hairline, borderTopWidth: 1 },
  sectionHeader: { alignItems: "flex-start", flexDirection: "row", gap: 12, justifyContent: "space-between", marginBottom: 6 },
  sectionCopy: { flex: 1, minWidth: 0 },
  sectionTitle: nuSection.title,
  sectionSubtitle: nuSection.subtitle,
  pill: { backgroundColor: nu.brandTint, borderRadius: 999, minWidth: 30, paddingHorizontal: 11, paddingVertical: 5 },
  pillText: { color: nu.brand, fontSize: 12, fontWeight: "700", textAlign: "center" },
  pressed: { opacity: 0.7 },

  summary: { backgroundColor: nu.surface, borderRadius: 16, flexDirection: "row", padding: 16 },
  summaryMetric: { flex: 1, minWidth: 0 },
  summaryDivided: { borderLeftColor: nu.track, borderLeftWidth: 1, marginLeft: 14, paddingLeft: 14 },
  summaryLabel: { color: nu.inkSoft, fontSize: 12 },
  summaryValue: { color: nu.ink, fontSize: 20, fontWeight: "700", letterSpacing: -0.4, marginTop: 4, fontVariant: ["tabular-nums"] },
  summaryNote: { color: nu.inkFaint, fontSize: 11, marginTop: 2 },

  filtersScroll: { marginHorizontal: -20, marginTop: 14 },
  filters: { gap: 8, paddingHorizontal: 20 },
  filter: { alignItems: "center", borderColor: nu.track, borderRadius: 999, borderWidth: 1, flexDirection: "row", gap: 7, minHeight: 36, paddingHorizontal: 14 },
  filterSelected: { backgroundColor: nu.brand, borderColor: nu.brand },
  filterText: { color: nu.inkSoft, fontSize: 13, fontWeight: "600" },
  filterTextSelected: { color: nu.white },

  list: { borderBottomColor: nu.hairline, borderBottomWidth: 1, borderTopColor: nu.hairline, borderTopWidth: 1, marginTop: 8 },
  rowDivided: { borderTopColor: nu.hairline, borderTopWidth: 1 },
  row: { alignItems: "center", flexDirection: "row", gap: 12, minHeight: 70, paddingVertical: 12 },
  rowPressed: { backgroundColor: "rgba(130,10,209,0.04)" },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: nu.ink, fontSize: 15, fontWeight: "700" },
  rowMeta: { color: nu.inkSoft, fontSize: 12, marginTop: 2 },
  rowTrailing: { alignItems: "flex-end", maxWidth: 130 },
  rowAmount: { color: nu.ink, fontSize: 15, fontWeight: "700", fontVariant: ["tabular-nums"] },
  rowAmountLabel: { color: nu.inkFaint, fontSize: 10, marginTop: 2 },
  chevronOpen: { transform: [{ rotate: "180deg" }] },

  details: { backgroundColor: nu.surface, borderRadius: 16, marginBottom: 12, padding: 14 },
  detailsRow: { flexDirection: "row", gap: 8, justifyContent: "space-between" },
  detailsLabel: { color: nu.inkSoft, fontSize: 12 },
  detailsValue: { color: nu.ink, fontSize: 12, fontWeight: "600" },
  dayLabel: { color: nu.inkFaint, fontSize: 10, fontWeight: "700", letterSpacing: 0.6, marginBottom: 2, marginTop: 14 },
  purchase: { alignItems: "center", borderBottomColor: nu.track, borderBottomWidth: StyleSheet.hairlineWidth, columnGap: 10, flexDirection: "row", paddingVertical: 9 },
  purchaseCopy: { flex: 1, minWidth: 0 },
  purchaseName: { color: nu.ink, fontSize: 13, fontWeight: "600" },
  purchaseCategory: { color: nu.inkFaint, fontSize: 11, marginTop: 2 },
  purchaseAmount: { color: nu.ink, fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] },
  totalRow: { flexDirection: "row", gap: 8, justifyContent: "space-between", paddingTop: 14 },
  totalLabel: { color: nu.inkSoft, fontSize: 13, fontWeight: "600" },
  totalValue: { color: nu.ink, fontSize: 14, fontWeight: "700", fontVariant: ["tabular-nums"] },

  loadMore: { alignItems: "center", backgroundColor: nu.surface, borderRadius: 999, marginTop: 14, paddingVertical: 12 },
  loadMoreText: { color: nu.brand, fontSize: 13, fontWeight: "700" },

  stateCard: { alignItems: "center", backgroundColor: nu.surface, borderRadius: 16, gap: 8, padding: 26 },
  stateTitle: { color: nu.ink, fontSize: 16, fontWeight: "600" },
  stateText: { color: nu.inkSoft, fontSize: 13, lineHeight: 19, textAlign: "center" },
  emptyIcon: { alignItems: "center", backgroundColor: nu.brandTint, borderRadius: 22, height: 44, justifyContent: "center", marginBottom: 4, width: 44 },
});
