import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BankLogo } from "@/components/accounts/BankLogo";
import { MerchantLogo } from "@/components/merchant/MerchantLogo";
import { colors } from "@/theme/colors";
import type { CardView, StatementView } from "./CardsScreen";

interface Props {
  cards: CardView[];
  allStatements: StatementView[];
  cardFilter: number | null;
  expanded: string | null;
  hidden: boolean;
  onFilter: (id: number | null) => void;
  onToggle: (id: string) => void;
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "GBP" });
const fullDate = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" });
const money = (value: number, hidden: boolean) => hidden ? "••••••" : currency.format(value);
const chevron = { ios: "chevron.down", android: "keyboard_arrow_down", web: "keyboard_arrow_down" } as const;

function StatementRow({ card, statement, expanded, hidden, onToggle }: {
  card: CardView; statement: StatementView; expanded: boolean; hidden: boolean; onToggle: () => void;
}) {
  const purchasesByDay = new Map<string, StatementView["transactions"]>();
  for (const purchase of statement.transactions) {
    const list = purchasesByDay.get(purchase.date) ?? [];
    list.push(purchase);
    purchasesByDay.set(purchase.date, list);
  }
  return (
    <View style={[styles.statement, expanded && styles.statementExpanded]}>
      <Pressable accessibilityRole="button" accessibilityLabel={statement.label + ", " + card.name} accessibilityState={{ expanded }} onPress={onToggle} style={({ pressed }) => [styles.statementButton, pressed && styles.pressed]}>
        <View style={styles.identityRow}>
          <BankLogo institution={card.issuer} name={card.name} size={32} />
          <Text numberOfLines={1} style={styles.cardName}>{card.name}</Text>
          <Text style={[styles.status, statement.status === "Aberta" && styles.statusOpen, statement.status === "Próxima" && styles.statusFuture]}>{statement.status}</Text>
        </View>
        <Text style={styles.month}>{statement.label.replace("Fatura de ", "")}</Text>
        <View style={styles.amountRow}>
          <Text adjustsFontSizeToFit minimumFontScale={0.65} numberOfLines={1} style={styles.amount}>{money(statement.total, hidden)}</Text>
          <View style={[styles.expandIcon, expanded && styles.expandIconActive]}>
            <SymbolView name={chevron} size={17} tintColor={expanded ? colors.white : colors.forest} style={expanded ? { transform: [{ rotate: "180deg" }] } : undefined} />
          </View>
        </View>
        <View style={styles.metadata}>
          <Text style={styles.due}>Vence <Text style={styles.dueStrong}>{fullDate.format(statement.paymentTimestamp)}</Text></Text>
          <Text style={styles.purchaseCount}>{statement.transactions.length} {statement.transactions.length === 1 ? "compra" : "compras"}</Text>
        </View>
      </Pressable>
      {expanded ? (
        <View style={styles.details}>
          <View style={styles.period}>
            <Text style={styles.smallLabel}>CICLO DA FATURA</Text>
            <Text style={styles.periodText}>{statement.period}</Text>
          </View>
          <Text style={styles.purchasesTitle}>Compras desta fatura</Text>
          {[...purchasesByDay].map(([date, purchases]) => (
            <View key={date}>
              <Text style={styles.dayLabel}>{date}</Text>
              {purchases.map((purchase) => (
                <View style={styles.purchase} key={purchase.id}>
                  <MerchantLogo
                    domain={purchase.merchantDomain}
                    name={purchase.merchantName || purchase.description}
                    size={34}
                    fallbackMode="none"
                  />
                  <View style={styles.purchaseCopy}><Text numberOfLines={2} style={styles.purchaseName}>{purchase.description}</Text><Text style={styles.purchaseCategory}>{purchase.category}</Text></View>
                  <Text style={styles.purchaseAmount}>{money(purchase.amount, hidden)}</Text>
                </View>
              ))}
            </View>
          ))}
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Total da fatura</Text><Text style={styles.totalValue}>{money(statement.total, hidden)}</Text></View>
        </View>
      ) : null}
    </View>
  );
}

