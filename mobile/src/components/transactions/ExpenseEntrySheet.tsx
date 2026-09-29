import { Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";

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
  "Transport",
  "Health",
  "Housing",
  "Shopping",
] as const;

export function ExpenseEntrySheet(props: TransactionEntrySheetProps) {
  const form = useTransactionEntry({ ...props, initialCategory: categories[0], type: "EXPENSE" });

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

      <Text style={sharedStyles.fieldLabel}>CATEGORY</Text>
      <ScrollView
        contentContainerStyle={sharedStyles.chipRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {categories.map((category) => {
          const selected = category === form.category;
          return (
            <Pressable
              key={category}
              onPress={() => form.setCategory(category)}
              style={({ pressed }) => [
                sharedStyles.chip,
                selected && styles.selectedCategory,
                pressed && sharedStyles.optionPressed,
              ]}
            >
              <Text style={[sharedStyles.chipText, selected && styles.selectedCategoryText]}>{category}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

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
  selectedCategory: {
    backgroundColor: colors.expenseTint,
    borderColor: colors.expense,
  },
  selectedCategoryText: { color: colors.expense },
});
