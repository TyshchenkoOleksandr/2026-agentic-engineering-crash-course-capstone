import { describe, expect, it } from "vitest";
import {
  buyItem,
  getItemPrice,
  getItemStatus,
  getRevealedItems,
  getShopItem,
  isItemRevealed,
  isShopVisible,
  PRICE_GROWTH,
  SHOP_CATALOG,
  SHOP_UNLOCK_CLICKS,
} from "./shop";
import type { BuyResult, GameState, ShopItem, ShopItemId } from "./types";

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

function ids(items: readonly ShopItem[]): ShopItemId[] {
  return items.map((item) => item.id);
}

function okState(result: BuyResult): GameState {
  if (!result.ok) {
    throw new Error(`expected a successful purchase, got reason "${result.reason}"`);
  }
  return result.state;
}

// ---------------------------------------------------------------------------
// Shop catalog
// ---------------------------------------------------------------------------

describe("shop: Shop catalog", () => {
  it("Catalog ids and order", () => {
    expect(SHOP_CATALOG.map((i) => i.id)).toEqual([
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
    ]);
  });

  it("Catalog entries", () => {
    expect(SHOP_CATALOG).toEqual([
      { kind: "skin", id: "soft-shadow", category: "skins", slot: "stack", price: 15, revealAt: 10 },
      { kind: "skin", id: "squish", category: "skins", slot: "stack", price: 25, revealAt: 15 },
      {
        kind: "skin",
        id: "floating-number",
        category: "skins",
        slot: "stack",
        price: 30,
        revealAt: 20,
      },
      { kind: "skin", id: "jumping-cap", category: "skins", slot: "stack", price: 50, revealAt: 35 },
      { kind: "skin", id: "gold", category: "skins", slot: "material", price: 500, revealAt: 300 },
      {
        kind: "decor",
        id: "sleeping-cat",
        category: "decor",
        size: { width: 120, height: 80 },
        price: 100,
        revealAt: 75,
      },
      {
        kind: "decor",
        id: "lava-lamp",
        category: "decor",
        size: { width: 64, height: 144 },
        price: 200,
        revealAt: 150,
      },
      {
        kind: "decor",
        id: "hydraulic-press",
        category: "decor",
        size: { width: 144, height: 144 },
        price: 1500,
        revealAt: 750,
      },
      {
        kind: "click-upgrade",
        id: "double-click",
        category: "upgrades",
        multiplier: 2,
        requires: null,
        price: 100,
        revealAt: 60,
      },
      {
        kind: "click-upgrade",
        id: "triple-click",
        category: "upgrades",
        multiplier: 3,
        requires: "double-click",
        price: 500,
        revealAt: 250,
      },
      {
        kind: "helper",
        id: "monkey",
        category: "upgrades",
        clicksPerSecond: 1,
        price: 50,
        revealAt: 30,
      },
    ]);

    expect(getShopItem("gold")).toEqual({
      kind: "skin",
      id: "gold",
      category: "skins",
      slot: "material",
      price: 500,
      revealAt: 300,
    });
    expect(getShopItem("lava-lamp")).toEqual({
      kind: "decor",
      id: "lava-lamp",
      category: "decor",
      size: { width: 64, height: 144 },
      price: 200,
      revealAt: 150,
    });
    expect(getShopItem("triple-click")).toEqual({
      kind: "click-upgrade",
      id: "triple-click",
      category: "upgrades",
      multiplier: 3,
      requires: "double-click",
      price: 500,
      revealAt: 250,
    });
    expect(getShopItem("monkey")).toEqual({
      kind: "helper",
      id: "monkey",
      category: "upgrades",
      clicksPerSecond: 1,
      price: 50,
      revealAt: 30,
    });
    for (const item of SHOP_CATALOG) {
      expect(getShopItem(item.id)).toEqual(item);
    }
  });

  it("Constants", () => {
    expect(SHOP_UNLOCK_CLICKS).toBe(10);
    expect(PRICE_GROWTH).toBe(1.15);
  });
});

// ---------------------------------------------------------------------------
// Shop visibility
// ---------------------------------------------------------------------------

