import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { nu } from "@/components/dashboard/nuTheme";
import { MerchantLogo } from "@/components/merchant/MerchantLogo";
import type { Transaction } from "@/types/finance";

const MAX_RESULTS = 60;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

function formatDate(transaction: Transaction) {
  const source = (transaction.transactionDate ?? transaction.dateTime).slice(0, 10);
  const [year, month, day] = source.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(year, month - 1, day),
  );
}

function normalise(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase();
}

/** Full-screen search over the transactions already loaded on the dashboard. */
export function TransactionSearchSheet({
  onClose,
  transactions,
  visible,
}: {
  onClose: () => void;
  transactions: Transaction[];
  visible: boolean;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const term = normalise(query.trim());
    if (!term) return [];
    return transactions
      .filter((transaction) =>
        [transaction.description, transaction.merchantName ?? "", transaction.category]
          .some((field) => normalise(field).includes(term)),
      )
      .sort((a, b) => (b.transactionDate ?? b.dateTime).localeCompare(a.transactionDate ?? a.dateTime))
      .slice(0, MAX_RESULTS);
  }, [query, transactions]);

  const close = () => {
    setQuery("");
    onClose();
  };

  return (
    <Modal animationType="slide" onRequestClose={close} presentationStyle="fullScreen" visible={visible}>
      <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
        <View style={styles.searchRow}>
          <View style={styles.inputWrap}>
            <SymbolView
              name={{ ios: "magnifyingglass", android: "search", web: "search" }}
              size={18}
              tintColor={nu.inkSoft}
            />
            <TextInput
              accessibilityLabel="Buscar transações"
              autoFocus
              clearButtonMode="while-editing"
              onChangeText={setQuery}
              placeholder="Buscar por descrição, loja ou categoria"
              placeholderTextColor={nu.inkFaint}
              returnKeyType="search"
              style={styles.input}
              value={query}
            />
          </View>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={close}>
            <Text style={styles.cancel}>Cancelar</Text>
          </Pressable>
        </View>

        <FlatList
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          data={results}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item, index) => String(item.id ?? `${item.description}-${index}`)}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {query.trim() ? "Nenhuma transação encontrada." : "Digite para buscar nas suas transações."}
            </Text>
          }
          renderItem={({ item, index }) => {
            const income = item.type === "INCOME";
            return (
              <View style={[styles.row, index > 0 && styles.rowDivided]}>
                <View style={styles.logo}>
                  <MerchantLogo
                    category={item.category}
                    domain={item.merchantDomain}
                    name={item.merchantName || item.description || item.category}
                    size={40}
                  />
                </View>
                <View style={styles.rowCopy}>
                  <Text numberOfLines={1} style={styles.rowTitle}>{item.description || item.category}</Text>
                  <Text numberOfLines={1} style={styles.rowMeta}>{item.category} · {formatDate(item)}</Text>
                </View>
                <Text style={[styles.amount, { color: income ? nu.positive : nu.ink }]}>
                  {income ? "+" : "−"}{formatCurrency(Number(item.amount))}
                </Text>
              </View>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: nu.white, flex: 1, paddingHorizontal: 20 },
  searchRow: { alignItems: "center", flexDirection: "row", gap: 12, marginBottom: 8 },
  inputWrap: { alignItems: "center", backgroundColor: nu.surface, borderRadius: 999, flex: 1, flexDirection: "row", gap: 8, paddingHorizontal: 14 },
  input: { color: nu.ink, flex: 1, fontSize: 15, minHeight: 44 },
  cancel: { color: nu.brand, fontSize: 15, fontWeight: "600" },
  empty: { color: nu.inkSoft, fontSize: 14, marginTop: 32, textAlign: "center" },
  row: { alignItems: "center", flexDirection: "row", minHeight: 66, paddingVertical: 10 },
  rowDivided: { borderTopColor: nu.hairline, borderTopWidth: 1 },
  logo: { marginRight: 12 },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: nu.ink, fontSize: 15, fontWeight: "600" },
  rowMeta: { color: nu.inkSoft, fontSize: 12, marginTop: 3 },
  amount: { fontSize: 14, fontWeight: "700", marginLeft: 8, fontVariant: ["tabular-nums"] },
});
