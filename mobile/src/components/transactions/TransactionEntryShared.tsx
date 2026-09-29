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
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

import { BankLogo } from "@/components/accounts/BankLogo";
import { colors } from "@/theme/colors";
import type { FinancialAccount } from "@/types/finance";

import type { TransactionType } from "./transactionEntryTypes";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const icons = {
  calendar: { ios: "calendar", android: "calendar_month", web: "calendar_month" },
  close: { ios: "xmark", android: "close", web: "close" },
  expense: { ios: "arrow.up.right", android: "north_east", web: "north_east" },
  income: { ios: "arrow.down.left", android: "south_west", web: "south_west" },
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

function IncomeHeaderArtwork() {
  return (
    <Svg height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 390 106" width="100%">
      <Defs>
        <LinearGradient id="incomeHeaderSky" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor="#173D31" />
          <Stop offset="0.58" stopColor="#285847" />
          <Stop offset="1" stopColor="#496D55" />
        </LinearGradient>
        <LinearGradient id="incomeHeaderHill" x1="0" x2="1" y1="0" y2="0">
          <Stop offset="0" stopColor="#D9C896" stopOpacity="0.16" />
          <Stop offset="1" stopColor="#F2E6BE" stopOpacity="0.42" />
        </LinearGradient>
      </Defs>
      <Rect fill="url(#incomeHeaderSky)" height="106" width="390" />
      <Circle cx="326" cy="18" fill="#F1D98E" opacity="0.82" r="25" />
      <Circle cx="326" cy="18" fill="none" opacity="0.23" r="35" stroke="#FFF5D6" />
      <Path d="M170 106 C220 62 276 62 390 82 L390 106 Z" fill="url(#incomeHeaderHill)" />
      <Path d="M220 106 C272 74 327 72 390 90 L390 106 Z" fill="#102E27" opacity="0.48" />
      <Path d="M286 106 C318 83 348 81 390 91" fill="none" opacity="0.2" stroke="#FFF8E8" strokeWidth="1" />
    </Svg>
  );
}

function ExpenseHeaderArtwork() {
  return (
    <Svg height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 390 106" width="100%">
      <Defs>
        <LinearGradient id="expenseHeaderSky" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor="#6E302E" />
          <Stop offset="0.58" stopColor="#91463E" />
          <Stop offset="1" stopColor="#B66E58" />
        </LinearGradient>
        <LinearGradient id="expenseHeaderWave" x1="0" x2="1" y1="0" y2="0">
          <Stop offset="0" stopColor="#F3C89E" stopOpacity="0.12" />
          <Stop offset="1" stopColor="#F8DFBE" stopOpacity="0.45" />
        </LinearGradient>
      </Defs>
      <Rect fill="url(#expenseHeaderSky)" height="106" width="390" />
      <Circle cx="330" cy="16" fill="#F2C87F" opacity="0.88" r="24" />
      <Circle cx="330" cy="16" fill="none" opacity="0.24" r="35" stroke="#FFF0D5" />
      <Path d="M150 106 C214 60 286 64 390 81 L390 106 Z" fill="url(#expenseHeaderWave)" />
      <Path d="M218 106 C274 77 333 76 390 91 L390 106 Z" fill="#562825" opacity="0.5" />
      <Path d="M270 106 C310 82 352 82 390 93" fill="none" opacity="0.2" stroke="#FFF4E4" strokeWidth="1" />
    </Svg>
  );
}

export function TransactionSheetFrame({
  children,
  onClose,
  transactionDate,
  type,
  visible,
}: {
  children: ReactNode;
  onClose: () => void;
  transactionDate: Date;
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
          <View style={sharedStyles.handle} />
          <View style={[sharedStyles.modalHeader, sharedStyles.illustratedModalHeader]}>
            <View pointerEvents="none" style={sharedStyles.headerArtwork}>
              {isIncome ? <IncomeHeaderArtwork /> : <ExpenseHeaderArtwork />}
            </View>
            <View style={sharedStyles.titleIcon}>
              <SymbolView
                name={isIncome ? icons.income : icons.expense}
                size={20}
                tintColor={colors.white}
                weight="bold"
              />
            </View>
            <View style={sharedStyles.titleCopy}>
              <Text style={sharedStyles.title}>Add {isIncome ? "income" : "expense"}</Text>
              <Text style={sharedStyles.headerDate}>{dateLabel(transactionDate)}</Text>
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

  useEffect(() => {
    if (!visible) setDatePickerVisible(false);
  }, [visible]);

  return (
    <>
      <View style={sharedStyles.amountDateRow}>
        <View style={sharedStyles.amountColumn}>
          <Text style={sharedStyles.fieldLabel}>AMOUNT</Text>
          <View style={[sharedStyles.amountField, { borderColor: accent }]}>
            <Text style={[sharedStyles.currencyMark, { color: accent }]}>£</Text>
            <TextInput
              autoFocus
              keyboardType="decimal-pad"
              onChangeText={(value) => onAmountChange(value.replace(/[^0-9.,]/g, ""))}
              placeholder="0.00"
              placeholderTextColor={colors.inkFaint}
              selectionColor={accent}
              style={sharedStyles.amountInput}
              value={amount}
            />
          </View>
        </View>
        <View style={sharedStyles.dateColumn}>
          <Text style={sharedStyles.fieldLabel}>DATE</Text>
          <Pressable
            accessibilityLabel={`${type === "INCOME" ? "Income" : "Expense"} date: ${dateLabel(transactionDate)}`}
            accessibilityRole="button"
            accessibilityState={{ expanded: datePickerVisible }}
            onPress={() => {
              Keyboard.dismiss();
              setDatePickerVisible((current) => !current);
            }}
            style={sharedStyles.dateTrigger}
          >
            <Text numberOfLines={1} style={sharedStyles.dateTriggerText}>
              {compactDateLabel(transactionDate)}
            </Text>
            <SymbolView name={icons.calendar} size={18} tintColor={accent} weight="semibold" />
          </Pressable>
        </View>
      </View>
      {datePickerVisible && Platform.OS === "ios" ? (
        <View style={sharedStyles.iosCalendar}>
          <DateTimePicker
            accentColor={accent}
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
            <Text style={[sharedStyles.calendarCloseText, { color: accent }]}>Done</Text>
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
      <Text style={sharedStyles.fieldLabel}>ACCOUNT</Text>
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
                key={account.id}
                onPress={() => onChange(account.id)}
                style={({ pressed }) => [
                  sharedStyles.accountChip,
                  selected && { backgroundColor: tint, borderColor: accent, borderWidth: 1.5 },
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

export function TransactionSubmit({
  accent,
  canSubmit,
  error,
  label,
  onPress,
  submitting,
}: {
  accent: string;
  canSubmit: boolean;
  error: string | null;
  label: string;
  onPress: () => void;
  submitting: boolean;
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
          <Text style={sharedStyles.saveButtonText}>{label}</Text>
        )}
      </Pressable>
    </>
  );
}

export const sharedStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(17, 31, 34, 0.46)" },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    backgroundColor: colors.line,
    borderRadius: 2,
    height: 4,
    marginTop: 10,
    width: 38,
  },
  modalHeader: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 92,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: "relative",
  },
  illustratedModalHeader: { borderBottomColor: "rgba(255,255,255,0.14)" },
  headerArtwork: { ...StyleSheet.absoluteFill },
  titleIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 16,
    height: 42,
    justifyContent: "center",
    marginRight: 12,
    zIndex: 1,
    width: 42,
  },
  titleCopy: { flex: 1, zIndex: 1 },
  title: { color: colors.white, fontSize: 20, fontWeight: "800", letterSpacing: -0.35 },
  headerDate: { color: "rgba(255,255,255,0.74)", fontSize: 12, marginTop: 3 },
  closeButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    zIndex: 1,
    width: 34,
  },
  form: { padding: 20, paddingBottom: 28 },
  fieldLabel: {
    color: colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
    marginBottom: 8,
    marginTop: 18,
  },
  amountDateRow: { alignItems: "flex-end", flexDirection: "row", gap: 10 },
  amountColumn: { flex: 1, minWidth: 0 },
  dateColumn: { width: 144 },
  amountField: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderRadius: 19,
    borderWidth: 1.5,
    flexDirection: "row",
    paddingHorizontal: 17,
  },
  currencyMark: { fontSize: 25, fontWeight: "800", marginRight: 8 },
  amountInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 32,
    fontWeight: "800",
    minHeight: 68,
    paddingVertical: 10,
  },
  textField: {
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  dateTrigger: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "space-between",
    minHeight: 70,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateTriggerText: { color: colors.ink, flexShrink: 1, fontSize: 13, fontWeight: "700" },
  nativeDatePicker: { height: 50, width: "100%" },
  iosCalendar: {
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
    overflow: "hidden",
  },
  iosDatePicker: { minHeight: 320, width: "100%" },
  calendarCloseButton: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    minHeight: 44,
  },
  calendarCloseText: { fontSize: 12, fontWeight: "800" },
  chipRow: { gap: 8, paddingRight: 4 },
  chip: {
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipText: { color: colors.inkSoft, fontSize: 12, fontWeight: "700" },
  accountGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  accountChip: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 50,
    paddingHorizontal: 9,
    paddingVertical: 8,
    width: "48.5%",
  },
  accountChipText: { flexShrink: 1 },
  accountsState: {
    alignItems: "center",
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  accountsStateText: { color: colors.inkSoft, flex: 1, fontSize: 12, lineHeight: 18 },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 16,
  },
  saveButton: {
    alignItems: "center",
    borderRadius: 17,
    justifyContent: "center",
    marginTop: 24,
    minHeight: 54,
  },
  saveButtonDisabled: { backgroundColor: "#B7C4BD", opacity: 0.82 },
  saveButtonText: { color: colors.white, fontSize: 15, fontWeight: "800" },
  optionPressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  pressed: { opacity: 0.78 },
});