describe("shop: Shop visibility", () => {
  it("Unlock threshold", () => {
    expect(isShopVisible({ balance: 500, totalClicks: 9 })).toBe(false);
    expect(isShopVisible({ balance: 0, totalClicks: 10 })).toBe(true);
    expect(isShopVisible({ balance: 0, totalClicks: 11 })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Progressive reveal
// ---------------------------------------------------------------------------

describe("shop: Progressive reveal", () => {
  it.each([
    ["soft-shadow", 10],
    ["squish", 15],
    ["floating-number", 20],
    ["jumping-cap", 35],
    ["gold", 300],
    ["sleeping-cat", 75],
    ["lava-lamp", 150],
    ["hydraulic-press", 750],
    ["double-click", 60],
    ["triple-click", 250],
    ["monkey", 30],
  ] as const)("Reveal boundaries for every item: %s at %i", (id, revealAt) => {
    expect(isItemRevealed(S({ totalClicks: revealAt - 1 }), id)).toBe(false);
    expect(isItemRevealed(S({ totalClicks: revealAt }), id)).toBe(true);
  });

  it("Revealed items at 20 clicks", () => {
    expect(ids(getRevealedItems(S({ totalClicks: 20 })))).toEqual([
      "soft-shadow",
      "squish",
      "floating-number",
    ]);
  });

  it("Revealed items by category", () => {
    expect(ids(getRevealedItems(S({ totalClicks: 60 }), "upgrades"))).toEqual([
      "double-click",
      "monkey",
    ]);
    expect(ids(getRevealedItems(S({ totalClicks: 60 }), "decor"))).toEqual([]);
  });

  it("Nothing revealed before 10", () => {
    expect(getRevealedItems(S({ totalClicks: 9 }))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Prices
// ---------------------------------------------------------------------------

describe("shop: Prices", () => {
  it("One-time prices ignore state", () => {
    expect(getItemPrice(FRESH, "gold")).toBe(500);
    expect(
      getItemPrice(S({ balance: 9999, totalClicks: 9999, upgrades: ["double-click"] }), "gold"),
    ).toBe(500);
    expect(getItemPrice(FRESH, "hydraulic-press")).toBe(1500);
    expect(getItemPrice(FRESH, "soft-shadow")).toBe(15);
  });

  it("Monkey price curve", () => {
    const prices = [0, 1, 2, 3, 4, 5, 10].map((n) =>
      getItemPrice(S({ helpers: { monkey: n } }), "monkey"),
    );
    expect(prices).toEqual([50, 58, 66, 76, 87, 101, 202]);
  });

  it("Rounding guard for the float artefact", () => {
    // Precondition of the scenario: the naive formula lands just below .5.
    expect(50 * 1.15 ** 1).toBe(57.49999999999999);
    expect(getItemPrice(S({ helpers: { monkey: 1 } }), "monkey")).toBe(58);
  });
});

// ---------------------------------------------------------------------------
// Item status
// ---------------------------------------------------------------------------

describe("shop: Item status", () => {
  it("Affordability boundary", () => {
    expect(getItemStatus(S({ balance: 14, totalClicks: 10 }), "soft-shadow")).toBe("unaffordable");
    expect(getItemStatus(S({ balance: 15, totalClicks: 10 }), "soft-shadow")).toBe("available");
  });

  it("Hidden wins over affordable", () => {
    expect(getItemStatus(S({ balance: 1000, totalClicks: 9 }), "soft-shadow")).toBe("hidden");
  });

  it("Owned one-time items", () => {
    expect(
      getItemStatus(
        S({ totalClicks: 20, ownedSkins: ["soft-shadow"], enabledSkins: [] }),
        "soft-shadow",
      ),
    ).toBe("owned");
    expect(
      getItemStatus(
        S({ totalClicks: 200, decor: [{ id: "lava-lamp", position: null }] }),
        "lava-lamp",
      ),
    ).toBe("owned");
    expect(
      getItemStatus(S({ totalClicks: 60, upgrades: ["double-click"] }), "double-click"),
    ).toBe("owned");
  });

  it("Triple click requirement", () => {
    const states = [
      S({ balance: 500, totalClicks: 250 }),
      S({ balance: 0, totalClicks: 250 }),
      S({ balance: 499, totalClicks: 250, upgrades: ["double-click"] }),
      S({ balance: 500, totalClicks: 250, upgrades: ["double-click"] }),
      S({ balance: 0, totalClicks: 250, upgrades: ["double-click", "triple-click"] }),
    ];
    expect(states.map((s) => getItemStatus(s, "triple-click"))).toEqual([
      "requires",
      "requires",
      "unaffordable",
      "available",
      "owned",
    ]);
  });

  it("Helpers are never owned", () => {
    expect(
      getItemStatus(S({ balance: 58, totalClicks: 30, helpers: { monkey: 1 } }), "monkey"),
    ).toBe("available");
    expect(
      getItemStatus(S({ balance: 57, totalClicks: 30, helpers: { monkey: 1 } }), "monkey"),
    ).toBe("unaffordable");
  });
});

// ---------------------------------------------------------------------------
// Buying
// ---------------------------------------------------------------------------

describe("shop: Buying", () => {
  it("Buy a stack skin", () => {
    expect(buyItem(S({ balance: 20, totalClicks: 12 }), "soft-shadow")).toEqual({
      ok: true,
      state: S({
        balance: 5,
        totalClicks: 12,
        ownedSkins: ["soft-shadow"],
        enabledSkins: ["soft-shadow"],
      }),
    });
  });

  it("Arrays keep catalog order", () => {
    const next = okState(
      buyItem(
        S({
          balance: 100,
          totalClicks: 50,
          ownedSkins: ["jumping-cap"],
          enabledSkins: ["jumping-cap"],
        }),
        "soft-shadow",
      ),
    );
    expect(next.ownedSkins).toEqual(["soft-shadow", "jumping-cap"]);
    expect(next.enabledSkins).toEqual(["soft-shadow", "jumping-cap"]);
    expect(next.balance).toBe(85);
  });

  it("Buy Gold", () => {
    const next = okState(
      buyItem(
        S({ balance: 600, totalClicks: 300, ownedSkins: ["squish"], enabledSkins: ["squish"] }),
        "gold",
      ),
    );
    expect(next).toEqual(
      S({
        balance: 100,
        totalClicks: 300,
        ownedSkins: ["squish", "gold"],
        enabledSkins: ["squish"],
        material: "gold",
      }),
    );
  });

  it("Buy decor with a position", () => {
    const next = okState(
      buyItem(S({ balance: 250, totalClicks: 150 }), "lava-lamp", {
        decorPosition: { x: 0.5, y: 0.25 },
      }),
    );
    expect(next).toEqual(
      S({
        balance: 50,
        totalClicks: 150,
        decor: [{ id: "lava-lamp", position: { x: 0.5, y: 0.25 } }],
      }),
    );
  });

  it("Buy decor without a position", () => {
    const next = okState(buyItem(S({ balance: 100, totalClicks: 75 }), "sleeping-cat"));
    expect(next.decor).toEqual([{ id: "sleeping-cat", position: null }]);
    expect(next.balance).toBe(0);
  });

  it("Decor keeps catalog order", () => {
    const next = okState(
      buyItem(
        S({
          balance: 100,
          totalClicks: 800,
          decor: [{ id: "hydraulic-press", position: { x: 0.1, y: 0.1 } }],
        }),
        "sleeping-cat",
        { decorPosition: { x: 0.7, y: 0.2 } },
      ),
    );
    expect(next.decor).toEqual([
      { id: "sleeping-cat", position: { x: 0.7, y: 0.2 } },
      { id: "hydraulic-press", position: { x: 0.1, y: 0.1 } },
    ]);
  });

  it("Buy click upgrades", () => {
    expect(okState(buyItem(S({ balance: 100, totalClicks: 60 }), "double-click"))).toEqual(
      S({ balance: 0, totalClicks: 60, upgrades: ["double-click"] }),
    );
    expect(
      okState(
        buyItem(
          S({ balance: 600, totalClicks: 250, upgrades: ["double-click"] }),
          "triple-click",
        ),
      ),
    ).toEqual(S({ balance: 100, totalClicks: 250, upgrades: ["double-click", "triple-click"] }));
  });

  it("Buy monkeys until broke", () => {
    let state = S({ balance: 200, totalClicks: 30 });
    const balances: number[] = [];
    for (let i = 0; i < 3; i += 1) {
      state = okState(buyItem(state, "monkey"));
      balances.push(state.balance);
    }
    expect(balances).toEqual([150, 92, 26]);
    expect(state.helpers).toEqual({ monkey: 3 });
    expect(state.totalClicks).toBe(30);
    expect(buyItem(state, "monkey")).toEqual({ ok: false, reason: "unaffordable" });
  });

  it("Failure reasons", () => {
    expect(buyItem(S({ balance: 1000, totalClicks: 9 }), "soft-shadow")).toEqual({
      ok: false,
      reason: "hidden",
    });
    expect(
      buyItem(
        S({
          balance: 1000,
          totalClicks: 20,
          ownedSkins: ["soft-shadow"],
          enabledSkins: ["soft-shadow"],
        }),
        "soft-shadow",
      ),
    ).toEqual({ ok: false, reason: "owned" });
    expect(buyItem(S({ balance: 1000, totalClicks: 250 }), "triple-click")).toEqual({
      ok: false,
      reason: "requires",
    });
    expect(buyItem(S({ balance: 14, totalClicks: 10 }), "soft-shadow")).toEqual({
      ok: false,
      reason: "unaffordable",
    });
  });

  it("Input is not mutated", () => {
    const input = deepFreeze(S({ balance: 20, totalClicks: 12 }));
    let result: BuyResult | undefined;
    expect(() => {
      result = buyItem(input, "soft-shadow");
    }).not.toThrow();
    expect(input).toEqual(S({ balance: 20, totalClicks: 12 }));
    expect(result?.ok).toBe(true);
    expect(result && result.ok ? result.state : undefined).not.toBe(input);
  });
});
