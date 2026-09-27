import { SymbolView } from "expo-symbols";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@expo/ui/community/datetime-picker";
import type { ComponentProps } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { ApiError, createHouseholdExpense, uploadHouseholdExpenseAttachments } from "@/services/api";
import { colors } from "@/theme/colors";
import type { HouseholdHeroData, HouseholdPageResponse } from "@/types/household";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const icons = {
  close: { ios: "xmark", android: "close", web: "close" },
  expense: { ios: "basket.fill", android: "shopping_basket", web: "shopping_basket" },
  plus: { ios: "plus", android: "add", web: "add" },
  check: { ios: "checkmark", android: "check", web: "check" },
  attachment: { ios: "paperclip", android: "attach_file", web: "attach_file" },
  remove: { ios: "xmark.circle.fill", android: "cancel", web: "cancel" },
} satisfies Record<string, SymbolName>;

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

const categories = [
  { value: "Groceries", label: "Mercado", defaultDescription: null, detailPlaceholder: "Ex.: compras da semana" },
  { value: "Electricity", label: "Luz", defaultDescription: "Conta de luz", detailPlaceholder: null },
  { value: "Water", label: "Água", defaultDescription: "Conta de água", detailPlaceholder: null },
  { value: "Gas", label: "Gás", defaultDescription: "Conta de gás", detailPlaceholder: null },
  { value: "Internet", label: "Internet", defaultDescription: "Conta de internet", detailPlaceholder: null },
  { value: "Cleaning", label: "Limpeza", defaultDescription: null, detailPlaceholder: "Ex.: faxina ou produtos de limpeza" },
  { value: "Rent", label: "Aluguel", defaultDescription: "Aluguel", detailPlaceholder: null },
  { value: "Council tax", label: "Imposto da casa", defaultDescription: "Imposto da casa", detailPlaceholder: null },
  { value: "Repairs", label: "Reparos", defaultDescription: null, detailPlaceholder: "Ex.: conserto da torneira" },
  { value: "Garden", label: "Jardim", defaultDescription: null, detailPlaceholder: "Ex.: corte da grama" },
  { value: "Other", label: "Outro", defaultDescription: null, detailPlaceholder: "Ex.: o que foi comprado ou feito?" },
] as const;

function currencyMark(currency: string) {
  const marks: Record<string, string> = {
    GBP: "£",
    BRL: "R$",
    USD: "$",
    EUR: "€",
  };
  return marks[currency] ?? `${currency} `;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "GBP",
  }).format(value);
}

