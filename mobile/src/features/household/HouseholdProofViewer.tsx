import { SymbolView } from "expo-symbols";
import { nu } from "@/components/dashboard/nuTheme";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { ApiError, getHouseholdProofImage } from "@/services/api";
import type { HouseholdExpense, HouseholdProof } from "@/types/household";

interface ProofViewerProps {
  expense: HouseholdExpense;
  householdId: number;
  onClose: () => void;
}

function ProofImage({ proof, householdId }: { proof: HouseholdProof; householdId: number }) {
  const { user, logout } = useAuth();
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setSource(null);
    setError(null);
    if (!user) return () => controller.abort();
    void getHouseholdProofImage(user.token, householdId, proof.id, controller.signal)
      .then((image) => { if (active) setSource(image); })
      .catch(async (imageError: unknown) => {
        if (!active) return;
        if (imageError instanceof ApiError && imageError.status === 401) {
          await logout();
          return;
        }
        setError(imageError instanceof Error ? imageError.message : "Não foi possível abrir a imagem.");
      });
    return () => { active = false; controller.abort(); };
  }, [attempt, householdId, logout, proof.id, user]);

  return (
    <View style={styles.imageSection}>
      <View style={styles.viewport} onLayout={({ nativeEvent }) => setViewport({ width: nativeEvent.layout.width, height: nativeEvent.layout.height })}>
        {error ? (
          <View style={styles.state}>
            <Text accessibilityRole="alert" style={styles.message}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={() => setAttempt((current) => current + 1)} style={styles.retry}>
              <Text style={styles.buttonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : source && viewport.width > 0 && viewport.height > 0 ? (
          <ScrollView key={zoom} style={styles.scroller} contentContainerStyle={styles.imageScroll} nestedScrollEnabled>
            <ScrollView horizontal nestedScrollEnabled style={{ height: viewport.height * zoom }}>
              <Image
                accessibilityLabel={`Comprovante: ${proof.originalFilename}`}
                source={{ uri: source }}
                resizeMode="contain"
                style={{ width: viewport.width * zoom, height: viewport.height * zoom }}
                onError={() => setError("Não foi possível exibir esta imagem.")}
              />
            </ScrollView>
          </ScrollView>
        ) : <View style={styles.state}><ActivityIndicator accessibilityLabel="Carregando comprovante" color={nu.brandTint} /></View>}
      </View>
      <View style={styles.imageToolbar}>
        <Text numberOfLines={1} style={styles.filename}>{proof.originalFilename}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={zoom === 1 ? "Ampliar comprovante" : "Reduzir comprovante"}
          disabled={!source || Boolean(error)}
          onPress={() => setZoom((current) => current === 1 ? 2 : 1)}
          style={[styles.zoomButton, (!source || Boolean(error)) && styles.disabled]}
        >
          <SymbolView name={{ ios: zoom === 1 ? "plus.magnifyingglass" : "minus.magnifyingglass", android: zoom === 1 ? "zoom_in" : "zoom_out", web: zoom === 1 ? "zoom_in" : "zoom_out" }} size={18} tintColor={nu.surface} />
          <Text style={styles.buttonText}>{zoom === 1 ? "Ampliar" : "Reduzir"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Used inside the history's existing Modal to avoid presenting stacked iOS modals.
export function HouseholdProofViewer({ expense, householdId, onClose }: ProofViewerProps) {
  const proofs = (expense.attachments ?? []).filter((proof) => proof.status === "AVAILABLE");
  const [index, setIndex] = useState(0);
  const proof = proofs[index];

  return (
    <View style={styles.overlay}>
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar comprovantes" onPress={onClose} style={styles.backdrop} />
      <SafeAreaView edges={["bottom"]} style={styles.viewer}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Comprovantes</Text>
            <Text numberOfLines={1} style={styles.subtitle}>{expense.description}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar comprovantes" onPress={onClose} style={styles.close}>
            <SymbolView name={{ ios: "xmark", android: "close", web: "close" }} size={21} tintColor={nu.surface} />
          </Pressable>
        </View>
        {proof ? <ProofImage key={proof.id} proof={proof} householdId={householdId} /> : (
          <View style={styles.state}>
            <Text style={styles.message}>Não há imagens disponíveis. Atualize a página e tente novamente.</Text>
          </View>
        )}
        {proofs.length > 0 ? (
          <View style={styles.navigation}>
            <Pressable accessibilityRole="button" accessibilityLabel="Comprovante anterior" disabled={index === 0} onPress={() => setIndex((current) => current - 1)} style={[styles.navButton, index === 0 && styles.disabled]}>
              <SymbolView name={{ ios: "chevron.left", android: "chevron_left", web: "chevron_left" }} size={20} tintColor={nu.surface} />
            </Pressable>
            <Text accessibilityLiveRegion="polite" style={styles.counter}>{index + 1} de {proofs.length}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Próximo comprovante" disabled={index === proofs.length - 1} onPress={() => setIndex((current) => current + 1)} style={[styles.navButton, index === proofs.length - 1 && styles.disabled]}>
              <SymbolView name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }} size={20} tintColor={nu.surface} />
            </Pressable>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

export function HouseholdProofModal(props: ProofViewerProps) {
  return (
    <Modal animationType="slide" transparent visible statusBarTranslucent onRequestClose={props.onClose}>
      <HouseholdProofViewer {...props} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(19,36,28,0.48)" },
  viewer: { height: "75%", width: "100%", maxWidth: 640, alignSelf: "center", backgroundColor: nu.ink, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: "hidden" },
  handle: { alignSelf: "center", backgroundColor: nu.inkSoft, borderRadius: 3, height: 5, width: 36, marginTop: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  headerCopy: { flex: 1 },
  title: { color: nu.surface, fontSize: 19, fontWeight: "700" },
  subtitle: { color: nu.track, fontSize: 12, marginTop: 4 },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: nu.ink, alignItems: "center", justifyContent: "center" },
  imageSection: { flex: 1 },
  viewport: { flex: 1, overflow: "hidden" },
  scroller: { flex: 1 },
  imageScroll: { flexGrow: 1 },
  state: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 18 },
  message: { color: nu.hairline, fontSize: 13, lineHeight: 20, textAlign: "center" },
  retry: { backgroundColor: nu.brand, minHeight: 44, paddingHorizontal: 18, borderRadius: 12, justifyContent: "center" },
  buttonText: { color: nu.surface, fontSize: 12, fontWeight: "600" },
  imageToolbar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 12 },
  filename: { flex: 1, color: nu.track, fontSize: 11 },
  zoomButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44, paddingHorizontal: 12, borderRadius: 12, backgroundColor: nu.ink },
  navigation: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 28, padding: 16 },
  navButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: nu.ink, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.35 },
  counter: { color: nu.hairline, fontSize: 13, fontWeight: "600" },
});