export function StatementsSection({ cards, allStatements, cardFilter, expanded, hidden, onFilter, onToggle }: Props) {
  const [view, setView] = useState<"current" | "history">(() => {
    const target = allStatements.find((statement) => statement.id === expanded);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return target && target.paymentTimestamp < today ? "history" : "current";
  });
  const [historyLimit, setHistoryLimit] = useState(8);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const filtered = allStatements.filter((statement) => cardFilter === null || statement.cardId === cardFilter);
  const current = filtered.filter((statement) => statement.paymentTimestamp >= today).sort((a, b) => a.paymentTimestamp - b.paymentTimestamp || a.cardId - b.cardId);
  const history = filtered.filter((statement) => statement.paymentTimestamp < today).sort((a, b) => b.paymentTimestamp - a.paymentTimestamp || a.cardId - b.cardId);
  const groups: Array<{ title: string; description: string; statements: StatementView[] }> = view === "current" ? [
    { title: "Fechadas a vencer", description: "Ciclo encerrado, vencimento pela frente", statements: current.filter((statement) => statement.status === "Fechada") },
    { title: "Em aberto", description: "Compras do ciclo atual", statements: current.filter((statement) => statement.status === "Aberta") },
    { title: "Próximos ciclos", description: "Lançamentos de faturas futuras", statements: current.filter((statement) => statement.status === "Próxima") },
  ] : [{ title: "Faturas anteriores", description: "Vencimentos passados, mais recentes primeiro", statements: history.slice(0, historyLimit) }];
  const next = current[0];
  const selectedCard = cards.find((card) => card.id === cardFilter);

  return (
    <View>
      <View style={styles.summary}>
        <View style={styles.summaryHeading}><Text style={styles.smallLabel}>ACOMPANHAMENTO DE FATURAS</Text><SymbolView name={{ ios: "doc.text", android: "receipt_long", web: "receipt_long" }} size={19} tintColor={colors.forest} /></View>
        <Text style={styles.summaryTitle}>{selectedCard?.name ?? "Todos os seus cartões"}</Text>
        <View style={styles.summaryMetrics}>
          <View style={styles.summaryMetric}><Text style={styles.metricLabel}>FATURAS A VENCER</Text><Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={styles.metricValue}>{money(current.reduce((sum, statement) => sum + statement.total, 0), hidden)}</Text><Text style={styles.metricNote}>{current.length} {current.length === 1 ? "fatura" : "faturas"}</Text></View>
          <View style={[styles.summaryMetric, styles.nextMetric]}><Text style={styles.metricLabel}>PRÓXIMO VENCIMENTO</Text><Text style={styles.dateValue}>{next ? next.dueDate : "—"}</Text><Text style={styles.metricNote}>{next ? money(next.total, hidden) : "Nada programado"}</Text></View>
        </View>
      </View>
      <Text style={styles.filterLabel}>FILTRAR POR CARTÃO</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <Pressable accessibilityRole="radio" accessibilityState={{ checked: cardFilter === null }} onPress={() => { onFilter(null); setHistoryLimit(8); }} style={[styles.filter, cardFilter === null && styles.filterSelected]}><Text style={[styles.filterText, cardFilter === null && styles.filterTextSelected]}>Todos os cartões</Text></Pressable>
        {cards.map((card) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: cardFilter === card.id }} onPress={() => { onFilter(card.id); setHistoryLimit(8); }} key={card.id} style={[styles.filter, cardFilter === card.id && styles.filterSelected]}><BankLogo institution={card.issuer} name={card.name} size={24} /><Text style={[styles.filterText, cardFilter === card.id && styles.filterTextSelected]}>{card.name}</Text></Pressable>)}
      </ScrollView>
      <View accessibilityRole="tablist" style={styles.viewTabs}>
        {[{ id: "current" as const, label: "Atuais", count: current.length }, { id: "history" as const, label: "Histórico", count: history.length }].map((tab) => <Pressable accessibilityRole="tab" accessibilityState={{ selected: view === tab.id }} key={tab.id} onPress={() => setView(tab.id)} style={[styles.viewTab, view === tab.id && styles.viewTabSelected]}><Text style={[styles.viewTabText, view === tab.id && styles.viewTabTextSelected]}>{tab.label}</Text><Text style={styles.tabCount}>{tab.count}</Text></Pressable>)}
      </View>
      {groups.filter((group) => group.statements.length > 0).map((group) => (
        <View key={group.title} style={styles.group}>
          <View style={styles.groupHeading}><Text style={styles.groupTitle}>{group.title}</Text><Text style={styles.groupCount}>{view === "history" ? history.length : group.statements.length}</Text></View>
          <Text style={styles.groupDescription}>{group.description}</Text>
          <View style={styles.list}>{group.statements.map((statement) => {
            const card = cards.find((item) => item.id === statement.cardId);
            return card ? <StatementRow key={statement.id} card={card} statement={statement} hidden={hidden} expanded={expanded === statement.id} onToggle={() => onToggle(statement.id)} /> : null;
          })}</View>
        </View>
      ))}
      {(view === "current" ? current : history).length === 0 ? <View style={styles.empty}><SymbolView name={{ ios: "doc.text", android: "receipt_long", web: "receipt_long" }} size={28} tintColor={colors.inkFaint} /><Text style={styles.emptyTitle}>{view === "current" ? "Tudo em dia por aqui" : "Ainda sem histórico"}</Text><Text style={styles.emptyText}>{view === "current" ? "Nenhuma fatura com vencimento a partir de hoje neste filtro." : "As faturas com vencimentos anteriores aparecerão aqui."}</Text></View> : null}
      {view === "history" && history.length > historyLimit ? <Pressable accessibilityRole="button" onPress={() => setHistoryLimit((limit) => limit + 8)} style={styles.loadMore}><Text style={styles.loadMoreText}>Ver mais faturas · {history.length - historyLimit} restantes</Text></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { backgroundColor: "#E4EBE6", borderWidth: 1, borderColor: "#CED9D1", borderRadius: 23, padding: 17 },
  summaryHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  smallLabel: { color: colors.forest, fontSize: 8, fontWeight: "800", letterSpacing: 1.2 },
  summaryTitle: { color: colors.ink, fontSize: 19, fontWeight: "700", marginTop: 7 },
  summaryMetrics: { flexDirection: "row", marginTop: 18 },
  summaryMetric: { flex: 1, minWidth: 0 },
  nextMetric: { borderLeftColor: "#C8D4CC", borderLeftWidth: 1, paddingLeft: 14, marginLeft: 12 },
  metricLabel: { color: colors.inkFaint, fontSize: 7, fontWeight: "800", letterSpacing: 0.7 },
  metricValue: { color: colors.ink, fontSize: 23, fontWeight: "800", letterSpacing: -0.8, marginTop: 7, fontVariant: ["tabular-nums"] },
  dateValue: { color: colors.forest, fontSize: 23, fontWeight: "700", marginTop: 7 },
  metricNote: { color: colors.inkSoft, fontSize: 10, marginTop: 5 },
  filterLabel: { color: colors.inkFaint, fontSize: 8, fontWeight: "800", letterSpacing: 1.2, marginTop: 20, marginBottom: 9 },
  filters: { gap: 7, paddingBottom: 4 },
  filter: { flexDirection: "row", gap: 7, alignItems: "center", borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paperRaised, borderRadius: 13, paddingHorizontal: 11, minHeight: 42 },
  filterSelected: { borderColor: colors.forest, backgroundColor: colors.header },
  filterText: { color: colors.inkSoft, fontSize: 11, fontWeight: "600" },
  filterTextSelected: { color: colors.forest, fontWeight: "800" },
  viewTabs: { flexDirection: "row", borderBottomColor: colors.line, borderBottomWidth: 1, marginTop: 16 },
  viewTab: { flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, minHeight: 45, borderBottomWidth: 2, borderBottomColor: "transparent" },
  viewTabSelected: { borderBottomColor: colors.forest },
  viewTabText: { color: colors.inkFaint, fontSize: 13, fontWeight: "600" },
  viewTabTextSelected: { color: colors.forest, fontWeight: "800" },
  tabCount: { color: colors.inkSoft, fontSize: 9, backgroundColor: colors.paperMuted, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3, overflow: "hidden" },
  group: { marginTop: 21 },
  groupHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  groupTitle: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  groupCount: { color: colors.inkFaint, fontSize: 10, fontWeight: "700" },
  groupDescription: { color: colors.inkFaint, fontSize: 10, marginTop: 4, marginBottom: 11 },
  list: { gap: 10 },
  statement: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paperRaised, borderRadius: 21, overflow: "hidden" },
  statementExpanded: { borderColor: "#7F9F9F" },
  statementButton: { padding: 15 },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  cardName: { flex: 1, color: colors.inkSoft, fontSize: 11, fontWeight: "700", minWidth: 0 },
  status: { backgroundColor: colors.paperMuted, color: colors.inkSoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, overflow: "hidden", fontSize: 9, fontWeight: "800" },
  statusOpen: { backgroundColor: colors.incomeTint, color: colors.income },
  statusFuture: { backgroundColor: "#EFE9D8", color: colors.gold },
  month: { color: colors.ink, fontSize: 17, fontWeight: "700", marginTop: 14, textTransform: "capitalize" },
  amountRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 5 },
  amount: { flex: 1, color: colors.ink, fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontVariant: ["tabular-nums"] },
  expandIcon: { backgroundColor: colors.header, width: 32, height: 32, borderRadius: 11, justifyContent: "center", alignItems: "center" },
  expandIconActive: { backgroundColor: colors.forest },
  metadata: { borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 13, paddingTop: 10, flexDirection: "row", justifyContent: "space-between", gap: 8, flexWrap: "wrap" },
  due: { color: colors.inkFaint, fontSize: 10 },
  dueStrong: { color: colors.inkSoft, fontWeight: "700" },
  purchaseCount: { color: colors.inkFaint, fontSize: 10 },
  details: { borderTopColor: colors.line, borderTopWidth: 1, backgroundColor: "#F5F5EF", padding: 15 },
  period: { flexDirection: "row", justifyContent: "space-between", gap: 8, flexWrap: "wrap" },
  periodText: { color: colors.inkSoft, fontSize: 10 },
  purchasesTitle: { color: colors.ink, fontSize: 13, fontWeight: "800", marginTop: 19 },
  dayLabel: { color: colors.inkFaint, fontSize: 9, fontWeight: "800", marginTop: 14, marginBottom: 4 },
  purchase: { flexDirection: "row", alignItems: "center", columnGap: 9, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  purchaseCopy: { flex: 1, minWidth: 0 },
  purchaseName: { color: colors.ink, fontSize: 12, fontWeight: "600" },
  purchaseCategory: { color: colors.inkFaint, fontSize: 9, marginTop: 4 },
  purchaseAmount: { color: colors.ink, fontSize: 12, fontWeight: "800", fontVariant: ["tabular-nums"] },
  totalRow: { flexDirection: "row", justifyContent: "space-between", gap: 9, paddingTop: 16 },
  totalLabel: { color: colors.inkSoft, fontSize: 11, fontWeight: "700" },
  totalValue: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  empty: { alignItems: "center", padding: 28, marginTop: 18, backgroundColor: colors.paperRaised, borderRadius: 19, borderColor: colors.line, borderWidth: 1 },
  emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: "700", marginTop: 11 },
  emptyText: { color: colors.inkSoft, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 6 },
  loadMore: { alignItems: "center", padding: 15, marginTop: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 14 },
  loadMoreText: { color: colors.forest, fontSize: 11, fontWeight: "800" },
  pressed: { opacity: 0.7 },
});
