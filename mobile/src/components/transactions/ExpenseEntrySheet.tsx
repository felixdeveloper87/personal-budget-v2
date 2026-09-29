import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { MerchantLogo } from "@/components/merchant/MerchantLogo";
import { colors } from "@/theme/colors";

import {
  AccountPicker,
  AmountDateFields,
  sharedStyles,
  TransactionSheetFrame,
  TransactionSubmit,
} from "./TransactionEntryShared";
import type { TransactionEntrySheetProps } from "./transactionEntryTypes";
import { useTransactionEntry } from "./useTransactionEntry";

const categories = [
  "Groceries",
  "Dining out",
  "Utilities",
  "Health",
  "Rent",
  "Shopping",
] as const;

type ExpenseCategory = typeof categories[number];

interface MerchantSuggestion {
  domain?: string;
  name: string;
}

const merchantSuggestions: Partial<Record<ExpenseCategory, readonly MerchantSuggestion[]>> = {
  Groceries: [
    { name: "Tesco", domain: "tesco.com" },
    { name: "Lidl", domain: "lidl.co.uk" },
    { name: "Aldi", domain: "aldi.co.uk" },
    { name: "Sainsbury's", domain: "sainsburys.co.uk" },
    { name: "Marks & Spencer", domain: "marksandspencer.com" },
    { name: "Asda", domain: "asda.com" },
    { name: "Costco", domain: "costco.co.uk" },
    { name: "Morrisons", domain: "morrisons.com" },
    { name: "Waitrose", domain: "waitrose.com" },
    { name: "Iceland", domain: "iceland.co.uk" },
    { name: "Co-op", domain: "coop.co.uk" },
    { name: "Off Licence" },
  ],
  "Dining out": [
    { name: "McDonald's", domain: "mcdonalds.com" },
    { name: "Nando's", domain: "nandos.co.uk" },
    { name: "Pepe's Piri Piri", domain: "pepes.co.uk" },
    { name: "KFC", domain: "kfc.co.uk" },
    { name: "Greggs", domain: "greggs.co.uk" },
    { name: "Costa Coffee", domain: "costa.co.uk" },
    { name: "Starbucks", domain: "starbucks.co.uk" },
    { name: "Pizza Hut", domain: "pizzahut.co.uk" },
    { name: "Burger King", domain: "burgerking.co.uk" },
    { name: "Domino's", domain: "dominos.co.uk" },
    { name: "Subway", domain: "subway.com" },
    { name: "Kokoro", domain: "kokorouk.com" },
    { name: "Pret A Manger", domain: "pret.co.uk" },
    { name: "Wagamama", domain: "wagamama.com" },
    { name: "Pizza Pilgrims", domain: "pizzapilgrims.co.uk" },
  ],
  Utilities: [
    { name: "OVO Energy", domain: "ovoenergy.com" },
    { name: "100Green", domain: "100green.com" },
    { name: "Community Fibre", domain: "communityfibre.co.uk" },
    { name: "SES Water", domain: "seswater.co.uk" },
    { name: "British Gas", domain: "britishgas.co.uk" },
    { name: "Octopus Energy", domain: "octopus.energy" },
    { name: "EDF Energy", domain: "edfenergy.com" },
    { name: "Thames Water", domain: "thameswater.co.uk" },
    { name: "Sky", domain: "sky.com" },
  ],
  Health: [
    { name: "Boots", domain: "boots.com" },
    { name: "Superdrug", domain: "superdrug.com" },
    { name: "Holland & Barrett", domain: "hollandandbarrett.com" },
    { name: "Specsavers", domain: "specsavers.co.uk" },
    { name: "Bupa", domain: "bupa.co.uk" },
    { name: "Nuffield Health", domain: "nuffieldhealth.com" },
  ],
  Shopping: [
    { name: "Amazon", domain: "amazon.co.uk" },
    { name: "Primark", domain: "primark.com" },
    { name: "Zara", domain: "zara.com" },
    { name: "ASOS", domain: "asos.com" },
    { name: "eBay", domain: "ebay.co.uk" },
    { name: "Vinted", domain: "vinted.co.uk" },
  ],
};

