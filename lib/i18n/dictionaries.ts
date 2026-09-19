import { Language } from "@/lib/game/types";

// Stage 1 translation keys — all values are empty strings (stubs).
// Keys are grouped by feature for clarity, though the type system treats them uniformly.
export const uk = {
  "mainButton.label": "",
  "balance.ariaLabel": "",
  "theme.switchToDark": "",
  "theme.switchToLight": "",
  "language.short": "",
  "language.switch": "",
  "reset.button": "",
  "reset.title": "",
  "reset.body": "",
  "reset.confirm": "",
  "reset.cancel": "",
} as const;

/**
 * Type-safe translation key.
 * Adding a key to `uk` automatically makes it available to `t()` and forces `en` (typed as
 * Record<TranslationKey, string>) to add it at compile time.
 */
export type TranslationKey = keyof typeof uk;

/** Translation dictionary: maps keys to localized strings. */
export type Dictionary = Record<TranslationKey, string>;

/** English dictionary — must have identical keys as `uk`. Stub values. */
export const en: Dictionary = {
  "mainButton.label": "",
  "balance.ariaLabel": "",
  "theme.switchToDark": "",
  "theme.switchToLight": "",
  "language.short": "",
  "language.switch": "",
  "reset.button": "",
  "reset.title": "",
  "reset.body": "",
  "reset.confirm": "",
  "reset.cancel": "",
};

/** Dictionary registry indexed by language. */
export const dictionaries: Record<Language, Dictionary> = {
  uk,
  en,
};
