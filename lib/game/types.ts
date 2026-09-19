// Shared contract for Dopamine Clicker (OpenSpec change: add-foundation, Stage 1).
// Types only — no runtime logic lives here. Owned by spec-writer; other agents propose changes in
// their reports instead of editing this file.
//
// Implementations:
//   lib/game/click-value.ts  -> GetClickValue, NEUTRAL_CLICK_MODIFIERS
//   lib/game/state.ts        -> CreateInitialState, ClickMainButton, IsBalanceVisible
//   lib/game/save.ts         -> SerializeGame, ValidateGameState, MigrateSave, ParseSave,
//                               LoadGame, SaveGame, ClearGame, SAVE_KEY, SAVE_BACKUP_KEY,
//                               CURRENT_SAVE_VERSION
//   lib/game/preferences.ts  -> ParseTheme, ResolveTheme, ToggleTheme, ParseLanguage,
//                               ResolveLanguage, ToggleLanguage, LoadPreferences, SaveTheme,
//                               SaveLanguage, THEME_KEY, LANGUAGE_KEY
//
// Out of scope for Stage 1 (added by later changes): shop item / skin / decor / upgrade ids,
// helpers, crit/combo/golden runtime state, injected RNG for random events.

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

/** Full persisted game state. Schema version 1. All numbers are non-negative safe integers. */
export interface GameState {
  /** Spendable clicks. Shown in the counter above the main button. */
  readonly balance: number;
  /**
   * Number of main-button presses ever made (+1 per press, independent of click value).
   * Never decreases except through an explicit reset. Used for unlocks from Stage 2.
   */
  readonly totalClicks: number;
}

/**
 * Inputs of the click-value formula from the brief:
 *   value = 1 × multiplier × combo × (crit ? 10 : 1) × goldenBonus
 * In Stage 1 the UI always passes the neutral modifiers (value = 1).
 */
export interface ClickModifiers {
  /** Upgrade multiplier: 1 | 2 | 3 (Double / Triple click, Stage 2). */
  readonly multiplier: number;
  /** Combo multiplier in [1, 2] (Stage 3). */
  readonly combo: number;
  /** Whether this click is a crit (×10, Stage 3). */
  readonly crit: boolean;
  /** Golden button bonus while active, otherwise 1 (Stage 3). */
  readonly goldenBonus: number;
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
export type CurrentSaveVersion = 1;

/** On-disk envelope written under SAVE_KEY. */
export interface SaveFileV1 {
  readonly version: 1;
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
  /** Defaults to the built-in table (empty in Stage 1). */
  readonly migrations?: MigrationTable;
  /** Defaults to CURRENT_SAVE_VERSION (1). */
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

// state.ts
export type CreateInitialState = () => GameState;
export type ClickMainButton = (state: GameState, modifiers: ClickModifiers) => GameState;
export type IsBalanceVisible = (state: GameState) => boolean;

// save.ts
export type SerializeGame = (state: GameState) => string;
export type ValidateGameState = (value: unknown) => GameState | null;
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
