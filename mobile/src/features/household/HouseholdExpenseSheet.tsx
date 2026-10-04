import { SymbolView } from "expo-symbols";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@expo/ui/community/datetime-picker";
import type { ComponentProps } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
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
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { useAuth } from "@/contexts/AuthContext";
import { HouseholdCategoryIcon } from "@/features/household/HouseholdCategoryIcon";
import { categories, categoryPalette, categoryTones } from "@/features/household/householdCategories";
import { HouseholdLandscape } from "@/features/household/HouseholdLandscape";
import { ApiError, createHouseholdExpense, uploadHouseholdExpenseAttachments } from "@/services/api";
import { nu } from "@/components/dashboard/nuTheme";
import type { HouseholdHeroData, HouseholdPageResponse } from "@/types/household";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

const icons = {
  close: { ios: "xmark", android: "close", web: "close" },
  expense: { ios: "basket.fill", android: "shopping_basket", web: "shopping_basket" },
  plus: { ios: "plus", android: "add", web: "add" },
  check: { ios: "checkmark", android: "check", web: "check" },
  attachment: { ios: "paperclip", android: "attach_file", web: "attach_file" },
  remove: { ios: "xmark.circle.fill", android: "cancel", web: "cancel" },
  people: { ios: "person.2", android: "group", web: "group" },
} satisfies Record<string, SymbolName>;

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

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
  const formLocked = saving || createdExpenseId !== null;

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
    if (saving || !user || (!canSubmit && createdExpenseId === null)) return;
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
      onRequestClose={() => { if (!saving) onClose(); }}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <Pressable accessibilityLabel="Fechar despesa" accessibilityRole="button" disabled={saving} onPress={onClose} style={styles.backdrop} />
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          <View style={styles.headerBanner}>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              pointerEvents="none"
              style={styles.headerArt}
            >
              <HouseholdLandscape height={170} width={190} />
              <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="expenseHeaderFade" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0" stopColor={nu.brandTint} stopOpacity="1" />
                    <Stop offset="0.55" stopColor={nu.brandTint} stopOpacity="0.78" />
                    <Stop offset="1" stopColor={nu.brandTint} stopOpacity="0.22" />
                  </LinearGradient>
                </Defs>
                <Rect fill="url(#expenseHeaderFade)" height="100%" width="100%" />
              </Svg>
            </View>
            <View style={styles.handle} />
            <View style={styles.modalHeader}>
              <View style={styles.titleIcon}>
                <SymbolView name={icons.expense} size={20} tintColor={nu.brand} weight="semibold" />
              </View>
              <View style={styles.titleCopy}>
                <Text numberOfLines={1} style={styles.householdLabel}>{household.name}</Text>
                <Text style={styles.title}>Adicionar despesa</Text>
                <Text style={styles.headerHint}>As contas da casa, juntas.</Text>
              </View>
              <Pressable
                accessibilityLabel="Fechar"
                accessibilityRole="button"
                hitSlop={10}
                disabled={saving}
                onPress={onClose}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              >
                <SymbolView name={icons.close} size={18} tintColor={nu.ink} weight="semibold" />
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.amountDateRow}>
              <View style={styles.amountColumn}>
                <Text style={styles.amountLabel}>Valor total da despesa</Text>
                <View style={styles.amountField}>
                  <Text style={styles.currencyMark}>{currencyMark(household.currency)}</Text>
                  <TextInput
                    accessibilityLabel="Valor da despesa"
                    editable={!formLocked}
                    keyboardType="decimal-pad"
                    onChangeText={(value) => setAmount(value.replace(/[^0-9.,]/g, ""))}
                    placeholder="0,00"
                    placeholderTextColor={nu.inkFaint}
                    selectionColor={nu.brand}
                    style={[styles.amountInput, { width: Math.max(92, (amount || "0,00").length * 23) }]}
                    value={amount}
                  />
                  <View style={styles.amountHintRow}>
                    <SymbolView name={icons.people} size={14} tintColor={nu.brand} />
                    <Text numberOfLines={1} style={styles.amountHint}>
                      {selectedCount >= 2 ? `Dividido por ${selectedCount} pessoas` : "Selecione quem vai dividir"}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.dateColumn}>
                <Text style={styles.fieldLabel}>Data da despesa</Text>
                {Platform.OS === "ios" || Platform.OS === "android" ? (
                  <>
                    <Pressable
                      accessibilityLabel={`Data da despesa: ${dateInput}`}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: formLocked, expanded: datePickerVisible }}
                      disabled={formLocked}
                      onPress={() => {
                        Keyboard.dismiss();
                        setDatePickerVisible((current) => !current);
                      }}
                      style={[styles.textField, styles.dateField, styles.dateTrigger]}
                    >
                      <Text style={styles.dateTriggerText}>{dateInput}</Text>
                      <SymbolView name={{ ios: "calendar", android: "calendar_month", web: "calendar_month" }} size={17} tintColor={nu.brand} weight="semibold" />
                    </Pressable>
                    {datePickerVisible && Platform.OS === "ios" ? (
                      <View style={styles.iosCalendar}>
                        <DateTimePicker
                          accentColor={nu.brand}
                          disabled={formLocked}
                          display="inline"
                          locale="pt_BR"
                          mode="date"
                          onValueChange={(_event, date) => updateExpenseDate(date)}
                          style={styles.iosDatePicker}
                          themeVariant="light"
                          value={datePickerValue}
                        />
                        <Pressable
                          accessibilityLabel={"Fechar calend\u00e1rio"}
                          accessibilityRole="button"
                          onPress={() => setDatePickerVisible(false)}
                          style={styles.calendarCloseButton}
                        >
                          <Text style={styles.calendarCloseText}>Fechar</Text>
                        </Pressable>
                      </View>
                    ) : datePickerVisible ? (
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
                    editable={!formLocked}
                    keyboardType="number-pad"
                    maxLength={10}
                    onChangeText={(value) => setDateInput(formatDateInput(value))}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={nu.inkFaint}
                    style={[styles.textField, styles.dateField, !parsedExpenseDate && dateInput.length >= 10 && styles.invalidField]}
                    value={dateInput}
                  />
                )}
              </View>
            </View>
            {!parsedExpenseDate && dateInput.length >= 10 ? (
              <Text style={styles.dateError}>Confira o dia, mês e ano.</Text>
            ) : null}

            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Sobre a despesa</Text>
              <Text style={styles.sectionHint}>Escolha a categoria que combina com ela.</Text>
              <View style={styles.chipRow}>
                {categories.map((item) => {
                  const selected = category === item.value;
                  const tone = categoryPalette[categoryTones[item.value]];
                  return (
                    <Pressable
                      key={item.value}
                      accessibilityRole="button"
                      accessibilityState={{ selected, disabled: formLocked }}
                      disabled={formLocked}
                      onPress={() => {
                        if (category !== item.value) setDescription("");
                        setCategory(item.value);
                      }}
                      style={({ pressed }) => [
                        styles.categoryChip,
                        selected && styles.categoryChipSelected,
                        pressed && styles.categoryChipPressed,
                      ]}
                    >
                      <View style={[
                        styles.categoryIcon,
                        { backgroundColor: tone.background },
                        selected && styles.categoryIconSelected,
                      ]}>
                        <HouseholdCategoryIcon category={item.value} size={16} color={selected ? nu.white : tone.ink} weight="medium" />
                      </View>
                      <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{item.label}</Text>
                      {selected ? (
                        <View style={styles.categoryCheck}>
                          <SymbolView name={icons.check} size={9} tintColor={nu.brand} weight="bold" />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              {selectedCategory.detailPlaceholder ? (
                <View>
                  <Text style={styles.fieldLabel}>O que foi?</Text>
                  <TextInput
                    accessibilityLabel={`Detalhe de ${selectedCategory.label.toLowerCase()}`}
                    autoCapitalize="sentences"
                    editable={!formLocked}
                    maxLength={120}
                    onChangeText={setDescription}
                    placeholder={selectedCategory.detailPlaceholder}
                    placeholderTextColor={nu.inkFaint}
                    returnKeyType="done"
                    style={styles.textField}
                    value={description}
                  />
                </View>
              ) : (
                <View style={styles.autoDescription}>
                  <SymbolView name={icons.check} size={15} tintColor={nu.brand} weight="bold" />
                  <Text style={styles.autoDescriptionCopy}>
                    Vamos registrar como <Text style={styles.autoDescriptionName}>{selectedCategory.defaultDescription}</Text>
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.formCard}>
              <View style={styles.splitHeading}>
                <View>
                  <Text style={styles.sectionTitle}>Quem vai dividir?</Text>
                  <Text style={styles.splitHint}>Selecione os participantes.</Text>
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
                      accessibilityLabel={`${member.name}${payer ? ", voc\u00ea pagou" : ""}`}
                      accessibilityState={{ checked: selected, disabled: payer || formLocked }}
                      disabled={payer || formLocked}
                      onPress={() => toggleParticipant(member.id)}
                      style={[styles.memberRow, selected && styles.memberRowSelected]}
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
                        {selected ? <SymbolView name={icons.check} size={12} tintColor={nu.white} weight="bold" /> : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {selectedCount >= 2 && parsedAmount > 0 ? (
                <View style={styles.splitPreview}>
                  <View style={styles.splitPreviewHeading}>
                    <SymbolView name={icons.people} size={17} tintColor={nu.brand} />
                    <Text style={styles.splitPreviewLabel}>Por pessoa, aproximadamente</Text>
                  </View>
                  <Text style={styles.splitPreviewAmount}>{formatCurrency(perPerson, household.currency)}</Text>
                  <Text style={styles.roundingHint}>Os centavos são ajustados ao salvar.</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.formCard}>
              <View style={styles.attachmentHeading}>
                <View style={styles.attachmentCopy}>
                  <Text style={styles.sectionTitle}>Comprovante <Text style={styles.optionalLabel}>opcional</Text></Text>
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
                        disabled={formLocked}
                        hitSlop={8}
                        onPress={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                        style={styles.removeAttachment}
                      >
                        <SymbolView name={icons.remove} size={20} tintColor={nu.ink} weight="semibold" />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              ) : null}
              {createdExpenseId === null && attachments.length < MAX_ATTACHMENTS ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={formLocked}
                  onPress={() => void chooseAttachments()}
                  style={({ pressed }) => [styles.attachmentButton, pressed && styles.pressed]}
                >
                  <SymbolView name={icons.attachment} size={17} tintColor={nu.brand} weight="semibold" />
                  <Text style={styles.attachmentButtonText}>{attachments.length ? "Adicionar mais fotos" : "Adicionar foto do comprovante"}</Text>
                  <SymbolView name={icons.plus} size={16} tintColor={nu.brand} weight="semibold" />
                </Pressable>
              ) : null}
            </View>

            {!canSplit ? <Text style={styles.errorText}>Adicione mais alguém à casa para dividir uma despesa.</Text> : null}
            {selectedCount < 2 && canSplit ? <Text style={styles.errorText}>Selecione pelo menos mais uma pessoa.</Text> : null}
          </ScrollView>
          <View style={styles.sheetFooter}>
            {error ? <Text style={styles.footerError}>{error}</Text> : null}
            <View style={styles.footerSummary}>
              <Text style={styles.footerSummaryLabel}>Total da despesa</Text>
              <Text adjustsFontSizeToFit numberOfLines={1} style={styles.footerSummaryAmount}>
                {formatCurrency(parsedAmount, household.currency)}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy: saving }}
              disabled={saving || (!canSubmit && createdExpenseId === null)}
              onPress={() => void submit()}
              style={({ pressed }) => [styles.saveButton, !canSubmit && createdExpenseId === null && styles.saveButtonDisabled, pressed && (canSubmit || createdExpenseId !== null) && styles.pressed]}
            >
              {saving ? (
                <ActivityIndicator color={nu.white} />
              ) : (
                <>
                  <SymbolView name={icons.plus} size={18} tintColor={nu.white} weight="bold" />
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
  backdrop: { backgroundColor: "rgba(19, 36, 28, 0.48)", ...StyleSheet.absoluteFill },
  sheet: { alignSelf: "center", backgroundColor: nu.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, height: "90%", maxHeight: "90%", maxWidth: 640, overflow: "hidden", width: "100%" },
  headerBanner: { backgroundColor: nu.brandTint, borderBottomColor: nu.hairline, borderBottomWidth: 1, marginBottom: 14, overflow: "hidden" },
  headerArt: { bottom: 0, position: "absolute", right: 0, top: 0, width: 190 },
  handle: { alignSelf: "center", backgroundColor: nu.track, borderRadius: 3, height: 5, marginTop: 10, width: 36 },
  modalHeader: { alignItems: "center", flexDirection: "row", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20 },
  titleIcon: { alignItems: "center", backgroundColor: nu.brandTint, borderColor: nu.track, borderWidth: 1, borderRadius: 17, height: 48, justifyContent: "center", marginRight: 12, width: 48 },
  titleCopy: { flex: 1, minWidth: 0 },
  householdLabel: { color: nu.brand, fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 3 },
  title: { color: nu.ink, fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  headerHint: { color: nu.inkSoft, fontSize: 11, marginTop: 4 },
  closeButton: { alignItems: "center", backgroundColor: nu.hairline, borderRadius: 22, height: 44, justifyContent: "center", marginLeft: 6, width: 44 },
  formScroll: { flex: 1 },
  form: { gap: 14, paddingHorizontal: 16, paddingBottom: 22 },
  formCard: { backgroundColor: nu.surface, borderColor: nu.hairline, borderRadius: 22, borderWidth: 1, padding: 16 },
  sectionTitle: { color: nu.ink, fontSize: 15, fontWeight: "700", letterSpacing: -0.2 },
  sectionHint: { color: nu.inkSoft, fontSize: 11, lineHeight: 16, marginTop: 4 },
  sheetFooter: { backgroundColor: nu.surface, borderTopColor: nu.hairline, borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  footerSummary: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between", marginBottom: 10 },
  footerSummaryLabel: { color: nu.inkSoft, fontSize: 12 },
  footerSummaryAmount: { color: nu.ink, flexShrink: 1, fontSize: 17, fontWeight: "800" },
  footerError: { color: nu.negative, fontSize: 11, fontWeight: "600", lineHeight: 15, marginBottom: 7 },
  amountDateRow: { backgroundColor: nu.brandTint, borderColor: nu.track, borderRadius: 24, borderWidth: 1, padding: 18 },
  amountColumn: { minWidth: 0 },
  amountLabel: { color: nu.brand, fontSize: 12, fontWeight: "600" },
  amountHintRow: { alignItems: "center", flexDirection: "row", flexShrink: 0, gap: 4, marginLeft: 4 },
  amountHint: { color: nu.brand, fontSize: 11, lineHeight: 16 },
  dateColumn: { borderTopColor: nu.track, borderTopWidth: 1, marginTop: 16, minWidth: 0 },
  fieldLabel: { color: nu.inkSoft, fontSize: 12, fontWeight: "600", marginBottom: 8, marginTop: 14 },
  amountField: { alignItems: "center", flexDirection: "row", minHeight: 68 },
  currencyMark: { color: nu.brand, fontSize: 28, fontWeight: "600", marginRight: 8 },
  amountInput: { color: nu.ink, flexShrink: 1, fontSize: 42, fontWeight: "800", letterSpacing: -1.5, minHeight: 64, minWidth: 0, paddingHorizontal: 0, paddingVertical: 4 },
  textField: { backgroundColor: nu.surface, borderColor: nu.hairline, borderRadius: 14, borderWidth: 1, color: nu.ink, fontSize: 14, minHeight: 50, paddingHorizontal: 14, paddingVertical: 12 },
  dateField: { backgroundColor: nu.surface, fontSize: 13, minHeight: 50, paddingHorizontal: 12, paddingVertical: 0 },
  dateTrigger: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  dateTriggerText: { color: nu.ink, fontSize: 13, fontWeight: "600" },
  nativeDatePicker: { height: 50, width: "100%" },
  iosCalendar: { backgroundColor: nu.surface, borderColor: nu.hairline, borderRadius: 16, borderWidth: 1, marginTop: 10, overflow: "hidden" },
  iosDatePicker: { minHeight: 320, width: "100%" },
  calendarCloseButton: { alignItems: "center", borderTopColor: nu.hairline, borderTopWidth: StyleSheet.hairlineWidth, justifyContent: "center", minHeight: 44 },
  calendarCloseText: { color: nu.brand, fontSize: 12, fontWeight: "700" },
  invalidField: { borderColor: nu.negative },
  dateError: { color: nu.negative, fontSize: 11 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  categoryChip: { alignItems: "center", backgroundColor: nu.surface, borderColor: nu.hairline, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 7, minHeight: 48, paddingLeft: 7, paddingRight: 15, paddingVertical: 8 },
  categoryChipSelected: { backgroundColor: nu.brandTint, borderColor: nu.brand },
  categoryChipPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  categoryIcon: { alignItems: "center", borderRadius: 10, height: 28, justifyContent: "center", width: 28 },
  categoryIconSelected: { backgroundColor: nu.brand },
  categoryCheck: { position: "absolute", right: 4, top: 4 },
  categoryText: { color: nu.inkSoft, fontSize: 11, fontWeight: "600" },
  categoryTextSelected: { color: nu.brand, fontWeight: "800" },
  autoDescription: { alignItems: "center", backgroundColor: nu.brandTint, borderRadius: 13, flexDirection: "row", gap: 8, marginTop: 16, paddingHorizontal: 12, paddingVertical: 11 },
  autoDescriptionCopy: { color: nu.inkSoft, flex: 1, fontSize: 12, lineHeight: 17 },
  autoDescriptionName: { color: nu.ink, fontWeight: "700" },
  splitHeading: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between" },
  splitHint: { color: nu.inkSoft, fontSize: 11, marginTop: 4 },
  selectedCount: { backgroundColor: nu.brandTint, borderRadius: 10, color: nu.brand, fontSize: 11, fontWeight: "800", overflow: "hidden", paddingHorizontal: 9, paddingVertical: 6 },
  memberList: { gap: 6, marginTop: 14 },
  memberRow: { alignItems: "center", backgroundColor: nu.surface, borderColor: nu.hairline, borderRadius: 14, borderWidth: 1, flexDirection: "row", minHeight: 58, paddingHorizontal: 10, paddingVertical: 8 },
  memberRowSelected: { backgroundColor: nu.brandTint, borderColor: nu.brandTint },
  memberAvatar: { alignItems: "center", backgroundColor: nu.hairline, borderRadius: 18, height: 36, justifyContent: "center", marginRight: 10, width: 36 },
  memberAvatarSelected: { backgroundColor: nu.brandTint },
  memberInitial: { color: nu.inkFaint, fontSize: 13, fontWeight: "700" },
  memberInitialSelected: { color: nu.brand },
  memberName: { color: nu.ink, flex: 1, fontSize: 13, fontWeight: "600" },
  checkbox: { alignItems: "center", borderColor: nu.track, borderRadius: 12, borderWidth: 1.5, height: 24, justifyContent: "center", width: 24 },
  checkboxSelected: { backgroundColor: nu.brand, borderColor: nu.brand },
  splitPreview: { backgroundColor: nu.brandTint, borderRadius: 16, marginTop: 14, padding: 14 },
  splitPreviewHeading: { alignItems: "center", flexDirection: "row", gap: 7 },
  splitPreviewLabel: { color: nu.brand, flex: 1, fontSize: 11 },
  splitPreviewAmount: { color: nu.brand, fontSize: 25, fontWeight: "800", letterSpacing: -0.5, marginTop: 6 },
  roundingHint: { color: nu.inkSoft, fontSize: 10, marginTop: 4 },
  attachmentHeading: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between" },
  attachmentCopy: { flex: 1 },
  optionalLabel: { color: nu.inkFaint, fontSize: 10, fontWeight: "500" },
  attachmentHint: { color: nu.inkSoft, fontSize: 10, lineHeight: 15, marginTop: 5 },
  attachmentList: { gap: 12, paddingTop: 14, paddingBottom: 6, paddingRight: 6 },
  attachmentPreview: { height: 84, position: "relative", width: 84 },
  attachmentImage: { backgroundColor: nu.brandTint, borderRadius: 14, height: 84, width: 84 },
  removeAttachment: { alignItems: "center", backgroundColor: nu.surface, borderRadius: 14, height: 28, justifyContent: "center", position: "absolute", right: -5, top: -5, width: 28 },
  attachmentButton: { alignItems: "center", backgroundColor: nu.surface, borderColor: nu.track, borderRadius: 15, borderStyle: "dashed", borderWidth: 1, flexDirection: "row", gap: 9, justifyContent: "center", minHeight: 64, marginTop: 14, paddingHorizontal: 14 },
  attachmentButtonText: { color: nu.brand, flex: 1, fontSize: 12, fontWeight: "600" },
  errorText: { color: nu.negative, fontSize: 12, fontWeight: "600", lineHeight: 18 },
  saveButton: { alignItems: "center", backgroundColor: nu.brand, borderRadius: 17, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 54, paddingHorizontal: 14 },
  saveButtonDisabled: { backgroundColor: nu.brand },
  saveButtonText: { color: nu.white, flexShrink: 1, fontSize: 14, fontWeight: "800" },
  skipAttachmentButton: { alignItems: "center", minHeight: 44, justifyContent: "center" },
  skipAttachmentText: { color: nu.inkSoft, fontSize: 12, fontWeight: "700" },
  pressed: { opacity: 0.78 },
});
