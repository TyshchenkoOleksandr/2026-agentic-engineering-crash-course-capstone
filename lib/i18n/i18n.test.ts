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
      it("should contain exactly 11 keys", () => {
        expect(Object.keys(uk)).toHaveLength(11);
        expect(Object.keys(en)).toHaveLength(11);
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

      it("should have all exact confirmed copy", () => {
        const expectedCopy: Record<TranslationKey, { uk: string; en: string }> = {
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
            uk: "Баланс і кліки буде обнулено. Тема й мова залишаться.",
            en: "Your balance and clicks will be set to zero. Theme and language stay.",
          },
          "reset.confirm": { uk: "Скинути", en: "Reset" },
          "reset.cancel": { uk: "Скасувати", en: "Cancel" },
        };

        Object.entries(expectedCopy).forEach(([key, { uk: ukValue, en: enValue }]) => {
          expect(uk[key as TranslationKey]).toBe(ukValue);
          expect(en[key as TranslationKey]).toBe(enValue);
        });
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
        expect(formatNumber(1234, "uk")).toBe("1 234"); // U+00A0 no-break space
        expect(formatNumber(1234567, "uk")).toBe("1 234 567");
      });

      it("should format en numbers with comma separator", () => {
        expect(formatNumber(1234, "en")).toBe("1,234");
        expect(formatNumber(1234567, "en")).toBe("1,234,567");
      });
    });
  });
});
