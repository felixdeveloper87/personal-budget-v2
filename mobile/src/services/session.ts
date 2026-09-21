import * as SecureStore from "expo-secure-store";

import type { AuthUser } from "@/types/auth";

const SESSION_KEY = "personal-budget.session";

export async function loadSession(): Promise<AuthUser | null> {
  const value = await SecureStore.getItemAsync(SESSION_KEY);
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as AuthUser;
    return parsed?.token ? parsed : null;
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }
}

export async function saveSession(user: AuthUser): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(user));
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
