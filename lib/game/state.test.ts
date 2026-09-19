import { describe, expect, it } from "vitest";
import { NEUTRAL_CLICK_MODIFIERS } from "./click-value";
import { clickMainButton, createInitialState, isBalanceVisible } from "./state";
import type { GameState } from "./types";

// ---------------------------------------------------------------------------
// Helpers (notation from openspec/changes/add-shop-v1/design.md: FRESH, S({...}))
// ---------------------------------------------------------------------------

function fresh(): GameState {
  return {
    balance: 0,
    totalClicks: 0,
    ownedSkins: [],
    enabledSkins: [],
    material: "classic",
    decor: [],
    upgrades: [],
    helpers: { monkey: 0 },
  };
}

const FRESH: GameState = fresh();

function S(overrides: Partial<GameState> = {}): GameState {
  return { ...fresh(), ...overrides };
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

// ---------------------------------------------------------------------------
// Initial game state
// ---------------------------------------------------------------------------

describe("clicker-core: Initial game state", () => {
  it("Fresh state values", () => {
    expect(createInitialState()).toStrictEqual({
      balance: 0,
      totalClicks: 0,
      ownedSkins: [],
      enabledSkins: [],
      material: "classic",
      decor: [],
      upgrades: [],
      helpers: { monkey: 0 },
    });
  });

  it("Fresh state is a new object each time", () => {
    const a = createInitialState();
    const b = createInitialState();
    expect(a).toStrictEqual(FRESH);
    expect(b).toStrictEqual(FRESH);
    expect(a).not.toBe(b);
    expect(a.ownedSkins).not.toBe(b.ownedSkins);
    expect(a.decor).not.toBe(b.decor);
    expect(a.helpers).not.toBe(b.helpers);
  });
});

// ---------------------------------------------------------------------------
// Main-button click
// ---------------------------------------------------------------------------

describe("clicker-core: Main-button click updates balance and total clicks", () => {
  it("First click", () => {
    expect(clickMainButton(FRESH, NEUTRAL_CLICK_MODIFIERS)).toStrictEqual(
      S({ balance: 1, totalClicks: 1 }),
    );
  });

  it("Click on an existing state", () => {
    expect(clickMainButton(S({ balance: 41, totalClicks: 99 }), NEUTRAL_CLICK_MODIFIERS)).toStrictEqual(
      S({ balance: 42, totalClicks: 100 }),
    );
  });

  it("Click value above 1 adds to balance but total clicks grows by 1", () => {
    expect(
      clickMainButton(S({ balance: 5, totalClicks: 5 }), {
        multiplier: 2,
        combo: 1,
        crit: true,
        goldenBonus: 1,
      }),
    ).toStrictEqual(S({ balance: 25, totalClicks: 6 }));
  });

  it("Other fields are copied unchanged", () => {
    const fields: Partial<GameState> = {
      ownedSkins: ["squish", "gold"],
      enabledSkins: ["squish"],
      material: "gold",
      decor: [{ id: "sleeping-cat", position: { x: 0.1, y: 0.2 } }],
      upgrades: ["double-click"],
      helpers: { monkey: 2 },
    };
    const input = S({ balance: 5, totalClicks: 70, ...fields });
    expect(
      clickMainButton(input, { multiplier: 2, combo: 1, crit: false, goldenBonus: 1 }),
    ).toStrictEqual(S({ balance: 7, totalClicks: 71, ...fields }));
  });

  it("Input state is not mutated", () => {
    const input = deepFreeze(S({ balance: 3, totalClicks: 3 }));
    let result: GameState | undefined;
    expect(() => {
      result = clickMainButton(input, NEUTRAL_CLICK_MODIFIERS);
    }).not.toThrow();
    expect(result).toStrictEqual(S({ balance: 4, totalClicks: 4 }));
    expect(input).toStrictEqual(S({ balance: 3, totalClicks: 3 }));
    expect(result).not.toBe(input);
  });

  it("Total clicks never decreases over a click sequence", () => {
    let state: GameState = FRESH;
    const totals: number[] = [];
    for (let i = 0; i < 25; i += 1) {
      state = clickMainButton(state, NEUTRAL_CLICK_MODIFIERS);
      totals.push(state.totalClicks);
    }
    expect(totals).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
    expect(state).toStrictEqual(S({ balance: 25, totalClicks: 25 }));
  });
});

// ---------------------------------------------------------------------------
// Balance counter visibility (unchanged Stage 1 requirement)
// ---------------------------------------------------------------------------

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
