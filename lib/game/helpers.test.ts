import { describe, expect, it } from "vitest";
import { getHelperClicksPerSecond, HELPER_TICK_MS, MAX_TICK_MS, tickHelpers } from "./helpers";
import type { GameState, HelperTickResult } from "./types";

// ---------------------------------------------------------------------------
// Helpers (notation from design.md: FRESH, S({...}))
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
// Helper income rate
// ---------------------------------------------------------------------------

describe("helpers: Helper income rate", () => {
  it("Rate per monkey count", () => {
    expect(getHelperClicksPerSecond(S({ helpers: { monkey: 0 } }))).toBe(0);
    expect(getHelperClicksPerSecond(S({ helpers: { monkey: 1 } }))).toBe(1);
    expect(getHelperClicksPerSecond(S({ helpers: { monkey: 4 } }))).toBe(4);
  });

  it("Upgrades do not boost helpers", () => {
    expect(
      getHelperClicksPerSecond(
        S({ helpers: { monkey: 2 }, upgrades: ["double-click", "triple-click"] }),
      ),
    ).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Game tick with fractional carry
// ---------------------------------------------------------------------------

describe("helpers: Game tick with fractional carry", () => {
  it("Constants", () => {
    expect(HELPER_TICK_MS).toBe(100);
    expect(MAX_TICK_MS).toBe(1000);
  });

  it("Partial tick only accumulates", () => {
    const A = S({ balance: 5, totalClicks: 40, helpers: { monkey: 1 } });
    const result = tickHelpers(A, 0, 100);
    expect(result.state).toBe(A);
    expect(result.carry).toBe(100);
  });

  it("Carry completes a click", () => {
    expect(tickHelpers(S({ balance: 5, totalClicks: 40, helpers: { monkey: 1 } }), 900, 100)).toEqual({
      state: S({ balance: 6, totalClicks: 41, helpers: { monkey: 1 } }),
      carry: 0,
    });
  });

  it("Ten ticks of three monkeys, no float drift", () => {
    let result: HelperTickResult = {
      state: S({ balance: 0, totalClicks: 30, helpers: { monkey: 3 } }),
      carry: 0,
    };
    const carries: number[] = [];
    for (let i = 0; i < 10; i += 1) {
      result = tickHelpers(result.state, result.carry, 100);
      carries.push(result.carry);
    }
    expect(carries).toEqual([300, 600, 900, 200, 500, 800, 100, 400, 700, 0]);
    expect(result.state.balance).toBe(3);
    expect(result.state.totalClicks).toBe(33);
  });

  it("Long gaps are clamped", () => {
    expect(tickHelpers(S({ balance: 0, totalClicks: 30, helpers: { monkey: 2 } }), 0, 60000)).toEqual({
      state: S({ balance: 2, totalClicks: 32, helpers: { monkey: 2 } }),
      carry: 0,
    });
  });

  it("Invalid elapsed counts as zero", () => {
    const B = S({ helpers: { monkey: 5 } });
    const negative = tickHelpers(B, 250, -50);
    const nan = tickHelpers(B, 250, Number.NaN);
    expect(negative.state).toBe(B);
    expect(negative.carry).toBe(250);
    expect(nan.state).toBe(B);
    expect(nan.carry).toBe(250);
  });

  it("No helpers keeps the carry", () => {
    const Z = S({ balance: 7, totalClicks: 7 });
    const result = tickHelpers(Z, 400, 1000);
    expect(result.state).toBe(Z);
    expect(result.carry).toBe(400);
  });

  it("Multipliers are ignored", () => {
    const { state } = tickHelpers(
      S({
        balance: 0,
        totalClicks: 250,
        upgrades: ["double-click", "triple-click"],
        helpers: { monkey: 1 },
      }),
      0,
      1000,
    );
    expect(state.balance).toBe(1);
    expect(state.totalClicks).toBe(251);
  });

  it("Other fields are preserved and input is not mutated", () => {
    const input = deepFreeze(
      S({
        balance: 0,
        totalClicks: 30,
        ownedSkins: ["squish"],
        enabledSkins: ["squish"],
        helpers: { monkey: 10 },
      }),
    );
    let result: HelperTickResult | undefined;
    expect(() => {
      result = tickHelpers(input, 0, 100);
    }).not.toThrow();
    expect(result).toEqual({
      state: S({
        balance: 1,
        totalClicks: 31,
        ownedSkins: ["squish"],
        enabledSkins: ["squish"],
        helpers: { monkey: 10 },
      }),
      carry: 0,
    });
  });
});