const suggestedMerchantNames = new Set(
  Object.values(merchantSuggestions).flatMap((merchants) => merchants?.map((merchant) => merchant.name) ?? []),
);

export function ExpenseEntrySheet(props: TransactionEntrySheetProps) {
  const form = useTransactionEntry({ ...props, initialCategory: categories[0], type: "EXPENSE" });
  const selectedMerchants = merchantSuggestions[form.category as ExpenseCategory] ?? [];

  return (
    <TransactionSheetFrame
      onClose={props.onClose}
      transactionDate={form.transactionDate}
      type="EXPENSE"
      visible={props.visible}
    >
      <AmountDateFields
        accent={colors.expense}
        amount={form.amount}
        onAmountChange={form.setAmount}
        onDateChange={form.setTransactionDate}
        transactionDate={form.transactionDate}
        type="EXPENSE"
        visible={props.visible}
      />

      <Text style={sharedStyles.fieldLabel}>CATEGORY</Text>
      <View style={styles.categoryGrid}>
        {categories.map((category) => {
          const selected = category === form.category;
          return (
            <Pressable
              key={category}
              onPress={() => {
                if (suggestedMerchantNames.has(form.description)) form.setDescription("");
                form.setCategory(category);
              }}
              style={({ pressed }) => [
                sharedStyles.chip,
                styles.categoryButton,
                selected && styles.selectedCategory,
                pressed && sharedStyles.optionPressed,
              ]}
            >
              <Text style={[sharedStyles.chipText, selected && styles.selectedCategoryText]}>{category}</Text>
            </Pressable>
          );
        })}
      </View>

      {selectedMerchants.length > 0 ? (
        <>
          <Text style={sharedStyles.fieldLabel}>QUICK ADD</Text>
          <View style={styles.merchantGrid}>
            {selectedMerchants.map((merchant) => {
              const selected = form.description === merchant.name;
              return (
                <Pressable
                  accessibilityLabel={`Use ${merchant.name} as expense merchant`}
                  accessibilityRole="button"
                  key={merchant.name}
                  onPress={() => form.setDescription(merchant.name)}
                  style={({ pressed }) => [
                    styles.merchantButton,
                    selected && styles.selectedMerchant,
                    pressed && sharedStyles.optionPressed,
                  ]}
                >
                  <MerchantLogo
                    category={form.category}
                    domain={merchant.domain}
                    name={merchant.name}
                    size={32}
                  />
                  <Text
                    numberOfLines={1}
                    style={[styles.merchantName, selected && styles.selectedMerchantName]}
                  >
                    {merchant.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <Text style={sharedStyles.fieldLabel}>DESCRIPTION</Text>
      <TextInput
        autoCapitalize="sentences"
        maxLength={120}
        onChangeText={form.setDescription}
        placeholder="e.g. Weekly groceries"
        placeholderTextColor={colors.inkFaint}
        returnKeyType="done"
        style={sharedStyles.textField}
        value={form.description}
      />

      <AccountPicker
        accent={colors.expense}
        accountId={form.accountId}
        accounts={form.accounts}
        loading={form.accountsLoading}
        onChange={form.setAccountId}
        tint={colors.expenseTint}
      />
      <TransactionSubmit
        accent={colors.expense}
        canSubmit={form.canSubmit}
        error={form.error}
        label="Save expense"
        onPress={() => void form.submit()}
        submitting={form.submitting}
      />
    </TransactionSheetFrame>
  );
}

const styles = StyleSheet.create({
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryButton: { alignItems: "center", justifyContent: "center", width: "31.7%" },
  selectedCategory: {
    backgroundColor: colors.expenseTint,
    borderColor: colors.expense,
  },
  selectedCategoryText: { color: colors.expense },
  merchantGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  merchantButton: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 52,
    paddingHorizontal: 8,
    paddingVertical: 8,
    width: "31.7%",
  },
  merchantName: { color: colors.ink, flex: 1, fontSize: 10, fontWeight: "800" },
  selectedMerchant: {
    backgroundColor: colors.expenseTint,
    borderColor: colors.expense,
    borderWidth: 1.5,
  },
  selectedMerchantName: { color: colors.expense },
});
