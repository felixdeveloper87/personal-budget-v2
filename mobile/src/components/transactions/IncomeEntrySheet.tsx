import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { MerchantLogo } from "@/components/merchant/MerchantLogo";
import { colors } from "@/theme/colors";

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

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const otherIcon = {
  ios: "ellipsis",
  android: "more_horiz",
  web: "more_horiz",
} satisfies SymbolName;

const quickSources = [
  { name: "Deliveroo", domain: "deliveroo.co.uk" },
  { name: "Uber Eats", domain: "ubereats.com" },
  { name: "Just Eat", domain: "just-eat.co.uk" },
] as const;

export function IncomeEntrySheet(props: TransactionEntrySheetProps) {
  const form = useTransactionEntry({ ...props, initialCategory: "Salary", type: "INCOME" });
  const [customSource, setCustomSource] = useState(false);

  useEffect(() => {
    if (props.visible) setCustomSource(false);
  }, [props.visible]);

  return (
    <TransactionSheetFrame
      onClose={props.onClose}
      type="INCOME"
      visible={props.visible}
    >
      <AmountDateFields
        accent={transactionTheme.positive}
        amount={form.amount}
        onAmountChange={form.setAmount}
        onDateChange={form.setTransactionDate}
        transactionDate={form.transactionDate}
        type="INCOME"
        visible={props.visible}
      />

      <Text style={sharedStyles.fieldLabel}>Quick add</Text>
      <View style={styles.quickSourceGrid}>
        {quickSources.map((source) => {
          const selected = !customSource
            && form.description.trim().toLocaleLowerCase() === source.name.toLocaleLowerCase();
          return (
            <Pressable
              accessibilityLabel={`Use ${source.name} as income source`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={source.name}
              onPress={() => {
                setCustomSource(false);
                form.setDescription(source.name);
                form.setCategory("Salary");
              }}
              style={({ pressed }) => [
                styles.quickSourceButton,
                selected && styles.selectedSource,
                pressed && sharedStyles.optionPressed,
              ]}
            >
              <MerchantLogo domain={source.domain} name={source.name} size={38} />
              <Text numberOfLines={1} style={[styles.quickSourceText, selected && styles.selectedSourceText]}>
                {source.name}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityLabel="Add another income source"
          accessibilityRole="button"
          accessibilityState={{ selected: customSource }}
          onPress={() => {
            if (!customSource) form.setDescription("");
            setCustomSource(true);
            form.setCategory("Salary");
          }}
          style={({ pressed }) => [
            styles.quickSourceButton,
            customSource && styles.selectedSource,
            pressed && sharedStyles.optionPressed,
          ]}
        >
          <View style={[styles.otherSourceIcon, customSource && styles.selectedOtherIcon]}>
            <SymbolView
              name={otherIcon}
              size={19}
              tintColor={customSource ? colors.white : transactionTheme.brand}
              weight="bold"
            />
          </View>
          <Text style={[styles.quickSourceText, customSource && styles.selectedSourceText]}>Other</Text>
        </Pressable>
      </View>

      {customSource ? (
        <DescriptionField
          onChangeText={form.setDescription}
          placeholder="e.g. September salary"
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
        label="Add income"
        onPress={() => void form.submit()}
        submitting={form.submitting}
        type="INCOME"
      />
    </TransactionSheetFrame>
  );
}

const styles = StyleSheet.create({
  quickSourceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  quickSourceButton: {
    alignItems: "center",
    backgroundColor: transactionTheme.surface,
    borderColor: transactionTheme.hairline,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 51,
    paddingHorizontal: 9,
    paddingVertical: 8,
    width: "48.5%",
  },
  selectedSource: {
    backgroundColor: transactionTheme.brandTint,
    borderColor: transactionTheme.brand,
    borderWidth: 2,
  },
  quickSourceText: { color: transactionTheme.ink, flexShrink: 1, fontSize: 12, fontWeight: "800" },
  selectedSourceText: { color: transactionTheme.brand },
  otherSourceIcon: {
    alignItems: "center",
    backgroundColor: transactionTheme.brandTint,
    borderRadius: 10,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  selectedOtherIcon: { backgroundColor: transactionTheme.brand },
});
