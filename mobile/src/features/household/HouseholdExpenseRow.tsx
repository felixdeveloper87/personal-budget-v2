import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HouseholdCategoryIcon } from "@/features/household/HouseholdCategoryIcon";
import { categories, categoryPalette, categoryTones } from "@/features/household/householdCategories";
import { expenseDateLabel, getExpenseAttachmentCount, getExpenseShare } from "@/features/household/expenseHistory";
import { nu } from "@/components/dashboard/nuTheme";
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
      <View style={[styles.icon, { backgroundColor: tone.background }]}>
        <HouseholdCategoryIcon category={key} size={19} color={tone.ink} />
      </View>
      <View style={styles.copy}>
        <View style={styles.categoryRow}>
          <Text numberOfLines={1} style={styles.category}>{category?.label ?? expense.category}</Text>
          {attachmentCount > 0 ? (
            <View style={styles.proofBadge}>
              <SymbolView name={{ ios: "paperclip", android: "attach_file", web: "attach_file" }} size={10} tintColor={nu.brand} />
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
  card: { position: "relative", overflow: "hidden", alignItems: "center", flexDirection: "row", gap: 10, backgroundColor: nu.surface, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 8 },
  twoToneCard: {},
  pressed: { backgroundColor: nu.surfacePressed },
  icon: { alignItems: "center", justifyContent: "center", flexShrink: 0, height: 38, width: 38, borderRadius: 19 },
  copy: { flex: 1, minWidth: 0 },
  details: { flex: 1.1, minWidth: 0 },
  category: { color: nu.ink, fontSize: 14, fontWeight: "600", flexShrink: 1 },
  categoryRow: { alignItems: "center", flexDirection: "row", gap: 5 },
  proofBadge: { alignItems: "center", flexDirection: "row", flexShrink: 0, gap: 2, backgroundColor: nu.brandTint, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  proofCount: { color: nu.brand, fontSize: 10, fontWeight: "700" },
  amount: { color: nu.ink, fontSize: 15, fontWeight: "700", textAlign: "right" },
  description: { color: nu.inkSoft, fontSize: 12, lineHeight: 16, marginTop: 2 },
  share: { color: nu.brand, fontSize: 11, fontWeight: "600", lineHeight: 15, marginTop: 3 },
  payer: { color: nu.inkSoft, fontSize: 11, lineHeight: 15, marginTop: 2, textAlign: "right" },
  payerName: { color: nu.ink, fontSize: 11, fontWeight: "600" },
  date: { color: nu.inkFaint, fontSize: 11, lineHeight: 14, marginTop: 1, textAlign: "right" },
});