function dateLabel(isoDate: string | null) {
  if (!isoDate) return "Escolha a data da despesa";
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function parseBrazilianDate(input: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input);
  if (!match) return null;
  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return `${yearText}-${monthText}-${dayText}`;
}

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function HouseholdExpenseSheet({
  household,
  visible,
  onClose,
  onSaved,
  onComplete,
}: {
  household: HouseholdHeroData;
  visible: boolean;
  onClose: () => void;
  onSaved: (page: HouseholdPageResponse) => void;
  onComplete: () => void;
}) {
  const { user, logout } = useAuth();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(categories[0].value);
  const [participants, setParticipants] = useState<number[]>([]);
  const [dateInput, setDateInput] = useState("");
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [attachments, setAttachments] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [createdExpenseId, setCreatedExpenseId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setAmount("");
    setDescription("");
    setCategory(categories[0].value);
    setParticipants(household.members.map((member) => member.id));
    const today = new Date();
    setDateInput(`${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`);
    setDatePickerVisible(false);
    setAttachments([]);
    setCreatedExpenseId(null);
    setSaving(false);
    setError(null);
  }, [household.id, visible]);

  const parsedAmount = useMemo(() => {
    const normalized = amount.replace(",", ".");
    const value = normalized ? Number(normalized) : 0;
    return Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;
  }, [amount]);
  const selectedCount = participants.length;
  const selectedCategory = categories.find((item) => item.value === category) ?? categories[0];
  const expenseDescription = selectedCategory.defaultDescription ?? description.trim();
  const parsedExpenseDate = parseBrazilianDate(dateInput);
  const datePickerValue = parsedExpenseDate
    ? (() => {
      const [year, month, day] = parsedExpenseDate.split("-").map(Number);
      return new Date(year, month - 1, day);
    })()
    : new Date();
  const canSubmit =
    Boolean(user) &&
    expenseDescription.length > 0 &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    Boolean(parsedExpenseDate) &&
    selectedCount >= 2 &&
    participants.includes(household.currentMemberId) &&
    !saving;
  const canSplit = household.members.length >= 2;
  const perPerson = selectedCount > 0 ? parsedAmount / selectedCount : 0;

  const toggleParticipant = (memberId: number) => {
    if (memberId === household.currentMemberId) return;
    setParticipants((current) => current.includes(memberId)
      ? current.filter((id) => id !== memberId)
      : [...current, memberId]);
  };

  const updateExpenseDate = (date: Date) => {
    setDateInput(`${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`);
    setError(null);
    setDatePickerVisible(false);
  };

  const chooseAttachments = async () => {
    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.85,
      });
      if (result.canceled) return;

      const accepted: ImagePicker.ImagePickerAsset[] = [];
      const rejected: string[] = [];
      for (const asset of result.assets) {
        const extension = asset.fileName?.split(".").pop()?.toLowerCase();
        const mimeType = asset.mimeType ?? (extension === "jpg" || extension === "jpeg"
          ? "image/jpeg"
          : extension === "png" ? "image/png" : extension === "webp" ? "image/webp" : "");
        if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
          rejected.push(`${asset.fileName ?? "Imagem"}: formato não suportado`);
        } else if (typeof asset.fileSize === "number" && asset.fileSize > MAX_ATTACHMENT_SIZE) {
          rejected.push(`${asset.fileName ?? "Imagem"}: maior que 5 MB`);
        } else {
          accepted.push({ ...asset, mimeType });
        }
      }
      setAttachments((current) => [...current, ...accepted].slice(0, MAX_ATTACHMENTS));
      setError(rejected.length ? `Use imagens JPG, PNG ou WebP de até 5 MB. ${rejected.join(" · ")}` : null);
    } catch {
      setError("Não foi possível abrir suas fotos agora.");
    }
  };

  const uploadAttachments = async (expenseId: number) => {
    if (!user) return;
    const page = await uploadHouseholdExpenseAttachments(
      user.token,
      household.id,
      expenseId,
      attachments.map((asset, index) => ({
        uri: asset.uri,
        name: asset.fileName ?? `comprovante-${index + 1}.${asset.mimeType === "image/png" ? "png" : asset.mimeType === "image/webp" ? "webp" : "jpg"}`,
        type: asset.mimeType ?? "image/jpeg",
      })),
    );
    onSaved(page);
    onClose();
    onComplete();
  };

  const submit = async () => {
    if (!user || (!canSubmit && createdExpenseId === null)) return;
    let expenseWasCreated = createdExpenseId !== null;
    setSaving(true);
    setError(null);
    try {
      if (createdExpenseId !== null) {
        await uploadAttachments(createdExpenseId);
        return;
      }
      const result = await createHouseholdExpense(user.token, household.id, {
        description: expenseDescription,
        category,
        amount: parsedAmount,
        expenseDate: parsedExpenseDate!,
        participantMemberIds: participants,
      });
      onSaved(result.page);
      if (attachments.length > 0) {
        setCreatedExpenseId(result.recordId);
        expenseWasCreated = true;
        await uploadAttachments(result.recordId);
      } else {
        onClose();
        onComplete();
      }
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        await logout();
        onClose();
        return;
      }
      setError(expenseWasCreated
        ? `A despesa foi salva, mas o comprovante não foi enviado. ${submitError instanceof Error ? submitError.message : "Tente novamente ou conclua sem o comprovante."}`
        : submitError instanceof ApiError
          ? submitError.message
          : "Não foi possível adicionar essa despesa agora.");
    } finally {
      setSaving(false);
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
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.modalHeader}>
            <View style={styles.titleIcon}>
              <SymbolView name={icons.expense} size={20} tintColor={colors.forest} weight="semibold" />
            </View>
            <View style={styles.titleCopy}>
              <Text style={styles.title}>Adicionar despesa</Text>
              <Text style={styles.dateLabel}>{dateLabel(parsedExpenseDate)}</Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar"
              accessibilityRole="button"
              hitSlop={10}
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <SymbolView name={icons.close} size={18} tintColor={colors.ink} weight="semibold" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.amountDateRow}>
              <View style={styles.amountColumn}>
                <Text style={styles.fieldLabel}>VALOR</Text>
                <View style={styles.amountField}>
                  <Text style={styles.currencyMark}>{currencyMark(household.currency)}</Text>
                  <TextInput
                    accessibilityLabel="Valor da despesa"
                    keyboardType="decimal-pad"
                    onChangeText={(value) => setAmount(value.replace(/[^0-9.,]/g, ""))}
                    placeholder="0,00"
                    placeholderTextColor={colors.inkFaint}
                    selectionColor={colors.forest}
                    style={styles.amountInput}
                    value={amount}
                  />
                </View>
              </View>
              <View style={styles.dateColumn}>
                <Text style={styles.fieldLabel}>QUANDO FOI?</Text>
                {Platform.OS === "ios" ? (
                  <View style={[styles.textField, styles.dateField]}>
                    <DateTimePicker
                      accentColor={colors.forest}
                      disabled={createdExpenseId !== null}
                      display="compact"
                      locale="pt_BR"
                      mode="date"
                      onValueChange={(_event, date) => updateExpenseDate(date)}
                      style={styles.nativeDatePicker}
                      value={datePickerValue}
                    />
                  </View>
                ) : Platform.OS === "android" ? (
                  <>
                    <Pressable
                      accessibilityLabel={`Data da despesa: ${dateInput}`}
                      accessibilityRole="button"
                      disabled={createdExpenseId !== null}
                      onPress={() => setDatePickerVisible(true)}
                      style={[styles.textField, styles.dateField, styles.dateTrigger]}
                    >
                      <Text style={styles.dateTriggerText}>{dateInput}</Text>
                      <SymbolView name={{ ios: "calendar", android: "calendar_month", web: "calendar_month" }} size={17} tintColor={colors.forest} weight="semibold" />
                    </Pressable>
                    {datePickerVisible ? (
                      <DateTimePicker
                        style={styles.nativeDatePicker}
                        mode="date"
                        negativeButton={{ label: "Cancelar" }}
                        onDismiss={() => setDatePickerVisible(false)}
                        onValueChange={(_event, date) => updateExpenseDate(date)}
                        positiveButton={{ label: "Escolher" }}
                        presentation="dialog"
                        value={datePickerValue}
                      />
                    ) : null}
                  </>
                ) : (
                  <TextInput
                    accessibilityLabel="Data da despesa"
                    editable={createdExpenseId === null}
                    keyboardType="number-pad"
                    maxLength={10}
                    onChangeText={(value) => setDateInput(formatDateInput(value))}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={colors.inkFaint}
                    style={[styles.textField, styles.dateField, !parsedExpenseDate && dateInput.length >= 10 && styles.invalidField]}
                    value={dateInput}
                  />
                )}
              </View>
            </View>
            {!parsedExpenseDate && dateInput.length >= 10 ? (
              <Text style={styles.dateError}>Confira o dia, mês e ano.</Text>
            ) : null}

            <Text style={styles.fieldLabel}>CATEGORIA</Text>
            <ScrollView contentContainerStyle={styles.chipRow} horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((item) => {
                const selected = category === item.value;
                return (
                  <Pressable
                    key={item.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      if (category !== item.value) setDescription("");
                      setCategory(item.value);
                    }}
                    style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                  >
                    <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {selectedCategory.detailPlaceholder ? (
              <View>
                <Text style={styles.fieldLabel}>O QUE FOI?</Text>
                <TextInput
                  accessibilityLabel={`Detalhe de ${selectedCategory.label.toLowerCase()}`}
                  autoCapitalize="sentences"
                  maxLength={120}
                  onChangeText={setDescription}
                  placeholder={selectedCategory.detailPlaceholder}
                  placeholderTextColor={colors.inkFaint}
                  returnKeyType="done"
                  style={styles.textField}
                  value={description}
                />
              </View>
            ) : (
              <View style={styles.autoDescription}>
                <SymbolView name={icons.check} size={15} tintColor={colors.forest} weight="bold" />
                <Text style={styles.autoDescriptionCopy}>
                  Vamos registrar como <Text style={styles.autoDescriptionName}>{selectedCategory.defaultDescription}</Text>
                </Text>
              </View>
            )}

            <View style={styles.splitHeading}>
              <View>
                <Text style={styles.fieldLabel}>DIVIDIR COM</Text>
                <Text style={styles.splitHint}>Todo mundo começa marcado.</Text>
              </View>
              <Text style={styles.selectedCount}>{selectedCount}/{household.members.length}</Text>
            </View>

            <View style={styles.memberList}>
              {household.members.map((member) => {
                const selected = participants.includes(member.id);
                const payer = member.id === household.currentMemberId;
                return (
                  <Pressable
                    key={member.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected, disabled: payer }}
                    disabled={payer}
                    onPress={() => toggleParticipant(member.id)}
                    style={styles.memberRow}
                  >
                    <View style={[styles.memberAvatar, selected && styles.memberAvatarSelected]}>
                      <Text style={[styles.memberInitial, selected && styles.memberInitialSelected]}>
                        {member.name.trim().charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text numberOfLines={1} style={styles.memberName}>
                      {payer ? "Você" : member.name}
                      {payer ? " · pagou" : ""}
                    </Text>
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected ? <SymbolView name={icons.check} size={12} tintColor={colors.white} weight="bold" /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {selectedCount > 0 && parsedAmount > 0 ? (
              <View style={styles.splitPreview}>
                <Text style={styles.splitPreviewLabel}>Fica mais ou menos</Text>
                <Text style={styles.splitPreviewAmount}>{formatCurrency(perPerson, household.currency)} por pessoa</Text>
                <Text style={styles.roundingHint}>Os centavos são ajustados ao salvar.</Text>
              </View>
            ) : null}

            <View style={styles.attachmentHeading}>
              <View style={styles.attachmentCopy}>
                <Text style={styles.fieldLabel}>COMPROVANTE</Text>
                <Text style={styles.attachmentHint}>JPG, PNG ou WebP · até 5 MB cada</Text>
              </View>
              <Text style={styles.selectedCount}>{attachments.length}/{MAX_ATTACHMENTS}</Text>
            </View>
            {attachments.length > 0 ? (
              <ScrollView contentContainerStyle={styles.attachmentList} horizontal showsHorizontalScrollIndicator={false}>
                {attachments.map((asset, index) => (
                  <View key={`${asset.uri}-${index}`} style={styles.attachmentPreview}>
                    <Image source={{ uri: asset.uri }} style={styles.attachmentImage} />
                    <Pressable
                      accessibilityLabel="Remover comprovante"
                      accessibilityRole="button"
                      disabled={createdExpenseId !== null}
                      onPress={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      style={styles.removeAttachment}
                    >
                      <SymbolView name={icons.remove} size={20} tintColor={colors.ink} weight="semibold" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            ) : null}
            {createdExpenseId === null && attachments.length < MAX_ATTACHMENTS ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => void chooseAttachments()}
                style={({ pressed }) => [styles.attachmentButton, pressed && styles.pressed]}
              >
                <SymbolView name={icons.attachment} size={17} tintColor={colors.forest} weight="semibold" />
                <Text style={styles.attachmentButtonText}>{attachments.length ? "Adicionar mais fotos" : "Adicionar foto do comprovante"}</Text>
                <SymbolView name={icons.plus} size={16} tintColor={colors.forest} weight="semibold" />
              </Pressable>
            ) : null}

            {!canSplit ? <Text style={styles.errorText}>Adicione mais alguém à casa para dividir uma despesa.</Text> : null}
            {selectedCount < 2 && canSplit ? <Text style={styles.errorText}>Selecione pelo menos mais uma pessoa.</Text> : null}
          </ScrollView>
          <View style={styles.sheetFooter}>
            {error ? <Text style={styles.footerError}>{error}</Text> : null}
            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit && createdExpenseId === null}
              onPress={() => void submit()}
              style={({ pressed }) => [styles.saveButton, !canSubmit && createdExpenseId === null && styles.saveButtonDisabled, pressed && (canSubmit || createdExpenseId !== null) && styles.pressed]}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <SymbolView name={icons.plus} size={18} tintColor={colors.white} weight="bold" />
                  <Text style={styles.saveButtonText}>{createdExpenseId !== null ? "Tentar enviar comprovante" : "Adicionar à casa"}</Text>
                </>
              )}
            </Pressable>
            {createdExpenseId !== null ? (
              <Pressable
                accessibilityRole="button"
                disabled={saving}
                onPress={() => { onClose(); onComplete(); }}
                style={styles.skipAttachmentButton}
              >
                <Text style={styles.skipAttachmentText}>Concluir sem comprovante</Text>
              </Pressable>
            ) : null}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { backgroundColor: "rgba(17, 31, 34, 0.46)", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  sheet: { backgroundColor: colors.paper, borderTopLeftRadius: 28, borderTopRightRadius: 28, height: "78%", maxHeight: "78%", overflow: "hidden" },
  handle: { alignSelf: "center", backgroundColor: colors.line, borderRadius: 2, height: 4, marginTop: 10, width: 38 },
  modalHeader: { alignItems: "center", borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", paddingHorizontal: 20, paddingVertical: 15 },
  titleIcon: { alignItems: "center", backgroundColor: colors.header, borderRadius: 14, height: 42, justifyContent: "center", marginRight: 12, width: 42 },
  titleCopy: { flex: 1 },
  title: { color: colors.ink, fontSize: 19, fontWeight: "800", letterSpacing: -0.3 },
  dateLabel: { color: colors.inkSoft, fontSize: 12, marginTop: 3 },
  closeButton: { alignItems: "center", backgroundColor: colors.paperMuted, borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
  formScroll: { flex: 1 },
  form: { paddingHorizontal: 20, paddingTop: 2, paddingBottom: 22 },
  sheetFooter: { backgroundColor: colors.paper, borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  footerError: { color: colors.danger, fontSize: 11, fontWeight: "600", lineHeight: 15, marginBottom: 7 },
  amountDateRow: { alignItems: "stretch", flexDirection: "row", gap: 10 },
  amountColumn: { flex: 1, minWidth: 0 },
  dateColumn: { flex: 1, minWidth: 0 },
  fieldLabel: { color: colors.inkSoft, fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 7, marginTop: 16 },
  amountField: { alignItems: "center", backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexDirection: "row", height: 56, paddingHorizontal: 11 },
  currencyMark: { color: colors.forest, fontSize: 20, fontWeight: "800", marginRight: 6 },
  amountInput: { color: colors.ink, flex: 1, fontSize: 24, fontWeight: "800", minHeight: 54, paddingVertical: 8 },
  textField: { backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 14, borderWidth: 1, color: colors.ink, fontSize: 14, minHeight: 48, paddingHorizontal: 14, paddingVertical: 10 },
  dateField: { fontSize: 13, height: 56, paddingHorizontal: 9 },
  dateTrigger: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  dateTriggerText: { color: colors.ink, fontSize: 13, fontWeight: "600" },
  nativeDatePicker: { height: 54, width: "100%" },
  invalidField: { borderColor: colors.danger },
  dateError: { color: colors.danger, fontSize: 11, marginTop: 5 },
  chipRow: { gap: 7, paddingRight: 3 },
  categoryChip: { backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  categoryChipSelected: { backgroundColor: colors.incomeTint, borderColor: colors.income },
  categoryText: { color: colors.inkSoft, fontSize: 11, fontWeight: "600" },
  categoryTextSelected: { color: colors.income, fontWeight: "800" },
  autoDescription: { alignItems: "center", backgroundColor: colors.header, borderRadius: 13, flexDirection: "row", gap: 8, marginTop: 16, paddingHorizontal: 12, paddingVertical: 11 },
  autoDescriptionCopy: { color: colors.inkSoft, flex: 1, fontSize: 12, lineHeight: 17 },
  autoDescriptionName: { color: colors.ink, fontWeight: "800" },
  splitHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  splitHint: { color: colors.inkFaint, fontSize: 11, marginTop: -3 },
  selectedCount: { backgroundColor: colors.header, borderRadius: 10, color: colors.forest, fontSize: 11, fontWeight: "800", overflow: "hidden", paddingHorizontal: 9, paddingVertical: 5 },
  memberList: { backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 16, borderWidth: 1, marginTop: 8, overflow: "hidden", paddingHorizontal: 12 },
  memberRow: { alignItems: "center", borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", minHeight: 48 },
  memberAvatar: { alignItems: "center", backgroundColor: colors.paperMuted, borderRadius: 14, height: 29, justifyContent: "center", marginRight: 10, width: 29 },
  memberAvatarSelected: { backgroundColor: colors.header },
  memberInitial: { color: colors.inkFaint, fontSize: 11, fontWeight: "800" },
  memberInitialSelected: { color: colors.forest },
  memberName: { color: colors.ink, flex: 1, fontSize: 13, fontWeight: "600" },
  checkbox: { alignItems: "center", borderColor: colors.line, borderRadius: 7, borderWidth: 1.5, height: 22, justifyContent: "center", width: 22 },
  checkboxSelected: { backgroundColor: colors.forest, borderColor: colors.forest },
  splitPreview: { backgroundColor: colors.incomeTint, borderRadius: 14, marginTop: 12, paddingHorizontal: 13, paddingVertical: 10 },
  splitPreviewLabel: { color: colors.inkSoft, fontSize: 11 },
  splitPreviewAmount: { color: colors.income, fontSize: 14, fontWeight: "800", marginTop: 2 },
  roundingHint: { color: colors.inkFaint, fontSize: 10, marginTop: 2 },
  attachmentHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  attachmentCopy: { flex: 1 },
  attachmentHint: { color: colors.inkFaint, fontSize: 11, marginTop: -5 },
  attachmentList: { gap: 10, paddingVertical: 3 },
  attachmentPreview: { height: 76, position: "relative", width: 76 },
  attachmentImage: { backgroundColor: colors.header, borderRadius: 13, height: 76, width: 76 },
  removeAttachment: { backgroundColor: colors.paper, borderRadius: 10, position: "absolute", right: -5, top: -5 },
  attachmentButton: { alignItems: "center", backgroundColor: colors.paperRaised, borderColor: colors.line, borderRadius: 13, borderStyle: "dashed", borderWidth: 1, flexDirection: "row", gap: 9, justifyContent: "center", minHeight: 46, marginTop: 9, paddingHorizontal: 12 },
  attachmentButtonText: { color: colors.forest, flex: 1, fontSize: 12, fontWeight: "700" },
  errorText: { color: colors.danger, fontSize: 12, fontWeight: "600", lineHeight: 18, marginTop: 12 },
  saveButton: { alignItems: "center", backgroundColor: colors.forest, borderRadius: 16, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 50 },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: { color: colors.white, fontSize: 14, fontWeight: "800" },
  skipAttachmentButton: { alignItems: "center", minHeight: 38, justifyContent: "center" },
  skipAttachmentText: { color: colors.inkSoft, fontSize: 12, fontWeight: "700" },
  pressed: { opacity: 0.78 },
});
