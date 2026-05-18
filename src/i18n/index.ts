import nl from "./nl.json";

type NestedKeyOf<T extends object> = {
  [K in keyof T & string]: T[K] extends object
    ? `${K}.${NestedKeyOf<T[K] & object>}`
    : K;
}[keyof T & string];

type Translations = typeof nl;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

export function t(
  key: NestedKeyOf<Translations>,
  params?: Record<string, string | number>,
): string {
  let value = getNestedValue(nl as unknown as Record<string, unknown>, key);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    });
  }
  return value;
}

export function translateMealType(rawType: string): string {
  const normalized = (rawType || "").toLowerCase().replace(/-/g, "").replace(/\s/g, "");
  if (normalized.startsWith("breakfast")) return t("mealTypes.breakfast");
  if (normalized.startsWith("lunch")) return t("mealTypes.lunch");
  if (normalized.startsWith("dinner")) return t("mealTypes.dinner");
  if (normalized.includes("snack1")) return t("mealTypes.snack1");
  if (normalized.includes("snack2")) return t("mealTypes.snack2");
  if (normalized.includes("snack3")) return t("mealTypes.snack3");
  return t("mealTypes.meal");
}

export function translateDayName(rawDay: string): string {
  const normalized = (rawDay || "").toLowerCase().trim();
  const map: Record<string, NestedKeyOf<Translations>> = {
    monday: "dayNames.monday",
    tuesday: "dayNames.tuesday",
    wednesday: "dayNames.wednesday",
    thursday: "dayNames.thursday",
    friday: "dayNames.friday",
    saturday: "dayNames.saturday",
    sunday: "dayNames.sunday",
  };
  return map[normalized] ? t(map[normalized]) : rawDay;
}
