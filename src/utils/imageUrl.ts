import { Platform } from "react-native";

const API_HOST =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

/**
 * Resolves a recipe image from the API (absolute URL, relative /uploads/..., or missing).
 */
export function resolveRecipeImageUrl(
  uri: string | undefined | null,
  fallback: string
): string {
  if (!uri || typeof uri !== "string") return fallback;
  const t = uri.trim();
  if (!t) return fallback;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return `${API_HOST}${t.startsWith("/") ? "" : "/"}${t}`;
}
