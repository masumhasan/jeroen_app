/** Calories supplied by macros (4/4/9 rule). */
export function macroCaloriesFromGrams(
  proteinG: number,
  carbsG: number,
  fatG: number,
): number {
  const p = Math.max(0, proteinG);
  const c = Math.max(0, carbsG);
  const f = Math.max(0, fatG);
  return p * 4 + c * 4 + f * 9;
}

export function maxProteinGrams(
  calories: number,
  carbsG: number,
  fatG: number,
): number {
  return Math.max(0, Math.floor((calories - 4 * carbsG - 9 * fatG) / 4));
}

export function maxCarbsGrams(
  calories: number,
  proteinG: number,
  fatG: number,
): number {
  return Math.max(0, Math.floor((calories - 4 * proteinG - 9 * fatG) / 4));
}

export function maxFatGrams(
  calories: number,
  proteinG: number,
  carbsG: number,
): number {
  return Math.max(0, Math.floor((calories - 4 * proteinG - 4 * carbsG) / 9));
}

/** Reduce grams (fat first) until macro calories fit within `calories`. */
export function clampMacrosToCalories(
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
): { protein: number; carbs: number; fat: number } {
  let p = Math.max(0, Math.round(protein));
  let c = Math.max(0, Math.round(carbs));
  let f = Math.max(0, Math.round(fat));
  const cap = Math.max(0, Math.round(calories));
  while (macroCaloriesFromGrams(p, c, f) > cap) {
    if (f > 0) f -= 1;
    else if (c > 0) c -= 1;
    else if (p > 0) p -= 1;
    else break;
  }
  return { protein: p, carbs: c, fat: f };
}

/** Share of total daily calories from one macro (for % labels). */
export function macroPercentOfCalories(
  grams: number,
  kcalPerGram: number,
  dailyCalories: number,
): number {
  if (!dailyCalories) return 0;
  return Math.round(((grams * kcalPerGram) / dailyCalories) * 100);
}
