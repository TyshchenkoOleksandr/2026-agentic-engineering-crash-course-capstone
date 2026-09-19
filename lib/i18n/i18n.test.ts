import { describe, it, expect } from "vitest";
import { t, formatNumber, uk, en } from "./index";
import type { TranslationKey } from "./index";

describe("lib/i18n", () => {
  describe("Requirement: Dictionaries with identical keys", () => {
    describe("Scenario: Key parity [unit]", () => {
      it("should have identical key sets in uk and en", () => {
        const ukKeys = Object.keys(uk).sort();
        const enKeys = Object.keys(en).sort();
        expect(ukKeys).toEqual(enKeys);
      });
    });

    describe("Scenario: No empty values [unit]", () => {
      it("should have no empty values in uk dictionary", () => {
        Object.entries(uk).forEach(([key, value]) => {
          expect(typeof value).toBe("string");
          expect(value.trim().length).toBeGreaterThan(0);
        });
      });

      it("should have no empty values in en dictionary", () => {
        Object.entries(en).forEach(([key, value]) => {
          expect(typeof value).toBe("string");
          expect(value.trim().length).toBeGreaterThan(0);
        });
      });
    });

    describe("Scenario: Required Stage 1 keys and copy [unit]", () => {
      it("should contain exactly 44 keys", () => {
        expect(Object.keys(uk)).toHaveLength(44);
        expect(Object.keys(en)).toHaveLength(44);
      });

      it("should have the required keys", () => {
        const requiredKeys: TranslationKey[] = [
          "mainButton.label",
          "balance.ariaLabel",
          "theme.switchToDark",
          "theme.switchToLight",
          "language.short",
          "language.switch",
          "reset.button",
          "reset.title",
          "reset.body",
          "reset.confirm",
          "reset.cancel",
          "shop.title",
          "shop.category.skins",
          "shop.category.decor",
          "shop.category.upgrades",
          "shop.buy",
          "shop.owned",
          "shop.requires",
          "shop.count",
          "skin.on",
          "skin.off",
          "item.soft-shadow.name",
          "item.soft-shadow.description",
          "item.squish.name",
          "item.squish.description",
          "item.floating-number.name",
          "item.floating-number.description",
          "item.jumping-cap.name",
          "item.jumping-cap.description",
          "item.gold.name",
          "item.gold.description",
          "item.sleeping-cat.name",
          "item.sleeping-cat.description",
          "item.lava-lamp.name",
          "item.lava-lamp.description",
          "item.hydraulic-press.name",
          "item.hydraulic-press.description",
          "item.double-click.name",
          "item.double-click.description",
          "item.triple-click.name",
          "item.triple-click.description",
          "item.monkey.name",
          "item.monkey.description",
          "helper.monkey.label",
        ];
        const ukKeys = Object.keys(uk) as TranslationKey[];
        requiredKeys.forEach((key) => {
          expect(ukKeys).toContain(key);
        });
      });

      it("should have exact confirmed copy for mainButton.label", () => {
        expect(uk["mainButton.label"]).toBe("Клік");
        expect(en["mainButton.label"]).toBe("Click");
      });

      it("should have exact confirmed copy for reset.button", () => {
        expect(uk["reset.button"]).toBe("Скинути прогрес");
        expect(en["reset.button"]).toBe("Reset progress");
      });

      it("should have exact confirmed copy for reset.body", () => {
        expect(uk["reset.body"]).toBe(
          "Баланс, кліки й покупки буде обнулено. Тема й мова залишаться.",
        );
        expect(en["reset.body"]).toBe(
          "Your balance, clicks and purchases will be reset. Theme and language stay.",
        );
      });

      it("should have all exact confirmed copy", () => {
        const expectedCopy: Record<TranslationKey, { uk: string; en: string }> =
          {
            "mainButton.label": { uk: "Клік", en: "Click" },
            "balance.ariaLabel": { uk: "Баланс: {value}", en: "Balance: {value}" },
            "theme.switchToDark": {
              uk: "Увімкнути темну тему",
              en: "Switch to dark theme",
            },
            "theme.switchToLight": {
              uk: "Увімкнути світлу тему",
              en: "Switch to light theme",
            },
            "language.short": { uk: "УКР", en: "ENG" },
            "language.switch": {
              uk: "Змінити мову на англійську",
              en: "Switch language to Ukrainian",
            },
            "reset.button": { uk: "Скинути прогрес", en: "Reset progress" },
            "reset.title": { uk: "Скинути весь прогрес?", en: "Reset all progress?" },
            "reset.body": {
              uk: "Баланс, кліки й покупки буде обнулено. Тема й мова залишаться.",
              en: "Your balance, clicks and purchases will be reset. Theme and language stay.",
            },
            "reset.confirm": { uk: "Скинути", en: "Reset" },
            "reset.cancel": { uk: "Скасувати", en: "Cancel" },
            "shop.title": { uk: "Магазин", en: "Shop" },
            "shop.category.skins": { uk: "Скіни", en: "Skins" },
            "shop.category.decor": { uk: "Декор", en: "Decor" },
            "shop.category.upgrades": { uk: "Покращення", en: "Upgrades" },
            "shop.buy": { uk: "Купити за {price}", en: "Buy for {price}" },
            "shop.owned": { uk: "Куплено", en: "Owned" },
            "shop.requires": { uk: "Потрібно: {item}", en: "Requires: {item}" },
            "shop.count": { uk: "Маєте: {count}", en: "Owned: {count}" },
            "skin.on": { uk: "Увімкнено", en: "On" },
            "skin.off": { uk: "Вимкнено", en: "Off" },
            "item.soft-shadow.name": { uk: "М’яка тінь", en: "Soft shadow" },
            "item.soft-shadow.description": {
              uk: "Тінь, що глибшає під курсором і при натисканні",
              en: "A shadow that deepens on hover and press",
            },
            "item.squish.name": { uk: "Желе", en: "Squish" },
            "item.squish.description": {
              uk: "Кнопка сплющується й пружинить після кліку",
              en: "Jelly-like squash and spring-back on click",
            },
            "item.floating-number.name": { uk: "Спливаючі +N", en: "Floating +N" },
            "item.floating-number.description": {
              uk: "Зароблене спливає від курсора й тане",
              en: "The earned amount floats up from the cursor and fades",
            },
            "item.jumping-cap.name": { uk: "Кепка-стрибунець", en: "Jumping cap" },
            "item.jumping-cap.description": {
              uk: "Кепка на кнопці підстрибує з кожним кліком",
              en: "A cap sits on the button and hops on each click",
            },
            "item.gold.name": { uk: "Золото", en: "Gold" },
            "item.gold.description": {
              uk: "Металева золота поверхня",
              en: "Metallic gold surface",
            },
            "item.sleeping-cat.name": { uk: "Сплячий кіт", en: "Sleeping cat" },
            "item.sleeping-cat.description": {
              uk: "Кіт повільно дихає, часом ворушить вухами",
              en: "A cat that slowly breathes, ears twitch now and then",
            },
            "item.lava-lamp.name": { uk: "Лава-лампа", en: "Lava lamp" },
            "item.lava-lamp.description": {
              uk: "Краплі воску здіймаються й зливаються",
              en: "Blobs rising and merging",
            },
            "item.hydraulic-press.name": {
              uk: "Гідравлічний прес",
              en: "Hydraulic press",
            },
            "item.hydraulic-press.description": {
              uk: "Прес повільно чавить нескінченну низку предметів",
              en: "A press slowly crushing an endless line of objects",
            },
            "item.double-click.name": { uk: "Подвійний клік", en: "Double click" },
            "item.double-click.description": {
              uk: "Кожен клік приносить ×2",
              en: "Each click is worth ×2",
            },
            "item.triple-click.name": { uk: "Потрійний клік", en: "Triple click" },
            "item.triple-click.description": {
              uk: "Кожен клік приносить ×3 (замість ×2)",
              en: "Each click is worth ×3 (replaces ×2)",
            },
            "item.monkey.name": { uk: "Мавпочка", en: "Monkey" },
            "item.monkey.description": {
              uk: "Сама тисне свою кнопку: 1 клік за секунду",
              en: "Presses its own button: 1 click per second",
            },
            "helper.monkey.label": {
              uk: "Мавпочки: {count} (+{rate} за секунду)",
              en: "Monkeys: {count} (+{rate} per second)",
            },
          };

        Object.entries(expectedCopy).forEach(([key, { uk: ukValue, en: enValue }]) => {
          expect(uk[key as TranslationKey]).toBe(ukValue);
          expect(en[key as TranslationKey]).toBe(enValue);
        });
      });
    });

    describe("Scenario: Every shop item has a name and description [unit]", () => {
      it("should have name and description for all 11 shop items", () => {
        const itemIds = [
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
          "monkey",
        ];

        itemIds.forEach((id) => {
          const nameKey = `item.${id}.name` as TranslationKey;
          const descKey = `item.${id}.description` as TranslationKey;

          expect(uk[nameKey]).toBeDefined();
          expect(en[nameKey]).toBeDefined();
          expect(uk[descKey]).toBeDefined();
          expect(en[descKey]).toBeDefined();
        });
      });
    });

    describe("Scenario: Shop interpolation [unit]", () => {
      it("should interpolate price in shop.buy", () => {
        expect(t("uk", "shop.buy", { price: "1 500" })).toBe("Купити за 1 500");
        expect(t("en", "shop.buy", { price: "1,500" })).toBe("Buy for 1,500");
      });

      it("should interpolate item in shop.requires", () => {
        expect(t("uk", "shop.requires", { item: "Подвійний клік" })).toBe(
          "Потрібно: Подвійний клік",
        );
        expect(t("en", "shop.requires", { item: "Double click" })).toBe(
          "Requires: Double click",
        );
      });

      it("should interpolate count and rate in helper.monkey.label", () => {
        expect(t("en", "helper.monkey.label", { count: 3, rate: 3 })).toBe(
          "Monkeys: 3 (+3 per second)",
        );
        expect(t("uk", "helper.monkey.label", { count: 3, rate: 3 })).toBe(
          "Мавпочки: 3 (+3 за секунду)",
        );
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
      it("should interpolate {value} placeholder in en", () => {
        expect(t("en", "balance.ariaLabel", { value: "1,234" })).toBe(
          "Balance: 1,234",
        );
      });

      it("should interpolate {value} placeholder in uk", () => {
        expect(t("uk", "balance.ariaLabel", { value: 7 })).toBe("Баланс: 7");
      });
    });

    describe("Scenario: Missing param keeps placeholder [unit]", () => {
      it("should keep placeholder when param is not provided", () => {
        expect(t("en", "balance.ariaLabel")).toBe("Balance: {value}");
      });
    });
  });

  describe("Requirement: Number formatting", () => {
    describe("Scenario: Format numbers [unit]", () => {
      it("should format uk numbers with no-break space separator", () => {
        expect(formatNumber(0, "uk")).toBe("0");
        expect(formatNumber(999, "uk")).toBe("999");
        // Use String.fromCharCode for U+00A0 (no-break space) in expected values
        expect(formatNumber(1234, "uk")).toBe(`1${String.fromCharCode(0xa0)}234`);
        expect(formatNumber(1234567, "uk")).toBe(`1${String.fromCharCode(0xa0)}234${String.fromCharCode(0xa0)}567`);
      });

      it("should format en numbers with comma separator", () => {
        expect(formatNumber(1234, "en")).toBe("1,234");
        expect(formatNumber(1234567, "en")).toBe("1,234,567");
      });
    });
  });
});
