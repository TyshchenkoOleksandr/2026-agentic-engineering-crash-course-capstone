import { describe, expect, it } from "vitest";
import {
  getClickModifiers,
  getClickMultiplier,
  getClickValue,
  NEUTRAL_CLICK_MODIFIERS,
} from "./click-value";
import { clickMainButton } from "./state";
import type { GameState } from "./types";

// Notation from openspec/changes/add-shop-v1/design.md: S({...}) = FRESH with fields replaced.
function S(overrides: Partial<GameState> = {}): GameState {
  return {
    balance: 0,
    totalClicks: 0,
    ownedSkins: [],
    enabledSkins: [],
    material: "classic",
    decor: [],
    upgrades: [],
    helpers: { monkey: 0 },
    ...overrides,
  };
}

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

describe("click-upgrades: Click multiplier from upgrades", () => {
  it("Multiplier per upgrade set", () => {
    expect(getClickMultiplier(S({ upgrades: [] }))).toBe(1);
    expect(getClickMultiplier(S({ upgrades: ["double-click"] }))).toBe(2);
    expect(getClickMultiplier(S({ upgrades: ["double-click", "triple-click"] }))).toBe(3);
  });

  it("Modifiers derived from state", () => {
    expect(getClickModifiers(S({ upgrades: ["double-click", "triple-click"] }))).toEqual({
      multiplier: 3,
      combo: 1,
      crit: false,
      goldenBonus: 1,
    });
    const neutral = getClickModifiers(S({}));
    expect(neutral).toEqual({ multiplier: 1, combo: 1, crit: false, goldenBonus: 1 });
    expect(neutral).toEqual(NEUTRAL_CLICK_MODIFIERS);
  });

  it("Other state does not affect the multiplier", () => {
    expect(
      getClickMultiplier(
        S({
          balance: 9999,
          totalClicks: 9999,
          ownedSkins: ["gold"],
          material: "gold",
          helpers: { monkey: 50 },
        }),
      ),
    ).toBe(1);
  });

  it("Double click doubles a press", () => {
    const D = S({ balance: 0, totalClicks: 60, upgrades: ["double-click"] });
    expect(clickMainButton(D, getClickModifiers(D))).toEqual(
      S({ balance: 2, totalClicks: 61, upgrades: ["double-click"] }),
    );
  });

  it("Triple replaces double", () => {
    let T = S({ balance: 10, totalClicks: 250, upgrades: ["double-click", "triple-click"] });
    for (let i = 0; i < 3; i += 1) {
      T = clickMainButton(T, getClickModifiers(T));
    }
    expect(T.balance).toBe(19);
    expect(T.totalClicks).toBe(253);
  });
});
