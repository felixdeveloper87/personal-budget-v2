import DateTimePicker from "@expo/ui/community/datetime-picker";
import { SymbolView } from "expo-symbols";
import type { ComponentProps, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { BankLogo } from "@/components/accounts/BankLogo";
import { colors } from "@/theme/colors";
import type { FinancialAccount } from "@/types/finance";

import type { TransactionType } from "./transactionEntryTypes";
import { transactionTheme } from "./transactionTheme";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const icons = {
  calculator: { ios: "plus.forwardslash.minus", android: "calculate", web: "calculate" },
  calendar: { ios: "calendar", android: "calendar_month", web: "calendar_month" },
  close: { ios: "xmark", android: "close", web: "close" },
  description: { ios: "doc.text", android: "description", web: "description" },
  minus: { ios: "minus", android: "remove", web: "remove" },
  plus: { ios: "plus", android: "add", web: "add" },
} satisfies Record<string, SymbolName>;

export function dateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function compactDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function TransactionSheetFrame({
  children,
  onClose,
  type,
  visible,
}: {
  children: ReactNode;
  onClose: () => void;
  type: TransactionType;
  visible: boolean;
}) {
  const isIncome = type === "INCOME";

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={sharedStyles.overlay}
      >
        <Pressable accessibilityRole="button" onPress={onClose} style={sharedStyles.backdrop} />
        <SafeAreaView style={sharedStyles.sheet}>
          <View style={sharedStyles.modalHeader}>
            <View pointerEvents="none" style={sharedStyles.headerRingOuter} />
            <View pointerEvents="none" style={sharedStyles.headerRingInner} />
            <View style={sharedStyles.titleCopy}>
              <Text style={sharedStyles.title}>{isIncome ? "Income" : "Expense"}</Text>
              <Text numberOfLines={1} style={sharedStyles.headerCaption}>
                {isIncome
                  ? "Track salary, transfers and one-off payments."
                  : "Track spending, bills and monthly commitments."}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close"
              accessibilityRole="button"
              hitSlop={10}
              onPress={onClose}
              style={({ pressed }) => [sharedStyles.closeButton, pressed && sharedStyles.pressed]}
            >
              <SymbolView name={icons.close} size={19} tintColor={colors.white} weight="semibold" />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={sharedStyles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function AmountDateFields({
  accent,
  amount,
  onAmountChange,
  onDateChange,
  transactionDate,
  type,
  visible,
}: {
  accent: string;
  amount: string;
  onAmountChange: (value: string) => void;
  onDateChange: (date: Date) => void;
  transactionDate: Date;
  type: TransactionType;
  visible: boolean;
}) {
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const amountTint = type === "INCOME" ? transactionTheme.positiveTint : transactionTheme.negativeTint;

  useEffect(() => {
    if (!visible) setDatePickerVisible(false);
  }, [visible]);

  return (
    <>
      <View style={sharedStyles.amountDateStack}>
        <View style={sharedStyles.formCard}>
          <View style={[sharedStyles.formCardIcon, { backgroundColor: amountTint }]}>
            <SymbolView name={icons.calculator} size={19} tintColor={accent} weight="semibold" />
          </View>
          <Text numberOfLines={1} style={sharedStyles.formCardLabel}>How much?</Text>
          <View style={[sharedStyles.amountPill, { backgroundColor: amountTint }]}>
            <Text style={[sharedStyles.currencyMark, { color: accent }]}>£</Text>
            <TextInput
              autoFocus
              keyboardType="decimal-pad"
              onChangeText={(value) => onAmountChange(value.replace(/[^0-9.,]/g, ""))}
              placeholder="0.00"
              placeholderTextColor={transactionTheme.inkFaint}
              selectionColor={accent}
              style={[sharedStyles.amountInput, { color: accent }]}
              value={amount}
            />
          </View>
        </View>

        <Pressable
          accessibilityLabel={`${type === "INCOME" ? "Income" : "Expense"} date: ${dateLabel(transactionDate)}`}
          accessibilityRole="button"
          accessibilityState={{ expanded: datePickerVisible }}
          onPress={() => {
            Keyboard.dismiss();
            setDatePickerVisible((current) => !current);
          }}
          style={({ pressed }) => [sharedStyles.formCard, pressed && sharedStyles.optionPressed]}
        >
          <View style={sharedStyles.formCardIcon}>
            <SymbolView name={icons.calendar} size={19} tintColor={transactionTheme.brand} weight="semibold" />
          </View>
          <Text numberOfLines={1} style={sharedStyles.formCardLabel}>What date?</Text>
          <Text numberOfLines={1} style={sharedStyles.dateTriggerText}>
            {compactDateLabel(transactionDate)}
          </Text>
        </Pressable>
      </View>

      {datePickerVisible && Platform.OS === "ios" ? (
        <View style={sharedStyles.iosCalendar}>
          <DateTimePicker
            accentColor={transactionTheme.brand}
            display="inline"
            locale="en_GB"
            mode="date"
            onValueChange={(_event, date) => onDateChange(date)}
            style={sharedStyles.iosDatePicker}
            themeVariant="light"
            value={transactionDate}
          />
          <Pressable
            accessibilityLabel="Close calendar"
            accessibilityRole="button"
            onPress={() => setDatePickerVisible(false)}
            style={sharedStyles.calendarCloseButton}
          >
            <Text style={sharedStyles.calendarCloseText}>Done</Text>
          </Pressable>
        </View>
      ) : datePickerVisible && Platform.OS === "android" ? (
        <DateTimePicker
          mode="date"
          negativeButton={{ label: "Cancel" }}
          onDismiss={() => setDatePickerVisible(false)}
          onValueChange={(_event, date) => {
            onDateChange(date);
            setDatePickerVisible(false);
          }}
          positiveButton={{ label: "Choose" }}
          presentation="dialog"
          style={sharedStyles.nativeDatePicker}
          value={transactionDate}
        />
      ) : null}
    </>
  );
}

export function AccountPicker({
  accent,
  accountId,
  accounts,
  loading,
  onChange,
  tint,
}: {
  accent: string;
  accountId: number | null;
  accounts: FinancialAccount[];
  loading: boolean;
  onChange: (accountId: number) => void;
  tint: string;
}) {
  return (
    <>
      <Text style={sharedStyles.fieldLabel}>Balance account</Text>
      {loading ? (
        <View style={sharedStyles.accountsState}>
          <ActivityIndicator color={accent} size="small" />
          <Text style={sharedStyles.accountsStateText}>Loading accounts…</Text>
        </View>
      ) : accounts.length === 0 ? (
        <View style={sharedStyles.accountsState}>
          <Text style={sharedStyles.accountsStateText}>
            No active account is available. Create one before adding a transaction.
          </Text>
        </View>
      ) : (
        <View style={sharedStyles.accountGrid}>
          {accounts.map((account) => {
            const selected = account.id === accountId;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={account.id}
                onPress={() => onChange(account.id)}
                style={({ pressed }) => [
                  sharedStyles.accountChip,
                  selected && { backgroundColor: tint, borderColor: accent, borderWidth: 2 },
                  pressed && sharedStyles.optionPressed,
                ]}
              >
                <BankLogo institution={account.institution} name={account.name} size={29} />
                <Text
                  numberOfLines={1}
                  style={[sharedStyles.chipText, sharedStyles.accountChipText, selected && { color: accent }]}
                >
                  {account.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </>
  );
}

export function DescriptionField({
  onChangeText,
  placeholder,
  value,
}: {
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={[sharedStyles.formCard, sharedStyles.descriptionCard]}>
      <View style={sharedStyles.formCardIcon}>
        <SymbolView name={icons.description} size={19} tintColor={transactionTheme.brand} weight="semibold" />
      </View>
      <Text style={sharedStyles.descriptionLabel}>Details</Text>
      <TextInput
        autoCapitalize="sentences"
        maxLength={120}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={transactionTheme.inkFaint}
        returnKeyType="done"
        style={sharedStyles.descriptionInput}
        value={value}
      />
    </View>
  );
}

export function TransactionSubmit({
  accent,
  canSubmit,
  error,
  label,
  onPress,
  submitting,
  type,
}: {
  accent: string;
  canSubmit: boolean;
  error: string | null;
  label: string;
  onPress: () => void;
  submitting: boolean;
  type: TransactionType;
}) {
  return (
    <>
      {error ? <Text style={sharedStyles.errorText}>{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        disabled={!canSubmit}
        onPress={onPress}
        style={({ pressed }) => [
          sharedStyles.saveButton,
          { backgroundColor: accent },
          !canSubmit && sharedStyles.saveButtonDisabled,
          pressed && canSubmit && sharedStyles.pressed,
        ]}
      >
        {submitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <View style={sharedStyles.saveButtonContent}>
            <SymbolView
              name={type === "INCOME" ? icons.plus : icons.minus}
              size={18}
              tintColor={colors.white}
              weight="bold"
            />
            <Text style={sharedStyles.saveButtonText}>{label}</Text>
          </View>
        )}
      </Pressable>
    </>
  );
}

export const sharedStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: transactionTheme.overlay },
  sheet: {
    backgroundColor: transactionTheme.page,
    borderColor: transactionTheme.hairlineStrong,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: StyleSheet.hairlineWidth,
    maxHeight: "92%",
    overflow: "hidden",
  },
  modalHeader: {
    alignItems: "center",
    backgroundColor: transactionTheme.brand,
    flexDirection: "row",
    minHeight: 88,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: "relative",
  },
  headerRingOuter: {
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 110,
    borderWidth: 1,
    height: 220,
    position: "absolute",
    right: -70,
    top: -90,
    width: 220,
  },
  headerRingInner: {
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 74,
    borderWidth: 1,
    height: 148,
    position: "absolute",
    right: -34,
    top: -54,
    width: 148,
  },
  titleCopy: { flex: 1, zIndex: 1 },
  title: { color: colors.white, fontSize: 22, fontWeight: "700", letterSpacing: -0.44, lineHeight: 25 },
  headerCaption: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    paddingRight: 10,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 17,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    zIndex: 1,
    width: 34,
  },
  form: { padding: 16, paddingBottom: 28 },
  fieldLabel: {
    color: transactionTheme.inkSoft,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 20,
  },
  amountDateStack: { gap: 16 },
  formCard: {
    alignItems: "center",
    backgroundColor: transactionTheme.surface,
    borderColor: transactionTheme.hairline,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: "row",
    minHeight: 68,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  formCardIcon: {
    alignItems: "center",
    backgroundColor: transactionTheme.surfacePressed,
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    marginRight: 10,
    width: 40,
  },
  formCardLabel: { color: transactionTheme.inkSoft, flex: 1, fontSize: 15, fontWeight: "600" },
  amountPill: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    minWidth: 112,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  currencyMark: { fontSize: 18, fontWeight: "800", marginRight: 4 },
  amountInput: {
    fontSize: 22,
    fontWeight: "800",
    minHeight: 28,
    minWidth: 72,
    padding: 0,
  },
  textField: {
    backgroundColor: transactionTheme.surface,
    borderColor: transactionTheme.hairline,
    borderRadius: 16,
    borderWidth: 2,
    color: transactionTheme.ink,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  descriptionCard: { marginTop: 20 },
  descriptionLabel: { color: transactionTheme.inkSoft, fontSize: 15, fontWeight: "600", marginRight: 10 },
  descriptionInput: {
    color: transactionTheme.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    minWidth: 0,
    padding: 0,
  },
  dateTriggerText: {
    color: transactionTheme.ink,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  nativeDatePicker: { height: 50, width: "100%" },
  iosCalendar: {
    backgroundColor: transactionTheme.surface,
    borderColor: transactionTheme.hairline,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
    overflow: "hidden",
  },
  iosDatePicker: { minHeight: 320, width: "100%" },
  calendarCloseButton: {
    alignItems: "center",
    borderTopColor: transactionTheme.hairline,
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    minHeight: 44,
  },
  calendarCloseText: { color: transactionTheme.brand, fontSize: 12, fontWeight: "800" },
  chip: {
    backgroundColor: transactionTheme.surface,
    borderColor: transactionTheme.hairline,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipText: { color: transactionTheme.ink, fontSize: 12, fontWeight: "700" },
  accountGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  accountChip: {
    alignItems: "center",
    backgroundColor: transactionTheme.surface,
    borderColor: transactionTheme.hairline,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 52,
    paddingHorizontal: 9,
    paddingVertical: 8,
    width: "48.5%",
  },
  accountChipText: { flexShrink: 1 },
  accountsState: {
    alignItems: "center",
    backgroundColor: transactionTheme.surface,
    borderColor: transactionTheme.hairline,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  accountsStateText: { color: transactionTheme.inkSoft, flex: 1, fontSize: 12, lineHeight: 18 },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 16,
  },
  saveButton: {
    alignItems: "center",
    borderRadius: 999,
    justifyContent: "center",
    marginTop: 24,
    minHeight: 54,
  },
  saveButtonDisabled: { backgroundColor: transactionTheme.disabled, opacity: 0.72 },
  saveButtonContent: { alignItems: "center", flexDirection: "row", gap: 8 },
  saveButtonText: { color: colors.white, fontSize: 15, fontWeight: "800" },
  optionPressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  pressed: { opacity: 0.78 },
});
