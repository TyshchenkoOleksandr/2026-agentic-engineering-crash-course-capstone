// Shared contract for Dopamine Clicker.
//   Stage 1: OpenSpec change add-foundation (archived).
//   Stage 2: OpenSpec change add-shop-v1 (shop, skins, decor, Double/Triple click, Monkey helper).
// Types only — no runtime logic lives here. Owned by spec-writer; other agents propose changes in
// their reports instead of editing this file.
//
// Implementations:
//   lib/game/click-value.ts  -> GetClickValue, NEUTRAL_CLICK_MODIFIERS,
//                               GetClickMultiplier, GetClickModifiers            (Stage 2: +2)
//   lib/game/state.ts        -> CreateInitialState, ClickMainButton, IsBalanceVisible
//   lib/game/save.ts         -> SerializeGame, ValidateGameState, MigrateSave, ParseSave,
//                               LoadGame, SaveGame, ClearGame, SAVE_KEY, SAVE_BACKUP_KEY,
//                               CURRENT_SAVE_VERSION (= 2), MIGRATIONS (= { 1: MigrateV1ToV2 }),
//                               migrateV1ToV2
//   lib/game/preferences.ts  -> ParseTheme, ResolveTheme, ToggleTheme, ParseLanguage,
//                               ResolveLanguage, ToggleLanguage, LoadPreferences, SaveTheme,
//                               SaveLanguage, THEME_KEY, LANGUAGE_KEY
//   lib/game/shop.ts         -> SHOP_CATALOG, SHOP_UNLOCK_CLICKS, PRICE_GROWTH, GetShopItem,
//                               IsShopVisible, IsItemRevealed, GetItemPrice, GetItemStatus,
//                               GetRevealedItems, BuyItem                       (Stage 2, new)
//   lib/game/skins.ts        -> ToggleSkin, IsSkinActive, GetButtonAppearance   (Stage 2, new)
//   lib/game/helpers.ts      -> HELPER_TICK_MS, MAX_TICK_MS, GetHelperClicksPerSecond,
//                               TickHelpers                                       (Stage 2, new)
//   lib/game/decor.ts        -> DECOR_MARGIN, DECOR_GAP, DECOR_MAX_ATTEMPTS, RectsOverlap,
//                               PlaceDecor, DecorRect                             (Stage 2, new)
//
// Out of scope until Stage 3+: crit / combo / golden-button runtime state, Robot, Factory,
// helper speed-ups, sound slot, remaining skins and decor, offline progress.

// ---------------------------------------------------------------------------
// Randomness
// ---------------------------------------------------------------------------

/**
 * Injectable random source: returns a number in [0, 1) on each call (same contract as
 * `Math.random`). The UI passes `Math.random`; tests pass a scripted sequence.
 */
export type RandomSource = () => number;

// ---------------------------------------------------------------------------
// Catalog ids (Stage 2)
// ---------------------------------------------------------------------------

/** Skins in the "stack" slot: any combination can be enabled at once. */
export type StackSkinId = "soft-shadow" | "squish" | "floating-number" | "jumping-cap";
/** Skins in the exclusive "material" slot (Stage 2: only Gold). */
export type MaterialSkinId = "gold";
export type SkinId = StackSkinId | MaterialSkinId;
/** Current material of the main button; "classic" is the default, not a purchasable item. */
export type MaterialId = "classic" | MaterialSkinId;
export type SkinSlot = "stack" | "material";

export type DecorId = "sleeping-cat" | "lava-lamp" | "hydraulic-press";
export type ClickUpgradeId = "double-click" | "triple-click";
export type HelperId = "monkey";

export type ShopItemId = SkinId | DecorId | ClickUpgradeId | HelperId;
export type ShopCategory = "skins" | "decor" | "upgrades";

// ---------------------------------------------------------------------------
// Catalog entries (SHOP_CATALOG in lib/game/shop.ts, in display order)
// ---------------------------------------------------------------------------

interface ShopItemBase {
  /** Price for one-time items; base price for repeatable items (helpers). */
  readonly price: number;
  /** Item is listed in the shop once `totalClicks >= revealAt`. */
  readonly revealAt: number;
}

