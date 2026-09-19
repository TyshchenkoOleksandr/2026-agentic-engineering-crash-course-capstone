import type {
  BuyItem,
  GameState,
  GetItemPrice,
  GetItemStatus,
  GetRevealedItems,
  GetShopItem,
  IsItemRevealed,
  IsShopVisible,
  MaterialSkinId,
  PlacedDecor,
  ShopItem,
  ShopItemId,
  StackSkinId,
} from "./types";

/** The shop box appears once `totalClicks >= SHOP_UNLOCK_CLICKS` (specs/shop). */
export const SHOP_UNLOCK_CLICKS = 10;

/** Growth factor of repeatable prices: `round(base × 1.15^owned)` (design D6). */
export const PRICE_GROWTH = 1.15;

/**
 * Stage 2 catalog in display order; also the canonical order of every array in GameState
 * (design D5).
 */
export const SHOP_CATALOG: readonly ShopItem[] = Object.freeze([
  { kind: "skin", id: "soft-shadow", category: "skins", slot: "stack", price: 15, revealAt: 10 },
  { kind: "skin", id: "squish", category: "skins", slot: "stack", price: 25, revealAt: 15 },
  { kind: "skin", id: "floating-number", category: "skins", slot: "stack", price: 30, revealAt: 20 },
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

/** Catalog position of every id; the canonical order of every array in GameState. */
const CATALOG_INDEX: ReadonlyMap<ShopItemId, number> = new Map(
  SHOP_CATALOG.map((item, index) => [item.id, index]),
);

/** Sorts any id list into catalog order without mutating the input. */
function sortByCatalog<T extends ShopItemId>(ids: readonly T[]): T[] {
  return [...ids].sort((a, b) => (CATALOG_INDEX.get(a) ?? 0) - (CATALOG_INDEX.get(b) ?? 0));
}

export const getShopItem: GetShopItem = (id) => {
  const item = SHOP_CATALOG.find((entry) => entry.id === id);
  if (!item) {
    throw new Error(`unknown shop item: ${id}`);
  }
  return item;
};

export const isShopVisible: IsShopVisible = (state) => state.totalClicks >= SHOP_UNLOCK_CLICKS;

export const isItemRevealed: IsItemRevealed = (state, id) =>
  state.totalClicks >= getShopItem(id).revealAt;

export const getItemPrice: GetItemPrice = (state, id) => {
  const item = getShopItem(id);
  if (item.kind !== "helper") {
    return item.price;
  }
  // Round the mathematically intended value, not the float artefact (design D6).
  const owned = state.helpers[item.id];
  return Math.round(Number((item.price * PRICE_GROWTH ** owned).toFixed(6)));
};

/** Helpers are repeatable, so they are never "owned" (design D6). */
function isOwned(state: GameState, item: ShopItem): boolean {
  switch (item.kind) {
    case "skin":
      return state.ownedSkins.includes(item.id);
    case "decor":
      return state.decor.some((entry) => entry.id === item.id);
    case "click-upgrade":
      return state.upgrades.includes(item.id);
    case "helper":
      return false;
  }
}

export const getItemStatus: GetItemStatus = (state, id) => {
  const item = getShopItem(id);
  if (isOwned(state, item)) {
    return "owned";
  }
  if (!isItemRevealed(state, id)) {
    return "hidden";
  }
  if (item.kind === "click-upgrade" && item.requires !== null) {
    if (!state.upgrades.includes(item.requires)) {
      return "requires";
    }
  }
  return state.balance < getItemPrice(state, id) ? "unaffordable" : "available";
};

export const getRevealedItems: GetRevealedItems = (state, category) =>
  SHOP_CATALOG.filter(
    (item) =>
      (category === undefined || item.category === category) &&
      getItemStatus(state, item.id) !== "hidden",
  );

export const buyItem: BuyItem = (state, id, options) => {
  const status = getItemStatus(state, id);
  if (status !== "available") {
    return { ok: false, reason: status };
  }

  const item = getShopItem(id);
  const balance = state.balance - getItemPrice(state, id);

  switch (item.kind) {
    case "skin":
      return {
        ok: true,
        state: {
          ...state,
          balance,
          ownedSkins: sortByCatalog([...state.ownedSkins, item.id]),
          // Buying equips immediately (design D7).
          enabledSkins:
            item.slot === "stack"
              ? sortByCatalog([...state.enabledSkins, item.id as StackSkinId])
              : state.enabledSkins,
          material: item.slot === "material" ? (item.id as MaterialSkinId) : state.material,
        },
      };
    case "decor":
      return {
        ok: true,
        state: {
          ...state,
          balance,
          decor: sortByCatalog([...state.decor.map((entry) => entry.id), item.id]).map(
            (decorId) =>
              decorId === item.id
                ? { id: item.id, position: options?.decorPosition ?? null }
                : (state.decor.find((entry) => entry.id === decorId) as PlacedDecor),
          ),
        },
      };
    case "click-upgrade":
      return {
        ok: true,
        state: {
          ...state,
          balance,
          upgrades: sortByCatalog([...state.upgrades, item.id]),
        },
      };
    case "helper":
      return {
        ok: true,
        state: {
          ...state,
          balance,
          helpers: { ...state.helpers, [item.id]: state.helpers[item.id] + 1 },
        },
      };
  }
};
