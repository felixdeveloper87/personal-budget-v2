import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { cleaningDutyPreview } from "@/features/household/cleaningDuties";
import { expenseDateLabel } from "@/features/household/expenseHistory";
import { HouseholdCleaningProgress } from "@/features/household/HouseholdCleaningProgress";
import { HouseholdCleaningSheet } from "@/features/household/HouseholdCleaningSheet";
import { ApiError, getHouseholdPage, updateHouseholdCleaningDuty } from "@/services/api";
import { colors } from "@/theme/colors";
import type { HouseholdCleaningDuty, HouseholdHeroData, HouseholdPageResponse } from "@/types/household";

export function HouseholdCleaning({ household, onUpdated }: { household: HouseholdHeroData; onUpdated: (page: HouseholdPageResponse) => void }) {
  const { user, logout } = useAuth();
  const [visible, setVisible] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const rotation = household.cleaningRotation;
  const current = rotation?.currentWeek;
  const next = rotation?.upcomingWeeks[0];
  const duties = current?.duties.length ? current.duties : cleaningDutyPreview;
  const isYourWeek = current?.assignedMemberId === household.currentMemberId;
  const canEdit = Boolean(rotation?.configured && rotation.active && current && isYourWeek);
  const complete = current?.status === "COMPLETED";
  const guidance = !rotation?.configured
    ? "Conheça as tarefas da casa. A marcação será liberada quando a escala começar."
    : !rotation.active
      ? "A escala está pausada. As tarefas ficam disponíveis apenas para consulta."
      : !current
        ? "A escala ainda não começou. Por enquanto, você pode consultar as tarefas."
        : isYourWeek
          ? "Sua semana! Marque cada tarefa conforme terminar. Você também pode desmarcá-la."
          : `Nesta semana, ${current.assignedMemberName} cuida da limpeza. Você pode acompanhar o progresso aqui.`;

  async function runRequest(key: string, action: () => Promise<HouseholdPageResponse>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusyKey(key);
    setError(null);
    try {
      const page = await action();
      if (mounted.current) onUpdated(page);
    } catch (requestError) {
      if (!mounted.current) return;
      if (requestError instanceof ApiError && requestError.status === 401) {
        await logout();
        return;
      }
      setError(requestError instanceof ApiError && [403, 404, 409].includes(requestError.status)
        ? "A escala mudou ou você não pode alterar esta tarefa. Atualize o checklist."
        : "Não foi possível confirmar a atualização. Atualize o checklist e tente novamente.");
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusyKey(null);
    }
  }

  function toggleDuty(duty: HouseholdCleaningDuty) {
    if (!user || !current || !canEdit || !duty.canToggle) return;
    void runRequest(duty.key, () => updateHouseholdCleaningDuty(user.token, household.id, current.id, duty.key, !duty.completed));
  }

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>CUIDADOS DA CASA</Text>
          <Text style={styles.title}>Limpeza semanal</Text>
        </View>
        {rotation ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir checklist da limpeza semanal" onPress={() => setVisible(true)} style={styles.open}>
            <Text style={styles.openText}>Ver tarefas</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.card}>
        {rotation?.configured && rotation.active && current ? (
          <>
            <View style={styles.periodRow}>
              <Text style={styles.period}>{expenseDateLabel(current.weekStart)} – {expenseDateLabel(current.weekEnd)}</Text>
            </View>
            <View style={styles.personRow}>
              <View style={styles.avatar}>
                <Text style={styles.initials}>{current.assignedMemberName.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase()}</Text>
              </View>
              <View style={styles.copy}>
                <Text style={styles.caption}>{isYourWeek ? "SUA SEMANA" : "RESPONSÁVEL DA SEMANA"}</Text>
                <Text style={styles.name}>{current.assignedMemberName}</Text>
              </View>
            </View>
            <HouseholdCleaningProgress duties={duties} />
            {complete ? <Text style={styles.complete}>Tudo em dia. Limpeza da semana concluída!</Text> : null}
          </>
        ) : (
          <View style={styles.empty}>
            <View style={styles.copy}>
              <Text style={styles.emptyTitle}>{!rotation ? "Escala indisponível" : !rotation.configured ? "Uma casa bem cuidada, juntos" : !rotation.active ? "Escala pausada" : "Escala programada"}</Text>
              <Text style={styles.emptyText}>{!rotation
                ? "Atualize a página para carregar a limpeza semanal."
                : !rotation.configured
                  ? rotation.canManage ? "Configure a escala na versão web para definir os responsáveis de cada semana." : "O responsável pela casa ainda precisa configurar a escala."
                  : !rotation.active
                    ? "A rotina está em pausa. Você ainda pode consultar o checklist."
                    : (next?.weekStart ?? rotation.startDate)
                      ? `Começa em ${expenseDateLabel((next?.weekStart ?? rotation.startDate)!)}.`
                      : "A próxima semana ainda não foi definida."}</Text>
            </View>
          </View>
        )}
        {rotation?.configured && rotation.active && next ? (
          <View style={styles.next}>
            <SymbolView name={{ ios: "arrow.triangle.2.circlepath", android: "repeat", web: "repeat" }} size={14} tintColor={colors.inkSoft} />
            <Text style={styles.nextText}>A seguir: <Text style={styles.nextName}>{next.assignedMemberId === household.currentMemberId ? "Você" : next.assignedMemberName}</Text> · {expenseDateLabel(next.weekStart)}</Text>
          </View>
        ) : null}
      </View>
      {visible ? (
        <HouseholdCleaningSheet
          duties={duties}
          guidance={guidance}
          canEdit={canEdit}
          busyKey={busyKey}
          error={error}
          onToggle={toggleDuty}
          onRefresh={() => { if (user) void runRequest("refresh", () => getHouseholdPage(user.token)); }}
          onClose={() => setVisible(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 26 },
  heading: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  copy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.income, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 20, fontWeight: "700", letterSpacing: -0.4, marginTop: 5 },
  open: { minHeight: 44, paddingHorizontal: 12, borderRadius: 13, backgroundColor: "#E5EDDC", alignItems: "center", justifyContent: "center" },
  openText: { color: colors.income, fontSize: 11, fontWeight: "700" },
  card: { borderRadius: 16, padding: 16, backgroundColor: "#FFFEFA", borderWidth: 1, borderColor: "#E2E6DB", gap: 14 },
  periodRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  period: { flex: 1, color: colors.inkSoft, fontSize: 10, lineHeight: 15 },
  personRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  avatar: { height: 42, width: 42, borderRadius: 15, backgroundColor: "#D8E5CC", alignItems: "center", justifyContent: "center" },
  initials: { color: colors.income, fontSize: 14, fontWeight: "800" },
  caption: { color: colors.income, fontSize: 8, fontWeight: "800", letterSpacing: 0.8 },
  name: { color: colors.ink, fontSize: 17, fontWeight: "700", marginTop: 4 },
  complete: { color: colors.income, fontSize: 11, fontWeight: "600" },
  next: { flexDirection: "row", alignItems: "center", gap: 7, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#DCE5D5" },
  nextText: { flex: 1, color: colors.inkSoft, fontSize: 10, lineHeight: 16 },
  nextName: { color: colors.ink, fontWeight: "700" },
  empty: { flexDirection: "row", alignItems: "center", gap: 12 },
  emptyTitle: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  emptyText: { color: colors.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 5 },
});
