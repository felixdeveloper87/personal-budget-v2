import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { ApiError, createTransaction, listAccounts } from "@/services/api";
import type { FinancialAccount } from "@/types/finance";

import type { TransactionEntrySheetProps, TransactionType } from "./transactionEntryTypes";

function localDateParts(date: Date) {
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

export function useTransactionEntry({
  initialCategory,
  onClose,
  onCreated,
  type,
  visible,
}: TransactionEntrySheetProps & { initialCategory: string; type: TransactionType }) {
  const { user, logout } = useAuth();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [transactionDate, setTransactionDate] = useState(() => new Date());
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setCategory(initialCategory);
    setAccounts([]);
    setAccountId(null);
    setTransactionDate(new Date());
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
  }, [initialCategory, logout, user, visible]);

  const submit = async () => {
    if (!user || !canSubmit || accountId === null) return;

    setSubmitting(true);
    setError(null);

    try {
      const submissionDate = new Date();
      submissionDate.setFullYear(
        transactionDate.getFullYear(),
        transactionDate.getMonth(),
        transactionDate.getDate(),
      );
      const dateParts = localDateParts(submissionDate);
      const transaction = await createTransaction(user.token, {
        accountId,
        amount: parsedAmount,
        category,
        dateTime: dateParts.dateTime,
        description: description.trim(),
        paymentMethodId: null,
        status: "CLEARED",
        transactionDate: dateParts.date,
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
          : `We couldn't save this ${type === "INCOME" ? "income" : "expense"}.`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
    accountId,
    accounts,
    accountsLoading,
    amount,
    canSubmit,
    category,
    description,
    error,
    setAccountId,
    setAmount,
    setCategory,
    setDescription,
    setTransactionDate,
    submit,
    submitting,
    transactionDate,
  };
}
