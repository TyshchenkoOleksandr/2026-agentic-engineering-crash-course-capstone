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
  "reset.body": "",
  "reset.confirm": "Скинути",
  "reset.cancel": "Скасувати",
  // Stage 2 shop and item copy
  "shop.title": "",
  "shop.category.skins": "",
  "shop.category.decor": "",
  "shop.category.upgrades": "",
  "shop.buy": "",
  "shop.owned": "",
  "shop.requires": "",
  "shop.count": "",
  "skin.on": "",
  "skin.off": "",
  "item.soft-shadow.name": "",
  "item.soft-shadow.description": "",
  "item.squish.name": "",
  "item.squish.description": "",
  "item.floating-number.name": "",
  "item.floating-number.description": "",
  "item.jumping-cap.name": "",
  "item.jumping-cap.description": "",
  "item.gold.name": "",
  "item.gold.description": "",
  "item.sleeping-cat.name": "",
  "item.sleeping-cat.description": "",
  "item.lava-lamp.name": "",
  "item.lava-lamp.description": "",
  "item.hydraulic-press.name": "",
  "item.hydraulic-press.description": "",
  "item.double-click.name": "",
  "item.double-click.description": "",
  "item.triple-click.name": "",
  "item.triple-click.description": "",
  "item.monkey.name": "",
  "item.monkey.description": "",
  "helper.monkey.label": "",
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
  "reset.body": "",
  "reset.confirm": "Reset",
  "reset.cancel": "Cancel",
  // Stage 2 shop and item copy
  "shop.title": "",
  "shop.category.skins": "",
  "shop.category.decor": "",
  "shop.category.upgrades": "",
  "shop.buy": "",
  "shop.owned": "",
  "shop.requires": "",
  "shop.count": "",
  "skin.on": "",
  "skin.off": "",
  "item.soft-shadow.name": "",
  "item.soft-shadow.description": "",
  "item.squish.name": "",
  "item.squish.description": "",
  "item.floating-number.name": "",
  "item.floating-number.description": "",
  "item.jumping-cap.name": "",
  "item.jumping-cap.description": "",
  "item.gold.name": "",
  "item.gold.description": "",
  "item.sleeping-cat.name": "",
  "item.sleeping-cat.description": "",
  "item.lava-lamp.name": "",
  "item.lava-lamp.description": "",
  "item.hydraulic-press.name": "",
  "item.hydraulic-press.description": "",
  "item.double-click.name": "",
  "item.double-click.description": "",
  "item.triple-click.name": "",
  "item.triple-click.description": "",
  "item.monkey.name": "",
  "item.monkey.description": "",
  "helper.monkey.label": "",
};

/** Dictionary registry indexed by language. */
export const dictionaries: Record<Language, Dictionary> = {
  uk,
  en,
};
