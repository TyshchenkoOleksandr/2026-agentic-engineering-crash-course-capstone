import { describe, it, expect } from "vitest";
import { t, formatNumber, uk, en } from "./index";
import type { TranslationKey } from "./index";

/** U+2019 — the Ukrainian apostrophe (design D21). Written as an escape to stay unambiguous. */
const APOSTROPHE = "’";
/** U+00A0 — no-break space: before a percent sign in Ukrainian copy and as thousands separator. */
const NBSP = " ";

/**
 * The confirmed copy of `specs/localization/spec.md` (add-upgrades-v2), rows 1–68 in table order.
 * Tuple order is `[key, uk, en]`.
 */
const COPY: ReadonlyArray<readonly [TranslationKey, string, string]> = [
  ["mainButton.label", "Клік", "Click"], // 1
  ["balance.ariaLabel", "Баланс: {value}", "Balance: {value}"], // 2
  ["theme.switchToDark", "Увімкнути темну тему", "Switch to dark theme"], // 3
  ["theme.switchToLight", "Увімкнути світлу тему", "Switch to light theme"], // 4
  ["language.short", "УКР", "ENG"], // 5
  ["language.switch", "Змінити мову на англійську", "Switch language to Ukrainian"], // 6
  ["reset.button", "Скинути прогрес", "Reset progress"], // 7
  ["reset.title", "Скинути весь прогрес?", "Reset all progress?"], // 8
  ["reset.body", "Баланс, кліки й покупки буде обнулено. Тема й мова залишаться.", "Your balance, clicks and purchases will be reset. Theme and language stay."], // 9
  ["reset.confirm", "Скинути", "Reset"], // 10
  ["reset.cancel", "Скасувати", "Cancel"], // 11
  ["shop.title", "Магазин", "Shop"], // 12
  ["shop.category.skins", "Скіни", "Skins"], // 13
  ["shop.category.decor", "Декор", "Decor"], // 14
  ["shop.category.upgrades", "Покращення", "Upgrades"], // 15
  ["shop.buy", "Купити за {price}", "Buy for {price}"], // 16
  ["shop.owned", "Куплено", "Owned"], // 17
  ["shop.requires", "Потрібно: {item}", "Requires: {item}"], // 18
  ["shop.count", "Маєте: {count}", "Owned: {count}"], // 19
  ["skin.on", "Увімкнено", "On"], // 20
  ["skin.off", "Вимкнено", "Off"], // 21
  ["item.soft-shadow.name", `М${APOSTROPHE}яка тінь`, "Soft shadow"], // 22
  ["item.soft-shadow.description", "Тінь, що глибшає під курсором і при натисканні", "A shadow that deepens on hover and press"], // 23
  ["item.squish.name", "Желе", "Squish"], // 24
  ["item.squish.description", "Кнопка сплющується й пружинить після кліку", "Jelly-like squash and spring-back on click"], // 25
  ["item.floating-number.name", "Спливаючі +N", "Floating +N"], // 26
  ["item.floating-number.description", "Зароблене спливає від курсора й тане", "The earned amount floats up from the cursor and fades"], // 27
  ["item.jumping-cap.name", "Кепка-стрибунець", "Jumping cap"], // 28
  ["item.jumping-cap.description", "Кепка на кнопці підстрибує з кожним кліком", "A cap sits on the button and hops on each click"], // 29
  ["item.gold.name", "Золото", "Gold"], // 30
  ["item.gold.description", "Металева золота поверхня", "Metallic gold surface"], // 31
  ["item.sleeping-cat.name", "Сплячий кіт", "Sleeping cat"], // 32
  ["item.sleeping-cat.description", "Кіт повільно дихає, часом ворушить вухами", "A cat that slowly breathes, ears twitch now and then"], // 33
  ["item.lava-lamp.name", "Лава-лампа", "Lava lamp"], // 34
  ["item.lava-lamp.description", "Краплі воску здіймаються й зливаються", "Blobs rising and merging"], // 35
  ["item.hydraulic-press.name", "Гідравлічний прес", "Hydraulic press"], // 36
  ["item.hydraulic-press.description", "Прес повільно чавить нескінченну низку предметів", "A press slowly crushing an endless line of objects"], // 37
  ["item.double-click.name", "Подвійний клік", "Double click"], // 38
  ["item.double-click.description", "Кожен клік приносить ×2", "Each click is worth ×2"], // 39
  ["item.triple-click.name", "Потрійний клік", "Triple click"], // 40
  ["item.triple-click.description", "Кожен клік приносить ×3 (замість ×2)", "Each click is worth ×3 (replaces ×2)"], // 41
  ["item.monkey.name", "Мавпочка", "Monkey"], // 42
  ["item.monkey.description", "Сама тисне свою кнопку: 1 клік за секунду", "Presses its own button: 1 click per second"], // 43
  ["helper.monkey.label", "Мавпочки: {count} (+{rate} за секунду)", "Monkeys: {count} (+{rate} per second)"], // 44
  ["item.crit.name", "Крит", "Crit"], // 45
  ["item.crit.description", `Шанс, що клік зарахується ×10: 5${NBSP}% → 10${NBSP}% → 15${NBSP}%`, "Chance for a click to count ×10: 5% → 10% → 15%"], // 46
  ["item.combo.name", "Комбо", "Combo"], // 47
  ["item.combo.description", "Швидкі кліки поспіль піднімають множник до ×2; на паузі він спадає", "Fast clicks in a row build a multiplier up to ×2; it fades when you pause"], // 48
  ["item.golden-button.name", "Золота кнопка", "Golden button"], // 49
  ["item.golden-button.description", `Часом з${APOSTROPHE}являється на кілька секунд: злови — і 30 с кліки ×7`, "Appears now and then for a few seconds: catch it for 30 s of ×7 clicks"], // 50
  ["item.robot.name", "Робот", "Robot"], // 51
  ["item.robot.description", "Сам тисне свою кнопку: 5 кліків за секунду", "Presses its own button: 5 clicks per second"], // 52
  ["item.factory.name", "Фабрика", "Factory"], // 53
  ["item.factory.description", "Сама тисне свою кнопку: 40 кліків за секунду", "Presses its own button: 40 clicks per second"], // 54
  ["item.speed-monkey.name", "Прискорення мавпочок", "Monkey speed-up"], // 55
  ["item.speed-monkey.description", "Мавпочки клікають удвічі швидше за кожен рівень", "Monkeys click twice as fast per level"], // 56
  ["item.speed-robot.name", "Прискорення роботів", "Robot speed-up"], // 57
  ["item.speed-robot.description", "Роботи клікають удвічі швидше за кожен рівень", "Robots click twice as fast per level"], // 58
  ["item.speed-factory.name", "Прискорення фабрик", "Factory speed-up"], // 59
  ["item.speed-factory.description", "Фабрики клікають удвічі швидше за кожен рівень", "Factories click twice as fast per level"], // 60
  ["shop.level", "Рівень {level} з {max}", "Level {level} of {max}"], // 61
  ["shop.maxed", "Максимальний рівень", "Max level"], // 62
  ["helper.robot.label", "Роботи: {count} (+{rate} за секунду)", "Robots: {count} (+{rate} per second)"], // 63
  ["helper.factory.label", "Фабрики: {count} (+{rate} за секунду)", "Factories: {count} (+{rate} per second)"], // 64
  ["crit.text", "КРИТ ×10!", "CRIT ×10!"], // 65
  ["combo.label", "Комбо ×{value}", "Combo ×{value}"], // 66
  ["golden.catch", "Зловити золоту кнопку", "Catch the golden button"], // 67
  ["golden.bonus", "Золотий бонус ×7: {seconds} с", "Golden bonus ×7: {seconds} s"], // 68
];

