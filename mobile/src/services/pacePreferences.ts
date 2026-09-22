import * as SecureStore from "expo-secure-store";

export type PacePreferenceDimension = "category" | "description";

function preferenceKey(userId: number, dimension: PacePreferenceDimension) {
  return `personal-budget.hidden-pace.${userId}.${dimension}`;
}

export async function loadHiddenPaceKeys(
  userId: number,
  dimension: PacePreferenceDimension,
): Promise<Set<string>> {
  const value = await SecureStore.getItemAsync(preferenceKey(userId, dimension));
  if (!value) return new Set();

  try {
    const parsed = JSON.parse(value) as unknown;
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [],
    );
  } catch {
    await SecureStore.deleteItemAsync(preferenceKey(userId, dimension));
    return new Set();
  }
}

export async function saveHiddenPaceKeys(
  userId: number,
  dimension: PacePreferenceDimension,
  keys: Set<string>,
): Promise<void> {
  const key = preferenceKey(userId, dimension);
  if (keys.size === 0) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  await SecureStore.setItemAsync(key, JSON.stringify([...keys]));
}
