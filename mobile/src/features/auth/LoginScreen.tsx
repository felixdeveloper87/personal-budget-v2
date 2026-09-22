import { useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
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
import { ApiError } from "@/services/api";

const palette = {
  background: "#FFFFFF",
  surface: "#F5F7F4",
  ink: "#172A2D",
  inkSoft: "#607074",
  inkFaint: "#8A9799",
  line: "#DDE4E1",
  accent: "#0F765D",
  accentPressed: "#0B624D",
  accentSoft: "#E2F2EB",
  white: "#FFFFFF",
  danger: "#A45148",
  dangerSoft: "#FAEFEC",
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type FocusedField = "email" | "password" | null;

export function LoginScreen() {
  const { login } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  async function handleLogin() {
    if (!canSubmit) return;

    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Digite um endereço de e-mail válido.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
    } catch (loginError) {
      if (loginError instanceof ApiError && loginError.status === 401) {
        setError("E-mail ou senha incorretos.");
      } else if (loginError instanceof ApiError && loginError.status === 403) {
        setError("Sua conta ainda está aguardando aprovação.");
      } else {
        setError("Não foi possível entrar. Verifique sua conexão e tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoArea}>
            <Image
              accessibilityLabel="Personal Budget"
              resizeMode="contain"
              source={require("../../../assets/images/branding.png")}
              style={styles.logo}
            />
          </View>

          <View style={styles.heading}>
            <Text style={styles.title}>Bem-vindo de volta</Text>
            <Text style={styles.subtitle}>
              Entre com a mesma conta da versão web para acessar suas informações.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View
                style={[
                  styles.inputShell,
                ]}
              >
                <TextInput
                  accessibilityLabel="E-mail"
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect={false}
                  editable={!submitting}
                  inputMode="email"
                  onBlur={() => {
                    console.log("[login-focus] email blur", passwordRef.current?.isFocused());
                  }}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (error) setError(null);
                  }}
                  onFocus={() => {
                    console.log("[login-focus] email focus", passwordRef.current?.isFocused());
                    setFocusedField("email");
                  }}
                  onSubmitEditing={() => {
                    console.log("[login-focus] email submit");
                    passwordRef.current?.focus();
                  }}
                  placeholder="seu@email.com"
                  placeholderTextColor={palette.inkFaint}
                  returnKeyType="next"
                  style={styles.input}
                  value={email}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Senha</Text>
              <View
                style={[
                  styles.inputShell,
                ]}
              >
                <TextInput
                  ref={passwordRef}
                  accessibilityLabel="Senha"
                  autoCapitalize="none"
                  autoComplete="off"
                  editable={!submitting}
                  onBlur={() => {
                    console.log("[login-focus] password blur", passwordRef.current?.isFocused());
                  }}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (error) setError(null);
                  }}
                  onFocus={() => {
                    console.log("[login-focus] password focus", passwordRef.current?.isFocused());
                    setFocusedField("password");
                  }}
                  onSubmitEditing={() => void handleLogin()}
                  placeholder="Digite sua senha"
                  placeholderTextColor={palette.inkFaint}
                  returnKeyType="go"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                />
                <Pressable
                  accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={() => setShowPassword((visible) => !visible)}
                  style={styles.passwordToggle}
                >
                  <Text style={styles.passwordToggleText}>
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {error ? (
              <View accessibilityRole="alert" style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={() => void handleLogin()}
              style={({ pressed }) => [
                styles.button,
                !canSubmit && styles.buttonDisabled,
                pressed && canSubmit && styles.buttonPressed,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color={palette.white} />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.securityNote}>
            <View style={styles.securityDot} />
            <Text style={styles.securityText}>
              Seu acesso é protegido e a senha não fica salva no aparelho.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: palette.background },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
    paddingVertical: 32,
  },
  logoArea: {
    alignItems: "center",
    height: 112,
    justifyContent: "center",
    marginBottom: 22,
    overflow: "hidden",
  },
  logo: { height: 112, width: "100%" },
  heading: { alignItems: "center", marginBottom: 34 },
  title: {
    color: palette.ink,
    fontSize: 29,
    fontWeight: "700",
    letterSpacing: -0.8,
    lineHeight: 35,
    textAlign: "center",
  },
  subtitle: {
    color: palette.inkSoft,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 325,
    textAlign: "center",
  },
  form: { gap: 18 },
  fieldGroup: { gap: 8 },
  label: { color: palette.ink, fontSize: 13, fontWeight: "600" },
  inputShell: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 58,
    paddingHorizontal: 17,
  },
  inputShellFocused: {
    backgroundColor: palette.white,
    borderColor: palette.accent,
    shadowColor: palette.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  input: {
    color: palette.ink,
    flex: 1,
    fontSize: 16,
    minHeight: 56,
    paddingVertical: 0,
  },
  passwordToggle: { paddingHorizontal: 2, paddingVertical: 9 },
  passwordToggleText: { color: palette.accent, fontSize: 12, fontWeight: "700" },
  errorBox: {
    backgroundColor: palette.dangerSoft,
    borderColor: "#EACDC7",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: { color: palette.danger, fontSize: 13, lineHeight: 19 },
  button: {
    alignItems: "center",
    backgroundColor: palette.accent,
    borderRadius: 17,
    justifyContent: "center",
    minHeight: 57,
    marginTop: 3,
    shadowColor: palette.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  buttonPressed: { backgroundColor: palette.accentPressed, transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.42, shadowOpacity: 0 },
  buttonText: { color: palette.white, fontSize: 16, fontWeight: "700" },
  securityNote: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    paddingHorizontal: 12,
  },
  securityDot: {
    backgroundColor: palette.accent,
    borderRadius: 3,
    height: 6,
    marginRight: 8,
    width: 6,
  },
  securityText: {
    color: palette.inkFaint,
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