export interface SkinItem extends ShopItemBase {
  readonly kind: "skin";
  readonly id: SkinId;
  readonly category: "skins";
  readonly slot: SkinSlot;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface DecorItem extends ShopItemBase {
  readonly kind: "decor";
  readonly id: DecorId;
  readonly category: "decor";
  /** Fixed on-screen size in CSS px, used for placement and rendering. */
  readonly size: Size;
}

export interface ClickUpgradeItem extends ShopItemBase {
  readonly kind: "click-upgrade";
  readonly id: ClickUpgradeId;
  readonly category: "upgrades";
  /** Click multiplier granted while this is the highest owned click upgrade. */
  readonly multiplier: 2 | 3;
  /** Upgrade that must be owned before this one can be bought, or null. */
  readonly requires: ClickUpgradeId | null;
}

export interface HelperItem extends ShopItemBase {
  readonly kind: "helper";
  readonly id: HelperId;
  readonly category: "upgrades";
  /** Whole clicks per second produced by one helper of this type. */
  readonly clicksPerSecond: number;
}

export type ShopItem = SkinItem | DecorItem | ClickUpgradeItem | HelperItem;

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

/** Schema version 1 state payload (Stage 1). Kept as the input type of the v1 -> v2 migration. */
export interface GameStateV1 {
  /** Spendable clicks. Shown in the counter above the main button. */
  readonly balance: number;
  /**
   * Main-button presses + whole helper clicks ever made (Stage 2 DECISION). Never decreases
   * except through an explicit reset. Drives shop visibility and item reveal.
   */
  readonly totalClicks: number;
}

/**
 * Position of a placed decor item: top-left corner as a fraction of the viewport,
 * `x = left / viewportWidth`, `y = top / viewportHeight`, both finite and in [0, 1].
 */
export interface DecorPosition {
  readonly x: number;
  readonly y: number;
}

export interface PlacedDecor {
  readonly id: DecorId;
  /** `null` when no free spot was found at purchase time (rendered in the fallback dock). */
  readonly position: DecorPosition | null;
}

/**
 * Full persisted game state. Schema version 2. All counts are non-negative safe integers.
 * Every array is kept in SHOP_CATALOG order and has no duplicates (so deep equality is stable).
 */
export interface GameState extends GameStateV1 {
  /** Purchased skins (stack and material). */
  readonly ownedSkins: readonly SkinId[];
  /** Enabled stack skins; always a subset of `ownedSkins`. */
  readonly enabledSkins: readonly StackSkinId[];
  /** Equipped material; "gold" only if Gold is owned. */
  readonly material: MaterialId;
  /** Purchased decor with its saved position. */
  readonly decor: readonly PlacedDecor[];
  /** Purchased click upgrades; "triple-click" only together with "double-click". */
  readonly upgrades: readonly ClickUpgradeId[];
  /** Number of owned helpers per type. */
  readonly helpers: Readonly<Record<HelperId, number>>;
}

/**
 * Inputs of the click-value formula from the brief:
 *   value = 1 × multiplier × combo × (crit ? 10 : 1) × goldenBonus
 * Stage 2: `multiplier` comes from click upgrades (GetClickModifiers); the rest stay neutral.
 */
export interface ClickModifiers {
  /** Upgrade multiplier: 1 | 2 | 3 (Double / Triple click). */
  readonly multiplier: number;
  /** Combo multiplier in [1, 2] (Stage 3). */
  readonly combo: number;
  /** Whether this click is a crit (×10, Stage 3). */
  readonly crit: boolean;
  /** Golden button bonus while active, otherwise 1 (Stage 3). */
  readonly goldenBonus: number;
}

// ---------------------------------------------------------------------------
// Shop
// ---------------------------------------------------------------------------

/**
 * Status of one catalog item for a given state, evaluated in this priority order:
 * - `owned`        — one-time item already bought (never returned for helpers);
 * - `hidden`       — `totalClicks < revealAt` (not rendered in the shop);
 * - `requires`     — a click upgrade whose `requires` item is not owned (shown disabled);
 * - `unaffordable` — `balance < current price` (shown disabled with the price);
 * - `available`    — can be bought now.
 */
export type ShopItemStatus = "owned" | "hidden" | "requires" | "unaffordable" | "available";

export type BuyFailureReason = Exclude<ShopItemStatus, "available">;

export interface BuyOptions {
  /** Decor only: position chosen by PlaceDecor at purchase time. Missing = null. */
  readonly decorPosition?: DecorPosition | null;
}

export type BuyResult =
  | { readonly ok: true; readonly state: GameState }
  | { readonly ok: false; readonly reason: BuyFailureReason };

/** Visual state of the main button derived from skins. */
export interface ButtonAppearance {
  /** Enabled stack skins in catalog order. */
  readonly stack: readonly StackSkinId[];
  readonly material: MaterialId;
}

// ---------------------------------------------------------------------------
// Helpers (game tick)
// ---------------------------------------------------------------------------

/**
 * Result of one helper tick. `carry` is the fractional remainder in milli-clicks
 * (integer in [0, 999]); it lives only in memory and is never saved.
 */
export interface HelperTickResult {
  readonly state: GameState;
  readonly carry: number;
}

// ---------------------------------------------------------------------------
// Decor placement
// ---------------------------------------------------------------------------

/** Axis-aligned rectangle in CSS px (same shape as a DOMRect subset). */
export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface PlaceDecorInput {
  readonly viewport: Size;
  readonly size: Size;
  /** Areas the decor must not overlap (UI elements and already placed decor), in px. */
  readonly reserved: readonly Rect[];
  readonly random: RandomSource;
  /** Distance kept from the viewport edges. Default DECOR_MARGIN (16). */
  readonly margin?: number;
  /** Extra free space kept around the decor when testing overlap. Default DECOR_GAP (16). */
  readonly gap?: number;
  /** Number of random candidates tried. Default DECOR_MAX_ATTEMPTS (50). */
  readonly maxAttempts?: number;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

/** Minimal storage interface; `window.localStorage` satisfies it. Injected so lib/ stays DOM-free. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Storage key of the game save (value of SAVE_KEY in lib/game/save.ts). */
export type SaveKey = "dopamine-clicker:save";

/** Storage key of the backup of the last corrupted raw save (value of SAVE_BACKUP_KEY). */
export type SaveBackupKey = "dopamine-clicker:save:bad";

/** Version of the save schema written by this build. */
export type CurrentSaveVersion = 2;

/** Stage 1 on-disk envelope (read-only now; migrated to v2 on load). */
export interface SaveFileV1 {
  readonly version: 1;
  readonly state: GameStateV1;
}

/** On-disk envelope written under SAVE_KEY from Stage 2 on. */
export interface SaveFileV2 {
  readonly version: 2;
  readonly state: GameState;
}

/** Any envelope read from storage before migration/validation. */
export interface UnknownSaveFile {
  readonly version: number;
  readonly state: unknown;
}

/** Converts the `state` payload of version N into the payload of version N + 1. */
export type Migration = (state: unknown) => unknown;

/** Keyed by SOURCE version: table[1] migrates v1 -> v2. */
export type MigrationTable = Readonly<Record<number, Migration>>;

export interface ParseSaveOptions {
  /** Defaults to the built-in table MIGRATIONS (`{ 1: migrateV1ToV2 }` in Stage 2). */
  readonly migrations?: MigrationTable;
  /** Defaults to CURRENT_SAVE_VERSION (2). */
  readonly targetVersion?: number;
}

/**
 * - `fresh`     — nothing stored (or storage unreadable); initial state returned.
 * - `loaded`    — stored save was already at the target version and valid.
 * - `migrated`  — stored save was older, migrated successfully and valid.
 * - `corrupted` — stored value unparseable, invalid, from an unknown/future version, or a
 *                 migration step is missing/throws; initial state returned.
 */
export type LoadStatus = "fresh" | "loaded" | "migrated" | "corrupted";

export interface LoadResult {
  readonly state: GameState;
  readonly status: LoadStatus;
}

// ---------------------------------------------------------------------------
// Preferences (theme + language) — stored separately from game state, survive reset
// ---------------------------------------------------------------------------

export type Theme = "light" | "dark";
export type Language = "uk" | "en";

export interface Preferences {
  /** Explicit saved choice, or null = follow system preference. */
  readonly theme: Theme | null;
  /** Saved language, or the default "uk". */
  readonly language: Language;
}

// ---------------------------------------------------------------------------
// Function signatures (implemented in lib/game/*.ts; all pure, never mutate inputs)
// ---------------------------------------------------------------------------

// click-value.ts
export type GetClickValue = (modifiers: ClickModifiers) => number;
/** 3 if "triple-click" is owned, else 2 if "double-click" is owned, else 1. */
export type GetClickMultiplier = (state: GameState) => 1 | 2 | 3;
/** `{ multiplier: GetClickMultiplier(state), combo: 1, crit: false, goldenBonus: 1 }` (Stage 2). */
export type GetClickModifiers = (state: GameState) => ClickModifiers;

// state.ts
/** v2 fresh state; see specs/clicker-core "Initial game state". */
export type CreateInitialState = () => GameState;
/** Adds the click value to balance and 1 to totalClicks; every other field is copied unchanged. */
export type ClickMainButton = (state: GameState, modifiers: ClickModifiers) => GameState;
export type IsBalanceVisible = (state: GameStateV1) => boolean;

// shop.ts
export type GetShopItem = (id: ShopItemId) => ShopItem;
/** `totalClicks >= SHOP_UNLOCK_CLICKS` (10). */
export type IsShopVisible = (state: GameStateV1) => boolean;
/** `totalClicks >= item.revealAt`. */
export type IsItemRevealed = (state: GameStateV1, id: ShopItemId) => boolean;
/**
 * One-time items: `item.price`. Helpers:
 * `Math.round(Number((item.price * PRICE_GROWTH ** owned).toFixed(6)))` where
 * `owned = state.helpers[id]` (rounds the intended value: owned 1 -> 58, not the float 57).
 */
export type GetItemPrice = (state: GameState, id: ShopItemId) => number;
export type GetItemStatus = (state: GameState, id: ShopItemId) => ShopItemStatus;
/** Items with status !== "hidden", in SHOP_CATALOG order, optionally filtered by category. */
export type GetRevealedItems = (state: GameState, category?: ShopCategory) => readonly ShopItem[];
/**
 * Buys one unit if `GetItemStatus` is "available"; otherwise `{ ok: false, reason: status }`.
 * Never changes totalClicks. See specs/shop "Buying".
 */
export type BuyItem = (state: GameState, id: ShopItemId, options?: BuyOptions) => BuyResult;

// skins.ts
/**
 * Owned stack skin: toggles membership in `enabledSkins`. Owned Gold: material
 * "gold" <-> "classic". Not owned: returns the input state object unchanged (same reference).
 */
export type ToggleSkin = (state: GameState, id: SkinId) => GameState;
/** Stack skin: in `enabledSkins`. Material skin: `material === id`. */
export type IsSkinActive = (state: GameState, id: SkinId) => boolean;
export type GetButtonAppearance = (state: GameState) => ButtonAppearance;

// helpers.ts
/** `Σ helpers[type] × clicksPerSecond(type)` (no speed-ups in Stage 2). */
export type GetHelperClicksPerSecond = (state: GameState) => number;
/**
 * Advances helpers by `elapsedMs` (clamped to [0, MAX_TICK_MS]; NaN/negative -> 0).
 * `milli = carry + clicksPerSecond × elapsed`; `whole = floor(milli / 1000)` is added to both
 * balance and totalClicks (click multipliers are NOT applied); new carry = `milli % 1000`.
 * When `whole === 0` the returned `state` is the input object (same reference).
 */
export type TickHelpers = (state: GameState, carry: number, elapsedMs: number) => HelperTickResult;

// decor.ts
/** Strict overlap: rectangles that only touch at an edge do NOT overlap. */
export type RectsOverlap = (a: Rect, b: Rect) => boolean;
/** Random placement avoiding `reserved`; null if the viewport is too small or all attempts fail. */
export type PlaceDecor = (input: PlaceDecorInput) => DecorPosition | null;
/**
 * Pixel rect of a placed decor for the current viewport:
 * `left = clamp(round(x × vw), 0, vw − w)`, `top = clamp(round(y × vh), 0, vh − h)`.
 */
export type DecorRect = (position: DecorPosition, size: Size, viewport: Size) => Rect;

// save.ts
/** Writes `{ version: 2, state }` with exactly the GameState fields (no timestamps). */
export type SerializeGame = (state: GameState) => string;
/** v2 validator; returns a normalized copy (arrays in catalog order, extra keys dropped) or null. */
export type ValidateGameState = (value: unknown) => GameState | null;
/** Built-in MIGRATIONS[1]: v1 payload -> v2 payload with default shop fields. */
export type MigrateV1ToV2 = (state: unknown) => unknown;
export type MigrateSave = (
  file: UnknownSaveFile,
  migrations: MigrationTable,
  targetVersion: number,
) => UnknownSaveFile | null;
/** Pure: never touches storage (the corrupted-save backup is LoadGame's job). */
export type ParseSave = (raw: string | null, options?: ParseSaveOptions) => LoadResult;
/**
 * Reads SAVE_KEY and parses it. Never throws. When the status is `corrupted` and the raw value was
 * non-null, copies the raw string verbatim to SAVE_BACKUP_KEY (overwriting any previous backup;
 * a failed backup write is ignored). Never writes the backup for other statuses and never
 * modifies SAVE_KEY.
 */
export type LoadGame = (storage: KeyValueStorage, options?: ParseSaveOptions) => LoadResult;
/** Returns false (never throws) when storage rejects the write. */
export type SaveGame = (storage: KeyValueStorage, state: GameState) => boolean;
/** Removes SAVE_KEY only; never touches SAVE_BACKUP_KEY or preference keys. Never throws. */
export type ClearGame = (storage: KeyValueStorage) => void;

// preferences.ts
export type ParseTheme = (raw: string | null) => Theme | null;
export type ResolveTheme = (stored: Theme | null, systemPrefersDark: boolean) => Theme;
export type ToggleTheme = (current: Theme) => Theme;
export type ParseLanguage = (raw: string | null) => Language | null;
export type ResolveLanguage = (stored: Language | null) => Language;
export type ToggleLanguage = (current: Language) => Language;
/** Never throws; unreadable storage yields { theme: null, language: "uk" }. */
export type LoadPreferences = (storage: KeyValueStorage) => Preferences;
/** Return false (never throw) when storage rejects the write. */
export type SaveTheme = (storage: KeyValueStorage, theme: Theme) => boolean;
export type SaveLanguage = (storage: KeyValueStorage, language: Language) => boolean;
