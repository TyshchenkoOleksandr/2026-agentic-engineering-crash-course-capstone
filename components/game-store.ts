import { tickHelpers } from "@/lib/game/helpers";
import { clearGame, loadGame, saveGame } from "@/lib/game/save";
import { buyItem } from "@/lib/game/shop";
import { toggleSkin } from "@/lib/game/skins";
import { createInitialState } from "@/lib/game/state";
import type { BuyOptions, GameState, ShopItemId, SkinId } from "@/lib/game/types";

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
  emit();
}

// Fractional helper income in milli-clicks. It lives only here, never in the save (design D11).
let carry = 0;

/** Buys one unit of `id`; a refused purchase leaves the state (and the save) untouched. */
export function buy(id: ShopItemId, options?: BuyOptions): void {
  const state = getSavedStateSnapshot();
  if (!state) {
    return;
  }
  const result = buyItem(state, id, options);
  if (result.ok) {
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

/** One game tick: only ticks that complete a whole helper click write to storage (design D11). */
export function tick(elapsedMs: number): void {
  const state = getSavedStateSnapshot();
  if (!state) {
    return;
  }
  const result = tickHelpers(state, carry, elapsedMs);
  carry = result.carry;
  if (result.state !== state) {
    commitGame(result.state);
  }
}
