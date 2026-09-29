import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { categories, categoryIcons, categoryPalette, categoryTones } from "@/features/household/householdCategories";
import { expenseDateLabel, getExpenseAttachmentCount, getExpenseShare } from "@/features/household/expenseHistory";
import { colors } from "@/theme/colors";
import type { HouseholdExpense } from "@/types/household";

export function HouseholdExpenseRow({ expense, currency, currentMemberId, onOpenAttachments, twoTone = false }: {
  expense: HouseholdExpense;
  currency: string;
  currentMemberId: number;
  onOpenAttachments: (expense: HouseholdExpense) => void;
  twoTone?: boolean;
}) {
  const category = categories.find((item) => item.value === expense.category);
  const key = category?.value ?? "Other";
  const tone = categoryPalette[categoryTones[key]];
  const currencyFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency });
  const amount = currencyFormat.format(expense.amount);
  const share = getExpenseShare(expense, currentMemberId);
  const shareLabel = share === undefined ? "Parte indisponível" : share === null ? "Não participa" : `Sua parte: ${currencyFormat.format(share)}`;
  const date = expenseDateLabel(expense.expenseDate);
  const attachmentCount = getExpenseAttachmentCount(expense);
  const proofLabel = attachmentCount > 0 ? `${attachmentCount} ${attachmentCount === 1 ? "comprovante" : "comprovantes"}.` : "";

  return (
    <Pressable
      accessible
      accessibilityRole={attachmentCount > 0 ? "button" : undefined}
      accessibilityHint={attachmentCount > 0 ? "Abre as imagens dos comprovantes" : undefined}
      accessibilityLabel={`${category?.label ?? expense.category}. ${expense.description}. Total: ${amount}. ${shareLabel}. Pago por ${expense.payerName}. ${date}. ${proofLabel}`}
      disabled={attachmentCount === 0}
      onPress={() => onOpenAttachments(expense)}
      style={({ pressed }) => [styles.card, twoTone && styles.twoToneCard, pressed && styles.pressed]}
    >
      {twoTone ? <View pointerEvents="none" style={styles.offWhiteTone} /> : null}
      <View style={[styles.icon, { backgroundColor: tone.background }]}>
        <SymbolView name={categoryIcons[key]} size={19} tintColor={tone.ink} />
      </View>
      <View style={styles.copy}>
        <View style={styles.categoryRow}>
          <Text numberOfLines={1} style={styles.category}>{category?.label ?? expense.category}</Text>
          {attachmentCount > 0 ? (
            <View style={styles.proofBadge}>
              <SymbolView name={{ ios: "paperclip", android: "attach_file", web: "attach_file" }} size={10} tintColor={colors.income} />
              <Text style={styles.proofCount}>{attachmentCount}</Text>
            </View>
          ) : null}
        </View>
        {expense.description ? <Text numberOfLines={1} style={styles.description}>{expense.description}</Text> : null}
        <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.share}>{shareLabel}</Text>
      </View>
      <View style={styles.details}>
        <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.amount}>{amount}</Text>
        <Text numberOfLines={1} style={styles.payer}>Pago por <Text style={styles.payerName}>{expense.payerName}</Text></Text>
        <Text numberOfLines={1} style={styles.date}>{date}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { position: "relative", overflow: "hidden", alignItems: "center", flexDirection: "row", gap: 9, backgroundColor: "#FFFEFA", borderColor: "#E2E6DB", borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 7 },
  twoToneCard: { backgroundColor: "#FFFFFF" },
  offWhiteTone: { position: "absolute", top: 0, right: 0, bottom: 0, width: "43%", backgroundColor: "#F7F3EA", borderTopLeftRadius: 999, borderBottomLeftRadius: 999 },
  pressed: { backgroundColor: "#EDF3E6" },
  icon: { alignItems: "center", justifyContent: "center", flexShrink: 0, height: 34, width: 34, borderRadius: 11 },
  copy: { flex: 1, minWidth: 0 },
  details: { flex: 1.1, minWidth: 0 },
  category: { color: colors.ink, fontSize: 13, fontWeight: "700", flexShrink: 1 },
  categoryRow: { alignItems: "center", flexDirection: "row", gap: 5 },
  proofBadge: { alignItems: "center", flexDirection: "row", flexShrink: 0, gap: 2, backgroundColor: "#E5EDDC", borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2 },
  proofCount: { color: colors.income, fontSize: 9, fontWeight: "700" },
  amount: { color: colors.ink, fontSize: 14, fontWeight: "800", textAlign: "right" },
  description: { color: colors.inkSoft, fontSize: 11, lineHeight: 15, marginTop: 3 },
  share: { color: colors.income, fontSize: 10, fontWeight: "600", lineHeight: 14, marginTop: 3 },
  payer: { color: colors.inkSoft, fontSize: 10, lineHeight: 14, marginTop: 2, textAlign: "right" },
  payerName: { color: colors.income, fontSize: 12, fontWeight: "800" },
  date: { color: colors.inkFaint, fontSize: 10, lineHeight: 13, marginTop: 1, textAlign: "right" },
});
