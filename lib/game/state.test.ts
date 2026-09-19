import { describe, expect, it } from "vitest";
import { NEUTRAL_CLICK_MODIFIERS } from "./click-value";
import { clickMainButton, createInitialState, isBalanceVisible } from "./state";
import type { GameState } from "./types";

describe("clicker-core: Initial game state", () => {
  it("Fresh state values", () => {
    expect(createInitialState()).toEqual({ balance: 0, totalClicks: 0 });
  });

  it("Fresh state is a new object each time", () => {
    const a = createInitialState();
    const b = createInitialState();
    expect(a).toEqual({ balance: 0, totalClicks: 0 });
    expect(b).toEqual({ balance: 0, totalClicks: 0 });
    expect(a).not.toBe(b);
  });
});

describe("clicker-core: Main-button click updates balance and total clicks", () => {
  it("First click", () => {
    expect(clickMainButton({ balance: 0, totalClicks: 0 }, NEUTRAL_CLICK_MODIFIERS)).toEqual({
      balance: 1,
      totalClicks: 1,
    });
  });

  it("Click on an existing state", () => {
    expect(clickMainButton({ balance: 41, totalClicks: 99 }, NEUTRAL_CLICK_MODIFIERS)).toEqual({
      balance: 42,
      totalClicks: 100,
    });
  });

  it("Click value above 1 adds to balance but total clicks grows by 1", () => {
    expect(
      clickMainButton(
        { balance: 5, totalClicks: 5 },
        { multiplier: 2, combo: 1, crit: true, goldenBonus: 1 },
      ),
    ).toEqual({ balance: 25, totalClicks: 6 });
  });

  it("Input state is not mutated", () => {
    const input: GameState = Object.freeze({ balance: 3, totalClicks: 3 });
    let result: GameState | undefined;
    expect(() => {
      result = clickMainButton(input, NEUTRAL_CLICK_MODIFIERS);
    }).not.toThrow();
    expect(result).toEqual({ balance: 4, totalClicks: 4 });
    expect(input).toEqual({ balance: 3, totalClicks: 3 });
    expect(result).not.toBe(input);
  });

  it("Total clicks never decreases over a click sequence", () => {
    let state: GameState = { balance: 0, totalClicks: 0 };
    const totals: number[] = [];
    for (let i = 0; i < 25; i += 1) {
      state = clickMainButton(state, NEUTRAL_CLICK_MODIFIERS);
      totals.push(state.totalClicks);
    }
    expect(totals).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
    expect(state).toEqual({ balance: 25, totalClicks: 25 });
  });
});

describe("clicker-core: Balance counter visibility", () => {
  it("Visibility rule — no clicks", () => {
    expect(isBalanceVisible({ balance: 0, totalClicks: 0 })).toBe(false);
  });

  it("Visibility rule — after one click", () => {
    expect(isBalanceVisible({ balance: 1, totalClicks: 1 })).toBe(true);
  });

  it("Visibility rule — zero balance but clicks made", () => {
    expect(isBalanceVisible({ balance: 0, totalClicks: 12 })).toBe(true);
  });
});
