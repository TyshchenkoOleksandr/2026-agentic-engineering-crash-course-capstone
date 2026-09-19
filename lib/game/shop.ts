import type {
  BuyItem,
  GetItemPrice,
  GetItemStatus,
  GetRevealedItems,
  GetShopItem,
  IsItemRevealed,
  IsShopVisible,
  ShopItem,
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

export const getShopItem: GetShopItem = () => {
  throw new Error("not implemented");
};

export const isShopVisible: IsShopVisible = () => {
  throw new Error("not implemented");
};

export const isItemRevealed: IsItemRevealed = () => {
  throw new Error("not implemented");
};

export const getItemPrice: GetItemPrice = () => {
  throw new Error("not implemented");
};

export const getItemStatus: GetItemStatus = () => {
  throw new Error("not implemented");
};

export const getRevealedItems: GetRevealedItems = () => {
  throw new Error("not implemented");
};

export const buyItem: BuyItem = () => {
  throw new Error("not implemented");
};
