import { Language } from "@/lib/game/types";

// Stage 1 + Stage 2 translation keys — copy confirmed in specs/localization/spec.md.
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
  "reset.body": "Баланс, кліки й покупки буде обнулено. Тема й мова залишаться.",
  "reset.confirm": "Скинути",
  "reset.cancel": "Скасувати",
  // Stage 2 shop and item copy
  "shop.title": "Магазин",
  "shop.category.skins": "Скіни",
  "shop.category.decor": "Декор",
  "shop.category.upgrades": "Покращення",
  "shop.buy": "Купити за {price}",
  "shop.owned": "Куплено",
  "shop.requires": "Потрібно: {item}",
  "shop.count": "Маєте: {count}",
  "skin.on": "Увімкнено",
  "skin.off": "Вимкнено",
  // Plain ASCII apostrophe here; `t()` renders it as the typographic U+2019 (design D18).
  "item.soft-shadow.name": "М’яка тінь",
  "item.soft-shadow.description": "Тінь, що глибшає під курсором і при натисканні",
  "item.squish.name": "Желе",
  "item.squish.description": "Кнопка сплющується й пружинить після кліку",
  "item.floating-number.name": "Спливаючі +N",
  "item.floating-number.description": "Зароблене спливає від курсора й тане",
  "item.jumping-cap.name": "Кепка-стрибунець",
  "item.jumping-cap.description": "Кепка на кнопці підстрибує з кожним кліком",
  "item.gold.name": "Золото",
  "item.gold.description": "Металева золота поверхня",
  "item.sleeping-cat.name": "Сплячий кіт",
  "item.sleeping-cat.description": "Кіт повільно дихає, часом ворушить вухами",
  "item.lava-lamp.name": "Лава-лампа",
  "item.lava-lamp.description": "Краплі воску здіймаються й зливаються",
  "item.hydraulic-press.name": "Гідравлічний прес",
  "item.hydraulic-press.description": "Прес повільно чавить нескінченну низку предметів",
  "item.double-click.name": "Подвійний клік",
  "item.double-click.description": "Кожен клік приносить ×2",
  "item.triple-click.name": "Потрійний клік",
  "item.triple-click.description": "Кожен клік приносить ×3 (замість ×2)",
  "item.monkey.name": "Мавпочка",
  "item.monkey.description": "Сама тисне свою кнопку: 1 клік за секунду",
  "helper.monkey.label": "Мавпочки: {count} (+{rate} за секунду)",
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
  "reset.body": "Your balance, clicks and purchases will be reset. Theme and language stay.",
  "reset.confirm": "Reset",
  "reset.cancel": "Cancel",
  // Stage 2 shop and item copy
  "shop.title": "Shop",
  "shop.category.skins": "Skins",
  "shop.category.decor": "Decor",
  "shop.category.upgrades": "Upgrades",
  "shop.buy": "Buy for {price}",
  "shop.owned": "Owned",
  "shop.requires": "Requires: {item}",
  "shop.count": "Owned: {count}",
  "skin.on": "On",
  "skin.off": "Off",
  "item.soft-shadow.name": "Soft shadow",
  "item.soft-shadow.description": "A shadow that deepens on hover and press",
  "item.squish.name": "Squish",
  "item.squish.description": "Jelly-like squash and spring-back on click",
  "item.floating-number.name": "Floating +N",
  "item.floating-number.description": "The earned amount floats up from the cursor and fades",
  "item.jumping-cap.name": "Jumping cap",
  "item.jumping-cap.description": "A cap sits on the button and hops on each click",
  "item.gold.name": "Gold",
  "item.gold.description": "Metallic gold surface",
  "item.sleeping-cat.name": "Sleeping cat",
  "item.sleeping-cat.description": "A cat that slowly breathes, ears twitch now and then",
  "item.lava-lamp.name": "Lava lamp",
  "item.lava-lamp.description": "Blobs rising and merging",
  "item.hydraulic-press.name": "Hydraulic press",
  "item.hydraulic-press.description": "A press slowly crushing an endless line of objects",
  "item.double-click.name": "Double click",
  "item.double-click.description": "Each click is worth ×2",
  "item.triple-click.name": "Triple click",
  "item.triple-click.description": "Each click is worth ×3 (replaces ×2)",
  "item.monkey.name": "Monkey",
  "item.monkey.description": "Presses its own button: 1 click per second",
  "helper.monkey.label": "Monkeys: {count} (+{rate} per second)",
};

/** Dictionary registry indexed by language. */
export const dictionaries: Record<Language, Dictionary> = {
  uk,
  en,
};
