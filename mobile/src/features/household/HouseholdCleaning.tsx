import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { cleaningDutyPreview } from "@/features/household/cleaningDuties";
import { CleaningCardArtwork } from "@/features/household/CleaningCardArtwork";
import { expenseDateLabel } from "@/features/household/expenseHistory";
import { HouseholdCleaningProgress } from "@/features/household/HouseholdCleaningProgress";
import { HouseholdCleaningSheet } from "@/features/household/HouseholdCleaningSheet";
import { ApiError, getHouseholdPage, updateHouseholdCleaningDuty } from "@/services/api";
import { nu, nuSection } from "@/components/dashboard/nuTheme";
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
          <Text style={styles.title}>Limpeza semanal</Text>
        </View>
        {rotation ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir checklist da limpeza semanal" onPress={() => setVisible(true)} style={styles.open}>
            <Text style={styles.openText}>Ver tarefas</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.card}>
        <CleaningCardArtwork />
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
                <Text style={styles.caption}>{isYourWeek ? "Sua semana" : "Responsável da semana"}</Text>
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
            <SymbolView name={{ ios: "arrow.triangle.2.circlepath", android: "repeat", web: "repeat" }} size={14} tintColor={nu.inkSoft} />
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
  section: { borderTopColor: nu.hairline, borderTopWidth: 1, paddingHorizontal: 20, paddingVertical: 20 },
  heading: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  copy: { flex: 1, minWidth: 0 },
  title: nuSection.title,
  open: { alignItems: "center", justifyContent: "center", backgroundColor: nu.brandTint, borderRadius: 999, minHeight: 34, paddingHorizontal: 14 },
  openText: { color: nu.brand, fontSize: 12, fontWeight: "600" },
  card: { position: "relative", overflow: "hidden", borderRadius: 16, padding: 16, backgroundColor: nu.surface, gap: 14 },
  periodRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  period: { flex: 1, color: nu.inkSoft, fontSize: 12, lineHeight: 16 },
  personRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  avatar: { height: 42, width: 42, borderRadius: 21, backgroundColor: nu.brandTint, alignItems: "center", justifyContent: "center" },
  initials: { color: nu.brand, fontSize: 14, fontWeight: "700" },
  caption: { color: nu.inkSoft, fontSize: 12 },
  name: { color: nu.ink, fontSize: 17, fontWeight: "600", marginTop: 2 },
  complete: { color: nu.positive, fontSize: 12, fontWeight: "600" },
  next: { flexDirection: "row", alignItems: "center", gap: 7, paddingTop: 12, borderTopWidth: 1, borderTopColor: nu.track },
  nextText: { flex: 1, color: nu.inkSoft, fontSize: 12, lineHeight: 17 },
  nextName: { color: nu.ink, fontWeight: "600" },
  empty: { flexDirection: "row", alignItems: "center", gap: 12 },
  emptyTitle: { color: nu.ink, fontSize: 15, fontWeight: "600" },
  emptyText: { color: nu.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 5 },
});