/** Expected uk / en copy of a key, looked up in the table above. */
const expectedCopy = (key: TranslationKey): { uk: string; en: string } => {
  const row = COPY.find(([candidate]) => candidate === key);
  if (!row) {
    throw new Error(`No expected copy for "${key}" in specs/localization/spec.md`);
  }
  return { uk: row[1], en: row[2] };
};

/** The 19 shop item ids of Stage 1 + 2 + 3, in catalog order (design D6). */
const ITEM_IDS = [
  "soft-shadow",
  "squish",
  "floating-number",
  "jumping-cap",
  "gold",
  "sleeping-cat",
  "lava-lamp",
  "hydraulic-press",
  "double-click",
  "triple-click",
  "crit",
  "combo",
  "golden-button",
  "monkey",
  "speed-monkey",
  "robot",
  "speed-robot",
  "factory",
  "speed-factory",
] as const;

/** Rows 61–68 of the table: the Stage 3 keys that are not item names / descriptions. */
const STAGE_3_KEYS: readonly TranslationKey[] = [
  "shop.level",
  "shop.maxed",
  "helper.robot.label",
  "helper.factory.label",
  "crit.text",
  "combo.label",
  "golden.catch",
  "golden.bonus",
];

describe("lib/i18n", () => {
  describe("Requirement: Dictionaries with identical keys", () => {
    describe("Scenario: Key parity [unit]", () => {
      it("should have identical key sets in uk and en", () => {
        expect(Object.keys(uk).sort()).toEqual(Object.keys(en).sort());
      });
    });

    describe("Scenario: No empty values [unit]", () => {
      it("should have a non-empty string for every uk value", () => {
        Object.entries(uk).forEach(([key, value]) => {
          expect(typeof value, key).toBe("string");
          expect(value.trim().length, key).toBeGreaterThan(0);
        });
      });

      it("should have a non-empty string for every en value", () => {
        Object.entries(en).forEach(([key, value]) => {
          expect(typeof value, key).toBe("string");
          expect(value.trim().length, key).toBeGreaterThan(0);
        });
      });
    });

    describe("Scenario: Required Stage 1 keys and copy [unit]", () => {
      it("should contain exactly the 68 keys of the table", () => {
        const expectedKeys = COPY.map(([key]) => key).sort();
        expect(expectedKeys).toHaveLength(68);
        expect(new Set(expectedKeys).size).toBe(68);
        expect(Object.keys(uk).sort()).toEqual(expectedKeys);
        expect(Object.keys(en).sort()).toEqual(expectedKeys);
      });

      it("should have exactly the confirmed copy for every key", () => {
        COPY.forEach(([key, ukValue, enValue]) => {
          expect(uk[key], key).toBe(ukValue);
          expect(en[key], key).toBe(enValue);
        });
      });

      it("should have the exact copy the spec calls out for Stage 1", () => {
        expect(uk["mainButton.label"]).toBe("Клік");
        expect(en["mainButton.label"]).toBe("Click");
        expect(uk["reset.button"]).toBe("Скинути прогрес");
        expect(en["reset.button"]).toBe("Reset progress");
        expect(uk["reset.body"]).toBe(
          "Баланс, кліки й покупки буде обнулено. Тема й мова залишаться.",
        );
      });

      it("should use the typographic apostrophe U+2019 in Ukrainian copy", () => {
        expect(uk["item.soft-shadow.name"]).toBe(`М${APOSTROPHE}яка тінь`);
        expect(uk["item.soft-shadow.name"]).toContain("’");
        expect(uk["item.soft-shadow.name"]).not.toContain("'");
        expect(uk["item.golden-button.description"]).toContain(`з${APOSTROPHE}являється`);
        expect(uk["item.golden-button.description"]).not.toContain("'");
      });
    });

    describe("Scenario: Every shop item has a name and description [unit]", () => {
      it("should return the table copy for all 76 lookups of the 19 items", () => {
        expect(ITEM_IDS).toHaveLength(19);
        let lookups = 0;
        ITEM_IDS.forEach((id) => {
          (["name", "description"] as const).forEach((suffix) => {
            const key = `item.${id}.${suffix}` as TranslationKey;
            const expected = expectedCopy(key);
            expect(t("uk", key), key).toBe(expected.uk);
            expect(t("en", key), key).toBe(expected.en);
            lookups += 2;
          });
        });
        expect(lookups).toBe(76);
      });
    });

    describe("Scenario: Stage 3 copy [unit]", () => {
      it("should return the table copy with placeholders kept for keys 61-68", () => {
        expect(STAGE_3_KEYS).toHaveLength(8);
        STAGE_3_KEYS.forEach((key) => {
          const expected = expectedCopy(key);
          expect(t("uk", key), key).toBe(expected.uk);
          expect(t("en", key), key).toBe(expected.en);
        });
      });

      it("should match the examples of the scenario", () => {
        expect(t("uk", "crit.text")).toBe("КРИТ ×10!");
        expect(t("en", "shop.maxed")).toBe("Max level");
        expect(t("uk", "shop.level")).toBe("Рівень {level} з {max}");
        expect(t("en", "golden.bonus")).toBe("Golden bonus ×7: {seconds} s");
      });
    });

    describe("Scenario: Shop interpolation [unit]", () => {
      it("should interpolate the shop and helper placeholders", () => {
        expect(t("uk", "shop.buy", { price: `1${NBSP}500` })).toBe(`Купити за 1${NBSP}500`);
        expect(t("en", "shop.buy", { price: "1,500" })).toBe("Buy for 1,500");
        expect(t("uk", "shop.requires", { item: "Подвійний клік" })).toBe(
          "Потрібно: Подвійний клік",
        );
        expect(t("en", "helper.monkey.label", { count: 3, rate: 3 })).toBe(
          "Monkeys: 3 (+3 per second)",
        );
      });
    });

    describe("Scenario: Percentages use a no-break space in Ukrainian [unit]", () => {
      it("should separate every Ukrainian percent sign with U+00A0", () => {
        const text = t("uk", "item.crit.description");
        expect(text).toBe(
          `Шанс, що клік зарахується ×10: 5${NBSP}% → 10${NBSP}% → 15${NBSP}%`,
        );
        expect([...text].filter((char) => char === "%")).toHaveLength(3);
        [...text].forEach((char, index) => {
          if (char === "%") {
            expect(text[index - 1], `char before % at ${index}`).toBe(" ");
          }
        });
        expect(text).not.toMatch(/\d %/);
        expect(text).not.toMatch(/\d%/);
      });

      it("should write English percentages without a space", () => {
        const text = t("en", "item.crit.description");
        expect(text).toBe("Chance for a click to count ×10: 5% → 10% → 15%");
        expect(text).not.toContain(" ");
      });
    });

    describe("Scenario: Stage 3 interpolation [unit]", () => {
      it("should interpolate the Stage 3 placeholders", () => {
        expect(t("uk", "shop.level", { level: 1, max: 3 })).toBe("Рівень 1 з 3");
        expect(t("en", "shop.level", { level: 3, max: 3 })).toBe("Level 3 of 3");
        expect(t("uk", "combo.label", { value: "1,5" })).toBe("Комбо ×1,5");
        expect(t("en", "combo.label", { value: "2" })).toBe("Combo ×2");
        expect(t("uk", "golden.bonus", { seconds: 30 })).toBe("Золотий бонус ×7: 30 с");
        expect(t("en", "golden.bonus", { seconds: 29 })).toBe("Golden bonus ×7: 29 s");
        expect(t("uk", "helper.robot.label", { count: 1, rate: 5 })).toBe(
          "Роботи: 1 (+5 за секунду)",
        );
        expect(t("en", "helper.factory.label", { count: 2, rate: 80 })).toBe(
          "Factories: 2 (+80 per second)",
        );
      });
    });

    describe("Scenario: Decimal formatting for the combo meter [unit]", () => {
      it("should format combo multipliers per language", () => {
        expect(formatNumber(1.5, "uk")).toBe("1,5");
        expect(formatNumber(1.9, "uk")).toBe("1,9");
        expect(formatNumber(1.5, "en")).toBe("1.5");
        expect(formatNumber(2, "uk")).toBe("2");
      });
    });
  });

  describe("Requirement: Translation function", () => {
    describe("Scenario: Plain lookup [unit]", () => {
      it("should look up mainButton.label in uk and en", () => {
        expect(t("uk", "mainButton.label")).toBe("Клік");
        expect(t("en", "mainButton.label")).toBe("Click");
      });
    });

    describe("Scenario: Interpolation [unit]", () => {
      it("should interpolate the {value} placeholder", () => {
        expect(t("en", "balance.ariaLabel", { value: "1,234" })).toBe("Balance: 1,234");
        expect(t("uk", "balance.ariaLabel", { value: 7 })).toBe("Баланс: 7");
      });
    });

    describe("Scenario: Missing param keeps placeholder [unit]", () => {
      it("should keep the placeholder when no param is given", () => {
        expect(t("en", "balance.ariaLabel")).toBe("Balance: {value}");
      });
    });
  });

  describe("Requirement: Number formatting", () => {
    describe("Scenario: Format numbers [unit]", () => {
      it("should group uk numbers with a no-break space", () => {
        expect(formatNumber(0, "uk")).toBe("0");
        expect(formatNumber(999, "uk")).toBe("999");
        expect(formatNumber(1234, "uk")).toBe(`1${NBSP}234`);
        expect(formatNumber(1234567, "uk")).toBe(`1${NBSP}234${NBSP}567`);
      });

      it("should group en numbers with a comma", () => {
        expect(formatNumber(1234, "en")).toBe("1,234");
        expect(formatNumber(1234567, "en")).toBe("1,234,567");
      });
    });
  });
});
