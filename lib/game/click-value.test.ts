import { describe, expect, it } from "vitest";
import { getClickValue, NEUTRAL_CLICK_MODIFIERS } from "./click-value";

describe("clicker-core: Click value formula", () => {
  it("Neutral modifiers give 1", () => {
    expect(getClickValue({ multiplier: 1, combo: 1, crit: false, goldenBonus: 1 })).toBe(1);
  });

  it("Exported neutral modifiers constant", () => {
    expect(NEUTRAL_CLICK_MODIFIERS).toEqual({
      multiplier: 1,
      combo: 1,
      crit: false,
      goldenBonus: 1,
    });
    expect(getClickValue(NEUTRAL_CLICK_MODIFIERS)).toBe(1);
  });

  it("Multiplier is applied", () => {
    expect(getClickValue({ multiplier: 3, combo: 1, crit: false, goldenBonus: 1 })).toBe(3);
  });

  it("Crit multiplies by 10", () => {
    expect(getClickValue({ multiplier: 2, combo: 1, crit: true, goldenBonus: 1 })).toBe(20);
  });

  it("All factors multiply", () => {
    expect(getClickValue({ multiplier: 3, combo: 2, crit: true, goldenBonus: 7 })).toBe(420);
  });

  it("Combo and golden bonus are applied without crit", () => {
    expect(getClickValue({ multiplier: 1, combo: 2, crit: false, goldenBonus: 7 })).toBe(14);
  });
});
