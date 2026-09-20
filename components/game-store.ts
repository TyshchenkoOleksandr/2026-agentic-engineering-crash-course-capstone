import { getComboLevel } from "@/lib/game/combo";
import { catchGolden, createGoldenState, tickGolden } from "@/lib/game/golden";
import { tickHelpers } from "@/lib/game/helpers";
import { createClickRuntime, pressMainButton } from "@/lib/game/press";
import { clearGame, loadGame, saveGame } from "@/lib/game/save";
import { buyItem } from "@/lib/game/shop";
import { toggleSkin } from "@/lib/game/skins";
import { createInitialState } from "@/lib/game/state";
import type {
  BuyOptions,
  ClickRuntime,
  DecorPosition,
  GameState,
  PressResult,
  ShopItemId,
  SkinId,
} from "@/lib/game/types";
import { pageRandom } from "./page-random";

// The saved game seen as an external store (mirrors components/preferences-store.ts): React reads
// it through useSyncExternalStore instead of copying it into local state. `null` until the browser
// snapshot is taken, which is exactly the "not loaded yet" state the main button stays disabled for
// (design D7). Every write (click, reset) goes through commitGame/resetGame below so the snapshot
// and localStorage never drift apart, even across a remount.

const listeners = new Set<() => void>();
let snapshot: GameState | null = null;

export function subscribeSavedState(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getSavedStateSnapshot(): GameState | null {
  snapshot ??= loadGame(window.localStorage).state;
  return snapshot;
}

/** Used for SSR and the hydration render: storage is unknown there. */
export function getServerSavedState(): GameState | null {
  return null;
}

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

/** Persists `next` and publishes it as the new snapshot. */
export function commitGame(next: GameState): void {
  saveGame(window.localStorage, next);
  snapshot = next;
  emit();
}

/** Wipes the save and publishes a fresh initial state as the new snapshot. */
export function resetGame(): void {
  clearGame(window.localStorage);
  snapshot = createInitialState();
  carry = 0;
  runtime = createClickRuntime();
  clickCarry = 0;
  publishRuntime(0);
  emit();
}

// Fractional helper income in milli-clicks. It lives only here, never in the save (design D11).
let carry = 0;

// ---------------------------------------------------------------------------
// Click runtime (combo, golden button, main-click carry) — never saved (design D2, D17)
// ---------------------------------------------------------------------------

/** What the screen needs to render the runtime: `now` drives the combo decay of the meter. */
export interface RuntimeSnapshot {
  readonly runtime: ClickRuntime;
  readonly now: number;
}

let runtime: ClickRuntime = createClickRuntime();
/** Fractional part of the main-click value, like the helper carry (design D9). */
let clickCarry = 0;
let runtimeSnapshot: RuntimeSnapshot = { runtime, now: 0 };
const runtimeListeners = new Set<() => void>();

const SERVER_RUNTIME_SNAPSHOT: RuntimeSnapshot = {
  runtime: createClickRuntime(),
  now: 0,
};

export function subscribeRuntime(onStoreChange: () => void): () => void {
  runtimeListeners.add(onStoreChange);
  return () => {
    runtimeListeners.delete(onStoreChange);
  };
}

export function getRuntimeSnapshot(): RuntimeSnapshot {
  return runtimeSnapshot;
}

/** SSR and the hydration render never have a runtime; one stable object keeps React happy. */
export function getServerRuntimeSnapshot(): RuntimeSnapshot {
  return SERVER_RUNTIME_SNAPSHOT;
}

function publishRuntime(now: number): void {
  runtimeSnapshot = { runtime, now };
  for (const listener of runtimeListeners) {
    listener();
  }
}

/** One main-button press: state and runtime move together, only the state is persisted. */
export function press(nowMs: number): PressResult | null {
  const state = getSavedStateSnapshot();
  if (!state) {
    return null;
  }
  const result = pressMainButton({
    state,
    runtime,
    carry: clickCarry,
    nowMs,
    random: pageRandom,
  });
  runtime = result.runtime;
  clickCarry = result.carry;
  publishRuntime(nowMs);
  commitGame(result.state);
  return result;
}

/** Catching is runtime only: no balance, no total clicks, no storage write (design D1). */
export function catchGoldenButton(): void {
  if (runtime.golden === null) {
    return;
  }
  const golden = catchGolden(runtime.golden, pageRandom);
  if (golden === runtime.golden) {
    return;
  }
  runtime = { ...runtime, golden };
  publishRuntime(runtimeSnapshot.now);
}

/** Buys one unit of `id`; a refused purchase leaves the state (and the save) untouched. */
export function buy(id: ShopItemId, options?: BuyOptions): void {
  const state = getSavedStateSnapshot();
  if (!state) {
    return;
  }
  const result = buyItem(state, id, options);
  if (result.ok) {
    // The countdown starts at the purchase, not at the next tick (design D8).
    if (id === "golden-button" && runtime.golden === null) {
      runtime = { ...runtime, golden: createGoldenState(pageRandom) };
      publishRuntime(runtimeSnapshot.now);
    }
    commitGame(result.state);
  }
}

/** Toggles an owned skin; skins that are not owned are a no-op down in `toggleSkin`. */
export function toggle(id: SkinId): void {
  const state = getSavedStateSnapshot();
  if (!state) {
    return;
  }
  const next = toggleSkin(state, id);
  if (next !== state) {
    commitGame(next);
  }
}

/**
 * True when the next tick would show a different runtime on screen, i.e. when publishing a new
 * snapshot is worth a re-render of the whole screen:
 * - the runtime object itself changed (golden spawn / lifetime / bonus countdown), or
 * - a combo meter is currently on screen, so the pure passage of time changes what it shows.
 *
 * The combo level is read at the last published `now`, so the tick that drops the meter to 0 is
 * still published (the screen needs it to hide the meter) and the ticks after it are not.
 */
function runtimeChangedOnScreen(state: GameState): boolean {
  if (runtime !== runtimeSnapshot.runtime) {
    return true;
  }
  return (
    state.upgrades.includes("combo") && getComboLevel(runtime.combo, runtimeSnapshot.now) > 0
  );
}

/**
 * One game tick: helpers plus the golden button. Only ticks that complete a whole helper click
 * write to storage (design D11); the runtime is published while it still moves on screen, so the
 * combo meter and the bonus timer keep counting down (design D17) without making a save that has
 * neither of them re-render ten times a second.
 */
export function tick(
  elapsedMs: number,
  nowMs?: number,
  /** Free spot for a new golden button; without it a spawn is skipped (design D8). */
  place: () => DecorPosition | null = () => null,
): void {
  const state = getSavedStateSnapshot();
  if (!state) {
    return;
  }
  const result = tickHelpers(state, carry, elapsedMs);
  carry = result.carry;

  if (state.upgrades.includes("golden-button")) {
    // A save that already owns the button gets its countdown on the first tick (design D8).
    const golden =
      runtime.golden === null
        ? createGoldenState(pageRandom)
        : tickGolden({ golden: runtime.golden, elapsedMs, random: pageRandom, place });
    if (golden !== runtime.golden) {
      runtime = { ...runtime, golden };
    }
  }

  // Unpublished ticks keep `runtimeSnapshot` referentially stable, which is what
  // useSyncExternalStore needs to skip the re-render (design D17).
  if (runtimeChangedOnScreen(state)) {
    publishRuntime(nowMs ?? runtimeSnapshot.now);
  }
  if (result.state !== state) {
    commitGame(result.state);
  }
}
