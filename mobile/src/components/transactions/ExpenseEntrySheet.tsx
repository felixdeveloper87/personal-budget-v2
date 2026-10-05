import { Pressable, StyleSheet, Text, View } from "react-native";

import { MerchantLogo } from "@/components/merchant/MerchantLogo";
import { EXPENSE_CATEGORIES as categories } from "@/constants/transactionCategories";
import type { FinancialAccount } from "@/types/finance";

import {
  AccountPicker,
  AmountDateFields,
  DescriptionField,
  sharedStyles,
  TransactionSheetFrame,
  TransactionSubmit,
} from "./TransactionEntryShared";
import type { TransactionEntrySheetProps } from "./transactionEntryTypes";
import { transactionTheme } from "./transactionTheme";
import { useTransactionEntry } from "./useTransactionEntry";

type ExpenseCategory = typeof categories[number];

function categoryLabel(category: ExpenseCategory) {
  return category === "Entertainment" ? "Leisure" : category;
}

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
  Transport: [
    { name: "Oil change" },
    { name: "Petrol" },
    { name: "Front tyre" },
    { name: "Front brake pad" },
    { name: "Rear tyre" },
    { name: "Rear brake pad" },
  ],
  Subscriptions: [
    { name: "YouTube", domain: "youtube.com" },
    { name: "OpenAI", domain: "openai.com" },
    { name: "Claude", domain: "claude.ai" },
    { name: "iCloud", domain: "icloud.com" },
    { name: "Spotify", domain: "spotify.com" },
    { name: "Netflix", domain: "netflix.com" },
    { name: "Disney+", domain: "disneyplus.com" },
    { name: "Amazon Prime", domain: "amazon.co.uk" },
    { name: "Microsoft 365", domain: "microsoft.com" },
  ],
  Entertainment: [
    { name: "Cinema" },
    { name: "Steam", domain: "steampowered.com" },
    { name: "Show" },
  ],
  Shopping: [
    { name: "Amazon", domain: "amazon.co.uk" },
    { name: "Temu", domain: "temu.com" },
    { name: "Primark", domain: "primark.com" },
    { name: "Zara", domain: "zara.com" },
    { name: "eBay", domain: "ebay.co.uk" },
    { name: "Next", domain: "next.co.uk" },
    { name: "H&M", domain: "hm.com" },
    { name: "John Lewis", domain: "johnlewis.com" },
    { name: "Argos", domain: "argos.co.uk" },
    { name: "TK Maxx", domain: "tkmaxx.com" },
    { name: "Hollister", domain: "hollisterco.com" },
    { name: "Dunelm", domain: "dunelm.com" },
    { name: "UNIQLO", domain: "uniqlo.com" },
  ],
};

const suggestedMerchantNames = new Set(
  Object.values(merchantSuggestions).flatMap((merchants) => merchants?.map((merchant) => merchant.name) ?? []),
);

function isExpenseAccount(account: FinancialAccount) {
  return account.type !== "SAVINGS";
}

export function ExpenseEntrySheet(props: TransactionEntrySheetProps) {
  const form = useTransactionEntry({
    ...props,
    accountFilter: isExpenseAccount,
    initialCategory: categories[0],
    type: "EXPENSE",
  });
  const selectedMerchants = merchantSuggestions[form.category as ExpenseCategory] ?? [];
  const hasSelectedMerchant = selectedMerchants.some((merchant) => merchant.name === form.description);
  const hideDescription = hasSelectedMerchant;

  return (
    <TransactionSheetFrame
      onClose={props.onClose}
      type="EXPENSE"
      visible={props.visible}
    >
      <AmountDateFields
        accent={transactionTheme.negative}
        amount={form.amount}
        onAmountChange={form.setAmount}
        onDateChange={form.setTransactionDate}
        transactionDate={form.transactionDate}
        type="EXPENSE"
        visible={props.visible}
      />

      <Text style={sharedStyles.fieldLabel}>Category</Text>
      <View style={styles.categoryGrid}>
        {categories.map((category) => {
          const selected = category === form.category;
          return (
            <Pressable
              accessibilityLabel={`Use ${categoryLabel(category)} as expense category`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={category}
              onPress={() => {
                if (suggestedMerchantNames.has(form.description)) {
                  form.setDescription("");
                }
                form.setCategory(category);
              }}
              style={({ pressed }) => [
                sharedStyles.chip,
                styles.categoryButton,
                selected && styles.selectedCategory,
                pressed && sharedStyles.optionPressed,
              ]}
            >
              <Text style={[sharedStyles.chipText, selected && styles.selectedCategoryText]}>
                {categoryLabel(category)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {selectedMerchants.length > 0 ? (
        <>
          <Text style={sharedStyles.fieldLabel}>Quick add</Text>
          <View style={styles.merchantGrid}>
            {selectedMerchants.map((merchant) => {
              const selected = form.description === merchant.name;
              return (
                <Pressable
                  accessibilityLabel={`Use ${merchant.name} as expense merchant`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={merchant.name}
                  onPress={() => form.setDescription(selected ? "" : merchant.name)}
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

      {!hideDescription ? (
        <DescriptionField
          onChangeText={form.setDescription}
          placeholder="e.g. Weekly groceries"
          value={form.description}
        />
      ) : null}

      <AccountPicker
        accent={transactionTheme.brand}
        accountId={form.accountId}
        accounts={form.accounts}
        loading={form.accountsLoading}
        onChange={form.setAccountId}
        tint={transactionTheme.brandTint}
      />
      <TransactionSubmit
        accent={transactionTheme.brand}
        canSubmit={form.canSubmit}
        error={form.error}
        label="Add expense"
        onPress={() => void form.submit()}
        submitting={form.submitting}
        type="EXPENSE"
      />
    </TransactionSheetFrame>
  );
}

const styles = StyleSheet.create({
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryButton: { alignItems: "center", justifyContent: "center", width: "31.7%" },
  selectedCategory: {
    backgroundColor: transactionTheme.brandTint,
    borderColor: transactionTheme.brand,
    borderWidth: 2,
  },
  selectedCategoryText: { color: transactionTheme.brand },
  merchantGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  merchantButton: {
    alignItems: "center",
    backgroundColor: transactionTheme.surface,
    borderColor: transactionTheme.hairline,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 52,
    paddingHorizontal: 8,
    paddingVertical: 8,
    width: "31.7%",
  },
  merchantName: { color: transactionTheme.ink, flex: 1, fontSize: 10, fontWeight: "800" },
  selectedMerchant: {
    backgroundColor: transactionTheme.brandTint,
    borderColor: transactionTheme.brand,
    borderWidth: 2,
  },
  selectedMerchantName: { color: transactionTheme.brand },
});
