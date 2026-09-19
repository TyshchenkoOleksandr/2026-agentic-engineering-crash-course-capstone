import { Language } from "@/lib/game/types";
import { TranslationKey, Dictionary, dictionaries } from "./dictionaries";

// Re-export types and dictionaries for convenience
export type { TranslationKey, Dictionary } from "./dictionaries";
export { dictionaries, uk, en } from "./dictionaries";

/**
 * Translate a key to the given language, optionally replacing `{name}` placeholders with params.
 * Placeholders without a matching param remain unchanged.
 */
export const t = (
  language: Language,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string => {
  throw new Error("not implemented");
};

/**
 * Format a number according to the language's conventions.
 * - `uk`: uses U+00A0 (no-break space) as thousands separator
 * - `en`: uses comma as thousands separator
 */
export const formatNumber = (value: number, language: Language): string => {
  throw new Error("not implemented");
};
