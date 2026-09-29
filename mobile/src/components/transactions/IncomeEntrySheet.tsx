import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
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

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const otherIcon = {
  ios: "ellipsis",
  android: "more_horiz",
  web: "more_horiz",
} satisfies SymbolName;

const quickSources = [
  { name: "Uber Eats", domain: "ubereats.com" },
  { name: "Deliveroo", domain: "deliveroo.co.uk" },
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
      transactionDate={form.transactionDate}
      type="INCOME"
      visible={props.visible}
    >
      <AmountDateFields
        accent={colors.income}
        amount={form.amount}
        onAmountChange={form.setAmount}
        onDateChange={form.setTransactionDate}
        transactionDate={form.transactionDate}
        type="INCOME"
        visible={props.visible}
      />

      <Text style={sharedStyles.fieldLabel}>QUICK ADD</Text>
      <View style={styles.quickSourceGrid}>
        {quickSources.map((source) => {
          const selected = !customSource
            && form.description.trim().toLocaleLowerCase() === source.name.toLocaleLowerCase();
          return (
            <Pressable
              accessibilityLabel={`Use ${source.name} as income source`}
              accessibilityRole="button"
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
              <MerchantLogo domain={source.domain} name={source.name} size={31} />
              <Text numberOfLines={1} style={[styles.quickSourceText, selected && styles.selectedSourceText]}>
                {source.name}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityLabel="Add another income source"
          accessibilityRole="button"
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
              tintColor={customSource ? colors.white : colors.income}
              weight="bold"
            />
          </View>
          <Text style={[styles.quickSourceText, customSource && styles.selectedSourceText]}>Other</Text>
        </Pressable>
      </View>

      {customSource ? (
        <>
          <Text style={sharedStyles.fieldLabel}>DESCRIPTION</Text>
          <TextInput
            autoCapitalize="sentences"
            maxLength={120}
            onChangeText={form.setDescription}
            placeholder="e.g. September salary"
            placeholderTextColor={colors.inkFaint}
            returnKeyType="done"
            style={sharedStyles.textField}
            value={form.description}
          />
        </>
      ) : null}

      <AccountPicker
        accent={colors.income}
        accountId={form.accountId}
        accounts={form.accounts}
        loading={form.accountsLoading}
        onChange={form.setAccountId}
        tint={colors.incomeTint}
      />
      <TransactionSubmit
        accent={colors.income}
        canSubmit={form.canSubmit}
        error={form.error}
        label="Save income"
        onPress={() => void form.submit()}
        submitting={form.submitting}
      />
    </TransactionSheetFrame>
  );
}

const styles = StyleSheet.create({
  quickSourceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  quickSourceButton: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
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
    backgroundColor: colors.incomeTint,
    borderColor: colors.income,
    borderWidth: 1.5,
  },
  quickSourceText: { color: colors.ink, flexShrink: 1, fontSize: 12, fontWeight: "800" },
  selectedSourceText: { color: colors.income },
  otherSourceIcon: {
    alignItems: "center",
    backgroundColor: colors.incomeTint,
    borderRadius: 10,
    height: 31,
    justifyContent: "center",
    width: 31,
  },
  selectedOtherIcon: { backgroundColor: colors.income },
});
