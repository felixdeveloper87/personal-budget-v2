import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

import { useAuth } from "@/contexts/AuthContext";
import { ApiError, createTransaction, listAccounts } from "@/services/api";
import { colors } from "@/theme/colors";
import type { FinancialAccount, Transaction } from "@/types/finance";

type SymbolName = ComponentProps<typeof SymbolView>["name"];
type TransactionType = "INCOME" | "EXPENSE";

const icons = {
  close: { ios: "xmark", android: "close", web: "close" },
  income: { ios: "arrow.down.left", android: "south_west", web: "south_west" },
  expense: { ios: "arrow.up.right", android: "north_east", web: "north_east" },
} satisfies Record<string, SymbolName>;

const categories: Record<TransactionType, string[]> = {
  INCOME: ["Salary", "Freelance", "Investments", "Rental", "Bonus", "Benefits", "Gift"],
  EXPENSE: [
    "Groceries",
    "Dining out",
    "Utilities",
    "Transport",
    "Health",
    "Housing",
    "Shopping",
  ],
};

interface TransactionEntryModalProps {
  onClose: () => void;
  onCreated: (transaction: Transaction) => void;
  type: TransactionType;
  visible: boolean;
}

function localDateParts(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    dateTime: `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`,
  };
}

function todayLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function TransactionEntryModal({
  onClose,
  onCreated,
  type,
  visible,
}: TransactionEntryModalProps) {
  const { user, logout } = useAuth();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[type][0]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isIncome = type === "INCOME";
  const accent = isIncome ? colors.income : colors.expense;
  const tint = isIncome ? colors.incomeTint : colors.expenseTint;
  const title = isIncome ? "Add income" : "Add expense";

  const parsedAmount = useMemo(() => Number(amount.replace(",", ".")), [amount]);
  const canSubmit =
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    description.trim().length > 0 &&
    accountId !== null &&
    !submitting;

  useEffect(() => {
    if (!visible || !user) return;

    let active = true;
    setAmount("");
    setDescription("");
    setCategory(categories[type][0]);
    setAccounts([]);
    setAccountId(null);
    setError(null);
    setAccountsLoading(true);

    void listAccounts(user.token)
      .then((items) => {
        if (!active) return;
        const activeAccounts = items.filter((account) => account.active);
        setAccounts(activeAccounts);
        setAccountId(activeAccounts[0]?.id ?? null);
      })
      .catch(async (loadError) => {
        if (!active) return;
        if (loadError instanceof ApiError && loadError.status === 401) {
          await logout();
          return;
        }
        setError("We couldn't load your accounts. Please try again.");
      })
      .finally(() => {
        if (active) setAccountsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [logout, type, user, visible]);

  const handleSubmit = async () => {
    if (!user || !canSubmit || accountId === null) return;

    setSubmitting(true);
    setError(null);

    try {
      const now = localDateParts();
      const transaction = await createTransaction(user.token, {
        accountId,
        amount: parsedAmount,
        category,
        dateTime: now.dateTime,
        description: description.trim(),
        paymentMethodId: null,
        status: "CLEARED",
        transactionDate: now.date,
        type,
      });
      onCreated(transaction);
      onClose();
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        await logout();
        onClose();
        return;
      }
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : `We couldn't save this ${isIncome ? "income" : "expense"}.`,
      );
    } finally {
      setSubmitting(false);
    }
  };

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
        style={styles.overlay}
      >
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.backdrop} />
        <SafeAreaView style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.modalHeader}>
            <View style={[styles.titleIcon, { backgroundColor: tint }]}>
              <SymbolView
                name={isIncome ? icons.income : icons.expense}
                size={20}
                tintColor={accent}
                weight="bold"
              />
            </View>
            <View style={styles.titleCopy}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.dateLabel}>{todayLabel()}</Text>
            </View>
            <Pressable
              accessibilityLabel="Close"
              accessibilityRole="button"
              hitSlop={10}
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <SymbolView name={icons.close} size={19} tintColor={colors.ink} weight="semibold" />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.fieldLabel}>AMOUNT</Text>
            <View style={[styles.amountField, { borderColor: accent }]}>
              <Text style={[styles.currencyMark, { color: accent }]}>£</Text>
              <TextInput
                autoFocus
                keyboardType="decimal-pad"
                onChangeText={(value) => setAmount(value.replace(/[^0-9.,]/g, ""))}
                placeholder="0.00"
                placeholderTextColor={colors.inkFaint}
                selectionColor={accent}
                style={styles.amountInput}
                value={amount}
              />
            </View>

            <Text style={styles.fieldLabel}>DESCRIPTION</Text>
            <TextInput
              autoCapitalize="sentences"
              maxLength={120}
              onChangeText={setDescription}
              placeholder={isIncome ? "e.g. September salary" : "e.g. Weekly groceries"}
              placeholderTextColor={colors.inkFaint}
              returnKeyType="done"
              style={styles.textField}
              value={description}
            />

            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <ScrollView
              contentContainerStyle={styles.chipRow}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {categories[type].map((item) => {
                const selected = item === category;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setCategory(item)}
                    style={[
                      styles.chip,
                      selected && { backgroundColor: tint, borderColor: accent },
                    ]}
                  >
                    <Text style={[styles.chipText, selected && { color: accent }]}>{item}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.fieldLabel}>ACCOUNT</Text>
            {accountsLoading ? (
              <View style={styles.accountsState}>
                <ActivityIndicator color={accent} size="small" />
                <Text style={styles.accountsStateText}>Loading accounts…</Text>
              </View>
            ) : accounts.length === 0 ? (
              <View style={styles.accountsState}>
                <Text style={styles.accountsStateText}>
                  No active account is available. Create one before adding a transaction.
                </Text>
              </View>
            ) : (
              <ScrollView
                contentContainerStyle={styles.chipRow}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {accounts.map((account) => {
                  const selected = account.id === accountId;
                  return (
                    <Pressable
                      key={account.id}
                      onPress={() => setAccountId(account.id)}
                      style={[
                        styles.accountChip,
                        selected && { backgroundColor: tint, borderColor: accent },
                      ]}
                    >
                      <Text style={[styles.chipText, selected && { color: accent }]}>
                        {account.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={() => void handleSubmit()}
              style={({ pressed }) => [
                styles.saveButton,
                { backgroundColor: accent },
                !canSubmit && styles.saveButtonDisabled,
                pressed && canSubmit && styles.pressed,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save {isIncome ? "income" : "expense"}</Text>
              )}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    bottom: 0,
    backgroundColor: "rgba(17, 31, 34, 0.46)",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
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
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 42,
    justifyContent: "center",
    marginRight: 12,
    width: 42,
  },
  titleCopy: { flex: 1 },
  title: { color: colors.ink, fontSize: 20, fontWeight: "800", letterSpacing: -0.35 },
  dateLabel: { color: colors.inkSoft, fontSize: 12, marginTop: 3 },
  closeButton: {
    alignItems: "center",
    backgroundColor: colors.paperMuted,
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
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
  chipRow: { gap: 8, paddingRight: 4 },
  chip: {
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  accountChip: {
    backgroundColor: colors.paperRaised,
    borderColor: colors.line,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chipText: { color: colors.inkSoft, fontSize: 12, fontWeight: "700" },
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
    paddingHorizontal: 18,
  },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: { color: colors.white, fontSize: 15, fontWeight: "800" },
  pressed: { opacity: 0.78 },
});
