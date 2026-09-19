import { Language } from "@/lib/game/types";

// Stage 1 translation keys — copy confirmed in specs/localization/spec.md.
// Keys are grouped by feature for clarity, though the type system treats them uniformly.
export const uk = {
  "mainButton.label": "Клік",
  "balance.ariaLabel": "Баланс: {value}",
  "theme.switchToDark": "Увімкнути темну тему",
  "theme.switchToLight": "Увімкнути світлу тему",
  "language.short": "УКР",
  "language.switch": "Змінити мову на англійську",
  "reset.button": "Скинути прогрес",
  "reset.title": "Скинути весь прогрес?",
  "reset.body": "Баланс і кліки буде обнулено. Тема й мова залишаться.",
  "reset.confirm": "Скинути",
  "reset.cancel": "Скасувати",
} as const;

/**
 * Type-safe translation key.
 * Adding a key to `uk` automatically makes it available to `t()` and forces `en` (typed as
 * Record<TranslationKey, string>) to add it at compile time.
 */
export type TranslationKey = keyof typeof uk;

/** Translation dictionary: maps keys to localized strings. */
export type Dictionary = Record<TranslationKey, string>;

/** English dictionary — must have identical keys as `uk`. */
export const en: Dictionary = {
  "mainButton.label": "Click",
  "balance.ariaLabel": "Balance: {value}",
  "theme.switchToDark": "Switch to dark theme",
  "theme.switchToLight": "Switch to light theme",
  "language.short": "ENG",
  "language.switch": "Switch language to Ukrainian",
  "reset.button": "Reset progress",
  "reset.title": "Reset all progress?",
  "reset.body": "Your balance and clicks will be set to zero. Theme and language stay.",
  "reset.confirm": "Reset",
  "reset.cancel": "Cancel",
};

/** Dictionary registry indexed by language. */
export const dictionaries: Record<Language, Dictionary> = {
  uk,
  en,
};
